import { Timestamp } from 'firebase-admin/firestore';

export type EstadoTarea = 
  | 'pendiente' 
  | 'trabajando' 
  | 'pausada' 
  | 'revision' 
  | 'completada' 
  | 'cancelada';

export type CategoriaPrioridad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export interface Subtarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  orden: number;
  creadaEn: Timestamp;
  completadaEn?: Timestamp;
}

export interface ProgresoSubtareas {
  total: number;
  completadas: number;
  porcentaje: number;
}

export interface Prioridad {
  puntuacion: number;
  categoria: CategoriaPrioridad;
  urgencia: number;
  beneficioCategoriaId: string; // ID de la categoría seleccionada (ej: 'bienestar', 'profesion')
  beneficioPuntos: number; // Puntos de la categoría (10-100)
  esfuerzo: number;
  ultimoCalculo: Timestamp;
  factores: {
    diasRestantes: number;
    tieneDependencias: boolean;
    tiempoEstancada: number;
  };
}

export interface Alerta {
  id: string;
  programadaPara: Timestamp;
  enviada: boolean;
  enviadaEn?: Timestamp;
  canales: ('email' | 'push' | 'interna')[];
}

export interface SesionTrabajo {
  inicioEn: Timestamp;
  finEn: Timestamp;
  duracion: number;
}

export interface HistorialEstado {
  estado: EstadoTarea;
  cambiadoEn: Timestamp;
  cambiadoPor: string;
}

export interface Tarea {
  id: string;
  usuarioId: string;
  
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  
  creadaEn: Timestamp;
  actualizadaEn: Timestamp;
  fechaVencimiento: Timestamp;
  completadaEn?: Timestamp;
  
  prioridad: Prioridad;
  alertas: Alerta[];
  
  etiquetas: string[];
  adjuntos: string[];
  dependencias: string[];
  bloqueadaPor: string[];
  
  seguimientoTiempo: {
    horasEstimadas: number;
    horasReales: number;
    sesiones: SesionTrabajo[];
  };
  
  historialEstados: HistorialEstado[];
  
  // Subtareas
  subtareas: Subtarea[];
  progresoSubtareas: ProgresoSubtareas;
}

export interface CrearTareaDTO {
  titulo: string;
  descripcion: string;
  fechaVencimiento: Date | string;
  beneficioCategoriaId: string; // Ahora usa el ID de categoría en lugar de número
  horasEstimadas: number;
  etiquetas?: string[];
  dependencias?: string[];
}

export interface ActualizarTareaDTO {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoTarea;
  fechaVencimiento?: Date | string;
  beneficioCategoriaId?: string; // Cambiado de beneficio a beneficioCategoriaId
  horasEstimadas?: number;
  etiquetas?: string[];
}