import { Request, Response } from 'express';
import { db } from '../config/database';
import { orderSchema, updateOrderStatusSchema } from '../schemas/validation.schemas';

export class OrderController {
  static async list(req: Request, res: Response): Promise<void> {
    const { search, status, client_id } = req.query;

    let query = db('orders')
      .join('clients', 'orders.client_id', 'clients.id')
      .leftJoin('drivers', 'orders.driver_id', 'drivers.id')
      .leftJoin('vehicles', 'orders.vehicle_id', 'vehicles.id')
      .select(
        'orders.*',
        'clients.name as client_name',
        'clients.document as client_document',
        'drivers.name as driver_name',
        'vehicles.plate as vehicle_plate'
      );

    if (search) {
      query = query.where((builder) => {
        builder.where('orders.order_code', 'ilike', `%${search}%`).orWhere('orders.cargo_description', 'ilike', `%${search}%`);
      });
    }

    if (status) query = query.where({ 'orders.status': String(status) });
    if (client_id) query = query.where({ 'orders.client_id': Number(client_id) });

    const orders = await query.orderBy('orders.created_at', 'desc');
    res.json(orders);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const order = await db('orders')
      .join('clients', 'orders.client_id', 'clients.id')
      .leftJoin('drivers', 'orders.driver_id', 'drivers.id')
      .leftJoin('vehicles', 'orders.vehicle_id', 'vehicles.id')
      .select(
        'orders.*',
        'clients.name as client_name',
        'clients.document as client_document',
        'drivers.name as driver_name',
        'vehicles.plate as vehicle_plate'
      )
      .where('orders.id', id)
      .first();

    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const history = await db('order_status_history')
      .leftJoin('users', 'order_status_history.changed_by', 'users.id')
      .select('order_status_history.*', 'users.name as user_name')
      .where('order_status_history.order_id', id)
      .orderBy('order_status_history.created_at', 'asc');

    res.json({ ...order, history });
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = orderSchema.parse(req.body);

    // Gerar código único do pedido ex: RO-2026-1045
    const countResult = await db('orders').count('id as count').first();
    const nextId = Number(countResult?.count || 0) + 1001;
    const order_code = `RO-${new Date().getFullYear()}-${nextId}`;

    const trx = await db.transaction();

    try {
      const [newOrder] = await trx('orders')
        .insert({
          ...data,
          order_code,
        })
        .returning('*');

      await trx('order_status_history').insert({
        order_id: newOrder.id,
        previous_status: null,
        new_status: newOrder.status,
        notes: 'Pedido de transporte criado no sistema.',
        changed_by: req.user?.id || null,
      });

      await trx.commit();
      res.status(201).json(newOrder);
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = orderSchema.parse(req.body);

    const order = await db('orders').where({ id }).first();
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const [updated] = await db('orders').where({ id }).update(data).returning('*');
    res.json(updated);
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, notes } = updateOrderStatusSchema.parse(req.body);

    const order = await db('orders').where({ id }).first();
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const previousStatus = order.status;
    if (previousStatus === status) {
      res.status(400).json({ error: 'O pedido já se encontra neste status.' });
      return;
    }

    const trx = await db.transaction();

    try {
      const updatePayload: any = { status };
      if (status === 'ENTREGUE') {
        updatePayload.delivered_at = new Date();
      }

      const [updatedOrder] = await trx('orders').where({ id }).update(updatePayload).returning('*');

      await trx('order_status_history').insert({
        order_id: Number(id),
        previous_status: previousStatus,
        new_status: status,
        notes: notes || `Status alterado de ${previousStatus} para ${status}.`,
        changed_by: req.user?.id || null,
      });

      await trx.commit();
      res.json(updatedOrder);
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }
}