import { Router } from 'express';
import { controladorTareas } from '../controladores/controladorTareas';
import { autenticacionTemporal } from '../middlewares/autenticacionTemporal';

const router = Router();

router.use(autenticacionTemporal);

// Rutas de tareas
router.post('/', (req, res) => controladorTareas.crearTarea(req, res));
router.get('/', (req, res) => controladorTareas.listarTareas(req, res));
router.get('/prioridad/lista', (req, res) => controladorTareas.obtenerListaPrioridades(req, res));
router.get('/:id', (req, res) => controladorTareas.obtenerTarea(req, res));
router.patch('/:id', (req, res) => controladorTareas.actualizarTarea(req, res));
router.delete('/:id', (req, res) => controladorTareas.eliminarTarea(req, res));

// Rutas de subtareas
router.post('/:id/subtareas', (req, res) => controladorTareas.agregarSubtarea(req, res));
router.patch('/:id/subtareas/:subtareaId', (req, res) => controladorTareas.actualizarSubtarea(req, res));
router.delete('/:id/subtareas/:subtareaId', (req, res) => controladorTareas.eliminarSubtarea(req, res));

export default router;
