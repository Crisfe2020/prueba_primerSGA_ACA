/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Award,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  teacherService,
  TeacherGroupData,
  TeacherRosterItem,
  SessionUser,
} from '../../services/apiService';

interface TeacherViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ session, onRefreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronización con la ruta activa del navegador
  const activeTab = useMemo<'grupos' | 'notas'>(() => {
    if (location.pathname.includes('/notas')) return 'notas';
    return 'grupos';
  }, [location.pathname]);

  const handleTabChange = (tab: 'grupos' | 'notas') => {
    if (tab === 'grupos') navigate('/docente');
    else navigate('/docente/notas');
  };

  const [assignedGroups, setAssignedGroups] = useState<TeacherGroupData[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [roster, setRoster] = useState<TeacherRosterItem[]>([]);
  const [localGrades, setLocalGrades] = useState<{ [detalleId: string]: { corte1: string; corte2: string; corte3: string } }>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeacherDashboard(session.usuario.id);
      if (data && data.grupos.length > 0) {
        setAssignedGroups(data.grupos);
        const initialGroupId = selectedGroupId || data.grupos[0].grupo.id;
        setSelectedGroupId(initialGroupId);
        await loadGroupRoster(initialGroupId);
      }
    } catch (e) {
      console.error('Error fetching teacher data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupRoster = async (groupId: string) => {
    try {
      const list = await teacherService.getGroupRoster(groupId);
      setRoster(list);

      // Initialize local editable state
      const initialMap: { [id: string]: { corte1: string; corte2: string; corte3: string } } = {};
      list.forEach((item) => {
        initialMap[item.matriculaDetalleId] = {
          corte1: item.corte1 !== null ? item.corte1.toString() : '',
          corte2: item.corte2 !== null ? item.corte2.toString() : '',
          corte3: item.corte3 !== null ? item.corte3.toString() : '',
        };
      });
      setLocalGrades(initialMap);
    } catch (e) {
      console.error('Error loading roster:', e);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [session.usuario.id]);

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setFeedback(null);
    await loadGroupRoster(groupId);
  };

  const handleGradeInputChange = (
    detalleId: string,
    field: 'corte1' | 'corte2' | 'corte3',
    value: string
  ) => {
    setLocalGrades((prev) => ({
      ...prev,
      [detalleId]: {
        ...prev[detalleId],
        [field]: value,
      },
    }));
  };

  // Cálculo en vivo de la definitiva ponderada (30% + 30% + 40%)
  const calculateLiveDefinitive = (detalleId: string): number | null => {
    const item = localGrades[detalleId];
    if (!item) return null;

    const c1 = item.corte1 !== '' ? parseFloat(item.corte1) : null;
    const c2 = item.corte2 !== '' ? parseFloat(item.corte2) : null;
    const c3 = item.corte3 !== '' ? parseFloat(item.corte3) : null;

    let total = 0;
    let peso = 0;

    if (c1 !== null && !isNaN(c1)) {
      total += c1 * 0.3;
      peso += 0.3;
    }
    if (c2 !== null && !isNaN(c2)) {
      total += c2 * 0.3;
      peso += 0.3;
    }
    if (c3 !== null && !isNaN(c3)) {
      total += c3 * 0.4;
      peso += 0.4;
    }

    if (peso === 0) return null;
    return Number((total / peso).toFixed(2));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    setFeedback(null);

    const activeGroupData = assignedGroups.find((g) => g.grupo.id === selectedGroupId);
    const groupName = activeGroupData ? `${activeGroupData.grupo.asignaturaNombre} - ${activeGroupData.grupo.numeroGrupo}` : 'Grupo';

    // Prepare payload
    const payload = roster.map((r) => {
      const g = localGrades[r.matriculaDetalleId] || { corte1: '', corte2: '', corte3: '' };
      return {
        matriculaDetalleId: r.matriculaDetalleId,
        estudianteNombre: r.nombreCompleto,
        corte1: g.corte1 !== '' ? parseFloat(g.corte1) : null,
        corte2: g.corte2 !== '' ? parseFloat(g.corte2) : null,
        corte3: g.corte3 !== '' ? parseFloat(g.corte3) : null,
      };
    });

    try {
      const res = await teacherService.saveGrades(session.usuario, groupName, payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `¡Acta guardada exitosamente! ${res.count} calificaciones asentadas y registradas en auditoría (RF-12).`,
        });
        await loadGroupRoster(selectedGroupId);
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Error al validar las notas.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error de conexión con el servidor al asentar notas.',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedGroup = assignedGroups.find((g) => g.grupo.id === selectedGroupId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={session.usuario.avatarUrl}
              alt={session.usuario.nombreCompleto}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {session.usuario.nombreCompleto}
                </h2>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                  DOCENTE TITULAR
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Departamento: <strong>Ingeniería de Software &amp; Ciencias Computacionales</strong>
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                {assignedGroups.length} Grupos Asignados · Periodo Académico 2026-1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
              Módulo de Calificaciones (RF-08)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => handleTabChange('grupos')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grupos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mis Grupos Asignados ({assignedGroups.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('notas')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Planilla de Calificaciones (RF-08)</span>
          </button>
        </div>

        {/* Assigned Groups Selector Strip (Visible en modo notas para alternar grupo rápido) */}
        {activeTab === 'notas' && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Grupo Activo para Calificar:
            </span>
            <div className="flex flex-wrap gap-2">
              {assignedGroups.map((item) => {
                const isSelected = item.grupo.id === selectedGroupId;
                return (
                  <button
                    key={item.grupo.id}
                    onClick={() => handleGroupChange(item.grupo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {item.grupo.asignaturaCodigo} - {item.grupo.numeroGrupo}: {item.grupo.asignaturaNombre}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {item.estudiantesMatriculadosCount} est.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* VISTA 1: MIS GRUPOS ASIGNADOS */}
      {activeTab === 'grupos' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Carga Académica Asignada - Periodo 2026-1</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seleccione cualquier grupo para abrir su acta y gestionar las notas de los estudiantes.
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg">
              {assignedGroups.length} Cursos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedGroups.map((item) => (
              <div
                key={item.grupo.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {item.grupo.asignaturaCodigo} · Grupo {item.grupo.numeroGrupo}
                    </span>
                    <span className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                      {item.grupo.creditos} Créditos
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-2">{item.grupo.asignaturaNombre}</h4>
                  <p className="text-xs text-slate-500 mt-1">Periodo: 2026-1 · Modalidad Presencial / Virtual</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.grupo.diasHorario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.grupo.aulaOEnlace}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{item.estudiantesMatriculadosCount}</strong> estudiantes matriculados</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleGroupChange(item.grupo.id);
                    handleTabChange('notas');
                  }}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Calificar este Grupo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: PLANILLA DE CALIFICACIONES (RF-08) */}
      {activeTab === 'notas' && selectedGroup && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                  {selectedGroup.grupo.asignaturaCodigo} · Grupo {selectedGroup.grupo.numeroGrupo}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedGroup.grupo.asignaturaNombre}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedGroup.grupo.diasHorario}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedGroup.grupo.aulaOEnlace}
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveGrades}
              disabled={saving || roster.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Asentando en BD...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar y Asentar Calificaciones (RF-08)</span>
                </>
              )}
            </button>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Interactive Editable Planilla Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-28">Código</th>
                  <th className="py-3 px-4">Estudiante Matriculado</th>
                  <th className="py-3 px-3 text-center w-28">Corte 1 (30%)</th>
                  <th className="py-3 px-3 text-center w-28">Corte 2 (30%)</th>
                  <th className="py-3 px-3 text-center w-28">Examen Final (40%)</th>
                  <th className="py-3 px-3 text-center w-28 font-bold">Definitiva En Vivo</th>
                  <th className="py-3 px-3 text-center w-24">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {roster.map((student, idx) => {
                  const grades = localGrades[student.matriculaDetalleId] || { corte1: '', corte2: '', corte3: '' };
                  const liveDef = calculateLiveDefinitive(student.matriculaDetalleId);
                  const isApproved = liveDef !== null && liveDef >= 3.0;

                  return (
                    <tr key={student.matriculaDetalleId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{student.codigoEstudiantil}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {student.nombreCompleto}
                        <span className="block text-[10px] text-slate-400 font-normal">C.C. {student.documento}</span>
                      </td>

                      {/* Input Corte 1 */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={grades.corte1}
                          onChange={(e) =>
                            handleGradeInputChange(student.matriculaDetalleId, 'corte1', e.target.value)
                          }
                          placeholder="0.0 - 5.0"
                          className="w-20 text-center font-mono font-bold text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Input Corte 2 */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={grades.corte2}
                          onChange={(e) =>
                            handleGradeInputChange(student.matriculaDetalleId, 'corte2', e.target.value)
                          }
                          placeholder="0.0 - 5.0"
                          className="w-20 text-center font-mono font-bold text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Input Corte 3 */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={grades.corte3}
                          onChange={(e) =>
                            handleGradeInputChange(student.matriculaDetalleId, 'corte3', e.target.value)
                          }
                          placeholder="0.0 - 5.0"
                          className="w-20 text-center font-mono font-bold text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Live Computed Definitive */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                            liveDef === null
                              ? 'text-slate-400'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {liveDef !== null ? liveDef.toFixed(2) : '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {liveDef === null ? (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                            SIN NOTA
                          </span>
                        ) : isApproved ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            APRUEBA
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                            REPRUEBA
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong>Cálculo Reactivo en Tiempo Real:</strong> La columna "Definitiva En Vivo" recalcula inmediatamente los ponderados con cada pulsación de tecla. Al presionar "Guardar y Asentar Calificaciones", los datos son enviados a la Capa de Servicios y persistidos con bloqueo transaccional y registro inmutable en auditoría bajo el estándar <strong>RF-12</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
