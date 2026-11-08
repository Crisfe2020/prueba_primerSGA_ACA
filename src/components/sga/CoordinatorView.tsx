/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  BookOpen,
  PlusCircle,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import {
  adminService,
  SessionUser,
} from '../../services/apiService';
import { AsignaturaEntity, GrupoEntity, DocenteEntity } from '../../services/dataStore';
import {
  FRANJAS_HORARIAS_PREDEFINIDAS,
  DIAS_SEMANA,
  parseSchedule,
  checkTeacherAndRoomConflicts,
  performSystemScheduleAudit,
} from '../../services/scheduleUtils';

interface CoordinatorViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const CoordinatorView: React.FC<CoordinatorViewProps> = ({ session, onRefreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronización con la ruta del Router
  const activeTab = useMemo<'oferta' | 'nueva_materia' | 'nuevo_grupo' | 'horarios'>(() => {
    if (location.pathname.includes('/admin/asignaturas')) return 'nueva_materia';
    if (location.pathname.includes('/admin/grupos')) return 'nuevo_grupo';
    if (location.pathname.includes('/admin/horarios')) return 'horarios';
    return 'oferta';
  }, [location.pathname]);

  const handleTabChange = (tab: 'oferta' | 'nueva_materia' | 'nuevo_grupo' | 'horarios') => {
    setFeedback(null);
    if (tab === 'nueva_materia') navigate('/admin/asignaturas');
    else if (tab === 'nuevo_grupo') navigate('/admin/grupos');
    else if (tab === 'horarios') navigate('/admin/horarios');
    else navigate('/admin/oferta');
  };
  
  const [asignaturas, setAsignaturas] = useState<AsignaturaEntity[]>([]);
  const [grupos, setGrupos] = useState<GrupoEntity[]>([]);
  const [docentes, setDocentes] = useState<DocenteEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: Asignatura
  const [asigCodigo, setAsigCodigo] = useState('');
  const [asigNombre, setAsigNombre] = useState('');
  const [asigCreditos, setAsigCreditos] = useState('3');
  const [asigSemestre, setAsigSemestre] = useState('5');
  const [asigPrerreqs, setAsigPrerreqs] = useState('');
  const [savingAsig, setSavingAsig] = useState(false);

  // Form State: Grupo Estructurado con Franjas Horarias (RF-06)
  const [grupoAsignaturaId, setGrupoAsignaturaId] = useState('');
  const [grupoDocenteId, setGrupoDocenteId] = useState('');
  const [grupoNumero, setGrupoNumero] = useState('G1');
  const [grupoCupoMax, setGrupoCupoMax] = useState('25');
  const [grupoDiasPreset, setGrupoDiasPreset] = useState('Lunes y Miércoles');
  const [grupoFranjaId, setGrupoFranjaId] = useState('f-18-20');
  const [grupoAula, setGrupoAula] = useState('Edificio Central - Aula B-204');
  const [savingGrupo, setSavingGrupo] = useState(false);

  // Estado del Módulo de Horarios y Auditoría Global
  const [scheduleFilterDocente, setScheduleFilterDocente] = useState('TODOS');
  const [scheduleFilterTurno, setScheduleFilterTurno] = useState('TODOS');
  const [globalAuditReport, setGlobalAuditReport] = useState<ReturnType<typeof performSystemScheduleAudit> | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);

  // Horario computado según franja y días seleccionados
  const selectedFranja = FRANJAS_HORARIAS_PREDEFINIDAS.find((f) => f.id === grupoFranjaId);
  const computedHorario = selectedFranja ? `${grupoDiasPreset} ${selectedFranja.horaInicio} - ${selectedFranja.horaFin}` : 'Lunes 08:00 - 10:00';

  // Validación reactiva de cruce de horario en tiempo real para Docente y Aula (RF-06, RNF-07)
  const liveConflictCheck = useMemo(() => {
    if (!grupoDocenteId || !computedHorario) return { hasConflict: false };
    return checkTeacherAndRoomConflicts(grupoDocenteId, computedHorario, grupoAula, grupos);
  }, [grupoDocenteId, computedHorario, grupoAula, grupos]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAcademicCatalog();
      setAsignaturas(data.asignaturas);
      setGrupos(data.grupos);
      setDocentes(data.docentes);
      if (data.asignaturas.length > 0 && !grupoAsignaturaId) {
        setGrupoAsignaturaId(data.asignaturas[0].id);
      }
      if (data.docentes.length > 0 && !grupoDocenteId) {
        setGrupoDocenteId(data.docentes[0].id);
      }
    } catch (e) {
      console.error('Error fetching catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asigCodigo.trim() || !asigNombre.trim()) {
      setFeedback({ type: 'error', message: 'El código y el nombre son obligatorios.' });
      return;
    }

    setSavingAsig(true);
    setFeedback(null);
    try {
      const res = await adminService.createSubject(session.usuario, {
        codigo: asigCodigo.trim(),
        nombre: asigNombre.trim(),
        creditos: parseInt(asigCreditos, 10),
        semestreNivel: parseInt(asigSemestre, 10),
        prerrequisitosTexto: asigPrerreqs,
      });

      if (res.success && res.asignatura) {
        setFeedback({
          type: 'success',
          message: `¡Asignatura ${res.asignatura.codigo} (${res.asignatura.nombre}) creada exitosamente y registrada en auditoría!`,
        });
        setAsigCodigo('');
        setAsigNombre('');
        setAsigPrerreqs('');
        await loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al crear la asignatura.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión.' });
    } finally {
      setSavingAsig(false);
    }
  };

  const handleRunGlobalAudit = async () => {
    setRunningAudit(true);
    try {
      const report = await adminService.runScheduleAudit();
      setGlobalAuditReport(report);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoAsignaturaId || !grupoDocenteId) {
      setFeedback({ type: 'error', message: 'Seleccione una asignatura y un docente válido.' });
      return;
    }

    if (liveConflictCheck.hasConflict) {
      setFeedback({
        type: 'error',
        message:
          liveConflictCheck.docenteConflict?.reason ||
          liveConflictCheck.aulaConflict?.reason ||
          'Existe un cruce de horario no resuelto.',
      });
      return;
    }

    setSavingGrupo(true);
    setFeedback(null);
    try {
      const res = await adminService.createGroup(session.usuario, {
        asignaturaId: grupoAsignaturaId,
        docenteId: grupoDocenteId,
        numeroGrupo: grupoNumero,
        cupoMaximo: parseInt(grupoCupoMax, 10),
        diasHorario: computedHorario,
        aulaOEnlace: grupoAula,
      });

      if (res.success && res.grupo) {
        setFeedback({
          type: 'success',
          message: `¡Grupo ${res.grupo.numeroGrupo} de ${res.grupo.asignaturaNombre} (${computedHorario}) abierto exitosamente con ${res.grupo.cupoMaximo} cupos y 0 cruces!`,
        });
        await loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al aperturar el grupo.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión.' });
    } finally {
      setSavingGrupo(false);
    }
  };

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
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  COORDINADOR ACADÉMICO
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Facultad de Ingeniería y Ciencias Aplicadas · Coordinación de Currículo y Matrícula
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                Periodo Académico Activo: <strong>2026-1</strong> · Control de Planes y Grupos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
              Módulo Curricular (RF-05 / RF-06)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => handleTabChange('oferta')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'oferta'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Oferta y Grupos Activos ({grupos.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('nueva_materia')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nueva_materia'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Crear Asignatura (RF-05)</span>
          </button>
          <button
            onClick={() => handleTabChange('nuevo_grupo')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nuevo_grupo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apertura de Grupos &amp; Cupos (RF-06)</span>
          </button>
          <button
            onClick={() => handleTabChange('horarios')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'horarios'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Franjas Horarias &amp; Cruces (RF-06)</span>
          </button>
        </div>
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

      {/* TAB 1: OFERTA ACADÉMICA Y MONITOREO DE CUPOS */}
      {activeTab === 'oferta' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Monitoreo en Tiempo Real de Grupos y Cupos (Periodo 2026-1)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Muestra la demanda en vivo, cupos consumidos mediante matrículas ACID y docentes adscritos.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              {grupos.length} Grupos Configurados
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Asignatura</th>
                  <th className="py-3 px-2 text-center">Grupo</th>
                  <th className="py-3 px-2 text-center">Créditos</th>
                  <th className="py-3 px-4">Docente Titular</th>
                  <th className="py-3 px-3">Horario</th>
                  <th className="py-3 px-3 text-center">Ocupación / Cupos</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {grupos.map((g) => {
                  const ocupados = g.cupoMaximo - g.cupoDisponible;
                  const porcentajeOcupacion = Math.round((ocupados / g.cupoMaximo) * 100);

                  return (
                    <tr key={g.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-900">{g.asignaturaCodigo}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{g.asignaturaNombre}</td>
                      <td className="py-3 px-2 text-center font-mono font-semibold">{g.numeroGrupo}</td>
                      <td className="py-3 px-2 text-center font-mono">{g.creditos}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{g.docenteNombre}</td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] font-sans">
                        <span>{g.diasHorario}</span>
                        <span className="block text-slate-400 text-[10px] truncate">{g.aulaOEnlace}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {ocupados} / {g.cupoMaximo}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              g.cupoDisponible === 0
                                ? 'bg-red-100 text-red-800'
                                : g.cupoDisponible <= 3
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {g.cupoDisponible} libres ({porcentajeOcupacion}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {g.cupoDisponible === 0 ? (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                            LLENO
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            ABIERTO
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FORMULARIO CREAR ASIGNATURA (RF-05) */}
      {activeTab === 'nueva_materia' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Registro de Nueva Asignatura (RF-05)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingreso al plan de estudios institucional con validación de código único y créditos.
            </p>
          </div>

          <form onSubmit={handleCreateSubjectSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código de Asignatura *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. IS-401"
                  value={asigCodigo}
                  onChange={(e) => setAsigCodigo(e.target.value.toUpperCase())}
                  className="w-full font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Créditos Académicos *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={asigCreditos}
                  onChange={(e) => setAsigCreditos(e.target.value)}
                  className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Oficial de la Materia *</label>
              <input
                type="text"
                required
                placeholder="ej. Computación en la Nube y DevOps"
                value={asigNombre}
                onChange={(e) => setAsigNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Semestre / Nivel Curricular</label>
                <select
                  value={asigSemestre}
                  onChange={(e) => setAsigSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem}>
                      Semestre {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prerrequisitos (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. IS-301, IS-302"
                  value={asigPrerreqs}
                  onChange={(e) => setAsigPrerreqs(e.target.value)}
                  className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingAsig}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {savingAsig ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Registrar Asignatura en Currículo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: FORMULARIO APERTURA DE GRUPOS (RF-06) */}
      {activeTab === 'nuevo_grupo' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <span>Apertura de Nuevo Grupo Académico (RF-06)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Habilita un curso para matrícula fijando docente titular, cupo máximo y horario semanal.
            </p>
          </div>

          <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Asignatura a Ofertar *</label>
              <select
                required
                value={grupoAsignaturaId}
                onChange={(e) => setGrupoAsignaturaId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
              >
                {asignaturas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} - {a.nombre} ({a.creditos} Créditos · Semestre {a.semestreNivel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Docente Asignado *</label>
              <select
                required
                value={grupoDocenteId}
                onChange={(e) => setGrupoDocenteId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
              >
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombres} {d.apellidos} ({d.tituloAcademico})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Identificador del Grupo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. G1, G2, G3"
                  value={grupoNumero}
                  onChange={(e) => setGrupoNumero(e.target.value.toUpperCase())}
                  className="w-full font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cupo Máximo Inicial *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={grupoCupoMax}
                  onChange={(e) => setGrupoCupoMax(e.target.value)}
                  className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Selector de Días y Franjas Horarias Normalizadas (RF-06) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Días de Clase *</label>
                <select
                  value={grupoDiasPreset}
                  onChange={(e) => setGrupoDiasPreset(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="Lunes y Miércoles">Lunes y Miércoles</option>
                  <option value="Martes y Jueves">Martes y Jueves</option>
                  <option value="Viernes">Viernes (Intensivo)</option>
                  <option value="Sábado">Sábado (Sabatino)</option>
                  <option value="Lunes a Viernes">Lunes a Viernes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Franja Horaria Académica *</label>
                <select
                  value={grupoFranjaId}
                  onChange={(e) => setGrupoFranjaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                >
                  {FRANJAS_HORARIAS_PREDEFINIDAS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vista Previa del Horario Resultante */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-500">Horario resultante:</span>
              <strong className="font-mono text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {computedHorario}
              </strong>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Aula Física o Espacio Asignado *</label>
              <select
                value={grupoAula}
                onChange={(e) => setGrupoAula(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="Edificio Central - Aula B-204">Edificio Central - Aula B-204 (Capacidad: 30)</option>
                <option value="Laboratorio de Cómputo 3">Laboratorio de Cómputo 3 (Capacidad: 25)</option>
                <option value="Laboratorio Especializado de Redes">Laboratorio Especializado de Redes (Capacidad: 25)</option>
                <option value="Edificio Central - Aula C-102">Edificio Central - Aula C-102 (Capacidad: 35)</option>
                <option value="Sala Virtual Sincrónica (Meet)">Sala Virtual Sincrónica (Meet / Online)</option>
              </select>
            </div>

            {/* Check de Cruce en Tiempo Real para Docente y Aula (RF-06 / RNF-07) */}
            <div className="pt-1">
              {liveConflictCheck.hasConflict ? (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>¡Alerta de Cruce de Horario Detectado en el Servidor!</span>
                  </div>
                  {liveConflictCheck.docenteConflict && (
                    <p className="text-[11px] text-red-800 pl-6">
                      • <strong>Docente ocupado:</strong> {liveConflictCheck.docenteConflict.reason}
                    </p>
                  )}
                  {liveConflictCheck.aulaConflict && (
                    <p className="text-[11px] text-red-800 pl-6">
                      • <strong>Aula no disponible:</strong> {liveConflictCheck.aulaConflict.reason}
                    </p>
                  )}
                  <p className="text-[10px] text-red-600 pl-6 font-semibold pt-1">
                    Cambie la franja horaria, el día, el aula o asigne a otro docente para evitar la colisión.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Disponibilidad Validada:</strong> El docente y el aula están 100% libres en esta franja horaria.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingGrupo || liveConflictCheck.hasConflict}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingGrupo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aperturando Grupo en Servidor...</span>
                  </>
                ) : liveConflictCheck.hasConflict ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Corregir Cruce de Horario para Continuar</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Abrir Grupo Académico para Matrícula</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: FRANJAS HORARIAS & MATRIZ MAESTRA DE CRUCES (RF-06) */}
      {activeTab === 'horarios' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Header con botón de Auditoría Global */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Matriz Maestra de Franjas Horarias &amp; Cruces (RF-06)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supervisión de la oferta académica institucional, detección algorítmica de traslapes y balance de aulas.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRunGlobalAudit}
                disabled={runningAudit}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {runningAudit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditando {grupos.length} grupos...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Ejecutar Check de Cruces Global</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultado de Auditoría Global */}
          {globalAuditReport && (
            <div
              className={`p-4 rounded-xl border text-xs animate-fadeIn ${
                globalAuditReport.isClean
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  {globalAuditReport.isClean ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm">
                    {globalAuditReport.isClean
                      ? '¡Auditoría de Horarios Exitosa! (100% Sin Cruces)'
                      : '¡Atención: Se detectaron colisiones de horario!'}
                  </h4>
                </div>
                <button
                  onClick={() => setGlobalAuditReport(null)}
                  className="text-[11px] underline font-bold"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Grupos Evaluados:</span>
                  <strong className="block font-mono text-sm">{globalAuditReport.totalGruposAuditados}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Cruces entre Docentes:</span>
                  <strong className={`block font-mono text-sm ${globalAuditReport.teacherCollisions.length === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {globalAuditReport.teacherCollisions.length}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Cruces en Aulas Físicas:</span>
                  <strong className={`block font-mono text-sm ${globalAuditReport.roomCollisions.length === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {globalAuditReport.roomCollisions.length}
                  </strong>
                </div>
              </div>

              {globalAuditReport.teacherCollisions.length > 0 && (
                <div className="mt-3 p-2 bg-red-100 rounded-lg text-red-950 text-[11px]">
                  <strong>Detalle de colisiones de docentes:</strong>
                  {globalAuditReport.teacherCollisions.map((tc, idx) => (
                    <div key={idx} className="mt-1 font-mono text-[10px]">
                      • {tc.docenteNombre}: {tc.detalle}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filtros de la Matriz */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-700">Filtrar Matriz:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={scheduleFilterDocente}
                onChange={(e) => setScheduleFilterDocente(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="TODOS">Todos los Docentes ({docentes.length})</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombres} {d.apellidos}
                  </option>
                ))}
              </select>

              <select
                value={scheduleFilterTurno}
                onChange={(e) => setScheduleFilterTurno(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="TODOS">Todos los Turnos</option>
                <option value="MAÑANA">Mañana (07:00 - 12:00)</option>
                <option value="TARDE">Tarde (12:00 - 18:00)</option>
                <option value="NOCHE">Noche (18:00 - 22:00)</option>
              </select>
            </div>
          </div>

          {/* Matriz Timetable Maestra de la Institución */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3 w-32 border-r border-slate-200 text-center uppercase tracking-wider text-[11px]">
                    Franja Horaria
                  </th>
                  {DIAS_SEMANA.map((dia) => (
                    <th key={dia} className="py-3 px-2 border-r last:border-r-0 border-slate-200 text-center uppercase tracking-wider text-[11px]">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {FRANJAS_HORARIAS_PREDEFINIDAS
                  .filter((franja) => scheduleFilterTurno === 'TODOS' || franja.turno === scheduleFilterTurno)
                  .map((franja) => (
                    <tr key={franja.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Franja */}
                      <td className="py-3 px-2.5 font-mono font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200 text-center text-[11px] whitespace-nowrap">
                        <div>{franja.horaInicio} - {franja.horaFin}</div>
                        <span className="text-[9px] font-sans font-normal text-slate-400 block mt-0.5">
                          {franja.turno}
                        </span>
                      </td>

                      {/* Días */}
                      {DIAS_SEMANA.map((dia) => {
                        const matches = grupos.filter((g) => {
                          if (scheduleFilterDocente !== 'TODOS' && g.docenteId !== scheduleFilterDocente) {
                            return false;
                          }
                          const intervals = parseSchedule(g.diasHorario);
                          return intervals.some(
                            (intv) =>
                              intv.dia === dia &&
                              intv.startMin < franja.endMin &&
                              franja.startMin < intv.endMin
                          );
                        });

                        const hasClass = matches.length > 0;
                        const hasCollision = matches.length > 1;

                        return (
                          <td
                            key={dia}
                            className={`p-2 border-r last:border-r-0 border-slate-200 min-w-[150px] align-top ${
                              hasClass ? (hasCollision ? 'bg-amber-50/70' : 'bg-slate-50/30') : ''
                            }`}
                          >
                            {matches.map((g) => (
                              <div
                                key={g.id}
                                className={`p-2 rounded-lg border text-xs shadow-2xs mb-1.5 last:mb-0 transition-all ${
                                  hasCollision
                                    ? 'bg-amber-100 border-amber-300 text-amber-950'
                                    : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded">
                                    {g.asignaturaCodigo} · {g.numeroGrupo}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {g.cupoDisponible}/{g.cupoMaximo} cupos
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 text-[11px] mt-1 leading-tight line-clamp-2">
                                  {g.asignaturaNombre}
                                </h5>
                                <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-600 space-y-0.5">
                                  <div className="truncate font-medium text-slate-800">{g.docenteNombre}</div>
                                  <div className="truncate text-slate-500 font-mono text-[9px]">{g.aulaOEnlace}</div>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Garantía de Integridad Temporal (RF-06 / RNF-07):</strong> El SGA previene a nivel de base de datos y controlador de servicios que se registren aperturas simultáneas del mismo docente o aula física. El botón de auditoría global ejecuta una inspección algorítmica $O(N^2)$ garantizando la consistencia institucional.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
