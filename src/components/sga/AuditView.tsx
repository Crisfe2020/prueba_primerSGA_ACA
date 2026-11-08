/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { auditService, SessionUser } from '../../services/apiService';
import { AuditLogEntity } from '../../services/dataStore';

interface AuditViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const AuditView: React.FC<AuditViewProps> = () => {
  const [logs, setLogs] = useState<AuditLogEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLogModal, setActiveLogModal] = useState<AuditLogEntity | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const list = await auditService.getLogs(selectedModulo);
      setLogs(list);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModulo]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        log.usuarioNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.usuarioEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.accion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipOrigen.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Pista Inmutable de Auditoría (RF-12 / RNF-10)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Bitácora de Eventos y Trazabilidad Transaccional
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Registro inmutable de solo adición (Append-Only) en PostgreSQL. Captura inicios de sesión, cambios de notas, 
              bloqueos de cupo y modificaciones administrativas con dirección IP, fecha UTC y deltas JSON.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Logs</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="inline-flex rounded-lg p-1 bg-slate-100 text-xs font-semibold w-full sm:w-auto overflow-x-auto">
            {['ALL', 'AUTENTICACION', 'MATRICULAS', 'CALIFICACIONES', 'ACADEMICO', 'USUARIOS'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModulo(mod)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  selectedModulo === mod
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mod === 'ALL' ? 'Todos los Módulos' : mod}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por usuario, IP, acción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-16 text-center">ID</th>
                <th className="py-3 px-3 w-36">Marca Temporal (UTC)</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-3">Módulo</th>
                <th className="py-3 px-4">Acción Ejecutada</th>
                <th className="py-3 px-3">IP Origen</th>
                <th className="py-3 px-3 text-center">Deltas JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map((log) => {
                let badgeModule = 'bg-slate-100 text-slate-700';
                if (log.modulo === 'AUTENTICACION') badgeModule = 'bg-blue-100 text-blue-900';
                if (log.modulo === 'MATRICULAS') badgeModule = 'bg-emerald-100 text-emerald-900';
                if (log.modulo === 'CALIFICACIONES') badgeModule = 'bg-amber-100 text-amber-900';
                if (log.modulo === 'USUARIOS') badgeModule = 'bg-purple-100 text-purple-900';
                if (log.modulo === 'ACADEMICO') badgeModule = 'bg-indigo-100 text-indigo-900';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">#{log.id}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {new Date(log.fechaUtc).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.usuarioNombre}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.usuarioEmail}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${badgeModule}`}>
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 text-[11px] block">{log.accion}</span>
                      <span className="text-[10px] text-slate-500">Entidad: {log.entidadAfectada} ({log.registroAfectadoId})</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{log.ipOrigen}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setActiveLogModal(log)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ver JSON</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No se encontraron eventos registrados en esta consulta.
          </div>
        )}
      </div>

      {/* Modal Visor de JSON Payload */}
      {activeLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                  Log #{activeLogModal.id} · {activeLogModal.modulo}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {activeLogModal.accion}
                </h3>
              </div>
              <button
                onClick={() => setActiveLogModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Usuario:</strong> {activeLogModal.usuarioNombre} ({activeLogModal.usuarioEmail})</p>
              <p><strong>Fecha UTC:</strong> {activeLogModal.fechaUtc}</p>
              <p><strong>IP Origen:</strong> {activeLogModal.ipOrigen}</p>
              {activeLogModal.justificacion && (
                <p className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900">
                  <strong>Justificación Legal:</strong> {activeLogModal.justificacion}
                </p>
              )}
            </div>

            {/* JSON Viewer */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Instantánea de Cambios (Deltas JSONB):
              </span>
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                <pre>
                  {JSON.stringify(
                    {
                      datosAnteriores: activeLogModal.datosAnteriores,
                      datosNuevos: activeLogModal.datosNuevos,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveLogModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
