import { Timestamp } from 'firebase-admin/firestore';
import { Prioridad, CategoriaPrioridad, Tarea } from '../modelos';

export class ServicioPrioridad {
  
  /**
   * Calcula la prioridad de una tarea
   */
  calcularPrioridad(
    fechaVencimiento: Date,
    beneficio: number,
    horasEstimadas: number,
    tieneDependencias: boolean = false,
    diasSinCambios: number = 0
  ): Prioridad {
    
    // 1. Calcular URGENCIA (0-100) basada en días restantes
    const urgencia = this.calcularUrgencia(fechaVencimiento);
    
    // 2. BENEFICIO ya viene del usuario (0-100)
    const beneficioNormalizado = Math.min(Math.max(beneficio, 0), 100);
    
    // 3. Calcular factor de ESFUERZO (inverso: menos esfuerzo = mayor prioridad)
    const factorEsfuerzo = this.calcularFactorEsfuerzo(horasEstimadas);
    
    // 4. Factor de DEPENDENCIAS (si otras tareas dependen de esta)
    const factorDependencias = tieneDependencias ? 20 : 0;
    
    // 5. Penalización por ESTANCAMIENTO
    const penalizacionEstancamiento = this.calcularPenalizacionEstancamiento(diasSinCambios);
    
    // FÓRMULA PONDERADA FINAL
    const puntuacion = (
      (urgencia * 0.40) +              // 40% peso a la urgencia
      (beneficioNormalizado * 0.35) +  // 35% peso al beneficio
      (factorEsfuerzo * 0.15) +        // 15% peso al esfuerzo
      (factorDependencias * 0.10)      // 10% peso a dependencias
    ) - penalizacionEstancamiento;     // Penalización por inactividad
    
    const puntuacionFinal = Math.round(Math.min(Math.max(puntuacion, 0), 100));
    
    return {
      puntuacion: puntuacionFinal,
      categoria: this.categorizarPrioridad(puntuacionFinal),
      urgencia: Math.round(urgencia),
      beneficio: beneficioNormalizado,
      esfuerzo: horasEstimadas,
      ultimoCalculo: Timestamp.now(),
      factores: {
        diasRestantes: this.calcularDiasRestantes(fechaVencimiento),
        tieneDependencias,
        tiempoEstancada: diasSinCambios
      }
    };
  }
  
  /**
   * Calcula urgencia basada en días hasta el vencimiento
   */
  private calcularUrgencia(fechaVencimiento: Date): number {
    const diasRestantes = this.calcularDiasRestantes(fechaVencimiento);
    
    if (diasRestantes < 0) return 100;        // Ya venció
    if (diasRestantes === 0) return 100;      // Vence hoy
    if (diasRestantes === 1) return 95;       // Vence mañana
    if (diasRestantes <= 3) return 85;        // Vence en 2-3 días
    if (diasRestantes <= 7) return 65;        // Vence esta semana
    if (diasRestantes <= 14) return 40;       // Vence en 2 semanas
    if (diasRestantes <= 30) return 20;       // Vence este mes
    
    return 10; // Más de un mes
  }
  
  /**
   * Calcula días restantes hasta el vencimiento
   */
  private calcularDiasRestantes(fechaVencimiento: Date): number {
    const ahora = new Date();
    const diferencia = fechaVencimiento.getTime() - ahora.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Factor de esfuerzo (menos horas = mayor prioridad)
   */
  private calcularFactorEsfuerzo(horasEstimadas: number): number {
    // Tareas de 1-2 horas tienen factor alto (fáciles de completar)
    if (horasEstimadas <= 2) return 100;
    if (horasEstimadas <= 4) return 80;
    if (horasEstimadas <= 8) return 60;
    if (horasEstimadas <= 16) return 40;
    
    return 20; // Tareas muy largas (>16 horas)
  }
  
  /**
   * Penalización por tiempo estancada
   */
  private calcularPenalizacionEstancamiento(diasSinCambios: number): number {
    if (diasSinCambios >= 7) return 10;   // Una semana sin cambios
    if (diasSinCambios >= 14) return 20;  // Dos semanas
    if (diasSinCambios >= 30) return 30;  // Un mes
    
    return 0;
  }
  
  /**
   * Categoriza la prioridad según el puntaje
   */
  private categorizarPrioridad(puntuacion: number): CategoriaPrioridad {
    if (puntuacion >= 80) return 'CRITICA';
    if (puntuacion >= 60) return 'ALTA';
    if (puntuacion >= 40) return 'MEDIA';
    return 'BAJA';
  }
  
  /**
   * Recalcula prioridad de una tarea existente
   */
  recalcularPrioridad(tarea: Tarea): Prioridad {
    const diasSinCambios = this.calcularDiasSinActualizacion(tarea.actualizadaEn);
    
    return this.calcularPrioridad(
      tarea.fechaVencimiento.toDate(),
      tarea.prioridad.beneficio,
      tarea.seguimientoTiempo.horasEstimadas,
      tarea.dependencias.length > 0,
      diasSinCambios
    );
  }
  
  /**
   * Calcula días desde la última actualización
   */
  private calcularDiasSinActualizacion(ultimaActualizacion: Timestamp): number {
    const ahora = new Date();
    const fechaActualizacion = ultimaActualizacion.toDate();
    const diferencia = ahora.getTime() - fechaActualizacion.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }
}

// Exportar instancia única (Singleton)
export const servicioPrioridad = new ServicioPrioridad();
