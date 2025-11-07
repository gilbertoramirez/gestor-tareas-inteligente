import { create } from 'zustand';
import type { Tarea, CrearTareaDTO, ActualizarTareaDTO } from '../tipos';
import { servicioTareas } from '../servicios';

interface TareasState {
  tareas: Tarea[];
  tareaSeleccionada: Tarea | null;
  cargando: boolean;
  error: string | null;
  
  // Acciones de tareas
  cargarTareas: () => Promise<void>;
  cargarTareasPorPrioridad: () => Promise<void>;
  crearTarea: (datos: CrearTareaDTO) => Promise<void>;
  actualizarTarea: (id: string, datos: ActualizarTareaDTO) => Promise<void>;
  eliminarTarea: (id: string) => Promise<void>;
  seleccionarTarea: (tarea: Tarea | null) => void;
  filtrarPorEstado: (estado: string) => void;
  
  // Acciones de subtareas
  agregarSubtarea: (tareaId: string, titulo: string, descripcion: string) => Promise<void>;
  actualizarSubtarea: (tareaId: string, subtareaId: string, estado: 'pendiente' | 'completada') => Promise<void>;
  eliminarSubtarea: (tareaId: string, subtareaId: string) => Promise<void>;
}

export const useTareasStore = create<TareasState>((set, get) => ({
  tareas: [],
  tareaSeleccionada: null,
  cargando: false,
  error: null,

  cargarTareas: async () => {
    try {
      set({ cargando: true, error: null });
      const tareas = await servicioTareas.listarTareas();
      console.log('📦 Tareas cargadas:', tareas.length);
      set({ tareas, cargando: false });
    } catch (error: any) {
      console.error('❌ Error cargando tareas:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
    }
  },

  cargarTareasPorPrioridad: async () => {
    try {
      set({ cargando: true, error: null });
      const tareas = await servicioTareas.obtenerListaPrioridades();
      console.log('📦 Tareas por prioridad cargadas:', tareas.length);
      set({ tareas, cargando: false });
    } catch (error: any) {
      console.error('❌ Error cargando tareas por prioridad:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
    }
  },

  crearTarea: async (datos: CrearTareaDTO) => {
    try {
      set({ cargando: true, error: null });
      const nuevaTarea = await servicioTareas.crearTarea(datos);
      console.log('✅ Tarea creada:', nuevaTarea.id);
      set((state) => ({
        tareas: [...state.tareas, nuevaTarea],
        cargando: false
      }));
    } catch (error: any) {
      console.error('❌ Error creando tarea:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  actualizarTarea: async (id: string, datos: ActualizarTareaDTO) => {
    try {
      set({ cargando: true, error: null });
      console.log('🔄 Actualizando tarea:', id, datos);
      const tareaActualizada = await servicioTareas.actualizarTarea(id, datos);
      console.log('✅ Tarea actualizada desde API:', tareaActualizada);
      
      set((state) => {
        const nuevasTareas = state.tareas.map(t => 
          t.id === id ? tareaActualizada : t
        );
        console.log('📦 Store actualizado con', nuevasTareas.length, 'tareas');
        
        return {
          tareas: nuevasTareas,
          tareaSeleccionada: state.tareaSeleccionada?.id === id 
            ? tareaActualizada 
            : state.tareaSeleccionada,
          cargando: false
        };
      });
    } catch (error: any) {
      console.error('❌ Error actualizando tarea:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  eliminarTarea: async (id: string) => {
    try {
      set({ cargando: true, error: null });
      await servicioTareas.eliminarTarea(id);
      console.log('🗑️ Tarea eliminada:', id);
      set((state) => ({
        tareas: state.tareas.filter(t => t.id !== id),
        tareaSeleccionada: state.tareaSeleccionada?.id === id 
          ? null 
          : state.tareaSeleccionada,
        cargando: false
      }));
    } catch (error: any) {
      console.error('❌ Error eliminando tarea:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  seleccionarTarea: (tarea: Tarea | null) => {
    console.log('👆 Tarea seleccionada:', tarea?.id);
    set({ tareaSeleccionada: tarea });
  },

  filtrarPorEstado: async (estado: string) => {
    try {
      set({ cargando: true, error: null });
      const tareas = await servicioTareas.listarTareas({ estado });
      console.log('🔍 Tareas filtradas por estado', estado, ':', tareas.length);
      set({ tareas, cargando: false });
    } catch (error: any) {
      console.error('❌ Error filtrando tareas:', error);
      set({ 
        error: error.message, 
        cargando: false 
      });
    }
  },

  // 🔥 MEJORADO: Acciones de subtareas con logs
  agregarSubtarea: async (tareaId: string, titulo: string, descripcion: string) => {
    try {
      console.log('➕ Agregando subtarea a tarea:', tareaId);
      const tareaActualizada = await servicioTareas.agregarSubtarea(tareaId, titulo, descripcion);
      console.log('✅ Subtarea agregada. Tarea actualizada:', tareaActualizada);
      
      set((state) => {
        const nuevasTareas = state.tareas.map(t => 
          t.id === tareaId ? tareaActualizada : t
        );
        
        console.log('📦 Store actualizado después de agregar subtarea');
        
        return {
          tareas: nuevasTareas,
          tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
            ? tareaActualizada 
            : state.tareaSeleccionada
        };
      });
    } catch (error: any) {
      console.error('❌ Error agregando subtarea:', error);
      throw error;
    }
  },

  actualizarSubtarea: async (tareaId: string, subtareaId: string, estado: 'pendiente' | 'completada') => {
    try {
      console.log('🔄 Actualizando subtarea:', subtareaId, 'a estado:', estado);
      const tareaActualizada = await servicioTareas.actualizarSubtarea(tareaId, subtareaId, estado);
      console.log('✅ Subtarea actualizada. Tarea actualizada:', tareaActualizada);
      
      set((state) => {
        const nuevasTareas = state.tareas.map(t => 
          t.id === tareaId ? tareaActualizada : t
        );
        
        console.log('📦 Store actualizado después de actualizar subtarea');
        console.log('📊 Subtareas actualizadas:', tareaActualizada.subtareas?.map(s => ({
          id: s.id,
          titulo: s.titulo,
          estado: s.estado
        })));
        
        return {
          tareas: nuevasTareas,
          tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
            ? tareaActualizada 
            : state.tareaSeleccionada
        };
      });
    } catch (error: any) {
      console.error('❌ Error actualizando subtarea:', error);
      throw error;
    }
  },

  eliminarSubtarea: async (tareaId: string, subtareaId: string) => {
    try {
      console.log('🗑️ Eliminando subtarea:', subtareaId);
      const tareaActualizada = await servicioTareas.eliminarSubtarea(tareaId, subtareaId);
      console.log('✅ Subtarea eliminada. Tarea actualizada:', tareaActualizada);
      
      set((state) => {
        const nuevasTareas = state.tareas.map(t => 
          t.id === tareaId ? tareaActualizada : t
        );
        
        console.log('📦 Store actualizado después de eliminar subtarea');
        
        return {
          tareas: nuevasTareas,
          tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
            ? tareaActualizada 
            : state.tareaSeleccionada
        };
      });
    } catch (error: any) {
      console.error('❌ Error eliminando subtarea:', error);
      throw error;
    }
  }
}));