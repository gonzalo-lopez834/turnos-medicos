import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { especialidades } from '../store';

export function getEspecialidades(req: Request, res: Response): void {
  try {
    res.status(200).json(especialidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener las especialidades' });
  }
}

export function getEspecialidadPorId(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const especialidad = especialidades.find((e) => e.especialidadId === id);

    if (!especialidad) {
      res.status(404).json({ error: `No existe una especialidad con id ${id}` });
      return;
    }

    res.status(200).json(especialidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al buscar la especialidad' });
  }
}

export function crearEspecialidad(req: Request, res: Response): void {
  try {
    const { nombreEspecialidad } = req.body ?? {};

    if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string' || !nombreEspecialidad.trim()) {
      res.status(400).json({ error: 'El campo nombreEspecialidad es obligatorio y debe ser un texto no vacío' });
      return;
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

    res.status(201).json(nuevaEspecialidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al crear la especialidad' });
  }
}

export function eliminarEspecialidad(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const especialidad = especialidades.find((e) => e.especialidadId === id);

    if (!especialidad) {
      res.status(404).json({ error: `No existe una especialidad con id ${id}` });
      return;
    }

    especialidad.activa = false;

    console.clear();
    console.log(`Especialidad "${especialidad.nombreEspecialidad}" dada de baja (soft delete). Estado actual:`);
    console.table(especialidades);

    res.status(200).json(especialidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al eliminar la especialidad' });
  }
}