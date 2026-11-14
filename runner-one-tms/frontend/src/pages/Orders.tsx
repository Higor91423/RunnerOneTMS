import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order, Client, Driver, Vehicle } from '../types';
import { Plus, Search, Eye, RefreshCw } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<any>('EM_TRANSITO');
  const [statusNotes, setStatusNotes] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    client_id: 0,
    driver_id: null as number | null,
    vehicle_id: null as number | null,
    origin_address: '',
    destination_address: '',
    cargo_description: '',
    cargo_weight_kg: 1000,
    freight_value: 500,
    pickup_date: '',
    estimated_delivery_date: '',
  });

  const loadData = () => {
    api.get(`/orders?search=${search}&status=${statusFilter}`).then((res) => setOrders(res.data));
  };

  useEffect(() => {
    loadData();
    api.get('/clients').then((res) => setClients(res.data));
    api.get('/drivers').then((res) => setDrivers(res.data));
    api.get('/vehicles').then((res) => setVehicles(res.data));
  }, [search, statusFilter]);

  const handleOpenModal = () => {
    setFormData({
      client_id: clients[0]?.id || 0,
      driver_id: null,
      vehicle_id: null,
      origin_address: '',
      destination_address: '',
      cargo_description: '',
      cargo_weight_kg: 1000,
      freight_value: 500,
      pickup_date: '',
      estimated_delivery_date: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/orders', formData);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar pedido.');
    }
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder(res.data);
      setNewStatus(res.data.status);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.patch(`/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        notes: statusNotes,
      });
      setStatusNotes('');
      setShowDetailModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar status.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>Gestão de Pedidos (TMS)</h1>
        <button className="btn btn-primary" onClick={handleOpenModal}><Plus size={20} /> Novo Pedido</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" className="form-control" placeholder="Buscar por código ou carga..." style={{ paddingLeft: '38px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os Status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="EM_COLETA">Em Coleta</option>
          <option value="EM_TRANSITO">Em Trânsito</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Origem → Destino</th>
              <th>Motorista</th>
              <th>Frete (R$)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600 }}>{order.order_code}</td>
                <td>{order.client_name}</td>
                <td>{order.origin_address} → {order.destination_address}</td>
                <td>{order.driver_name || 'Não alocado'}</td>
                <td>R$ {Number(order.freight_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                <td>
                  <button className="btn" style={{ padding: '6px', background: '#E0F2FE', color: '#0369A1' }} onClick={() => handleOpenDetail(order.id)}>
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Pedido */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Novo Pedido de Transporte</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Cliente / Embarcador</label>
                <select className="form-control" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })} required>
                  {clients.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.document})</option>))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Motorista (Opcional)</label>
                  <select className="form-control" value={formData.driver_id || ''} onChange={(e) => setFormData({ ...formData, driver_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Nenhum</option>
                    {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Veículo (Opcional)</label>
                  <select className="form-control" value={formData.vehicle_id || ''} onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Nenhum</option>
                    {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.plate} - {v.model}</option>))}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Endereço de Origem</label><input type="text" className="form-control" value={formData.origin_address} onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Endereço de Destino</label><input type="text" className="form-control" value={formData.destination_address} onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Descrição da Carga</label><textarea className="form-control" value={formData.cargo_description} onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })} required rows={2} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Peso da Carga (kg)</label><input type="number" className="form-control" value={formData.cargo_weight_kg} onChange={(e) => setFormData({ ...formData, cargo_weight_kg: Number(e.target.value) })} required /></div>
                <div className="form-group"><label className="form-label">Valor do Frete (R$)</label><input type="number" step="0.01" className="form-control" value={formData.freight_value} onChange={(e) => setFormData({ ...formData, freight_value: Number(e.target.value) })} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Data de Coleta</label><input type="date" className="form-control" value={formData.pickup_date} onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Previsão de Entrega</label><input type="date" className="form-control" value={formData.estimated_delivery_date} onChange={(e) => setFormData({ ...formData, estimated_delivery_date: e.target.value })} required /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes e Histórico */}
      {showDetailModal && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Pedido {selectedOrder.order_code}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Cliente: <strong>{selectedOrder.client_name}</strong></p>

            <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <p><strong>Origem:</strong> {selectedOrder.origin_address}</p>
              <p><strong>Destino:</strong> {selectedOrder.destination_address}</p>
              <p><strong>Carga:</strong> {selectedOrder.cargo_description} ({selectedOrder.cargo_weight_kg} kg)</p>
              <p><strong>Frete:</strong> R$ {Number(selectedOrder.freight_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Atualizar Status do Pedido</h3>
            <form onSubmit={handleUpdateStatus} style={{ background: '#F3F4F6', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Novo Status</label>
                  <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_COLETA">Em Coleta</option>
                    <option value="EM_TRANSITO">Em Trânsito</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Observação / Ocorrência</label>
                  <input type="text" className="form-control" placeholder="Ex: Saiu para rota final" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}><RefreshCw size={16} /> Atualizar Status</button>
            </form>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Histórico de Movimentações</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>De → Para</th>
                    <th>Observação</th>
                    <th>Responsável</th>
                    <th>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.history?.map((h) => (
                    <tr key={h.id}>
                      <td>{h.previous_status || 'Início'} → <strong>{h.new_status}</strong></td>
                      <td>{h.notes || '-'}</td>
                      <td>{h.user_name || 'Sistema'}</td>
                      <td>{new Date(h.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn" style={{ background: '#E5E7EB' }} onClick={() => setShowDetailModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};