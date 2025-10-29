import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isPast, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Convierte timestamp de Firestore a Date
 */
export const timestampAFecha = (timestamp: any): Date => {
  // Debug: ver estructura completa
  console.log('timestampAFecha recibió:', timestamp);
  console.log('Tipo:', typeof timestamp);
  console.log('Keys:', timestamp ? Object.keys(timestamp) : 'null');
  
  // Si ya es un Date, retornarlo
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Si es un objeto Timestamp de Firestore con seconds
  if (timestamp && typeof timestamp === 'object') {
    if ('seconds' in timestamp && typeof timestamp.seconds === 'number') {
      const fecha = new Date(timestamp.seconds * 1000);
      console.log('Convertido de seconds:', fecha);
      return fecha;
    }
    
    // Si tiene _seconds (formato alternativo)
    if ('_seconds' in timestamp && typeof timestamp._seconds === 'number') {
      const fecha = new Date(timestamp._seconds * 1000);
      console.log('Convertido de _seconds:', fecha);
      return fecha;
    }
    
    // Si es un objeto con toDate() (Timestamp de Firebase)
    if (typeof timestamp.toDate === 'function') {
      const fecha = timestamp.toDate();
      console.log('Convertido con toDate():', fecha);
      return fecha;
    }
  }
  
  // Si es un string ISO
  if (typeof timestamp === 'string') {
    const fecha = new Date(timestamp);
    console.log('Convertido de string:', fecha);
    return fecha;
  }
  
  // Si es un número (unix timestamp en milisegundos)
  if (typeof timestamp === 'number') {
    const fecha = new Date(timestamp);
    console.log('Convertido de number:', fecha);
    return fecha;
  }
  
  // Fallback: fecha actual
  console.warn('Formato de fecha no reconocido:', timestamp);
  return new Date();
};

/**
 * Valida que una fecha sea válida
 */
const esFechaValida = (fecha: Date): boolean => {
  return fecha instanceof Date && isValid(fecha) && !isNaN(fecha.getTime());
};

/**
 * Formatea una fecha a string legible
 */
export const formatearFecha = (fecha: Date | string | any): string => {
  try {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      fechaObj = parseISO(fecha);
    } else if (fecha instanceof Date) {
      fechaObj = fecha;
    } else {
      fechaObj = timestampAFecha(fecha);
    }
    
    if (!esFechaValida(fechaObj)) {
      return 'Fecha no disponible';
    }
    
    return format(fechaObj, "d 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error, fecha);
    return 'Fecha no disponible';
  }
};

/**
 * Formatea fecha con hora
 */
export const formatearFechaHora = (fecha: Date | string | any): string => {
  try {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      fechaObj = parseISO(fecha);
    } else if (fecha instanceof Date) {
      fechaObj = fecha;
    } else {
      fechaObj = timestampAFecha(fecha);
    }
    
    if (!esFechaValida(fechaObj)) {
      return 'Fecha no disponible';
    }
    
    return format(fechaObj, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es });
  } catch (error) {
    console.error('Error formateando fecha con hora:', error, fecha);
    return 'Fecha no disponible';
  }
};

/**
 * Retorna tiempo relativo (hace 2 horas, en 3 días, etc.)
 */
export const tiempoRelativo = (fecha: Date | string | any): string => {
  try {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      fechaObj = parseISO(fecha);
    } else if (fecha instanceof Date) {
      fechaObj = fecha;
    } else {
      fechaObj = timestampAFecha(fecha);
    }
    
    if (!esFechaValida(fechaObj)) {
      return 'Fecha no disponible';
    }
    
    return formatDistanceToNow(fechaObj, { addSuffix: true, locale: es });
  } catch (error) {
    return 'Fecha no disponible';
  }
};

/**
 * Verifica si una fecha es hoy
 */
export const esHoy = (fecha: Date | string | any): boolean => {
  try {
    const fechaObj = timestampAFecha(fecha);
    return esFechaValida(fechaObj) && isToday(fechaObj);
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha es mañana
 */
export const esManana = (fecha: Date | string | any): boolean => {
  try {
    const fechaObj = timestampAFecha(fecha);
    return esFechaValida(fechaObj) && isTomorrow(fechaObj);
  } catch (error) {
    return false;
  }
};

/**
 * Verifica si una fecha ya pasó
 */
export const yaVencio = (fecha: Date | string | any): boolean => {
  try {
    const fechaObj = timestampAFecha(fecha);
    return esFechaValida(fechaObj) && isPast(fechaObj);
  } catch (error) {
    return false;
  }
};

/**
 * Calcula días restantes hasta una fecha
 */
export const diasRestantes = (fecha: Date | string | any): number => {
  try {
    const fechaObj = timestampAFecha(fecha);
    
    if (!esFechaValida(fechaObj)) {
      console.warn('Fecha inválida en diasRestantes:', fecha);
      return 0;
    }
    
    const ahora = new Date();
    const dias = differenceInDays(fechaObj, ahora);
    
    return dias;
  } catch (error) {
    console.error('Error calculando días restantes:', error);
    return 0;
  }
};

/**
 * Retorna texto descriptivo del tiempo restante
 */
export const textoTiempoRestante = (fecha: Date | string | any): string => {
  try {
    const fechaObj = timestampAFecha(fecha);
    
    if (!esFechaValida(fechaObj)) {
      return 'Fecha no disponible';
    }
    
    const dias = diasRestantes(fechaObj);
    
    if (dias < 0) return 'Vencida';
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    if (dias <= 7) return `Vence en ${dias} días`;
    if (dias <= 30) return `Vence en ${Math.ceil(dias / 7)} semanas`;
    
    return `Vence en ${Math.ceil(dias / 30)} meses`;
  } catch (error) {
    console.error('Error en textoTiempoRestante:', error);
    return 'Fecha no disponible';
  }
};
