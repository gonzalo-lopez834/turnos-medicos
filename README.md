# TurnosMed

Backend para la gestión de turnos de un centro de atención médica. Centraliza especialidades y profesionales de la salud, exponiendo una API RESTful sobre datos persistidos en arrays en memoria (cargados desde JSON al iniciar el servidor).

## Requisitos

- Node.js LTS (v20+)
- npm

## Instalación y ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/gonzalo-lopez834/turnos-medicos.git
   cd turnos-medicos
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo (recarga automática ante cambios en `src/`):
   ```bash
   npm run dev
   ```
4. Alternativamente, compilar y ejecutar en modo producción:
   ```bash
   npm run build
   npm run start
   ```

El servidor queda escuchando en `http://localhost:3000`.

## Arquitectura

El código sigue una separación de responsabilidades inspirada en Clean Architecture:

- **routes/**: definición de rutas por entidad, sin lógica de negocio.
- **controllers/**: lógica de cada endpoint, en funciones `async` independientes por entidad (y un controller general para bienvenida y 404).
- **store.ts**: carga de datos (`node:fs/promises`) y arrays en memoria compartidos.

Cada controller declara una variable `status` que se ajusta dinámicamente según el resultado del flujo. Las validaciones previas lanzan errores explícitos (`throw new Error(...)`) capturados en un único bloque `catch` por función, que arma la respuesta de error. Toda respuesta exitosa se envía con `return res.status(status).json(...)` en una sola instrucción.

## Estructura del proyecto

```
turnos-medicos/
├── src/
│   ├── index.ts                       # Bootstrap del servidor Express
│   ├── store.ts                       # Carga de datos y arrays en memoria
│   ├── data/
│   │   ├── especialidades.json
│   │   └── profesionales.json
│   ├── routes/
│   │   ├── especialidades.routes.ts
│   │   └── profesionales.routes.ts
│   └── controllers/
│       ├── general.controller.ts      # Bienvenida (GET /) y 404 global
│       ├── especialidades.controller.ts
│       └── profesionales.controller.ts
├── pacientes-turnos.md                # Mockup del próximo módulo (no implementado)
├── TurnosMed_API.postman_collection.json
├── package.json
├── tsconfig.json
└── README.md
```

## Documentación de la API

Todos los endpoints comparten la URL base `http://localhost:3000`. En Postman, esa base está centralizada en la variable de colección `{{baseUrl}}`.

### General

#### `GET /`

Mensaje de bienvenida de la API.

- **Params:** no aplica
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | OK | `{ "mensaje": "Bienvenido a la API de TurnosMed" }` |

#### Cualquier ruta/método no contemplado

Middleware global de 404 (servido desde `general.controller.ts`).

| Código | Caso | Body |
|---|---|---|
| 404 | Ruta inexistente | `{ "error": "Recurso no encontrado", "mensaje": "No existe la ruta GET /ruta en esta API" }` |

---

### Especialidades

#### `GET /especialidades`

Lista todas las especialidades registradas (activas e inactivas).

- **Params:** no aplica
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso |
|---|---|
| 200 | Listado completo |

```json
[
  { "especialidadId": "d838cba2-9b97-4dcf-abf9-f5b3644413cf", "nombreEspecialidad": "Cardiología", "activa": true }
]
```

#### `GET /especialidades/:id`

Busca una especialidad por su id.

- **Params:** `id` (path) — `especialidadId` (UUID v4)
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | Encontrada | objeto `Especialidad` |
| 404 | No existe | `{ "error": "No existe una especialidad con id <id>" }` |

#### `POST /especialidades`

Crea una nueva especialidad.

- **Params:** no aplica
- **Query Params:** no aplica
- **Body:**
```json
{ "nombreEspecialidad": "Cirugía General" }
```

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 201 | Creada | objeto `Especialidad` con `especialidadId` generado y `activa: true` |
| 400 | `nombreEspecialidad` vacío o ausente | `{ "error": "El campo nombreEspecialidad es obligatorio y debe ser un texto no vacío" }` |

#### `DELETE /especialidades/:id`

Baja lógica de una especialidad (`activa: false`). No elimina el registro.

- **Params:** `id` (path) — `especialidadId`
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | Baja aplicada | objeto `Especialidad` actualizado |
| 404 | No existe | `{ "error": "No existe una especialidad con id <id>" }` |

---

### Profesionales

#### `GET /profesionales`

Lista todos los profesionales registrados.

- **Params:** no aplica
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso |
|---|---|
| 200 | Listado completo |

```json
[
  { "medicoId": "c91e64e0-4c13-4863-9097-88f338051542", "nombre": "Ana García", "especialidad": "Cardiología", "activo": true }
]
```

#### `GET /profesionales/:id`

Busca un profesional por su id.

- **Params:** `id` (path) — `medicoId` (UUID v4)
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | Encontrado | objeto `Profesional` |
| 404 | No existe | `{ "error": "No existe un profesional con id <id>" }` |

#### `POST /profesionales`

Registra un nuevo profesional. Valida que la especialidad indicada exista en el listado de especialidades.

- **Params:** no aplica
- **Query Params:** no aplica
- **Body:**
```json
{ "nombre": "Roberto Sosa", "especialidad": "Cardiología", "activo": true }
```
(`activo` es opcional; por defecto `true`)

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 201 | Creado | objeto `Profesional` con `medicoId` generado |
| 400 | Falta `nombre`/`especialidad`, o están vacíos | `{ "error": "El campo nombre es obligatorio y debe ser un texto no vacío" }` |
| 400 | La especialidad no existe | `{ "error": "La especialidad \"X\" no existe en el listado de especialidades" }` |

#### `PUT /profesionales/:id`

Actualiza completamente los datos de un profesional existente.

- **Params:** `id` (path) — `medicoId`
- **Query Params:** no aplica
- **Body:**
```json
{ "nombre": "Roberto Sosa", "especialidad": "Cardiología", "activo": true }
```

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | Actualizado | objeto `Profesional` actualizado |
| 400 | Campo faltante, vacío o de tipo inválido | `{ "error": "El campo activo es obligatorio y debe ser booleano" }` |
| 400 | La especialidad no existe | `{ "error": "La especialidad \"X\" no existe en el listado de especialidades" }` |
| 404 | No existe el profesional | `{ "error": "No existe un profesional con id <id>" }` |

#### `DELETE /profesionales/:id`

Baja lógica de un profesional (`activo: false`). No elimina el registro.

- **Params:** `id` (path) — `medicoId`
- **Query Params:** no aplica
- **Body:** no aplica

**Respuestas:**

| Código | Caso | Body |
|---|---|---|
| 200 | Baja aplicada | objeto `Profesional` actualizado |
| 404 | No existe | `{ "error": "No existe un profesional con id <id>" }` |

---

### Próximo módulo: Pacientes y Turnos

Diseño conceptual y contrato propuesto (aún no implementado) en [`pacientes-turnos.md`](./pacientes-turnos.md), incluyendo el modelado de datos y la definición de `POST /pacientes` y `POST /turnos`.

## Persistencia

Los datos se cargan una única vez al iniciar el servidor desde `src/data/*.json` y se manipulan en memoria (arrays globales). Los cambios (altas, bajas, modificaciones) **no se guardan de vuelta al archivo**: se pierden al reiniciar el proceso.

## Pruebas con Postman

La colección `TurnosMed_API.postman_collection.json` (en la raíz del repo) contiene los endpoints organizados en carpetas **Especialidades** y **Profesionales**, más las requests sueltas de bienvenida y 404 global, con casos de éxito y de error para cada uno. La URL base está centralizada en la variable de colección `baseUrl`, configurada en `http://localhost:3000` — todas las requests la usan como `{{baseUrl}}/especialidades`, sin URLs escritas a mano, así que alcanza con cambiar esa variable en un solo lugar para apuntar a otro entorno.

## Uso de Inteligencia Artificial

Se utilizó Claude (Anthropic) como asistente durante el desarrollo: diseño y refactor de la arquitectura en capas (routes/controllers), migración de los handlers a funciones asincrónicas con manejo de errores mediante `throw`/`catch` y códigos de estado dinámicos, generación de los datos iniciales, diseño del mockup conceptual del módulo Pacientes y Turnos (`pacientes-turnos.md`), redacción de esta documentación técnica, y armado de la colección de Postman y de los documentos de evidencias.