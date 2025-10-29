/**
 * Valida que un email sea válido
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida que una contraseña sea segura
 */
export const validarPassword = (password: string): {
  valido: boolean;
  mensaje: string;
} => {
  if (password.length < 6) {
    return {
      valido: false,
      mensaje: 'La contraseña debe tener al menos 6 caracteres'
    };
  }
  
  return { valido: true, mensaje: '' };
};

/**
 * Valida que el título de una tarea no esté vacío
 */
export const validarTitulo = (titulo: string): boolean => {
  return titulo.trim().length > 0;
};

/**
 * Valida que el beneficio esté entre 0 y 100
 */
export const validarBeneficio = (beneficio: number): boolean => {
  return beneficio >= 0 && beneficio <= 100;
};

/**
 * Valida que las horas estimadas sean positivas
 */
export const validarHorasEstimadas = (horas: number): boolean => {
  return horas > 0;
};

/**
 * Valida que una fecha sea futura
 */
export const validarFechaFutura = (fecha: string | Date): boolean => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  return fechaObj > ahora;
};
