import { Request, Response } from 'express';
import { db } from '../config/database';

export class DashboardController {
  static async getMetrics(req: Request, res: Response): Promise<void> {
    const [ongoingOrders] = await db('orders')
      .whereIn('status', ['EM_COLETA', 'EM_TRANSITO'])
      .count('id as count');

    const [completedOrders] = await db('orders').where({ status: 'ENTREGUE' }).count('id as count');

    // Pedidos atrasados: estimados para entrega no passado e que ainda não foram entregues nem cancelados
    const [delayedOrders] = await db('orders')
      .where('estimated_delivery_date', '<', new Date())
      .whereNotIn('status', ['ENTREGUE', 'CANCELADO'])
      .count('id as count');

    const [totalClients] = await db('clients').where({ active: true }).count('id as count');
    const [totalDrivers] = await db('drivers').where({ status: 'DISPONIVEL' }).count('id as count');
    const [totalVehicles] = await db('vehicles').where({ status: 'DISPONIVEL' }).count('id as count');

    const recentOrders = await db('orders')
      .join('clients', 'orders.client_id', 'clients.id')
      .select(
        'orders.id',
        'orders.order_code',
        'orders.origin_address',
        'orders.destination_address',
        'orders.status',
        'orders.estimated_delivery_date',
        'clients.name as client_name'
      )
      .orderBy('orders.created_at', 'desc')
      .limit(6);

    res.json({
      metrics: {
        ongoingOrders: Number(ongoingOrders.count),
        completedOrders: Number(completedOrders.count),
        delayedOrders: Number(delayedOrders.count),
        totalClients: Number(totalClients.count),
        totalDrivers: Number(totalDrivers.count),
        totalVehicles: Number(totalVehicles.count),
      },
      recentOrders,
    });
  }
}