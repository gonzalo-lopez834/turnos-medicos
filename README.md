# TurnosMed

Backend para la gestión de turnos de un centro de atención médica. Centraliza especialidades y profesionales de la salud, exponiendo una API RESTful sobre datos persistidos en arrays en memoria (cargados desde JSON al iniciar el servidor).

## Requisitos

- Node.js LTS (v20+)
- npm

## Instalación y ejecución

```bash
npm install
npm run build
npm run start
```

El servidor queda escuchando en `http://localhost:3000`.

## Arquitectura

El código sigue una separación de responsabilidades inspirada en Clean Architecture:

- **routes/**: definición de rutas por entidad, sin lógica de negocio.
- **controllers/**: lógica de cada endpoint, portada a funciones `async` independientes por entidad (y un controller general para bienvenida y 404).
- **store.ts**: carga de datos (`node:fs/promises`) y arrays en memoria compartidos.

Cada controller declara una variable `status` que se ajusta dinámicamente según el resultado del flujo (éxito o error). Las validaciones previas lanzan errores explícitos (`throw new Error(...)`) que son capturados en un único bloque `catch` por función, el cual arma la respuesta de error. Toda respuesta exitosa se envía con `return res.status(status).json(...)` en una sola instrucción, evitando ejecuciones posteriores no deseadas ("headers already sent").

## Estructura del proyecto

```
src/
├── index.ts                          # Bootstrap del servidor Express
├── store.ts                          # Carga de datos y arrays en memoria
├── data/
│   ├── especialidades.json
│   └── profesionales.json
├── routes/
│   ├── especialidades.routes.ts
│   └── profesionales.routes.ts
└── controllers/
    ├── general.controller.ts          # Bienvenida (GET /) y 404 global
    ├── especialidades.controller.ts
    └── profesionales.controller.ts
```

## Endpoints

### General

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | / | Mensaje de bienvenida | 200 |

### Especialidades

| Método | Ruta | Descripción | Body | Respuestas |
|---|---|---|---|---|
| GET | /especialidades | Lista todas las especialidades | — | 200 |
| GET | /especialidades/:id | Busca por `especialidadId` | — | 200 / 404 |
| POST | /especialidades | Crea una especialidad | `{ "nombreEspecialidad": string }` | 201 / 400 |
| DELETE | /especialidades/:id | Baja lógica (`activa: false`) | — | 200 / 404 |

### Profesionales

| Método | Ruta | Descripción | Body | Respuestas |
|---|---|---|---|---|
| GET | /profesionales | Lista todos los profesionales | — | 200 |
| GET | /profesionales/:id | Busca por `medicoId` | — | 200 / 404 |
| POST | /profesionales | Registra un profesional (valida que la especialidad exista) | `{ "nombre": string, "especialidad": string, "activo"?: boolean }` | 201 / 400 |
| PUT | /profesionales/:id | Actualiza completamente un profesional | `{ "nombre": string, "especialidad": string, "activo": boolean }` | 200 / 400 / 404 |
| DELETE | /profesionales/:id | Baja lógica (`activo: false`) | — | 200 / 404 |

Cualquier otra ruta o método no contemplado devuelve `404` (servido desde `general.controller.ts`):

```json
{ "error": "Recurso no encontrado", "mensaje": "No existe la ruta GET /ruta en esta API" }
```

## Persistencia

Los datos se cargan una única vez al iniciar el servidor desde `src/data/*.json` y se manipulan en memoria (arrays globales). Los cambios (altas, bajas, modificaciones) **no se guardan de vuelta al archivo**: se pierden al reiniciar el proceso. El equipo de base de datos está diseñando la persistencia definitiva tomando como modelo esta misma estructura.

## Pruebas con Postman

La colección `TurnosMed_API.postman_collection.json` (en la raíz del repo) contiene los endpoints organizados en carpetas **Especialidades** y **Profesionales**, más las requests sueltas de bienvenida y 404 global, con casos de éxito y de error (happy path / unhappy path) para cada uno. Al importarla, configurá la variable de colección `baseUrl = http://localhost:3000`.

## Uso de Inteligencia Artificial

Se utilizó Claude (Anthropic) como asistente durante el desarrollo: diseño y refactor de la arquitectura en capas (routes/controllers), migración de los handlers a funciones asincrónicas con manejo de errores mediante `throw`/`catch` y códigos de estado dinámicos, generación de los datos iniciales, y armado de la colección de Postman y de los documentos de evidencias.
