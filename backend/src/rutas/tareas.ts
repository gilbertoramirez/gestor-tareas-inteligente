import { Router } from 'express';
import { controladorTareas } from '../controladores/controladorTareas';
import { autenticacionTemporal } from '../middlewares/autenticacionTemporal';

const router = Router();

// Middleware de autenticación
router.use(autenticacionTemporal);

// ✅ Ruta de categorías (ANTES de /:id)
router.get('/categorias', async (req, res) => {
  await controladorTareas.obtenerCategorias(req, res);
});

// Otras rutas específicas
router.get('/prioridad/lista', async (req, res) => {
  await controladorTareas.obtenerListaPrioridades(req, res);
});

// Rutas CRUD de tareas
router.post('/', async (req, res) => {
  await controladorTareas.crearTarea(req, res);
});

router.get('/', async (req, res) => {
  await controladorTareas.listarTareas(req, res);
});

router.get('/:id', async (req, res) => {
  await controladorTareas.obtenerTarea(req, res);
});

router.patch('/:id', async (req, res) => {
  await controladorTareas.actualizarTarea(req, res);
});

router.delete('/:id', async (req, res) => {
  await controladorTareas.eliminarTarea(req, res);
});

// Rutas de subtareas
router.post('/:id/subtareas', async (req, res) => {
  await controladorTareas.agregarSubtarea(req, res);
});

router.patch('/:id/subtareas/:subtareaId', async (req, res) => {
  await controladorTareas.actualizarSubtarea(req, res);
});

router.delete('/:id/subtareas/:subtareaId', async (req, res) => {
  await controladorTareas.eliminarSubtarea(req, res);
});

export default router;