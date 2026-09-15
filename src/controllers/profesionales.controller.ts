import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { profesionales, especialidades } from '../store';

export function getProfesionales(req: Request, res: Response): void {
  try {
    res.status(200).json(profesionales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener los profesionales' });
  }
}

export function getProfesionalPorId(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      res.status(404).json({ error: `No existe un profesional con id ${id}` });
      return;
    }

    res.status(200).json(profesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al buscar el profesional' });
  }
}

export function crearProfesional(req: Request, res: Response): void {
  try {
    const { nombre, especialidad, activo } = req.body ?? {};

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      res.status(400).json({ error: 'El campo nombre es obligatorio y debe ser un texto no vacío' });
      return;
    }

    if (!especialidad || typeof especialidad !== 'string' || !especialidad.trim()) {
      res.status(400).json({ error: 'El campo especialidad es obligatorio y debe ser un texto no vacío' });
      return;
    }

    const especialidadExiste = especialidades.some(
      (e) => e.nombreEspecialidad.toLowerCase() === especialidad.trim().toLowerCase()
    );

    if (!especialidadExiste) {
      res.status(400).json({ error: `La especialidad "${especialidad}" no existe en el listado de especialidades` });
      return;
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

    res.status(201).json(nuevoProfesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al crear el profesional' });
  }
}

export function actualizarProfesional(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      res.status(404).json({ error: `No existe un profesional con id ${id}` });
      return;
    }

    const { nombre, especialidad, activo } = req.body ?? {};

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      res.status(400).json({ error: 'El campo nombre es obligatorio y debe ser un texto no vacío' });
      return;
    }

    if (!especialidad || typeof especialidad !== 'string' || !especialidad.trim()) {
      res.status(400).json({ error: 'El campo especialidad es obligatorio y debe ser un texto no vacío' });
      return;
    }

    if (typeof activo !== 'boolean') {
      res.status(400).json({ error: 'El campo activo es obligatorio y debe ser booleano' });
      return;
    }

    const especialidadExiste = especialidades.some(
      (e) => e.nombreEspecialidad.toLowerCase() === especialidad.trim().toLowerCase()
    );

    if (!especialidadExiste) {
      res.status(400).json({ error: `La especialidad "${especialidad}" no existe en el listado de especialidades` });
      return;
    }

    profesional.nombre = nombre.trim();
    profesional.especialidad = especialidad.trim();
    profesional.activo = activo;

    console.clear();
    console.log(`Profesional "${profesional.nombre}" actualizado. Estado actual de "profesionales":`);
    console.table(profesionales);

    res.status(200).json(profesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al actualizar el profesional' });
  }
}

export function eliminarProfesional(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.medicoId === id);

    if (!profesional) {
      res.status(404).json({ error: `No existe un profesional con id ${id}` });
      return;
    }

    profesional.activo = false;

    console.clear();
    console.log(`Profesional "${profesional.nombre}" dado de baja (soft delete). Estado actual:`);
    console.table(profesionales);

    res.status(200).json(profesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al eliminar el profesional' });
  }
}