import { Router } from 'express';
import {
  getProfesionales,
  getProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
} from '../controllers/profesionales.controller';

const router = Router();

router.get('/', getProfesionales);
router.get('/:id', getProfesionalPorId);
router.post('/', crearProfesional);
router.put('/:id', actualizarProfesional);
router.delete('/:id', eliminarProfesional);

export default router;