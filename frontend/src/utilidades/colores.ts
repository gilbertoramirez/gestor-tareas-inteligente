import type { CategoriaPrioridad } from '../tipos/tarea';

/**
 * Retorna clases de Tailwind según la categoría de prioridad
 */
export const obtenerColorPrioridad = (categoria: CategoriaPrioridad): string => {
  const colores = {
    'CRITICA': 'bg-red-100 text-red-800 border-red-300',
    'ALTA': 'bg-orange-100 text-orange-800 border-orange-300',
    'MEDIA': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'BAJA': 'bg-green-100 text-green-800 border-green-300'
  };
  
  return colores[categoria] || colores.BAJA;
};

/**
 * Retorna color de badge según prioridad
 */
export const obtenerColorBadgePrioridad = (categoria: CategoriaPrioridad): string => {
  const colores = {
    'CRITICA': 'bg-red-500',
    'ALTA': 'bg-orange-500',
    'MEDIA': 'bg-yellow-500',
    'BAJA': 'bg-green-500'
  };
  
  return colores[categoria] || colores.BAJA;
};

/**
 * Retorna emoji según prioridad
 */
export const obtenerEmojiPrioridad = (categoria: CategoriaPrioridad): string => {
  const emojis = {
    'CRITICA': '🔴',
    'ALTA': '🟠',
    'MEDIA': '🟡',
    'BAJA': '🟢'
  };
  
  return emojis[categoria] || emojis.BAJA;
};

/**
 * Retorna color según estado de la tarea
 */
export const obtenerColorEstado = (estado: string): string => {
  const colores = {
    'pendiente': 'bg-gray-100 text-gray-800',
    'trabajando': 'bg-blue-100 text-blue-800',
    'pausada': 'bg-yellow-100 text-yellow-800',
    'revision': 'bg-purple-100 text-purple-800',
    'completada': 'bg-green-100 text-green-800',
    'cancelada': 'bg-red-100 text-red-800'
  };
  
  return colores[estado] || colores.pendiente;
};

/**
 * Retorna texto en español del estado
 */
export const obtenerTextoEstado = (estado: string): string => {
  const textos = {
    'pendiente': 'Pendiente',
    'trabajando': 'En progreso',
    'pausada': 'Pausada',
    'revision': 'En revisión',
    'completada': 'Completada',
    'cancelada': 'Cancelada'
  };
  
  return textos[estado] || estado;
};
