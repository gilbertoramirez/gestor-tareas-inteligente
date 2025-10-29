import { Request, Response, NextFunction } from 'express';
import { auth } from '../configuracion/firebase';

/**
 * Middleware para verificar token de Firebase
 */
export const verificarToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar el token con Firebase
    const tokenDecodificado = await auth.verifyIdToken(token);
    
    // Agregar info del usuario al request
    req.usuario = {
      uid: tokenDecodificado.uid,
      email: tokenDecodificado.email
    };
    
    next();
    
  } catch (error: any) {
    console.error('Error al verificar token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
};
