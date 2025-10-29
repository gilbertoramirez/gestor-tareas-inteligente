interface CargandoProps {
  mensaje?: string;
}

export const Cargando = ({ mensaje = 'Cargando...' }: CargandoProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">{mensaje}</p>
    </div>
  );
};
