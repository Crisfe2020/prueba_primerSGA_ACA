/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MATRIZ_CASOS_DE_USO, CasoDeUso } from '../data/sgaArchitectureData';
import { Search, Filter, X, ArrowUpRight, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface UseCaseTableProps {
  onSelectUseCase?: (ucId: string) => void;
}

export const UseCaseTable: React.FC<UseCaseTableProps> = ({ onSelectUseCase }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedActorFilter, setSelectedActorFilter] = useState<string>('all');
  const [selectedCriticalityFilter, setSelectedCriticalityFilter] = useState<string>('all');
  const [selectedUseCaseModal, setSelectedUseCaseModal] = useState<CasoDeUso | null>(null);

  const filteredUseCases = useMemo(() => {
    return MATRIZ_CASOS_DE_USO.filter((uc) => {
      const matchesSearch =
        uc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.actorPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.rfRelacionados.some((rf) => rf.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesActor =
        selectedActorFilter === 'all' ||
        uc.actorPrincipal.toLowerCase().includes(selectedActorFilter.toLowerCase()) ||
        (selectedActorFilter === 'Todos' && uc.actorPrincipal.includes('Todos'));

      const matchesCriticality =
        selectedCriticalityFilter === 'all' || uc.criticidad === selectedCriticalityFilter;

      return matchesSearch && matchesActor && matchesCriticality;
    });
  }, [searchTerm, selectedActorFilter, selectedCriticalityFilter]);

  const getCriticalityBadge = (criticidad: CasoDeUso['criticidad']) => {
    switch (criticidad) {
      case 'Crítica':
        return (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-200">
            Crítica
          </span>
        );
      case 'Alta':
        return (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200">
            Alta
          </span>
        );
      case 'Media':
        return (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
            Media
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.1.2</span>
          <span aria-hidden="true">·</span>
          <span>Catálogo Formal de Casos de Uso</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Matriz Tabular de Casos de Uso del Sistema
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Especificación tabular exhaustiva de los doce (12) casos de uso del SGA, relacionando su identificador formal,
          actor primario, requerimientos funcionales mapeados (RF-01 a RF-12), requerimientos no funcionales y descripción de comportamiento.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, nombre de caso de uso, RF (ej. RF-07), actor o descripción..."
            className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Actor:</span>
            <select
              value={selectedActorFilter}
              onChange={(e) => setSelectedActorFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Todos los Actores</option>
              <option value="Administrador">Administrador</option>
              <option value="Coordinador">Coordinador Académico</option>
              <option value="Docente">Docente</option>
              <option value="Estudiante">Estudiante</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Criticidad:</span>
            <select
              value={selectedCriticalityFilter}
              onChange={(e) => setSelectedCriticalityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Todas</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold tracking-wider">
                <th className="py-3.5 px-4 w-20">ID</th>
                <th className="py-3.5 px-4 min-w-[220px]">Nombre del Caso de Uso</th>
                <th className="py-3.5 px-4 min-w-[160px]">Actor Principal</th>
                <th className="py-3.5 px-4 min-w-[130px]">RF Relacionado</th>
                <th className="py-3.5 px-4 min-w-[100px] text-center">Criticidad</th>
                <th className="py-3.5 px-4 min-w-[340px]">Descripción Breve</th>
                <th className="py-3.5 px-4 text-center w-24">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUseCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron casos de uso que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUseCases.map((uc) => {
                  const isHighlighted = uc.id === 'UC-05' || uc.id === 'UC-06';
                  return (
                    <tr
                      key={uc.id}
                      onClick={() => setSelectedUseCaseModal(uc)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isHighlighted ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{uc.id}</span>
                          {isHighlighted && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" title="Caso de Uso Crítico Prioritario" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{uc.nombre}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Subsistema: {uc.subsistema}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {uc.actorPrincipal}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {uc.rfRelacionados.map((rf) => (
                            <span
                              key={rf}
                              className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {rf}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getCriticalityBadge(uc.criticidad)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        {uc.descripcion}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if ((uc.id === 'UC-05' || uc.id === 'UC-06') && onSelectUseCase) {
                              onSelectUseCase(uc.id);
                            } else {
                              setSelectedUseCaseModal(uc);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <span>{uc.id === 'UC-05' || uc.id === 'UC-06' ? 'Plantilla' : 'Detalle'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/75 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredUseCases.length} de {MATRIZ_CASOS_DE_USO.length} Casos de Uso del SGA</span>
          <span className="font-mono text-[11px]">
            Casos Críticos con Plantilla Detallada: <strong>UC-05 (Matrícula)</strong> y <strong>UC-06 (Calificaciones)</strong>
          </span>
        </div>
      </div>

      {/* Modal / Drawer for Use Case Quick Detail */}
      {selectedUseCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUseCaseModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {selectedUseCaseModal.id}
              </span>
              <span className="text-xs text-slate-500">Subsistema: {selectedUseCaseModal.subsistema}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              {getCriticalityBadge(selectedUseCaseModal.criticidad)}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">{selectedUseCaseModal.nombre}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {selectedUseCaseModal.descripcion}
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Actor Principal:</span>
                <span className="text-slate-900 font-medium">{selectedUseCaseModal.actorPrincipal}</span>
                {selectedUseCaseModal.actoresSecundarios.length > 0 && (
                  <span className="text-slate-500 block mt-1">
                    Actores Secundarios: {selectedUseCaseModal.actoresSecundarios.join(', ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Precondición Resumida:</span>
                  <span className="text-slate-600">{selectedUseCaseModal.precondicionBreve}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Postcondición Resumida:</span>
                  <span className="text-slate-600">{selectedUseCaseModal.postcondicionBreve}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">RFs Mapeados:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedUseCaseModal.rfRelacionados.map((rf) => (
                      <span key={rf} className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                        {rf}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">RNFs Clave:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedUseCaseModal.rnfRelacionados.map((rnf) => (
                      <span key={rnf} className="font-mono text-xs px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded border border-indigo-200">
                        {rnf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUseCaseModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              {(selectedUseCaseModal.id === 'UC-05' || selectedUseCaseModal.id === 'UC-06') && onSelectUseCase && (
                <button
                  onClick={() => {
                    const id = selectedUseCaseModal.id;
                    setSelectedUseCaseModal(null);
                    onSelectUseCase(id);
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Abrir Plantilla Detallada Completa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
