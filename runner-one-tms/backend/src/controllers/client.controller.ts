import { Request, Response } from 'express';
import { db } from '../config/database';
import { clientSchema } from '../schemas/validation.schemas';

export class ClientController {
  static async list(req: Request, res: Response): Promise<void> {
    const { search, active } = req.query;
    let query = db('clients');

    if (search) {
      query = query.where((builder) => {
        builder.where('name', 'ilike', `%${search}%`).orWhere('document', 'ilike', `%${search}%`);
      });
    }

    if (active !== undefined) {
      query = query.where({ active: active === 'true' });
    }

    const clients = await query.orderBy('name', 'asc');
    res.json(clients);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await db('clients').where({ id }).first();

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
      return;
    }

    res.json(client);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = clientSchema.parse(req.body);

    const existing = await db('clients').where({ document: data.document }).first();
    if (existing) {
      res.status(409).json({ error: 'Já existe um cliente cadastrado com este CPF/CNPJ.' });
      return;
    }

    const [newClient] = await db('clients').insert(data).returning('*');
    res.status(201).json(newClient);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = clientSchema.parse(req.body);

    const client = await db('clients').where({ id }).first();
    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
      return;
    }

    const [updated] = await db('clients').where({ id }).update(data).returning('*');
    res.json(updated);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await db('clients').where({ id }).first();

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
      return;
    }

    // Soft delete ou inativação para manter integridade dos pedidos
    const [updated] = await db('clients').where({ id }).update({ active: false }).returning('*');
    res.json({ message: 'Cliente desativado com sucesso.', client: updated });
  }
}