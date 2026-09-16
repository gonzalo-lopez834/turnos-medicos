import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { especialidades } from '../store';

export const getEspecialidades = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    status = 200;
    return res.status(status).json(especialidades);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const getEspecialidadPorId = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { id } = req.params;
    const especialidad = especialidades.find((e) => e.especialidadId === id);

    if (!especialidad) {
      status = 404;
      throw new Error(`No existe una especialidad con id ${id}`);
    }

    status = 200;
    return res.status(status).json(especialidad);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const crearEspecialidad = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { nombreEspecialidad } = req.body ?? {};

    if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string' || !nombreEspecialidad.trim()) {
      status = 400;
      throw new Error('El campo nombreEspecialidad es obligatorio y debe ser un texto no vacío');
    }

    const nuevaEspecialidad = {
      especialidadId: randomUUID(),
      nombreEspecialidad: nombreEspecialidad.trim(),
      activa: true,
    };

    especialidades.push(nuevaEspecialidad);

    console.clear();
    console.log('Nueva especialidad creada. Estado actual de "especialidades":');
    console.table(especialidades);

    status = 201;
    return res.status(status).json(nuevaEspecialidad);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const eliminarEspecialidad = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { id } = req.params;
    const especialidad = especialidades.find((e) => e.especialidadId === id);

    if (!especialidad) {
      status = 404;
      throw new Error(`No existe una especialidad con id ${id}`);
    }

    especialidad.activa = false;

    console.clear();
    console.log(`Especialidad "${especialidad.nombreEspecialidad}" dada de baja (soft delete). Estado actual:`);
    console.table(especialidades);

    status = 200;
    return res.status(status).json(especialidad);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};