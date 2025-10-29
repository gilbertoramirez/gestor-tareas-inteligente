import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Cargando } from './Cargando';

interface RutaProtegidaProps {
  children: ReactNode;
}

export const RutaProtegida = ({ children }: RutaProtegidaProps) => {
  const { usuario, cargando, inicializarAuth } = useAuthStore();

  useEffect(() => {
    inicializarAuth();
  }, [inicializarAuth]);

  if (cargando) {
    return <Cargando mensaje="Verificando autenticación..." />;
  }

  // Por ahora permitimos acceso sin autenticación para desarrollo
  // TODO: Descomentar cuando implementemos auth real
  // if (!usuario) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};
