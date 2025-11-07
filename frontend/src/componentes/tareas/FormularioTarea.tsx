import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Input, TextArea, Boton, Modal } from '../comunes';
import { useTareasStore } from '../../store';
import { validarTitulo, validarHorasEstimadas } from '../../utilidades';
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

interface CategoriaPrioridad {
  id: string;
  nombre: string;
  puntos: number;
  descripcion?: string;
}

export const FormularioTarea = ({ abierto, onCerrar }: FormularioTareaProps) => {
  const { crearTarea, agregarSubtarea, cargando } = useTareasStore();
  
  const [datos, setDatos] = useState({
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    beneficioCategoriaId: '', // 🔥 CAMBIADO: ahora es ID de categoría
    horasEstimadas: 1,
    etiquetas: [] as string[]
  });
  
  const [etiquetaInput, setEtiquetaInput] = useState('');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  
  // Estado para categorías
  const [categorias, setCategorias] = useState<CategoriaPrioridad[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  
  // Estado para subtareas temporales
  const [subtareas, setSubtareas] = useState<SubtareaTemporal[]>([]);
  const [mostrarFormSubtarea, setMostrarFormSubtarea] = useState(false);
  const [subtareaTitulo, setSubtareaTitulo] = useState('');
  const [subtareaDesc, setSubtareaDesc] = useState('');

  // 🔥 Cargar categorías al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/tareas/categorias`);
        const data = await response.json();
        setCategorias(data.categorias);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCargandoCategorias(false);
      }
    };

    if (abierto) {
      cargarCategorias();
    }
  }, [abierto]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!validarTitulo(datos.titulo)) {
      nuevosErrores.titulo = 'El título es requerido';
    }

    if (!datos.fechaVencimiento) {
      nuevosErrores.fechaVencimiento = 'La fecha de vencimiento es requerida';
    }

    // 🔥 Validar categoría en lugar de beneficio
    if (!datos.beneficioCategoriaId) {
      nuevosErrores.beneficioCategoriaId = 'Debes seleccionar una categoría de prioridad';
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
      
      // 🔥 Crear la tarea con beneficioCategoriaId
      await crearTarea({
        ...datos,
        fechaVencimiento: fechaISO
      } as any);
      
      // Si hay subtareas, agregarlas
      if (subtareas.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const tareasStore = useTareasStore.getState().tareas;
        const tareaRecienCreada = tareasStore[tareasStore.length - 1];
        
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
        beneficioCategoriaId: '',
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

  // 🔥 Obtener la categoría seleccionada
  const categoriaSeleccionada = categorias?.find(c => c.id === datos.beneficioCategoriaId);

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

        {/* 🔥 NUEVO: Selector de Categoría de Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría de Prioridad *
            {categoriaSeleccionada && (
              <span className="ml-2 text-blue-600 font-bold">
                ({categoriaSeleccionada.puntos} pts)
              </span>
            )}
          </label>
          
          {cargandoCategorias ? (
            <div className="text-gray-500 text-sm py-2">Cargando categorías...</div>
          ) : (
            <>
              <select
                value={datos.beneficioCategoriaId}
                onChange={(e) => setDatos({ ...datos, beneficioCategoriaId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.beneficioCategoriaId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre} - {cat.puntos} puntos
                  </option>
                ))}
              </select>
              
              {errores.beneficioCategoriaId && (
                <p className="mt-1 text-sm text-red-600">{errores.beneficioCategoriaId}</p>
              )}
              
              {/* Indicador visual de prioridad */}
              {categoriaSeleccionada && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        categoriaSeleccionada.puntos >= 80 ? 'bg-red-500' :
                        categoriaSeleccionada.puntos >= 60 ? 'bg-orange-500' :
                        categoriaSeleccionada.puntos >= 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${categoriaSeleccionada.puntos}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Bajo</span>
                    <span className="font-medium">
                      {categoriaSeleccionada.puntos >= 80 ? 'Muy Alto' :
                       categoriaSeleccionada.puntos >= 60 ? 'Alto' :
                       categoriaSeleccionada.puntos >= 40 ? 'Medio' :
                       'Bajo'}
                    </span>
                    <span>Alto</span>
                  </div>
                </div>
              )}
            </>
          )}
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