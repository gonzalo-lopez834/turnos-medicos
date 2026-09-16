import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { profesionales, especialidades } from '../store';

export const getProfesionales = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    status = 200;
    return res.status(status).json(profesionales);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const getProfesionalPorId = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      status = 404;
      throw new Error(`No existe un profesional con id ${id}`);
    }

    status = 200;
    return res.status(status).json(profesional);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const crearProfesional = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { nombre, especialidad, activo } = req.body ?? {};

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      status = 400;
      throw new Error('El campo nombre es obligatorio y debe ser un texto no vacío');
    }

    if (!especialidad || typeof especialidad !== 'string' || !especialidad.trim()) {
      status = 400;
      throw new Error('El campo especialidad es obligatorio y debe ser un texto no vacío');
    }

    const especialidadExiste = especialidades.some(
      (e) => e.nombreEspecialidad.toLowerCase() === especialidad.trim().toLowerCase()
    );

    if (!especialidadExiste) {
      status = 400;
      throw new Error(`La especialidad "${especialidad}" no existe en el listado de especialidades`);
    }

    const nuevoProfesional = {
      medicoId: randomUUID(),
      nombre: nombre.trim(),
      especialidad: especialidad.trim(),
      activo: typeof activo === 'boolean' ? activo : true,
    };

    profesionales.push(nuevoProfesional);

    console.clear();
    console.log('Nuevo profesional registrado. Estado actual de "profesionales":');
    console.table(profesionales);

    status = 201;
    return res.status(status).json(nuevoProfesional);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const actualizarProfesional = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      status = 404;
      throw new Error(`No existe un profesional con id ${id}`);
    }

    const { nombre, especialidad, activo } = req.body ?? {};

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      status = 400;
      throw new Error('El campo nombre es obligatorio y debe ser un texto no vacío');
    }

    if (!especialidad || typeof especialidad !== 'string' || !especialidad.trim()) {
      status = 400;
      throw new Error('El campo especialidad es obligatorio y debe ser un texto no vacío');
    }

    if (typeof activo !== 'boolean') {
      status = 400;
      throw new Error('El campo activo es obligatorio y debe ser booleano');
    }

    const especialidadExiste = especialidades.some(
      (e) => e.nombreEspecialidad.toLowerCase() === especialidad.trim().toLowerCase()
    );

    if (!especialidadExiste) {
      status = 400;
      throw new Error(`La especialidad "${especialidad}" no existe en el listado de especialidades`);
    }

    profesional.nombre = nombre.trim();
    profesional.especialidad = especialidad.trim();
    profesional.activo = activo;

    console.clear();
    console.log(`Profesional "${profesional.nombre}" actualizado. Estado actual de "profesionales":`);
    console.table(profesionales);

    status = 200;
    return res.status(status).json(profesional);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};

export const eliminarProfesional = async (req: Request, res: Response): Promise<Response> => {
  let status = 500;
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      status = 404;
      throw new Error(`No existe un profesional con id ${id}`);
    }

    profesional.activo = false;

    console.clear();
    console.log(`Profesional "${profesional.nombre}" dado de baja (soft delete). Estado actual:`);
    console.table(profesionales);

    status = 200;
    return res.status(status).json(profesional);
  } catch (error) {
    return res.status(status).json({ error: (error as Error).message });
  }
};