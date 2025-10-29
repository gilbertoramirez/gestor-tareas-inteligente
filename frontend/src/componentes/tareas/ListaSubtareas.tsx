import { useState } from 'react';
import { Plus, Trash2, Check, Square } from 'lucide-react';
import { Boton, Input } from '../comunes';
import { useTareasStore } from '../../store';
import type { Subtarea } from '../../tipos';

interface ListaSubtareasProps {
  tareaId: string;
  subtareas: Subtarea[];
}

export const ListaSubtareas = ({ tareaId, subtareas }: ListaSubtareasProps) => {
  const { agregarSubtarea, actualizarSubtarea, eliminarSubtarea } = useTareasStore();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);

  const total = subtareas.length;
  const completadas = subtareas.filter(s => s.estado === 'completada').length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const handleAgregar = async () => {
    if (!nuevoTitulo.trim()) return;

    try {
      setCargando(true);
      await agregarSubtarea(tareaId, nuevoTitulo, nuevaDescripcion);
      setNuevoTitulo('');
      setNuevaDescripcion('');
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al agregar subtarea:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleToggleEstado = async (subtareaId: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'completada' ? 'pendiente' : 'completada';
    try {
      await actualizarSubtarea(tareaId, subtareaId, nuevoEstado);
    } catch (error) {
      console.error('Error al actualizar subtarea:', error);
    }
  };

  const handleEliminar = async (subtareaId: string) => {
    if (!window.confirm('¿Eliminar esta subtarea?')) return;
    
    try {
      await eliminarSubtarea(tareaId, subtareaId);
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con progreso */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            Subtareas ({completadas} de {total} completadas)
          </h4>
          <span className="text-sm font-semibold text-blue-600">
            {porcentaje}%
          </span>
        </div>
        
        {/* Barra de progreso */}
        {total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        )}
      </div>

      {/* Lista de subtareas */}
      {subtareas.length > 0 && (
        <div className="space-y-2">
          {subtareas
            .sort((a, b) => a.orden - b.orden)
            .map((subtarea) => (
              <div
                key={subtarea.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  subtarea.estado === 'completada'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleEstado(subtarea.id, subtarea.estado)}
                  className="mt-1 flex-shrink-0"
                >
                  {subtarea.estado === 'completada' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  )}
                </button>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      subtarea.estado === 'completada'
                        ? 'text-gray-500 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {subtarea.titulo}
                  </p>
                  {subtarea.descripcion && (
                    <p className="text-xs text-gray-600 mt-1">
                      {subtarea.descripcion}
                    </p>
                  )}
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => handleEliminar(subtarea.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Eliminar subtarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Formulario para agregar nueva subtarea */}
      {mostrarFormulario ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <Input
            placeholder="Título de la subtarea"
            value={nuevoTitulo}
            onChange={(e) => setNuevoTitulo(e.target.value)}
            autoFocus
          />
          <Input
            placeholder="Descripción (opcional)"
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
          />
          <div className="flex gap-2">
            <Boton
              variante="primario"
              onClick={handleAgregar}
              cargando={cargando}
              disabled={!nuevoTitulo.trim()}
              className="flex-1"
            >
              Agregar
            </Boton>
            <Boton
              variante="secundario"
              onClick={() => {
                setMostrarFormulario(false);
                setNuevoTitulo('');
                setNuevaDescripcion('');
              }}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      ) : (
        <Boton
          variante="secundario"
          onClick={() => setMostrarFormulario(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar subtarea
        </Boton>
      )}
    </div>
  );
};
