# Módulo Pacientes y Turnos — Propuesta Técnica (Mockup)

> Documento de diseño conceptual para el equipo de Frontend. Define el modelado de datos y el contrato de los dos nuevos endpoints del módulo, siguiendo las convenciones de Clean Architecture ya aplicadas en el resto de la API de TurnosMed (routes → controllers → services → models). **No implementado todavía** — es la base funcional para avanzar en paralelo con la pantalla de gestión de pacientes y asignación de turnos.

## 1. Modelado de datos

### 1.1 Paciente

Se relevaron los datos mínimos e indispensables para identificar de forma unívoca a una persona y poder contactarla ante cambios en su turno: **DNI** (identificador legal, único por paciente), nombre y apellido, fecha de nacimiento (útil a futuro para reglas etarias en algunas especialidades) y datos de contacto (teléfono y email, para notificaciones). Se incluye `activo` para dar de baja lógica a un paciente sin perder su historial de turnos, siguiendo el mismo criterio de soft delete que ya usamos en `Especialidad` y `Profesional`.

```typescript
interface Paciente {
  pacienteId: string;       // UUID v4, generado por el servidor
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;  // formato YYYY-MM-DD
  telefono: string;
  email: string;
  activo: boolean;
}
```

### 1.2 Turno

Un turno vincula a un `Paciente` con un `Profesional` en una fecha y hora determinadas. Se referencia a ambas entidades por su id (`pacienteId`, `medicoId`) en vez de anidar sus datos completos, para evitar duplicación y mantener una única fuente de verdad. Se agrega `especialidad` de forma explícita (en vez de inferirla del profesional) para poder validar en la asignación que coincide con la especialidad real del médico elegido.

La fecha y hora del turno deben respetar los límites operativos del centro médico, ya definidos desde la Actividad 1 en la interfaz `ConfiguracionAgenda` (atención de lunes a viernes, de 07:00 a 13:00 hs, en bloques de 30 minutos):

```typescript
interface ConfiguracionAgenda {
  fechaMaxima: string;
  horaMinima: string;
  horaMaxima: string;
}

interface Turno {
  turnoId: string;          // UUID v4, generado por el servidor
  pacienteId: string;       // referencia a Paciente.pacienteId
  medicoId: string;         // referencia a Profesional.medicoId
  especialidad: string;     // debe coincidir con la especialidad del profesional asignado
  fecha: string;            // YYYY-MM-DD, dentro del rango habilitado por ConfiguracionAgenda
  hora: string;             // HH:mm, entre horaMinima y horaMaxima, en bloques de 30 minutos
  estado: 'pendiente' | 'confirmado' | 'cancelado';
}
```

## 2. Endpoints propuestos

Ambos endpoints siguen el mismo recorrido en capas que el resto de la API: **route → controller → (a incorporar) service → model**. Por ahora la validación de negocio vive directamente en el controller, tal como en `especialidades` y `profesionales`; al introducir persistencia real, esa lógica se extraerá a una capa de `services` dedicada.

### 2.1 `POST /pacientes`

Registra un nuevo paciente en el sistema.

**Capas involucradas:**
- Route: `src/routes/pacientes.routes.ts`
- Controller: `crearPaciente` en `src/controllers/pacientes.controller.ts`
- Model: `Paciente` (persistido en `src/data/pacientes.json`)

**Request Body:**

```json
{
  "dni": "34567890",
  "nombre": "Martina",
  "apellido": "Suárez",
  "fechaNacimiento": "1995-04-12",
  "telefono": "+54 9 11 5555-1234",
  "email": "martina.suarez@example.com"
}
```

**Validaciones:**
- `dni`, `nombre`, `apellido`, `fechaNacimiento`, `telefono` y `email` son obligatorios y deben ser texto no vacío.
- `dni` debe ser único: si ya existe un paciente activo con ese DNI, se rechaza la creación.

**Respuestas:**

Éxito (`201 Created`):
```json
{
  "pacienteId": "b3f1c2a0-1234-4abc-9def-0123456789ab",
  "dni": "34567890",
  "nombre": "Martina",
  "apellido": "Suárez",
  "fechaNacimiento": "1995-04-12",
  "telefono": "+54 9 11 5555-1234",
  "email": "martina.suarez@example.com",
  "activo": true
}
```

Error de validación (`400 Bad Request`):
```json
{ "error": "El campo dni es obligatorio y debe ser un texto no vacío" }
```

Error de duplicado (`400 Bad Request`):
```json
{ "error": "Ya existe un paciente activo con el DNI 34567890" }
```

### 2.2 `POST /turnos`

Asigna un nuevo turno médico a un paciente ya registrado.

**Capas involucradas:**
- Route: `src/routes/turnos.routes.ts`
- Controller: `crearTurno` en `src/controllers/turnos.controller.ts`
- Model: `Turno` (persistido en `src/data/turnos.json`)

**Request Body:**

```json
{
  "pacienteId": "b3f1c2a0-1234-4abc-9def-0123456789ab",
  "medicoId": "c91e64e0-4c13-4863-9097-88f338051542",
  "especialidad": "Cardiología",
  "fecha": "2026-10-15",
  "hora": "09:30"
}
```

**Validaciones:**
- Todos los campos son obligatorios.
- `pacienteId` debe corresponder a un paciente existente y activo.
- `medicoId` debe corresponder a un profesional existente y activo.
- `especialidad` debe coincidir exactamente con la especialidad del profesional indicado.
- `fecha` debe ser un día hábil (lunes a viernes), no superar `configuracionAgenda.fechaMaxima`, y `hora` debe caer entre `horaMinima` y `horaMaxima` en un bloque válido de 30 minutos.
- No puede existir otro turno con el mismo `medicoId`, `fecha` y `hora` (evitar doble reserva del mismo profesional).

**Respuestas:**

Éxito (`201 Created`):
```json
{
  "turnoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "pacienteId": "b3f1c2a0-1234-4abc-9def-0123456789ab",
  "medicoId": "c91e64e0-4c13-4863-9097-88f338051542",
  "especialidad": "Cardiología",
  "fecha": "2026-10-15",
  "hora": "09:30",
  "estado": "pendiente"
}
```

Error de validación (`400 Bad Request`):
```json
{ "error": "La hora 14:00 está fuera del rango habilitado (07:00 - 13:00)" }
```

Error de referencia inexistente (`404 Not Found`):
```json
{ "error": "No existe un paciente activo con id b3f1c2a0-1234-4abc-9def-0123456789ab" }
```

Error de conflicto de agenda (`400 Bad Request`):
```json
{ "error": "El profesional ya tiene un turno asignado el 2026-10-15 a las 09:30" }
```