import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    res.status(401).json({ error: 'Erro no formato do token.' });
    return;
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token malformatado.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
    return;
  }
}

export function requireRole(allowedRoles: Array<'ADMIN' | 'OPERADOR' | 'VISUALIZADOR'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado. Permissões insuficientes para esta operação.' });
      return;
    }

    return next();
  };
}