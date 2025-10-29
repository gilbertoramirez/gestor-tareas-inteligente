import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Tarea, EstadoTarea } from '../../tipos';
import { TarjetaKanban } from './TarjetaKanban';
import { obtenerTextoEstado } from '../../utilidades';

interface ColumnaKanbanProps {
  estado: EstadoTarea;
  tareas: Tarea[];
  onClickTarea: (tarea: Tarea) => void;
}

const coloresColumna: Record<EstadoTarea, string> = {
  'pendiente': 'bg-gray-100 border-gray-300',
  'trabajando': 'bg-blue-50 border-blue-300',
  'pausada': 'bg-yellow-50 border-yellow-300',
  'revision': 'bg-purple-50 border-purple-300',
  'completada': 'bg-green-50 border-green-300',
  'cancelada': 'bg-red-50 border-red-300'
};

export const ColumnaKanban = ({ estado, tareas, onClickTarea }: ColumnaKanbanProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: estado,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header de la columna */}
      <div className={`rounded-t-lg border-2 ${coloresColumna[estado]} p-4`}>
        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
          <span>{obtenerTextoEstado(estado)}</span>
          <span className="bg-white px-2 py-1 rounded-full text-sm">
            {tareas.length}
          </span>
        </h3>
      </div>

      {/* Zona de drop - IMPORTANTE: El ref debe estar aquí */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 min-h-[300px] border-2 border-t-0 rounded-b-lg transition-colors ${
          isOver 
            ? 'bg-blue-100 border-blue-400' 
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <SortableContext 
          items={tareas.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tareas.map((tarea) => (
            <TarjetaKanban
              key={tarea.id}
              tarea={tarea}
              onClick={() => onClickTarea(tarea)}
            />
          ))}
        </SortableContext>
        
        {tareas.length === 0 && !isOver && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Sin tareas
          </div>
        )}
        
        {tareas.length === 0 && isOver && (
          <div className="text-center py-8 text-blue-500 text-sm font-medium">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  );
};
