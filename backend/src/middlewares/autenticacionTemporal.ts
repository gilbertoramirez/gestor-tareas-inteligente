import { Request, Response, NextFunction } from 'express';

/**
 * Middleware temporal para desarrollo SIN autenticación real
 * ⚠️ SOLO PARA DESARROLLO - ELIMINAR EN PRODUCCIÓN
 */
export const autenticacionTemporal = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Simular un usuario autenticado
  req.usuario = {
    uid: 'usuario-prueba-123',
    email: 'prueba@test.com'
  };
  
  console.log('⚠️  Usando autenticación temporal (desarrollo)');
  next();
};
