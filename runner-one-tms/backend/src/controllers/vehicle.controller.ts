import { Request, Response } from 'express';
import { db } from '../config/database';
import { vehicleSchema } from '../schemas/validation.schemas';

export class VehicleController {
  static async list(req: Request, res: Response): Promise<void> {
    const { search, status, type } = req.query;
    let query = db('vehicles');

    if (search) {
      query = query.where((builder) => {
        builder.where('plate', 'ilike', `%${search}%`).orWhere('model', 'ilike', `%${search}%`);
      });
    }

    if (status) query = query.where({ status: String(status) });
    if (type) query = query.where({ type: String(type) });

    const vehicles = await query.orderBy('plate', 'asc');
    res.json(vehicles);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const vehicle = await db('vehicles').where({ id }).first();

    if (!vehicle) {
      res.status(404).json({ error: 'Veículo não encontrado.' });
      return;
    }

    res.json(vehicle);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = vehicleSchema.parse(req.body);

    const existing = await db('vehicles').where({ plate: data.plate.toUpperCase() }).first();
    if (existing) {
      res.status(409).json({ error: 'Já existe um veículo cadastrado com esta placa.' });
      return;
    }

    const [newVehicle] = await db('vehicles').insert({ ...data, plate: data.plate.toUpperCase() }).returning('*');
    res.status(201).json(newVehicle);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = vehicleSchema.parse(req.body);

    const vehicle = await db('vehicles').where({ id }).first();
    if (!vehicle) {
      res.status(404).json({ error: 'Veículo não encontrado.' });
      return;
    }

    const [updated] = await db('vehicles').where({ id }).update({ ...data, plate: data.plate.toUpperCase() }).returning('*');
    res.json(updated);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const vehicle = await db('vehicles').where({ id }).first();

    if (!vehicle) {
      res.status(404).json({ error: 'Veículo não encontrado.' });
      return;
    }

    const [updated] = await db('vehicles').where({ id }).update({ status: 'INATIVO' }).returning('*');
    res.json({ message: 'Veículo inativado com sucesso.', vehicle: updated });
  }
}