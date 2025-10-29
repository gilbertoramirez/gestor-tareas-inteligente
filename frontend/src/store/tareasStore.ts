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
      set({ tareas, cargando: false });
    } catch (error: any) {
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
      set({ tareas, cargando: false });
    } catch (error: any) {
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
      set((state) => ({
        tareas: [...state.tareas, nuevaTarea],
        cargando: false
      }));
    } catch (error: any) {
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
      const tareaActualizada = await servicioTareas.actualizarTarea(id, datos);
      set((state) => ({
        tareas: state.tareas.map(t => t.id === id ? tareaActualizada : t),
        tareaSeleccionada: state.tareaSeleccionada?.id === id 
          ? tareaActualizada 
          : state.tareaSeleccionada,
        cargando: false
      }));
    } catch (error: any) {
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
      set((state) => ({
        tareas: state.tareas.filter(t => t.id !== id),
        tareaSeleccionada: state.tareaSeleccionada?.id === id 
          ? null 
          : state.tareaSeleccionada,
        cargando: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  seleccionarTarea: (tarea: Tarea | null) => {
    set({ tareaSeleccionada: tarea });
  },

  filtrarPorEstado: async (estado: string) => {
    try {
      set({ cargando: true, error: null });
      const tareas = await servicioTareas.listarTareas({ estado });
      set({ tareas, cargando: false });
    } catch (error: any) {
      set({ 
        error: error.message, 
        cargando: false 
      });
    }
  },

  // Acciones de subtareas
  agregarSubtarea: async (tareaId: string, titulo: string, descripcion: string) => {
    try {
      const tareaActualizada = await servicioTareas.agregarSubtarea(tareaId, titulo, descripcion);
      set((state) => ({
        tareas: state.tareas.map(t => t.id === tareaId ? tareaActualizada : t),
        tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
          ? tareaActualizada 
          : state.tareaSeleccionada
      }));
    } catch (error: any) {
      console.error('Error al agregar subtarea:', error);
      throw error;
    }
  },

  actualizarSubtarea: async (tareaId: string, subtareaId: string, estado: 'pendiente' | 'completada') => {
    try {
      const tareaActualizada = await servicioTareas.actualizarSubtarea(tareaId, subtareaId, estado);
      set((state) => ({
        tareas: state.tareas.map(t => t.id === tareaId ? tareaActualizada : t),
        tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
          ? tareaActualizada 
          : state.tareaSeleccionada
      }));
    } catch (error: any) {
      console.error('Error al actualizar subtarea:', error);
      throw error;
    }
  },

  eliminarSubtarea: async (tareaId: string, subtareaId: string) => {
    try {
      const tareaActualizada = await servicioTareas.eliminarSubtarea(tareaId, subtareaId);
      set((state) => ({
        tareas: state.tareas.map(t => t.id === tareaId ? tareaActualizada : t),
        tareaSeleccionada: state.tareaSeleccionada?.id === tareaId 
          ? tareaActualizada 
          : state.tareaSeleccionada
      }));
    } catch (error: any) {
      console.error('Error al eliminar subtarea:', error);
      throw error;
    }
  }
}));
