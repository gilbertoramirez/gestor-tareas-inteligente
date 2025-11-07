import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rutasTareas from './rutas/tareas';

// Cargar variables de entorno
dotenv.config();

// Importar configuración de Firebase (esto inicializa la conexión)
import './configuracion/firebase';

// Crear aplicación Express
const app: Application = express();
const PUERTO = process.env.PUERTO || 3000;

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : true,  // ✅ Permitir cualquier origen en desarrollo
  credentials: true
}));
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios

// Logging de requests (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// RUTAS
// ========================================

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    mensaje: '🚀 API del Gestor de Tareas Inteligente',
    version: '1.0.0',
    estado: 'funcionando',
    endpoints: {
      salud: '/salud',
      tareas: '/api/tareas'
    }
  });
});

// Health check
app.get('/salud', (req: Request, res: Response) => {
  res.json({
    estado: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoria: process.memoryUsage()
  });
});

// Rutas de la API
app.use('/api/tareas', (req, res, next) => {
  console.log('🔍 DEBUG - Ruta completa:', req.method, req.path);
  console.log('🔍 DEBUG - URL completa:', req.originalUrl);
  next();
});

app.use('/api/tareas', rutasTareas);

// Ruta para 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.path
  });
});

// Manejador de errores global
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error global:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'desarrollo' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log('========================================');
  console.log('🚀 Servidor iniciado correctamente');
  console.log(`📍 URL: http://localhost:${PUERTO}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'desarrollo'}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString('es-MX')}`);
  console.log('========================================');
});

export default app;
