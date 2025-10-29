import { Timestamp } from 'firebase-admin/firestore';

export type TipoNotificacion = 
  | 'tarea_vencida' 
  | 'cambio_estado' 
  | 'actualizacion_prioridad' 
  | 'recordatorio'
  | 'reporte';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  tareaId?: string;
  leida: boolean;
  creadaEn: Timestamp;
  leidaEn?: Timestamp;
  urlAccion?: string;
}
