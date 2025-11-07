  /**
   * backend/src/constantes/categoriasPrioridad.ts
   * 
   * Categorías de prioridad predefinidas con sus puntos
   */
  export interface CategoriaPrioridad {
    id: string;
    nombre: string;
    puntos: number;
    descripcion?: string;
  }
  
  export const CATEGORIAS_PRIORIDAD: CategoriaPrioridad[] = [
    { id: 'ocio_digital', nombre: 'Ocio Digital', puntos: 10 },
    { id: 'holy_deal', nombre: 'Holy Deal', puntos: 18 },
    { id: 'holy_order', nombre: 'Holy Order', puntos: 19 },
    { id: 'logistica', nombre: 'Logística', puntos: 20 },
    { id: 'tramites', nombre: 'Trámites', puntos: 30 },
    { id: 'crecimiento_personal', nombre: 'Crecimiento Personal', puntos: 40 },
    { id: 'organizacion', nombre: 'Organización', puntos: 50 },
    { id: 'conexiones', nombre: 'Conexiones', puntos: 60 },
    { id: 'formaciones', nombre: 'Formaciones', puntos: 70 },
    { id: 'cotizacion_3d', nombre: 'Cotización 3D', puntos: 79 },
    { id: 'servicio', nombre: 'Servicio', puntos: 80 },
    { id: 'fabricacion_3d_personal', nombre: 'Fabricación 3D Personal', puntos: 89 },
    { id: 'produccion', nombre: 'Producción', puntos: 90 },
    { id: 'profesion', nombre: 'Profesión', puntos: 95 },
    { id: 'bienestar', nombre: 'Bienestar', puntos: 100 }
  ];
  
  /**
   * Obtiene una categoría por su ID
   */
  export function obtenerCategoriaPorId(id: string): CategoriaPrioridad | undefined {
    return CATEGORIAS_PRIORIDAD.find(cat => cat.id === id);
  }
  
  /**
   * Obtiene una categoría por sus puntos
   */
  export function obtenerCategoriaPorPuntos(puntos: number): CategoriaPrioridad | undefined {
    return CATEGORIAS_PRIORIDAD.find(cat => cat.puntos === puntos);
  }
  
  /**
   * Valida si un ID de categoría es válido
   */
  export function esCategorialValida(id: string): boolean {
    return CATEGORIAS_PRIORIDAD.some(cat => cat.id === id);
  }
  
  /**
   * Obtiene los puntos de una categoría por su ID
   */
  export function obtenerPuntosPorCategoria(id: string): number | null {
    const categoria = obtenerCategoriaPorId(id);
    return categoria ? categoria.puntos : null;
  }