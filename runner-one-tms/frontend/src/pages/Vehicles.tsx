import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vehicle } from '../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    plate: string;
    model: string;
    brand: string;
    type: 'VUC' | 'TOCO' | 'TRUCK' | 'CARRETA' | 'UTILITARIO';
    capacity_kg: number;
    status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO' | 'INATIVO';
  }>({
    plate: '',
    model: '',
    brand: '',
    type: 'TRUCK',
    capacity_kg: 10000,
    status: 'DISPONIVEL',
  });

  const loadVehicles = () => {
    api.get(`/vehicles?search=${search}`)
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadVehicles();
  }, [search]);

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        plate: vehicle.plate,
        model: vehicle.model,
        brand: vehicle.brand,
        type: vehicle.type,
        capacity_kg: Number(vehicle.capacity_kg),
        status: vehicle.status,
      });
    } else {
      setEditingVehicle(null);
      setFormData({ plate: '', model: '', brand: '', type: 'TRUCK', capacity_kg: 10000, status: 'DISPONIVEL' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      setShowModal(false);
      loadVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar veículo.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja inativar este veículo?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        loadVehicles();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Erro ao inativar.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>Gerenciamento de Veículos</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={20} /> Novo Veículo</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" className="form-control" placeholder="Buscar por placa ou modelo..." style={{ paddingLeft: '38px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo / Marca</th>
              <th>Tipo</th>
              <th>Capacidade (kg)</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 600 }}>{v.plate}</td>
                <td>{v.model} ({v.brand})</td>
                <td>{v.type}</td>
                <td>{Number(v.capacity_kg).toLocaleString('pt-BR')} kg</td>
                <td><span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px', background: '#E0F2FE', color: '#0369A1' }} onClick={() => handleOpenModal(v)}><Edit size={16} /></button>
                    <button className="btn" style={{ padding: '6px', background: '#FEE2E2', color: '#B91C1C' }} onClick={() => handleDelete(v.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Placa</label><input type="text" className="form-control" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })} required /></div>
              <div className="form-group"><label className="form-label">Modelo</label><input type="text" className="form-control" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Marca</label><input type="text" className="form-control" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Tipo</label>
                  <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="VUC">VUC</option><option value="TOCO">Toco</option><option value="TRUCK">Truck</option><option value="CARRETA">Carreta</option><option value="UTILITARIO">Utilitário</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Capacidade (kg)</label><input type="number" className="form-control" value={formData.capacity_kg} onChange={(e) => setFormData({ ...formData, capacity_kg: Number(e.target.value) })} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Situação</label>
                <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="DISPONIVEL">Disponível</option><option value="EM_USO">Em Uso</option><option value="MANUTENCAO">Manutenção</option><option value="INATIVO">Inativo</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Veículo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};