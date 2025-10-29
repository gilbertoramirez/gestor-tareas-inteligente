import { Timestamp } from 'firebase-admin/firestore';

export interface PreferenciasUsuario {
  vistaDefault: 'tablero' | 'calendario' | 'lista';
  tema: 'claro' | 'oscuro';
  notificaciones: {
    email: boolean;
    push: boolean;
  };
  horarioTrabajo: {
    inicio: string; // "09:00"
    fin: string;    // "18:00"
  };
  diasLaborales: number[]; // 0=Domingo, 1=Lunes, etc.
}

export interface Usuario {
  uid: string;
  email: string;
  nombreCompleto: string;
  fotoURL?: string;
  preferencias: PreferenciasUsuario;
  creadoEn: Timestamp;
  ultimoAcceso: Timestamp;
}

export interface CrearUsuarioDTO {
  email: string;
  nombreCompleto: string;
  password: string;
}
