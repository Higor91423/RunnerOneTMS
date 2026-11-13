import { Request, Response } from 'express';
import { db } from '../config/database';
import { driverSchema } from '../schemas/validation.schemas';

export class DriverController {
  static async list(req: Request, res: Response): Promise<void> {
    const { search, status } = req.query;
    let query = db('drivers');

    if (search) {
      query = query.where((builder) => {
        builder.where('name', 'ilike', `%${search}%`).orWhere('cpf', 'ilike', `%${search}%`);
      });
    }

    if (status) {
      query = query.where({ status: String(status) });
    }

    const drivers = await query.orderBy('name', 'asc');
    res.json(drivers);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const driver = await db('drivers').where({ id }).first();

    if (!driver) {
      res.status(404).json({ error: 'Motorista não encontrado.' });
      return;
    }

    res.json(driver);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = driverSchema.parse(req.body);

    const existing = await db('drivers').where({ cpf: data.cpf }).orWhere({ cnh_number: data.cnh_number }).first();
    if (existing) {
      res.status(409).json({ error: 'Já existe um motorista com este CPF ou CNH.' });
      return;
    }

    const [newDriver] = await db('drivers').insert(data).returning('*');
    res.status(201).json(newDriver);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = driverSchema.parse(req.body);

    const driver = await db('drivers').where({ id }).first();
    if (!driver) {
      res.status(404).json({ error: 'Motorista não encontrado.' });
      return;
    }

    const [updated] = await db('drivers').where({ id }).update(data).returning('*');
    res.json(updated);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const driver = await db('drivers').where({ id }).first();

    if (!driver) {
      res.status(404).json({ error: 'Motorista não encontrado.' });
      return;
    }

    const [updated] = await db('drivers').where({ id }).update({ status: 'INATIVO' }).returning('*');
    res.json({ message: 'Motorista inativado com sucesso.', driver: updated });
  }
}