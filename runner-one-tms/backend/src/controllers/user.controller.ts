import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { z } from 'zod';

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const user = await db('users').select('id', 'name', 'email', 'role', 'active', 'created_at').where({ id: userId }).first();

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    res.json(user);
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const schema = z.object({
      name: z.string().min(3).optional(),
      currentPassword: z.string().min(6).optional(),
      newPassword: z.string().min(6).optional(),
    });

    const { name, currentPassword, newPassword } = schema.parse(req.body);
    const user = await db('users').where({ id: userId }).first();

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Senha atual obrigatória para definir uma nova senha.' });
        return;
      }
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        res.status(401).json({ error: 'Senha atual incorreta.' });
        return;
      }
      updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }

    const [updated] = await db('users').where({ id: userId }).update(updateData).returning(['id', 'name', 'email', 'role', 'active']);
    res.json({ message: 'Perfil atualizado com sucesso.', user: updated });
  }
}