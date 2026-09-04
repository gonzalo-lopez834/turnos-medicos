import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Interfaces que reflejan el shape de los JSON generados por IA
interface Especialidad {
  especialidadId: string;
  nombreEspecialidad: string;
  activa: boolean;
}

interface Profesional {
  medicoId: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

// Interfaz pedida por la consigna: límites operativos del centro médico
interface ConfiguracionAgenda {
  fechaMaxima: string;
  horaMinima: string;
  horaMaxima: string;
}

// Arrays globales donde van a vivir los datos una vez leídos
let especialidades: Especialidad[] = [];
let profesionales: Profesional[] = [];

// Regla base de agenda del centro médico
const configuracionAgenda: ConfiguracionAgenda = {
  fechaMaxima: '2026-12-30',
  horaMinima: '07:00',
  horaMaxima: '13:00',
};

async function cargarDatos(): Promise<void> {
  const especialidadesPath = join(__dirname, 'data', 'especialidades.json');
  const profesionalesPath = join(__dirname, 'data', 'profesionales.json');

  const [especialidadesRaw, profesionalesRaw] = await Promise.all([
    readFile(especialidadesPath, 'utf-8'),
    readFile(profesionalesPath, 'utf-8'),
  ]);

  especialidades = JSON.parse(especialidadesRaw) as Especialidad[];
  profesionales = JSON.parse(profesionalesRaw) as Profesional[];

  console.log(`Especialidades cargadas: ${especialidades.length}`);
  console.log(`Profesionales cargados: ${profesionales.length}`);
  console.log('Configuración de agenda:', configuracionAgenda);
}

cargarDatos().catch((error) => {
  console.error('Error al cargar los datos iniciales:', error);
});