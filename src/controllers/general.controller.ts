import type { Request, Response } from 'express';

export const bienvenida = async (req: Request, res: Response): Promise<Response> => {
  const status = 200;
  return res.status(status).json({ mensaje: 'Bienvenido a la API de TurnosMed' });
};

export const rutaNoEncontrada = async (req: Request, res: Response): Promise<Response> => {
  const status = 404;
  return res.status(status).json({
    error: 'Recurso no encontrado',
    mensaje: `No existe la ruta ${req.method} ${req.originalUrl} en esta API`,
  });
};