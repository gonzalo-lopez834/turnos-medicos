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

## Estructura del proyecto

```
src/
├── index.ts                          # Bootstrap del servidor Express + middleware 404
├── store.ts                          # Carga de datos (fs/promises) y arrays en memoria
├── data/
│   ├── especialidades.json
│   └── profesionales.json
├── routes/
│   ├── especialidades.routes.ts
│   └── profesionales.routes.ts
└── controllers/
    ├── especialidades.controller.ts
    └── profesionales.controller.ts
```

## Endpoints

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

Cualquier otra ruta o método no contemplado devuelve `404` con un JSON explicativo:

```json
{ "error": "Recurso no encontrado", "mensaje": "No existe la ruta GET /ruta en esta API" }
```

## Persistencia

Los datos se cargan una única vez al iniciar el servidor desde `src/data/*.json` y se manipulan en memoria (arrays globales). Los cambios (altas, bajas, modificaciones) **no se guardan de vuelta al archivo**: se pierden al reiniciar el proceso. Esto es intencional — el equipo de base de datos está diseñando la persistencia definitiva sobre esta misma estructura.

## Pruebas con Postman

La colección `TurnosMed_API.postman_collection.json` (en la raíz del repo) contiene los endpoints organizados en carpetas **Especialidades** y **Profesionales**, con casos de éxito y de error (happy path / unhappy path) para cada uno, más una request suelta para verificar el middleware de 404 global. Al importarla, configurá la variable de colección `baseUrl = http://localhost:3000`.

## Uso de Inteligencia Artificial

Se utilizó Claude (Anthropic) como asistente durante el desarrollo: diseño de la estructura en capas (routes/controllers), generación de los datos iniciales de especialidades y profesionales, redacción de los controllers con manejo de errores y códigos de estado HTTP, y armado de la colección de Postman y del documento de evidencias.