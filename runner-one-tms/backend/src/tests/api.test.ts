import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../config/database';

describe('Runner One TMS API Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    // Executar migrações e seed para testes limpos
    await db.migrate.latest();
    await db.seed.run();
  });

  it('deve retornar status OK na rota de health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('deve autenticar o usuário administrador com sucesso', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@runnerone.com.br',
      password: 'Runner@2026',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('ADMIN');
    authToken = response.body.token;
  });

  it('deve retornar as métricas do dashboard autenticado', async () => {
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('metrics');
    expect(response.body.metrics).toHaveProperty('ongoingOrders');
  });

  it('deve listar clientes cadastrados', async () => {
    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});