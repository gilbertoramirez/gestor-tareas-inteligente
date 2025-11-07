import { db } from '../configuracion/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  Tarea, 
  CrearTareaDTO, 
  ActualizarTareaDTO, 
  EstadoTarea,
  Subtarea,
  ProgresoSubtareas
} from '../modelos';
import { servicioPrioridad } from './servicioPrioridad';

export class ServicioTareas {
  private coleccion = db.collection('tareas');
  
  /**
   * Calcula el progreso de las subtareas
   */
  private calcularProgresoSubtareas(subtareas: Subtarea[]): ProgresoSubtareas {
    const total = subtareas.length;
    const completadas = subtareas.filter(s => s.estado === 'completada').length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    return { total, completadas, porcentaje };
  }
  
  /**
   * Crear una nueva tarea
   */
  async crearTarea(usuarioId: string, datos: CrearTareaDTO): Promise<Tarea> {
    try {
      const ahora = Timestamp.now();
      const fechaVencimiento = new Date(datos.fechaVencimiento);
      
      // Calcular prioridad usando el nuevo sistema de categorías
      const prioridad = servicioPrioridad.calcularPrioridad(
        fechaVencimiento,
        datos.beneficioCategoriaId,
        datos.horasEstimadas,
        datos.dependencias && datos.dependencias.length > 0,
        0
      );
      
      const nuevaTarea: Omit<Tarea, 'id'> = {
        usuarioId,
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        estado: 'pendiente',
        creadaEn: ahora,
        actualizadaEn: ahora,
        fechaVencimiento: Timestamp.fromDate(fechaVencimiento),
        prioridad,
        alertas: this.generarAlertasAutomaticas(fechaVencimiento),
        etiquetas: datos.etiquetas || [],
        adjuntos: [],
        dependencias: datos.dependencias || [],
        bloqueadaPor: [],
        seguimientoTiempo: {
          horasEstimadas: datos.horasEstimadas,
          horasReales: 0,
          sesiones: []
        },
        historialEstados: [{
          estado: 'pendiente',
          cambiadoEn: ahora,
          cambiadoPor: usuarioId
        }],
        subtareas: [],
        progresoSubtareas: {
          total: 0,
          completadas: 0,
          porcentaje: 0
        }
      };
      
      const docRef = await this.coleccion.add(nuevaTarea);
      
      console.log(`✅ Tarea creada con ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...nuevaTarea
      };
    } catch (error) {
      console.error('❌ Error al crear tarea:', error);
      throw new Error('No se pudo crear la tarea');
    }
  }
  
  async obtenerTareaPorId(tareaId: string, usuarioId: string): Promise<Tarea | null> {
    try {
      const doc = await this.coleccion.doc(tareaId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const tarea = doc.data() as Omit<Tarea, 'id'>;
      
      if (tarea.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso para ver esta tarea');
      }
      
      return {
        id: doc.id,
        ...tarea
      };
    } catch (error) {
      console.error('❌ Error al obtener tarea:', error);
      throw error;
    }
  }
  
  async listarTareas(
    usuarioId: string, 
    filtros?: {
      estado?: EstadoTarea;
      etiqueta?: string;
      ordenarPor?: 'prioridad' | 'fecha' | 'titulo';
    }
  ): Promise<Tarea[]> {
    try {
      let query = this.coleccion.where('usuarioId', '==', usuarioId);
      
      if (filtros?.estado) {
        query = query.where('estado', '==', filtros.estado);
      }
      
      if (filtros?.etiqueta) {
        query = query.where('etiquetas', 'array-contains', filtros.etiqueta);
      }
      
      const snapshot = await query.get();
      
      let tareas: Tarea[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tarea));
      
      if (filtros?.ordenarPor === 'prioridad') {
        tareas.sort((a, b) => b.prioridad.puntuacion - a.prioridad.puntuacion);
      } else if (filtros?.ordenarPor === 'fecha') {
        tareas.sort((a, b) => 
          a.fechaVencimiento.toMillis() - b.fechaVencimiento.toMillis()
        );
      } else if (filtros?.ordenarPor === 'titulo') {
        tareas.sort((a, b) => a.titulo.localeCompare(b.titulo));
      }
      
      return tareas;
    } catch (error) {
      console.error('❌ Error al listar tareas:', error);
      throw new Error('No se pudieron obtener las tareas');
    }
  }
  
  async actualizarTarea(
    tareaId: string, 
    usuarioId: string, 
    datos: ActualizarTareaDTO
  ): Promise<Tarea> {
    try {
      const tareaDoc = await this.coleccion.doc(tareaId).get();
      
      if (!tareaDoc.exists) {
        throw new Error('Tarea no encontrada');
      }
      
      const tareaActual = tareaDoc.data() as Omit<Tarea, 'id'>;
      
      if (tareaActual.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso para actualizar esta tarea');
      }
      
      const ahora = Timestamp.now();
      const actualizacion: any = {
        actualizadaEn: ahora
      };
      
      if (datos.titulo) actualizacion.titulo = datos.titulo;
      if (datos.descripcion) actualizacion.descripcion = datos.descripcion;
      if (datos.etiquetas) actualizacion.etiquetas = datos.etiquetas;
      
      if (datos.estado && datos.estado !== tareaActual.estado) {
        actualizacion.estado = datos.estado;
        actualizacion.historialEstados = [
          ...tareaActual.historialEstados,
          {
            estado: datos.estado,
            cambiadoEn: ahora,
            cambiadoPor: usuarioId
          }
        ];
        
        if (datos.estado === 'completada') {
          actualizacion.completadaEn = ahora;
        }
      }
      
      // Recalcular prioridad si cambió algún factor relevante
      if (datos.fechaVencimiento || datos.beneficioCategoriaId || datos.horasEstimadas) {
        const fechaVencimiento = datos.fechaVencimiento 
          ? new Date(datos.fechaVencimiento)
          : tareaActual.fechaVencimiento.toDate();
        
        const beneficioCategoriaId = datos.beneficioCategoriaId ?? 
          tareaActual.prioridad.beneficioCategoriaId;
          
        const horasEstimadas = datos.horasEstimadas ?? 
          tareaActual.seguimientoTiempo.horasEstimadas;
        
        actualizacion.prioridad = servicioPrioridad.calcularPrioridad(
          fechaVencimiento,
          beneficioCategoriaId,
          horasEstimadas,
          tareaActual.dependencias.length > 0,
          0
        );
        
        if (datos.fechaVencimiento) {
          actualizacion.fechaVencimiento = Timestamp.fromDate(fechaVencimiento);
        }
        
        if (datos.horasEstimadas) {
          actualizacion['seguimientoTiempo.horasEstimadas'] = horasEstimadas;
        }
      }
      
      await this.coleccion.doc(tareaId).update(actualizacion);
      
      const tareaActualizada = await this.obtenerTareaPorId(tareaId, usuarioId);
      
      console.log(`✅ Tarea ${tareaId} actualizada`);
      
      return tareaActualizada!;
    } catch (error) {
      console.error('❌ Error al actualizar tarea:', error);
      throw error;
    }
  }
  
  async eliminarTarea(tareaId: string, usuarioId: string): Promise<void> {
    try {
      const tareaDoc = await this.coleccion.doc(tareaId).get();
      
      if (!tareaDoc.exists) {
        throw new Error('Tarea no encontrada');
      }
      
      const tarea = tareaDoc.data() as Omit<Tarea, 'id'>;
      
      if (tarea.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso para eliminar esta tarea');
      }
      
      await this.coleccion.doc(tareaId).delete();
      
      console.log(`✅ Tarea ${tareaId} eliminada`);
    } catch (error) {
      console.error('❌ Error al eliminar tarea:', error);
      throw error;
    }
  }
  
  /**
   * Agregar subtarea
   */
  async agregarSubtarea(
    tareaId: string,
    usuarioId: string,
    titulo: string,
    descripcion: string
  ): Promise<Tarea> {
    try {
      const tareaDoc = await this.coleccion.doc(tareaId).get();
      
      if (!tareaDoc.exists) {
        throw new Error('Tarea no encontrada');
      }
      
      const tarea = tareaDoc.data() as Omit<Tarea, 'id'>;
      
      if (tarea.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso');
      }
      
      const nuevaSubtarea: Subtarea = {
        id: `subtarea_${Date.now()}`,
        titulo,
        descripcion,
        estado: 'pendiente',
        orden: tarea.subtareas?.length || 0,
        creadaEn: Timestamp.now()
      };
      
      const subtareasActuales = tarea.subtareas || [];
      const subtareasActualizadas = [...subtareasActuales, nuevaSubtarea];
      const progresoSubtareas = this.calcularProgresoSubtareas(subtareasActualizadas);
      
      await this.coleccion.doc(tareaId).update({
        subtareas: subtareasActualizadas,
        progresoSubtareas,
        actualizadaEn: Timestamp.now()
      });
      
      return await this.obtenerTareaPorId(tareaId, usuarioId) as Tarea;
    } catch (error) {
      console.error('Error al agregar subtarea:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar estado de subtarea
   */
  async actualizarSubtarea(
    tareaId: string,
    usuarioId: string,
    subtareaId: string,
    nuevoEstado: 'pendiente' | 'completada'
  ): Promise<Tarea> {
    try {
      const tareaDoc = await this.coleccion.doc(tareaId).get();
      
      if (!tareaDoc.exists) {
        throw new Error('Tarea no encontrada');
      }
      
      const tarea = tareaDoc.data() as Omit<Tarea, 'id'>;
      
      if (tarea.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso');
      }
      
      const subtareasActuales = tarea.subtareas || [];
      const subtareasActualizadas = subtareasActuales.map(s => {
        if (s.id === subtareaId) {
          return {
            ...s,
            estado: nuevoEstado,
            completadaEn: nuevoEstado === 'completada' ? Timestamp.now() : undefined
          };
        }
        return s;
      });
      
      const progresoSubtareas = this.calcularProgresoSubtareas(subtareasActualizadas);
      
      await this.coleccion.doc(tareaId).update({
        subtareas: subtareasActualizadas,
        progresoSubtareas,
        actualizadaEn: Timestamp.now()
      });
      
      return await this.obtenerTareaPorId(tareaId, usuarioId) as Tarea;
    } catch (error) {
      console.error('Error al actualizar subtarea:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar subtarea
   */
  async eliminarSubtarea(
    tareaId: string,
    usuarioId: string,
    subtareaId: string
  ): Promise<Tarea> {
    try {
      const tareaDoc = await this.coleccion.doc(tareaId).get();
      
      if (!tareaDoc.exists) {
        throw new Error('Tarea no encontrada');
      }
      
      const tarea = tareaDoc.data() as Omit<Tarea, 'id'>;
      
      if (tarea.usuarioId !== usuarioId) {
        throw new Error('No tienes permiso');
      }
      
      const subtareasActuales = tarea.subtareas || [];
      const subtareasActualizadas = subtareasActuales.filter(s => s.id !== subtareaId);
      const progresoSubtareas = this.calcularProgresoSubtareas(subtareasActualizadas);
      
      await this.coleccion.doc(tareaId).update({
        subtareas: subtareasActualizadas,
        progresoSubtareas,
        actualizadaEn: Timestamp.now()
      });
      
      return await this.obtenerTareaPorId(tareaId, usuarioId) as Tarea;
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
      throw error;
    }
  }
  
  private generarAlertasAutomaticas(fechaVencimiento: Date) {
    const alertas = [];
    const ahora = new Date();
    
    const unDiaAntes = new Date(fechaVencimiento);
    unDiaAntes.setDate(unDiaAntes.getDate() - 1);
    unDiaAntes.setHours(9, 0, 0, 0);
    
    if (unDiaAntes > ahora) {
      alertas.push({
        id: `alerta-1d-${Date.now()}`,
        programadaPara: Timestamp.fromDate(unDiaAntes),
        enviada: false,
        canales: ['email', 'push'] as ('email' | 'push' | 'interna')[]
      });
    }
    
    const diaVencimiento = new Date(fechaVencimiento);
    diaVencimiento.setHours(9, 0, 0, 0);
    
    if (diaVencimiento > ahora) {
      alertas.push({
        id: `alerta-hoy-${Date.now()}`,
        programadaPara: Timestamp.fromDate(diaVencimiento),
        enviada: false,
        canales: ['email', 'push', 'interna'] as ('email' | 'push' | 'interna')[]
      });
    }
    
    return alertas;
  }
}

export const servicioTareas = new ServicioTareas();