import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input, TextArea, Boton, Modal } from '../comunes';
import { useTareasStore } from '../../store';
import { validarTitulo, validarBeneficio, validarHorasEstimadas } from '../../utilidades';
import type { CrearTareaDTO } from '../../tipos';

interface FormularioTareaProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface SubtareaTemporal {
  id: string;
  titulo: string;
  descripcion: string;
}

export const FormularioTarea = ({ abierto, onCerrar }: FormularioTareaProps) => {
  const { crearTarea, agregarSubtarea, cargando } = useTareasStore();
  
  const [datos, setDatos] = useState<CrearTareaDTO>({
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    beneficio: 50,
    horasEstimadas: 1,
    etiquetas: []
  });
  
  const [etiquetaInput, setEtiquetaInput] = useState('');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  
  // Estado para subtareas temporales
  const [subtareas, setSubtareas] = useState<SubtareaTemporal[]>([]);
  const [mostrarFormSubtarea, setMostrarFormSubtarea] = useState(false);
  const [subtareaTitulo, setSubtareaTitulo] = useState('');
  const [subtareaDesc, setSubtareaDesc] = useState('');

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!validarTitulo(datos.titulo)) {
      nuevosErrores.titulo = 'El título es requerido';
    }

    if (!datos.fechaVencimiento) {
      nuevosErrores.fechaVencimiento = 'La fecha de vencimiento es requerida';
    }

    if (!validarBeneficio(datos.beneficio)) {
      nuevosErrores.beneficio = 'El beneficio debe estar entre 0 y 100';
    }

    if (!validarHorasEstimadas(datos.horasEstimadas)) {
      nuevosErrores.horasEstimadas = 'Las horas estimadas deben ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarSubtareaTemporal = () => {
    if (!subtareaTitulo.trim()) return;
    
    const nueva: SubtareaTemporal = {
      id: `temp_${Date.now()}`,
      titulo: subtareaTitulo,
      descripcion: subtareaDesc
    };
    
    setSubtareas([...subtareas, nueva]);
    setSubtareaTitulo('');
    setSubtareaDesc('');
    setMostrarFormSubtarea(false);
  };

  const eliminarSubtareaTemporal = (id: string) => {
    setSubtareas(subtareas.filter(s => s.id !== id));
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      const fechaLocal = new Date(datos.fechaVencimiento);
      const año = fechaLocal.getFullYear();
      const mes = String(fechaLocal.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaLocal.getDate()).padStart(2, '0');
      const horas = String(fechaLocal.getHours()).padStart(2, '0');
      const minutos = String(fechaLocal.getMinutes()).padStart(2, '0');
      
      const fechaISO = `${año}-${mes}-${dia}T${horas}:${minutos}:00.000Z`;
      
      // Crear la tarea
      await crearTarea({
        ...datos,
        fechaVencimiento: fechaISO
      });
      
      // Si hay subtareas, necesitamos obtener el ID de la tarea recién creada
      // Para simplificar, asumimos que la última tarea en el store es la recién creada
      // En producción, crearTarea debería devolver la tarea con su ID
      if (subtareas.length > 0) {
        // Esperar un momento para que se actualice el store
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Obtener la última tarea (la recién creada)
        // Nota: esto es una simplificación, en producción deberías obtener el ID directamente
        const tareasStore = useTareasStore.getState().tareas;
        const tareaRecienCreada = tareasStore[tareasStore.length - 1];
        
        // Agregar cada subtarea
        for (const subtarea of subtareas) {
          await agregarSubtarea(
            tareaRecienCreada.id,
            subtarea.titulo,
            subtarea.descripcion
          );
        }
      }
      
      // Limpiar formulario
      setDatos({
        titulo: '',
        descripcion: '',
        fechaVencimiento: '',
        beneficio: 50,
        horasEstimadas: 1,
        etiquetas: []
      });
      setEtiquetaInput('');
      setSubtareas([]);
      setErrores({});
      onCerrar();
      
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  const agregarEtiqueta = () => {
    if (etiquetaInput.trim() && !datos.etiquetas?.includes(etiquetaInput.trim())) {
      setDatos({
        ...datos,
        etiquetas: [...(datos.etiquetas || []), etiquetaInput.trim()]
      });
      setEtiquetaInput('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setDatos({
      ...datos,
      etiquetas: datos.etiquetas?.filter(e => e !== etiqueta) || []
    });
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="📝 Nueva Tarea" ancho="grande">
      <form onSubmit={manejarSubmit} className="space-y-4">
        <Input
          etiqueta="Título de la tarea *"
          placeholder="Ej: Implementar sistema de login"
          value={datos.titulo}
          onChange={(e) => setDatos({ ...datos, titulo: e.target.value })}
          error={errores.titulo}
        />

        <TextArea
          etiqueta="Descripción"
          placeholder="Describe los detalles de la tarea..."
          rows={4}
          value={datos.descripcion}
          onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            etiqueta="Fecha de vencimiento *"
            type="datetime-local"
            value={datos.fechaVencimiento}
            onChange={(e) => setDatos({ ...datos, fechaVencimiento: e.target.value })}
            error={errores.fechaVencimiento}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas estimadas *
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={datos.horasEstimadas}
              onChange={(e) => setDatos({ ...datos, horasEstimadas: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errores.horasEstimadas && (
              <p className="mt-1 text-sm text-red-600">{errores.horasEstimadas}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beneficio esperado: {datos.beneficio}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={datos.beneficio}
            onChange={(e) => setDatos({ ...datos, beneficio: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Bajo (0)</span>
            <span>Medio (50)</span>
            <span>Alto (100)</span>
          </div>
        </div>

        {/* Subtareas */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtareas ({subtareas.length})
          </label>
          
          {subtareas.length > 0 && (
            <div className="space-y-2 mb-3">
              {subtareas.map((subtarea) => (
                <div
                  key={subtarea.id}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {subtarea.titulo}
                    </p>
                    {subtarea.descripcion && (
                      <p className="text-xs text-gray-600 mt-1">
                        {subtarea.descripcion}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarSubtareaTemporal(subtarea.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {mostrarFormSubtarea ? (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <Input
                placeholder="Título de la subtarea"
                value={subtareaTitulo}
                onChange={(e) => setSubtareaTitulo(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="Descripción (opcional)"
                value={subtareaDesc}
                onChange={(e) => setSubtareaDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Boton
                  type="button"
                  variante="primario"
                  onClick={agregarSubtareaTemporal}
                  disabled={!subtareaTitulo.trim()}
                  className="flex-1"
                >
                  Agregar
                </Boton>
                <Boton
                  type="button"
                  variante="secundario"
                  onClick={() => {
                    setMostrarFormSubtarea(false);
                    setSubtareaTitulo('');
                    setSubtareaDesc('');
                  }}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ) : (
            <Boton
              type="button"
              variante="secundario"
              onClick={() => setMostrarFormSubtarea(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar subtarea
            </Boton>
          )}
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etiquetas
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ej: urgente, backend"
              value={etiquetaInput}
              onChange={(e) => setEtiquetaInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarEtiqueta();
                }
              }}
            />
            <Boton
              type="button"
              variante="secundario"
              onClick={agregarEtiqueta}
            >
              Agregar
            </Boton>
          </div>
          
          {datos.etiquetas && datos.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {datos.etiquetas.map((etiqueta, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {etiqueta}
                  <button
                    type="button"
                    onClick={() => eliminarEtiqueta(etiqueta)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Boton
            type="submit"
            variante="primario"
            className="flex-1"
            cargando={cargando}
          >
            Crear Tarea
          </Boton>
          <Boton
            type="button"
            variante="secundario"
            onClick={onCerrar}
          >
            Cancelar
          </Boton>
        </div>
      </form>
    </Modal>
  );
};
