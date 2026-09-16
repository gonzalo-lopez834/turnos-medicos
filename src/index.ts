import express from 'express';
import { cargarDatos } from './store';
import especialidadesRouter from './routes/especialidades.routes';
import profesionalesRouter from './routes/profesionales.routes';
import { bienvenida, rutaNoEncontrada } from './controllers/general.controller';

const app = express();
app.use(express.json());

app.get('/', bienvenida);

app.use('/especialidades', especialidadesRouter);
app.use('/profesionales', profesionalesRouter);

// Middleware final: captura cualquier ruta/método no contemplado por la API
app.use(rutaNoEncontrada);

const PORT = 3000;

cargarDatos()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor TurnosMed escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al cargar los datos iniciales:', error);
    process.exit(1);
  });