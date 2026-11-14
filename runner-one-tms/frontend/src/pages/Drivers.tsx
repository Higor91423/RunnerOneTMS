import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Driver } from '../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    cpf: string;
    phone: string;
    cnh_number: string;
    cnh_category: string;
    cnh_expiration: string;
    status: 'DISPONIVEL' | 'EM_VIAGEM' | 'INATIVO';
  }>({
    name: '',
    cpf: '',
    phone: '',
    cnh_number: '',
    cnh_category: 'E',
    cnh_expiration: '',
    status: 'DISPONIVEL',
  });

  const loadDrivers = () => {
    api.get(`/drivers?search=${search}`)
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadDrivers();
  }, [search]);

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        cpf: driver.cpf,
        phone: driver.phone,
        cnh_number: driver.cnh_number,
        cnh_category: driver.cnh_category,
        cnh_expiration: driver.cnh_expiration ? driver.cnh_expiration.split('T')[0] : '',
        status: (driver.status || 'DISPONIVEL') as 'DISPONIVEL' | 'EM_VIAGEM' | 'INATIVO',
      });
    } else {
      setEditingDriver(null);
      setFormData({ name: '', cpf: '', phone: '', cnh_number: '', cnh_category: 'E', cnh_expiration: '', status: 'DISPONIVEL' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, formData);
      } else {
        await api.post('/drivers', formData);
      }
      setShowModal(false);
      loadDrivers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar motorista.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja inativar este motorista?')) {
      try {
        await api.delete(`/drivers/${id}`);
        loadDrivers();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Erro ao inativar.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>Gerenciamento de Motoristas</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={20} /> Novo Motorista</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" className="form-control" placeholder="Buscar por nome ou CPF..." style={{ paddingLeft: '38px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>CNH / Categoria</th>
              <th>Validade CNH</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.cpf}</td>
                <td>{d.phone}</td>
                <td>{d.cnh_number} ({d.cnh_category})</td>
                <td>{new Date(d.cnh_expiration).toLocaleDateString('pt-BR')}</td>
                <td><span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px', background: '#E0F2FE', color: '#0369A1' }} onClick={() => handleOpenModal(d)}><Edit size={16} /></button>
                    <button className="btn" style={{ padding: '6px', background: '#FEE2E2', color: '#B91C1C' }} onClick={() => handleDelete(d.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{editingDriver ? 'Editar Motorista' : 'Novo Motorista'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Nome Completo</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">CPF</label><input type="text" className="form-control" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Telefone</label><input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Número da CNH</label><input type="text" className="form-control" value={formData.cnh_number} onChange={(e) => setFormData({ ...formData, cnh_number: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Categoria</label>
                  <select className="form-control" value={formData.cnh_category} onChange={(e) => setFormData({ ...formData, cnh_category: e.target.value })}>
                    <option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Validade da CNH</label><input type="date" className="form-control" value={formData.cnh_expiration} onChange={(e) => setFormData({ ...formData, cnh_expiration: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Situação</label>
                <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="DISPONIVEL">Disponível</option><option value="EM_VIAGEM">Em Viagem</option><option value="INATIVO">Inativo</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Motorista</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};