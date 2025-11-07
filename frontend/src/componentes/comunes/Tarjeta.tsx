import type { ReactNode } from 'react';

interface TarjetaProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Tarjeta = ({ children, className = '', onClick }: TarjetaProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
