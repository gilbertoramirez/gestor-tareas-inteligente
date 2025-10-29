import { Clock, Calendar } from 'lucide-react';
import type { Tarea } from '../../tipos';
import { 
  obtenerColorPrioridad, 
  obtenerEmojiPrioridad,
  obtenerColorEstado,
  obtenerTextoEstado,
  timestampAFecha,
  textoTiempoRestante
} from '../../utilidades';
import { Badge } from '../comunes';

interface TarjetaTareaProps {
  tarea: Tarea;
  onClick?: () => void;
}

export const TarjetaTarea = ({ tarea, onClick }: TarjetaTareaProps) => {
  const fechaVencimiento = timestampAFecha(tarea.fechaVencimiento);

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">
              {obtenerEmojiPrioridad(tarea.prioridad.categoria)}
            </span>
            <h3 className="font-semibold text-gray-900 text-lg">
              {tarea.titulo}
            </h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {tarea.descripcion}
          </p>
        </div>
        
        {/* Score de prioridad */}
        <div className="ml-4">
          <div className={`px-3 py-2 rounded-lg font-bold text-lg border-2 ${obtenerColorPrioridad(tarea.prioridad.categoria)}`}>
            {tarea.prioridad.puntuacion}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{textoTiempoRestante(fechaVencimiento)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{tarea.seguimientoTiempo.horasEstimadas}h estimadas</span>
        </div>
      </div>

      {/* Etiquetas y estado */}
      <div className="flex items-center justify-between">
        {/* Etiquetas */}
        <div className="flex flex-wrap gap-2">
          {tarea.etiquetas.slice(0, 3).map((etiqueta, index) => (
            <Badge key={index} texto={etiqueta} color="bg-gray-100 text-gray-700" />
          ))}
          {tarea.etiquetas.length > 3 && (
            <Badge texto={`+${tarea.etiquetas.length - 3}`} color="bg-gray-100 text-gray-700" />
          )}
        </div>

        {/* Estado */}
        <Badge 
          texto={obtenerTextoEstado(tarea.estado)} 
          color={obtenerColorEstado(tarea.estado)} 
        />
      </div>
    </div>
  );
};
