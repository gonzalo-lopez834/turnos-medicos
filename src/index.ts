import express from 'express';
import { cargarDatos } from './store';
import especialidadesRouter from './routes/especialidades.routes';
import profesionalesRouter from './routes/profesionales.routes';

const app = express();
app.use(express.json());

app.use('/especialidades', especialidadesRouter);

app.use('/profesionales', profesionalesRouter);

// Middleware final: captura cualquier ruta/método no contemplado por la API
app.use((req, res) => {
  res.status(404).json({
    error: 'Recurso no encontrado',
    mensaje: `No existe la ruta ${req.method} ${req.originalUrl} en esta API`,
  });
});

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