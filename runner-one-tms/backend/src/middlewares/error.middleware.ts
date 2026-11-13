import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('🔥 Erro na API:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Erro de validação nos dados enviados.',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err.code === '23505') {
    res.status(409).json({ error: 'Registro duplicado. O valor informado já existe no sistema.' });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({ error: 'Violação de chave estrangeira. O registro relacionado não existe ou está em uso.' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor.';

  res.status(statusCode).json({ error: message });
}