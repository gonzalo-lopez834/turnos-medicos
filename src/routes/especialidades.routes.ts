import { Router } from 'express';
import {
  getEspecialidades,
  getEspecialidadPorId,
  crearEspecialidad,
  eliminarEspecialidad,
} from '../controllers/especialidades.controller';

const router = Router();

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadPorId);
router.post('/', crearEspecialidad);
router.delete('/:id', eliminarEspecialidad);

export default router;