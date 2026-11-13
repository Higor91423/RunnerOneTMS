import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { env } from '../config/env';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/validation.schemas';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db('users').where({ email }).first();
    if (!user || !user.active) {
      res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  static async register(req: Request, res: Response): Promise<void> {
    if (!env.ALLOW_PUBLIC_REGISTRATION && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Criação pública de contas desativada. Solicite ao administrador.' });
      return;
    }

    const { name, email, password, role } = registerSchema.parse(req.body);

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      res.status(409).json({ error: 'E-mail já cadastrado.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = req.user?.role === 'ADMIN' ? role : 'OPERADOR';

    const [newUser] = await db('users')
      .insert({
        name,
        email,
        password_hash,
        role: assignedRole,
        active: true,
      })
      .returning(['id', 'name', 'email', 'role', 'active']);

    res.status(201).json({ message: 'Conta criada com sucesso.', user: newUser });
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await db('users').where({ email }).first();

    // Por segurança, nunca revelamos se o e-mail existe ou não
    if (user) {
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

      await db('users').where({ id: user.id }).update({
        reset_token: resetToken,
        reset_token_expires: expires,
      });

      console.log(`[DEV ONLY] Token de recuperação para ${email}: ${resetToken}`);
    }

    res.json({ message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.' });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await db('users').where({ reset_token: token }).where('reset_token_expires', '>', new Date()).first();

    if (!user) {
      res.status(400).json({ error: 'Token inválido ou expirado.' });
      return;
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await db('users').where({ id: user.id }).update({
      password_hash,
      reset_token: null,
      reset_token_expires: null,
    });

    res.json({ message: 'Senha redefinida com sucesso.' });
  }
}