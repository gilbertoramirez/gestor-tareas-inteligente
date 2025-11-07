import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro';
  children: ReactNode;
  cargando?: boolean;
}

export const Boton = ({ 
  variante = 'primario', 
  children, 
  cargando = false,
  disabled,
  className = '',
  ...props 
}: BotonProps) => {
  const estilosBase = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const estilosVariante = {
    primario: 'bg-blue-600 hover:bg-blue-700 text-white',
    secundario: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    peligro: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      className={`${estilosBase} ${estilosVariante[variante]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
