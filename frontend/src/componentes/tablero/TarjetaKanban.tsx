import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Calendar, GripVertical } from 'lucide-react';
import type { Tarea } from '../../tipos';
import { 
  obtenerColorPrioridad,
  obtenerEmojiPrioridad,
  timestampAFecha,
  textoTiempoRestante
} from '../../utilidades';
import { Badge } from '../comunes';

interface TarjetaKanbanProps {
  tarea: Tarea;
  onClick: () => void;
}

export const TarjetaKanban = ({ tarea, onClick }: TarjetaKanbanProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Dejar semi-transparente en lugar de ocultarlo
  };

  const fechaVencimiento = timestampAFecha(tarea.fechaVencimiento);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-3 border-2 border-gray-200 shadow-sm transition-all ${
        isDragging 
          ? 'shadow-xl border-blue-400' 
          : 'hover:shadow-md hover:border-blue-300'
      }`}
    >
      {/* Header con drag handle */}
      <div className="flex items-start gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
          title="Arrastra para mover"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1" onClick={onClick}>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-lg">
              {obtenerEmojiPrioridad(tarea.prioridad.categoria)}
            </span>
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
              {tarea.titulo}
            </h4>
            <div className={`px-2 py-1 rounded text-xs font-bold ${obtenerColorPrioridad(tarea.prioridad.categoria)}`}>
              {tarea.prioridad.puntuacion}
            </div>
          </div>

          {/* Descripción */}
          {tarea.descripcion && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-2 ml-6">
              {tarea.descripcion}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-col gap-1 text-xs text-gray-600 mt-2 ml-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{textoTiempoRestante(fechaVencimiento)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{tarea.seguimientoTiempo.horasEstimadas}h</span>
            </div>
          </div>

          {/* Etiquetas */}
          {tarea.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 ml-6">
              {tarea.etiquetas.slice(0, 2).map((etiqueta, idx) => (
                <Badge 
                  key={idx} 
                  texto={etiqueta} 
                  color="bg-gray-100 text-gray-700" 
                />
              ))}
              {tarea.etiquetas.length > 2 && (
                <Badge 
                  texto={`+${tarea.etiquetas.length - 2}`} 
                  color="bg-gray-100 text-gray-700" 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
