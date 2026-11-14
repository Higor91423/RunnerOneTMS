import React, { useState } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { FileText, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [reportData, setReportData] = useState<{ total_orders: number; total_freight: number; total_weight_kg: number; orders: Order[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/reports?start_date=${startDate}&end_date=${endDate}&status=${status}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.orders.length) return;

    const headers = ['Codigo', 'Cliente', 'Origem', 'Destino', 'Peso_kg', 'Frete_R$', 'Status', 'Data_Criacao'];
    const rows = reportData.orders.map((o) => [
      o.order_code,
      `"${o.client_name}"`,
      `"${o.origin_address}"`,
      `"${o.destination_address}"`,
      o.cargo_weight_kg,
      o.freight_value,
      o.status,
      o.created_at ? new Date(o.created_at).toLocaleDateString('pt-BR') : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_runner_one_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--navy-900)' }}>Relatórios Gerenciais</h1>

      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <form onSubmit={handleGenerateReport} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) gap: 16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data Inicial</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data Final</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_TRANSITO">Em Trânsito</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <FileText size={18} /> {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </form>
      </div>

      {reportData && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>Total de Pedidos: <strong>{reportData.total_orders}</strong></div>
              <div>Volume Total: <strong>{Number(reportData.total_weight_kg).toLocaleString('pt-BR')} kg</strong></div>
              <div>Frete Acumulado: <strong>R$ {Number(reportData.total_freight).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            </div>
            <button className="btn btn-secondary" onClick={exportToCSV}>
              <Download size={18} /> Exportar CSV
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Origem → Destino</th>
                  <th>Peso (kg)</th>
                  <th>Frete (R$)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.order_code}</td>
                    <td>{o.client_name}</td>
                    <td>{o.origin_address} → {o.destination_address}</td>
                    <td>{Number(o.cargo_weight_kg).toLocaleString('pt-BR')} kg</td>
                    <td>R$ {Number(o.freight_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};