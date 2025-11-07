import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Clock, Calendar } from 'lucide-react';
import type { Tarea, EstadoTarea } from '../../tipos';
import { useTareasStore } from '../../store';
import { Boton, Badge } from '../comunes';
import { ListaSubtareas } from './ListaSubtareas';
import { 
  obtenerColorPrioridad,
  obtenerColorEstado,
  obtenerTextoEstado,
  timestampAFecha,
  formatearFechaHora,
  textoTiempoRestante
} from '../../utilidades';

interface DetalleTareaProps {
  tarea: Tarea;
  onCerrar: () => void;
}

const ESTADOS: EstadoTarea[] = ['pendiente', 'trabajando', 'pausada', 'revision', 'completada', 'cancelada'];

export const DetalleTarea = ({ tarea: tareaInicial, onCerrar }: DetalleTareaProps) => {
  const { actualizarTarea, eliminarTarea, tareas } = useTareasStore();
  const [eliminando, setEliminando] = useState(false);
  
  // 🔥 NUEVO: Estado local que se actualiza automáticamente
  const [tareaActual, setTareaActual] = useState<Tarea>(tareaInicial);

  // 🔥 NUEVO: Efecto para sincronizar con el store
  useEffect(() => {
    const tareaActualizada = tareas.find(t => t.id === tareaInicial.id);
    if (tareaActualizada) {
      console.log('🔄 Tarea actualizada desde el store:', tareaActualizada);
      setTareaActual(tareaActualizada);
    }
  }, [tareas, tareaInicial.id]);

  const todasSubtareasCompletadas = tareaActual.subtareas && tareaActual.subtareas.length > 0
    ? tareaActual.subtareas.every(s => s.estado === 'completada')
    : true;

  const manejarCambioEstado = async (nuevoEstado: EstadoTarea) => {
    if (nuevoEstado === 'completada' && !todasSubtareasCompletadas) {
      alert('⚠️ Debes completar todas las subtareas antes de marcar esta tarea como completada');
      return;
    }

    try {
      await actualizarTarea(tareaActual.id, { estado: nuevoEstado });
      onCerrar();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const manejarEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      setEliminando(true);
      await eliminarTarea(tareaActual.id);
      onCerrar();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setEliminando(false);
    }
  };

  const fechaVencimiento = timestampAFecha(tareaActual.fechaVencimiento);
  const fechaCreacion = timestampAFecha(tareaActual.creadaEn);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCerrar}
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              Detalle de la Tarea
            </h2>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Título y estado */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {tareaActual.titulo}
              </h3>
              <Badge 
                texto={obtenerTextoEstado(tareaActual.estado)}
                color={obtenerColorEstado(tareaActual.estado)}
              />
            </div>

            {/* Descripción */}
            {tareaActual.descripcion && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </h4>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {tareaActual.descripcion}
                </p>
              </div>
            )}

            {/* Prioridad */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Análisis de Prioridad
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Puntuación Total</p>
                  <div className={`text-3xl font-bold mt-1 px-3 py-2 rounded-lg inline-block ${obtenerColorPrioridad(tareaActual.prioridad.categoria)}`}>
                    {tareaActual.prioridad.puntuacion}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Categoría</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {tareaActual.prioridad.categoria}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Urgencia</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {tareaActual.prioridad.urgencia}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Beneficio</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {tareaActual.prioridad.beneficioPuntos || tareaActual.prioridad.beneficio || 0}/100
                  </p>
                </div>
              </div>
              
              {/* Mostrar categoría de beneficio si existe */}
              {tareaActual.prioridad.beneficioCategoriaId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Categoría de Beneficio</p>
                  <p className="text-sm font-medium text-blue-600">
                    {tareaActual.prioridad.beneficioCategoriaId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Fecha de vencimiento</p>
                  <p className="text-sm">
                    {formatearFechaHora(fechaVencimiento)} 
                    <span className="ml-2 text-orange-600 font-medium">
                      ({textoTiempoRestante(fechaVencimiento)})
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Tiempo estimado</p>
                  <p className="text-sm">
                    {tareaActual.seguimientoTiempo.horasEstimadas} horas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Edit2 className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Creada</p>
                  <p className="text-sm">
                    {formatearFechaHora(fechaCreacion)}
                  </p>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {tareaActual.etiquetas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Etiquetas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tareaActual.etiquetas.map((etiqueta, index) => (
                    <Badge 
                      key={index}
                      texto={etiqueta}
                      color="bg-blue-100 text-blue-800"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAREAS - 🔥 Usando tareaActual en lugar de tarea */}
            <div className="border-t border-gray-200 pt-6">
              <ListaSubtareas 
                tareaId={tareaActual.id}
                subtareas={tareaActual.subtareas || []}
              />
            </div>

            {/* Cambiar estado */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Cambiar Estado
              </h4>
              {!todasSubtareasCompletadas && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ⚠️ Completa todas las subtareas para poder marcar esta tarea como completada
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {ESTADOS.map((estado) => {
                  const disabled = estado === 'completada' && !todasSubtareasCompletadas;
                  return (
                    <Boton
                      key={estado}
                      variante={tareaActual.estado === estado ? 'primario' : 'secundario'}
                      onClick={() => manejarCambioEstado(estado)}
                      className="text-sm"
                      disabled={disabled}
                    >
                      {obtenerTextoEstado(estado)}
                    </Boton>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <Boton
              variante="peligro"
              onClick={manejarEliminar}
              cargando={eliminando}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar Tarea
            </Boton>
          </div>
        </div>
      </div>
    </div>
  );
};