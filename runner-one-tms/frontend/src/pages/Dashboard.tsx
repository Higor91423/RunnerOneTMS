import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, Order } from '../types';
import { Package, CheckCircle2, AlertTriangle, Users, Truck, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => {
        setMetrics(res.data.metrics);
        setRecentOrders(res.data.recentOrders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando métricas...</div>;

  const cards = [
    { title: 'Pedidos em Andamento', value: metrics?.ongoingOrders || 0, icon: Package, color: '#0369A1' },
    { title: 'Entregas Concluídas', value: metrics?.completedOrders || 0, icon: CheckCircle2, color: '#047857' },
    { title: 'Entregas Atrasadas', value: metrics?.delayedOrders || 0, icon: AlertTriangle, color: '#B91C1C' },
    { title: 'Clientes Ativos', value: metrics?.totalClients || 0, icon: Users, color: '#D97706' },
    { title: 'Motoristas Disponíveis', value: metrics?.totalDrivers || 0, icon: Truck, color: '#4F46E5' },
    { title: 'Veículos Disponíveis', value: metrics?.totalVehicles || 0, icon: Clock, color: '#0D9488' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--navy-900)' }}>
        Dashboard Operacional
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: `${c.color}15`, color: c.color }}>
                <Icon size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{c.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--navy-900)' }}>Pedidos Recentes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Origem / Destino</th>
                <th>Previsão</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_code}</td>
                  <td>{order.client_name}</td>
                  <td>{order.origin_address} → {order.destination_address}</td>
                  <td>{new Date(order.estimated_delivery_date).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};