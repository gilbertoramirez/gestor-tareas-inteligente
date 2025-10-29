import api from './api';
import type { Tarea, CrearTareaDTO, ActualizarTareaDTO } from '../tipos';

export const servicioTareas = {
  /**
   * Crear una nueva tarea
   */
  async crearTarea(datos: CrearTareaDTO): Promise<Tarea> {
    const response = await api.post('/api/tareas', datos);
    return response.data.tarea;
  },

  /**
   * Listar todas las tareas
   */
  async listarTareas(filtros?: {
    estado?: string;
    etiqueta?: string;
    ordenarPor?: string;
  }): Promise<Tarea[]> {
    const response = await api.get('/api/tareas', { params: filtros });
    return response.data.tareas;
  },

  /**
   * Obtener una tarea por ID
   */
  async obtenerTarea(id: string): Promise<Tarea> {
    const response = await api.get(`/api/tareas/${id}`);
    return response.data.tarea;
  },

  /**
   * Actualizar una tarea
   */
  async actualizarTarea(id: string, datos: ActualizarTareaDTO): Promise<Tarea> {
    const response = await api.patch(`/api/tareas/${id}`, datos);
    return response.data.tarea;
  },

  /**
   * Eliminar una tarea
   */
  async eliminarTarea(id: string): Promise<void> {
    await api.delete(`/api/tareas/${id}`);
  },

  /**
   * Obtener lista de prioridades
   */
  async obtenerListaPrioridades(): Promise<Tarea[]> {
    const response = await api.get('/api/tareas/prioridad/lista');
    return response.data.tareas;
  },

  /**
   * Agregar subtarea
   */
  async agregarSubtarea(tareaId: string, titulo: string, descripcion: string): Promise<Tarea> {
    const response = await api.post(`/api/tareas/${tareaId}/subtareas`, {
      titulo,
      descripcion
    });
    return response.data.tarea;
  },

  /**
   * Actualizar estado de subtarea
   */
  async actualizarSubtarea(
    tareaId: string, 
    subtareaId: string, 
    estado: 'pendiente' | 'completada'
  ): Promise<Tarea> {
    const response = await api.patch(`/api/tareas/${tareaId}/subtareas/${subtareaId}`, {
      estado
    });
    return response.data.tarea;
  },

  /**
   * Eliminar subtarea
   */
  async eliminarSubtarea(tareaId: string, subtareaId: string): Promise<Tarea> {
    const response = await api.delete(`/api/tareas/${tareaId}/subtareas/${subtareaId}`);
    return response.data.tarea;
  }
};
