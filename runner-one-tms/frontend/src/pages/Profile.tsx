import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/profile').then((res) => {
      setUser(res.data);
      setName(res.data.name);
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await api.put('/users/profile', {
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil.');
    }
  };

  if (!user) return <div>Carregando perfil...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--navy-900)' }}>Meu Perfil</h1>

      <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ background: 'var(--navy-900)', color: 'var(--amber-500)', padding: '16px', borderRadius: '50%' }}>
            <Shield size={32} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.email}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nível de Acesso: <strong>{user.role}</strong></div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px' }}>Alterar Senha (Opcional)</h3>

          <div className="form-group">
            <label className="form-label">Senha Atual</label>
            <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Nova Senha</label>
            <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};