import { Request, Response } from 'express';
import { db } from '../config/database';

export class ReportController {
  static async getReport(req: Request, res: Response): Promise<void> {
    const { start_date, end_date, status, client_id } = req.query;

    let baseQuery = db('orders')
      .join('clients', 'orders.client_id', 'clients.id')
      .leftJoin('drivers', 'orders.driver_id', 'drivers.id')
      .leftJoin('vehicles', 'orders.vehicle_id', 'vehicles.id');

    if (start_date) baseQuery = baseQuery.where('orders.created_at', '>=', `${start_date} 00:00:00`);
    if (end_date) baseQuery = baseQuery.where('orders.created_at', '<=', `${end_date} 23:59:59`);
    if (status) baseQuery = baseQuery.where({ 'orders.status': String(status) });
    if (client_id) baseQuery = baseQuery.where({ 'orders.client_id': Number(client_id) });

    // Busca os totais direto do banco (mais seguro e performático)
    const summaryQuery = baseQuery.clone().first(
      db.raw('COUNT(orders.id) as total_orders'),
      db.raw('COALESCE(SUM(orders.freight_value), 0) as total_freight'),
      db.raw('COALESCE(SUM(orders.cargo_weight_kg), 0) as total_weight_kg')
    );

    // Busca a lista detalhada de pedidos
    const ordersQuery = baseQuery
      .clone()
      .select(
        'orders.*',
        'clients.name as client_name',
        'clients.document as client_document',
        'drivers.name as driver_name',
        'vehicles.plate as vehicle_plate'
      )
      .orderBy('orders.created_at', 'desc');

    const [summary, orders] = await Promise.all([summaryQuery, ordersQuery]);

    res.json({
      total_orders: Number(summary?.total_orders || 0),
      total_freight: Number(summary?.total_freight || 0),
      total_weight_kg: Number(summary?.total_weight_kg || 0),
      orders,
    });
  }
}