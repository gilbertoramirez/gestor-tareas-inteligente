import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import type { Tarea, EstadoTarea } from '../../tipos';
import { ColumnaKanban } from './ColumnaKanban';
import { useTareasStore } from '../../store';

interface VistaKanbanProps {
  tareas: Tarea[];
  onClickTarea: (tarea: Tarea) => void;
}

const ESTADOS: EstadoTarea[] = [
  'pendiente',
  'trabajando',
  'pausada',
  'revision',
  'completada',
  'cancelada'
];

export const VistaKanban = ({ tareas, onClickTarea }: VistaKanbanProps) => {
  const { actualizarTarea } = useTareasStore();
  const [tareaActiva, setTareaActiva] = useState<Tarea | null>(null);

  useEffect(() => {
    console.log('🔧 VistaKanban montada');
    console.log('📦 Tareas recibidas:', tareas.length);
    return () => {
      console.log('🔧 VistaKanban desmontada');
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const obtenerTareasPorEstado = (estado: EstadoTarea): Tarea[] => {
    return tareas
      .filter(t => t.estado === estado)
      .sort((a, b) => b.prioridad.puntuacion - a.prioridad.puntuacion);
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 DRAG START');
    console.log('Active ID:', event.active.id);
    console.log('Active data:', event.active.data);
    
    const tarea = tareas.find(t => t.id === event.active.id);
    if (tarea) {
      console.log('✅ Tarea encontrada:', tarea.titulo);
      console.log('Estado actual:', tarea.estado);
      setTareaActiva(tarea);
    } else {
      console.log('❌ Tarea NO encontrada');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    console.log('🔄 DRAG OVER');
    console.log('Over ID:', event.over?.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏁 DRAG END');
    console.log('Active:', event.active.id);
    console.log('Over:', event.over?.id);
    
    const { active, over } = event;
    
    setTareaActiva(null);

    if (!over) {
      console.log('❌ NO HAY OVER - drop fuera');
      return;
    }

    const tareaId = active.id as string;
    const nuevoEstado = over.id as EstadoTarea;
    
    console.log('🎯 Intentando mover a:', nuevoEstado);
    console.log('🎯 Estados válidos:', ESTADOS);
    console.log('🎯 ¿Es válido?', ESTADOS.includes(nuevoEstado));
    
    if (!ESTADOS.includes(nuevoEstado)) {
      console.log('❌ Estado no válido');
      return;
    }
    
    const tarea = tareas.find(t => t.id === tareaId);
    
    if (!tarea) {
      console.log('❌ Tarea no encontrada en array');
      return;
    }
    
    console.log('✅ Tarea:', tarea.titulo);
    console.log('✅ Estado actual:', tarea.estado);
    console.log('✅ Nuevo estado:', nuevoEstado);
    
    if (tarea.estado === nuevoEstado) {
      console.log('ℹ️ Mismo estado - no hacer nada');
      return;
    }

    try {
      console.log('🚀 Ejecutando actualizarTarea...');
      await actualizarTarea(tareaId, { estado: nuevoEstado });
      console.log('✅ ¡ACTUALIZACIÓN EXITOSA!');
    } catch (error) {
      console.error('❌ ERROR al actualizar:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full">
        {ESTADOS.map(estado => {
          const tareasColumna = obtenerTareasPorEstado(estado);
          return (
            <ColumnaKanban
              key={estado}
              estado={estado}
              tareas={tareasColumna}
              onClickTarea={onClickTarea}
            />
          );
        })}
      </div>

      <DragOverlay>
        {tareaActiva ? (
          <div className="bg-white rounded-lg p-3 border-2 border-blue-400 shadow-2xl">
            <div className="font-semibold text-gray-900">
              🎯 {tareaActiva.titulo}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
