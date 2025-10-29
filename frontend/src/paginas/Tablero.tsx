import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useTareasStore } from '../store';
import { Cargando, Tarjeta, Boton } from '../componentes/comunes';
import { FormularioTarea } from '../componentes/tareas/FormularioTarea';
import { TarjetaTarea } from '../componentes/tareas/TarjetaTarea';
import { DetalleTarea } from '../componentes/tareas/DetalleTarea';
import { VistaKanban } from '../componentes/tablero/VistaKanban';
import type { Tarea } from '../tipos';

type VistaType = 'lista' | 'kanban';

export const Tablero = () => {
  const { tareas, cargando, cargarTareasPorPrioridad } = useTareasStore();
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [vista, setVista] = useState<VistaType>('kanban');

  useEffect(() => {
    cargarTareasPorPrioridad();
  }, []);

  if (cargando && tareas.length === 0) {
    return <Cargando mensaje="Cargando tareas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Tablero de Tareas
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus tareas de forma inteligente
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle Vista */}
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setVista('kanban')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  vista === 'kanban' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setVista('lista')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  vista === 'lista' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>

            {/* Botón Nueva Tarea */}
            <Boton
              variante="primario"
              onClick={() => setModalNuevoAbierto(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Tarea
            </Boton>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Tarjeta>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Total de tareas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {tareas.length}
              </p>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="text-center">
              <p className="text-gray-600 text-sm">En progreso</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {tareas.filter(t => t.estado === 'trabajando').length}
              </p>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Completadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {tareas.filter(t => t.estado === 'completada').length}
              </p>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {tareas.filter(t => t.estado === 'pendiente').length}
              </p>
            </div>
          </Tarjeta>
        </div>

        {/* Vista Kanban o Lista */}
        {vista === 'kanban' ? (
          tareas.length === 0 ? (
            <Tarjeta>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  No tienes tareas aún
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Crea tu primera tarea para comenzar
                </p>
                <Boton
                  variante="primario"
                  onClick={() => setModalNuevoAbierto(true)}
                  className="mx-auto"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Crear Primera Tarea
                </Boton>
              </div>
            </Tarjeta>
          ) : (
            <div className="h-[calc(100vh-450px)]">
              <VistaKanban
                tareas={tareas}
                onClickTarea={setTareaSeleccionada}
              />
            </div>
          )
        ) : (
          <Tarjeta>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tareas prioritarias
            </h2>
            
            {tareas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  No tienes tareas aún
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Crea tu primera tarea para comenzar
                </p>
                <Boton
                  variante="primario"
                  onClick={() => setModalNuevoAbierto(true)}
                  className="mx-auto"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Crear Primera Tarea
                </Boton>
              </div>
            ) : (
              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <TarjetaTarea 
                    key={tarea.id} 
                    tarea={tarea}
                    onClick={() => setTareaSeleccionada(tarea)}
                  />
                ))}
              </div>
            )}
          </Tarjeta>
        )}
      </div>

      {/* Modal de nueva tarea */}
      <FormularioTarea
        abierto={modalNuevoAbierto}
        onCerrar={() => setModalNuevoAbierto(false)}
      />

      {/* Panel de detalle de tarea */}
      {tareaSeleccionada && (
        <DetalleTarea
          tarea={tareaSeleccionada}
          onCerrar={() => setTareaSeleccionada(null)}
        />
      )}
    </div>
  );
};
