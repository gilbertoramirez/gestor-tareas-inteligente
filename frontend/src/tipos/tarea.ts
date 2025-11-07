export type EstadoTarea = 
  | 'pendiente' 
  | 'trabajando' 
  | 'pausada' 
  | 'revision' 
  | 'completada' 
  | 'cancelada';

export type CategoriaPrioridad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export interface Prioridad {
  puntuacion: number;
  categoria: CategoriaPrioridad;
  urgencia: number;
  beneficioCategoriaId: string; // 🔥 NUEVO: ID de la categoría
  beneficioPuntos: number;       // 🔥 NUEVO: Puntos de la categoría (10-100)
  esfuerzo: number;
  ultimoCalculo: {
    seconds: number;
    nanoseconds: number;
  };
  factores: {
    diasRestantes: number;
    tieneDependencias: boolean;
    tiempoEstancada: number;
  };
}

export interface Subtarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  orden: number;
  creadaEn: {
    seconds: number;
    nanoseconds: number;
  };
  completadaEn?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface ProgresoSubtareas {
  total: number;
  completadas: number;
  porcentaje: number;
}

export interface Tarea {
  id: string;
  usuarioId: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  creadaEn: {
    seconds: number;
    nanoseconds: number;
  };
  actualizadaEn: {
    seconds: number;
    nanoseconds: number;
  };
  fechaVencimiento: {
    seconds: number;
    nanoseconds: number;
  };
  completadaEn?: {
    seconds: number;
    nanoseconds: number;
  };
  prioridad: Prioridad;
  alertas: any[];
  etiquetas: string[];
  adjuntos: string[];
  dependencias: string[];
  bloqueadaPor: string[];
  seguimientoTiempo: {
    horasEstimadas: number;
    horasReales: number;
    sesiones: any[];
  };
  historialEstados: any[];
  
  subtareas: Subtarea[];
  progresoSubtareas: ProgresoSubtareas;
}

export interface CrearTareaDTO {
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  beneficioCategoriaId: string; // 🔥 CAMBIADO: de 'beneficio' a 'beneficioCategoriaId'
  horasEstimadas: number;
  etiquetas?: string[];
  dependencias?: string[];
}

export interface ActualizarTareaDTO {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoTarea;
  fechaVencimiento?: string;
  beneficioCategoriaId?: string; // 🔥 CAMBIADO: de 'beneficio' a 'beneficioCategoriaId'
  horasEstimadas?: number;
  etiquetas?: string[];
}

export interface CrearSubtareaDTO {
  titulo: string;
  descripcion: string;
}

export interface ActualizarSubtareaDTO {
  titulo?: string;
  descripcion?: string;
  estado?: 'pendiente' | 'completada';
}