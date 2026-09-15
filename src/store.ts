import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface Especialidad {
  especialidadId: string;
  nombreEspecialidad: string;
  activa: boolean;
}

export interface Profesional {
  medicoId: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

// Interfaz de la Actividad 1, se mantiene por si se retoma más adelante
export interface ConfiguracionAgenda {
  fechaMaxima: string;
  horaMinima: string;
  horaMaxima: string;
}

export let especialidades: Especialidad[] = [];
export let profesionales: Profesional[] = [];

export const configuracionAgenda: ConfiguracionAgenda = {
  fechaMaxima: '2026-12-30',
  horaMinima: '07:00',
  horaMaxima: '13:00',
};

export async function cargarDatos(): Promise<void> {
  const especialidadesPath = join(__dirname, 'data', 'especialidades.json');
  const profesionalesPath = join(__dirname, 'data', 'profesionales.json');

  const [especialidadesRaw, profesionalesRaw] = await Promise.all([
    readFile(especialidadesPath, 'utf-8'),
    readFile(profesionalesPath, 'utf-8'),
  ]);

  especialidades = JSON.parse(especialidadesRaw) as Especialidad[];
  profesionales = JSON.parse(profesionalesRaw) as Profesional[];
}