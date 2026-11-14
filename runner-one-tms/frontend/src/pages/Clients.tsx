import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Client } from '../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const loadClients = () => {
    api.get(`/clients?search=${search}`)
      .then((res) => setClients(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        document: '',
        email: '',
        phone: '',
        zip_code: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      loadClients();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar cliente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente desativar este cliente?')) {
      try {
        await api.delete(`/clients/${id}`);
        loadClients();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Erro ao desativar cliente.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>Gerenciamento de Clientes</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            style={{ paddingLeft: '38px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome / Razão Social</th>
              <th>CPF / CNPJ</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Cidade / UF</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td style={{ fontWeight: 600 }}>{client.name}</td>
                <td>{client.document}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.city} - {client.state}</td>
                <td>
                  <span className={`badge ${client.active ? 'badge-disponivel' : 'badge-inativo'}`}>
                    {client.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px', background: '#E0F2FE', color: '#0369A1' }} onClick={() => handleOpenModal(client)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn" style={{ padding: '6px', background: '#FEE2E2', color: '#B91C1C' }} onClick={() => handleDelete(client.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome / Razão Social</label>
                  <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CPF ou CNPJ</label>
                  <input type="text" className="form-control" value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input type="text" className="form-control" value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Logradouro (Rua, Av.)</label>
                  <input type="text" className="form-control" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input type="text" className="form-control" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input type="text" className="form-control" value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input type="text" className="form-control" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado (UF)</label>
                  <input type="text" maxLength={2} className="form-control" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};