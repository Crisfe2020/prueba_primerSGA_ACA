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
} from 'lucide-react';
import {
  adminService,
  SessionUser,
} from '../../services/apiService';
import { AsignaturaEntity, GrupoEntity, DocenteEntity } from '../../services/dataStore';

interface CoordinatorViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const CoordinatorView: React.FC<CoordinatorViewProps> = ({ session, onRefreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronización con la ruta del Router
  const activeTab = useMemo<'oferta' | 'nueva_materia' | 'nuevo_grupo'>(() => {
    if (location.pathname.includes('/admin/asignaturas')) return 'nueva_materia';
    if (location.pathname.includes('/admin/grupos')) return 'nuevo_grupo';
    return 'oferta';
  }, [location.pathname]);

  const handleTabChange = (tab: 'oferta' | 'nueva_materia' | 'nuevo_grupo') => {
    setFeedback(null);
    if (tab === 'nueva_materia') navigate('/admin/asignaturas');
    else if (tab === 'nuevo_grupo') navigate('/admin/grupos');
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

  // Form State: Grupo
  const [grupoAsignaturaId, setGrupoAsignaturaId] = useState('');
  const [grupoDocenteId, setGrupoDocenteId] = useState('');
  const [grupoNumero, setGrupoNumero] = useState('G1');
  const [grupoCupoMax, setGrupoCupoMax] = useState('25');
  const [grupoHorario, setGrupoHorario] = useState('Lunes y Miércoles 18:00 - 20:00');
  const [grupoAula, setGrupoAula] = useState('Aula Virtual Sincrónica Meet');
  const [savingGrupo, setSavingGrupo] = useState(false);

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

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoAsignaturaId || !grupoDocenteId) {
      setFeedback({ type: 'error', message: 'Seleccione una asignatura y un docente válido.' });
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
        diasHorario: grupoHorario,
        aulaOEnlace: grupoAula,
      });

      if (res.success && res.grupo) {
        setFeedback({
          type: 'success',
          message: `¡Grupo ${res.grupo.numeroGrupo} de ${res.grupo.asignaturaNombre} abierto exitosamente con ${res.grupo.cupoMaximo} cupos!`,
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">Franja Horaria y Días *</label>
              <input
                type="text"
                required
                placeholder="ej. Lunes y Miércoles 18:00 - 20:00"
                value={grupoHorario}
                onChange={(e) => setGrupoHorario(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Aula Física o Enlace Sincrónico *</label>
              <input
                type="text"
                required
                placeholder="ej. Laboratorio de Cómputo 2 o Enlace Google Meet"
                value={grupoAula}
                onChange={(e) => setGrupoAula(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingGrupo}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {savingGrupo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aperturando Grupo en Servidor...</span>
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
    </div>
  );
};
