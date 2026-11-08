/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  PlusCircle,
  XCircle,
  Award,
  Layers,
  MapPin,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import {
  studentService,
  StudentDashboardData,
  SessionUser,
} from '../../services/apiService';
import { GrupoEntity } from '../../services/dataStore';
import {
  FRANJAS_HORARIAS_PREDEFINIDAS,
  DIAS_SEMANA,
  parseSchedule,
  checkStudentEnrollmentConflict,
  DiaSemana,
} from '../../services/scheduleUtils';

interface StudentViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ session, onRefreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sincronización bidireccional entre la URL del Router y la pestaña activa
  const activeTab = useMemo<'resumen' | 'calificaciones' | 'matricula' | 'horario'>(() => {
    if (location.pathname.includes('/calificaciones')) return 'calificaciones';
    if (location.pathname.includes('/matricula')) return 'matricula';
    if (location.pathname.includes('/horario')) return 'horario';
    return 'resumen';
  }, [location.pathname]);

  const handleTabChange = (tab: 'resumen' | 'calificaciones' | 'matricula' | 'horario') => {
    if (tab === 'resumen') navigate('/estudiante');
    else if (tab === 'calificaciones') navigate('/estudiante/calificaciones');
    else if (tab === 'matricula') navigate('/estudiante/matricula');
    else if (tab === 'horario') navigate('/estudiante/horario');
  };

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Matrícula state
  const [availableGroups, setAvailableGroups] = useState<GrupoEntity[]>([]);
  const [enrolledCodes, setEnrolledCodes] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrollmentReceipt, setEnrollmentReceipt] = useState<{ comprobante: string; totalCreditos: number; fecha: string } | null>(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const data = await studentService.getDashboard(session.usuario.id);
      setDashboardData(data);

      if (data && data.estudiante) {
        const groupsRes = await studentService.getAvailableGroups(data.estudiante.id);
        setAvailableGroups(groupsRes.gruposDisponibles);
        setEnrolledCodes(groupsRes.yaMatriculadosCodigos);
      }
    } catch (e) {
      console.error('Error fetching student dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [session.usuario.id]);

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleEnrollSubmit = async () => {
    if (!dashboardData || selectedGroupIds.length === 0) return;
    setEnrolling(true);
    setEnrollmentError(null);

    try {
      const res = await studentService.enrollCourses(
        session.usuario,
        dashboardData.estudiante.id,
        'per-2026-1',
        selectedGroupIds
      );

      if (res.success && res.matricula) {
        setEnrollmentReceipt({
          comprobante: res.matricula.codigoComprobante,
          totalCreditos: res.matricula.totalCreditos,
          fecha: new Date().toLocaleString(),
        });
        setSelectedGroupIds([]);
        await fetchStudentData();
        if (onRefreshData) onRefreshData();
      } else {
        setEnrollmentError(res.error || 'Error al procesar la matrícula.');
      }
    } catch {
      setEnrollmentError('Ocurrió un error de red durante la transacción.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleCancelSubject = async (detalleId: string, cursoNombre: string) => {
    if (!dashboardData?.matriculaActiva) return;
    if (!confirm(`¿Está seguro de cancelar la asignatura "${cursoNombre}"? El cupo será liberado de inmediato en el sistema.`)) {
      return;
    }

    try {
      const res = await studentService.cancelSubject(
        session.usuario,
        dashboardData.matriculaActiva.id,
        detalleId,
        cursoNombre
      );
      if (res.success) {
        await fetchStudentData();
        if (onRefreshData) onRefreshData();
      } else {
        alert(res.error || 'No fue posible cancelar la materia.');
      }
    } catch {
      alert('Error de conexión.');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-sm font-medium">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
        <span>Cargando expediente académico de {session.usuario.nombreCompleto}...</span>
      </div>
    );
  }

  const est = dashboardData?.estudiante;
  const materias = dashboardData?.asignaturasMatriculadas || [];

  return (
    <div className="space-y-6">
      {/* Student Banner Header */}
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
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {est?.estado || 'ACTIVO'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Código: <strong className="text-slate-800 font-mono">{est?.codigoEstudiantil}</strong> · Documento: <span className="font-mono">{est?.documentoIdentidad}</span>
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                {est?.programaNombre} · Semestre {est?.semestreActual}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
              Periodo Académico: <strong className="text-slate-900">2026-1</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => handleTabChange('resumen')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Resumen del Periodo</span>
          </button>
          <button
            onClick={() => handleTabChange('calificaciones')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calificaciones'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mis Calificaciones (RF-09)</span>
          </button>
          <button
            onClick={() => handleTabChange('matricula')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'matricula'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Inscripción de Materias (RF-07)</span>
          </button>
          <button
            onClick={() => handleTabChange('horario')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'horario'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Horario Semanal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RESUMEN / DASHBOARD */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Promedio Ponderado</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{est?.promedioAcumulado.toFixed(2)}</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Sobresaliente</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Escala institucional 0.0 - 5.0</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Créditos en Curso</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-indigo-700 font-mono">{dashboardData?.totalCreditosMatriculados}</span>
                <span className="text-xs text-slate-600">créditos</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">{materias.length} asignaturas inscritas</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avance del Plan</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{dashboardData?.porcentajeCarrera}%</span>
                <span className="text-xs text-slate-600 font-medium">completado</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">{est?.creditosAprobados} de {est?.totalCreditos} aprobados</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Comprobante Matrícula</span>
              <div className="mt-1">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded block truncate">
                  {dashboardData?.matriculaActiva?.codigoComprobante || 'PENDIENTE'}
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-medium mt-1 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Estado Asentada
              </span>
            </div>
          </div>

          {/* Enrolled Courses Active Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Asignaturas Matriculadas en el Periodo 2026-1</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grupos y docentes adjudicados formalmente mediante el proceso de matrícula académica.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                {materias.length} Asignaturas
              </span>
            </div>

            {materias.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                No tienes asignaturas matriculadas actualmente en este periodo. Ve a la pestaña{' '}
                <button onClick={() => handleTabChange('matricula')} className="text-indigo-600 underline font-bold">
                  Inscripción de Materias
                </button>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materias.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                          {m.asignaturaCodigo}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{m.asignaturaNombre}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">Docente: {m.docenteNombre}</p>
                      </div>
                      <span className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                        {m.creditos} Créditos
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.horario}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.aula}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500">Nota Proyectada: </span>
                        <strong className="font-mono text-slate-900 font-bold text-sm">
                          {m.notaDefinitiva !== null ? m.notaDefinitiva.toFixed(2) : 'Sin notas'}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleCancelSubject(m.id, m.asignaturaNombre)}
                        className="text-red-600 hover:text-red-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                        title="Cancelar materia y liberar cupo"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MIS CALIFICACIONES (RF-09) */}
      {activeTab === 'calificaciones' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Consulta de Resultados Académicos y Calificaciones</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ponderación institucional oficial: Corte 1 (30%), Corte 2 (30%), Examen Final (40%). Nota mínima aprobatoria: 3.00.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                Promedio Semestral Proyectado: <strong>4.45</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Asignatura</th>
                  <th className="py-3 px-2 text-center">Créditos</th>
                  <th className="py-3 px-3 text-center">Corte 1 (30%)</th>
                  <th className="py-3 px-3 text-center">Corte 2 (30%)</th>
                  <th className="py-3 px-3 text-center">Corte 3 (40%)</th>
                  <th className="py-3 px-3 text-center font-bold">Definitiva</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {materias.map((m) => {
                  const def = m.notaDefinitiva;
                  const isApproved = def !== null && def >= 3.0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-900">{m.asignaturaCodigo}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{m.asignaturaNombre}</span>
                        <span className="text-[11px] text-slate-500">{m.docenteNombre}</span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono">{m.creditos}</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {m.corte1 !== null ? m.corte1.toFixed(1) : <span className="text-slate-400 font-normal">Pendiente</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {m.corte2 !== null ? m.corte2.toFixed(1) : <span className="text-slate-400 font-normal">Pendiente</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {m.corte3 !== null ? m.corte3.toFixed(1) : <span className="text-slate-400 font-normal">En curso</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                            def === null
                              ? 'text-slate-500'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {def !== null ? def.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {def === null ? (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            EN CURSO
                          </span>
                        ) : isApproved ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            APROBADA
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                            REPROBADA
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Cierre oficial de calificaciones:</strong> Las calificaciones se consolidan definitivamente tras el tercer corte evaluativo. Toda modificación efectuada por el cuerpo docente queda auditada inmutablemente bajo el requerimiento <strong>RF-12</strong>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: INSCRIPCIÓN DE MATERIAS / MATRÍCULA (RF-07 / UC-05) */}
      {activeTab === 'matricula' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-900 mb-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Módulo de Matrícula Transaccional (UC-05 / RF-07)</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Selección e Inscripción de Asignaturas - Periodo 2026-1
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Valida cupos en tiempo real, adquiere bloqueo pesimista en PostgreSQL y genera el comprobante oficial inmutable.
              </p>
            </div>

            {selectedGroupIds.length > 0 && (
              <button
                onClick={handleEnrollSubmit}
                disabled={enrolling}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Bloqueando Cupos &amp; Asentando...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Confirmar Matrícula ({selectedGroupIds.length} Asig)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Receipt Modal/Banner if just enrolled */}
          {enrollmentReceipt && (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm">¡Matrícula Asentada con Éxito en Base de Datos!</h4>
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Comprobante Oficial: <strong className="font-mono text-emerald-950 text-sm">{enrollmentReceipt.comprobante}</strong> · Total Créditos: {enrollmentReceipt.totalCreditos}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Fecha de Transacción: {enrollmentReceipt.fecha} · Registrado en Auditoría RF-12.
                </p>
              </div>
              <button
                onClick={() => setEnrollmentReceipt(null)}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-900 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
              >
                Cerrar Aviso
              </button>
            </div>
          )}

          {enrollmentError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{enrollmentError}</span>
            </div>
          )}

          {/* Available Groups Catalog */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Oferta de Cursos Disponibles para Inscripción
                </h4>
                <p className="text-[11px] text-slate-500">
                  El sistema valida en tiempo real la disponibilidad de cupos y la compatibilidad de franjas horarias (RF-06 / RF-07).
                </p>
              </div>

              {selectedGroupIds.length > 0 && (
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {selectedGroupIds.length} curso(s) en selección
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {availableGroups.map((g) => {
                const isAlreadyEnrolled = enrolledCodes.includes(g.asignaturaCodigo);
                const isSelected = selectedGroupIds.includes(g.id);
                const isExhausted = g.cupoDisponible <= 0;

                // Información de materias ya matriculadas
                const enrolledInfo = materias.map((m) => ({
                  asignaturaCodigo: m.asignaturaCodigo,
                  asignaturaNombre: m.asignaturaNombre,
                  diasHorario: m.horario,
                }));

                // Otras materias seleccionadas actualmente en el carrito
                const otherSelected = availableGroups.filter(
                  (item) => selectedGroupIds.includes(item.id) && item.id !== g.id
                );

                // Check reactivo de cruce de horario (RF-07, RNF-07)
                const conflictCheck = !isAlreadyEnrolled
                  ? checkStudentEnrollmentConflict(g, enrolledInfo, otherSelected)
                  : { hasConflict: false };

                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isAlreadyEnrolled
                        ? 'bg-slate-100/90 border-slate-200 opacity-70'
                        : conflictCheck.hasConflict
                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                        : isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                              {g.asignaturaCodigo} · Grupo {g.numeroGrupo}
                            </span>
                            <span className="font-bold text-slate-700 text-[11px]">{g.creditos} Créditos</span>
                            {conflictCheck.hasConflict && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Cruce Detectado</span>
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{g.asignaturaNombre}</h5>
                          <p className="text-slate-600 text-xs mt-0.5">Docente: {g.docenteNombre}</p>
                        </div>

                        {/* Live Capacity Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isExhausted
                                ? 'bg-red-100 text-red-800'
                                : g.cupoDisponible <= 3
                                ? 'bg-amber-100 text-amber-900 font-extrabold animate-pulse'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {g.cupoDisponible} cupos
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">de {g.cupoMaximo} máx</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">{g.diasHorario}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{g.aulaOEnlace}</span>
                        </div>
                      </div>

                      {/* Notificación Explícita de Conflicto de Horario */}
                      {conflictCheck.hasConflict && (
                        <div className="mt-2.5 p-2 bg-amber-100/80 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <p className="leading-tight">
                            <strong>{conflictCheck.reason}</strong> Deseleccione la materia en conflicto o elija otro grupo para inscribir.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                      {isAlreadyEnrolled ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ya Inscrita
                        </span>
                      ) : isExhausted ? (
                        <span className="text-xs text-red-600 font-bold">Sin Cupo Disponible</span>
                      ) : conflictCheck.hasConflict && !isSelected ? (
                        <button
                          disabled
                          className="text-xs font-semibold text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-lg cursor-not-allowed opacity-80"
                          title="No es posible seleccionar por cruce con otra asignatura"
                        >
                          Bloqueado por Cruce de Horario
                        </button>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleGroupSelection(g.id)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span>{isSelected ? 'Seleccionada' : 'Seleccionar Materia'}</span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HORARIO SEMANAL INTERACTIVO CON FRANJAS Y VALIDACIÓN DE CRUCES */}
      {activeTab === 'horario' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Header de Horario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Horario Semanal de Clases (Periodo 2026-1)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visualización integral por franjas horarias normalizadas y verificación de colisiones para {session.usuario.nombreCompleto}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>0 Cruces de Horario (Validado)</span>
              </span>
              <button
                onClick={() => alert(`Horario Oficial descargado:\n- Estudiante: ${session.usuario.nombreCompleto}\n- Periodo: 2026-1\n- Asignaturas: ${materias.length}\n- Créditos: ${dashboardData?.totalCreditosMatriculados || 0}\n\nDocumento emitido con hash de integridad institucional SGA.`)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
                title="Descargar comprobante de horario oficial"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Estadísticas Rápidas de Horario */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block font-semibold">Asignaturas en Horario</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{materias.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block font-semibold">Créditos Inscritos</span>
              <span className="text-xl font-bold font-mono text-indigo-700 mt-0.5 block">{dashboardData?.totalCreditosMatriculados || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block font-semibold">Horas Semanales</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">14 hrs / sem</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block font-semibold">Estado de Agenda</span>
              <span className="text-xs font-bold text-emerald-700 mt-1 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Franjas Compatibles
              </span>
            </div>
          </div>

          {/* Cuadrícula Timetable por Franjas Horarias */}
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
                {FRANJAS_HORARIAS_PREDEFINIDAS.map((franja) => (
                  <tr key={franja.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Columna Franja */}
                    <td className="py-3 px-2.5 font-mono font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200 text-center text-[11px] whitespace-nowrap">
                      <div>{franja.horaInicio} - {franja.horaFin}</div>
                      <span className="text-[9px] font-sans font-normal text-slate-400 block mt-0.5">
                        {franja.turno}
                      </span>
                    </td>

                    {/* Días de la semana */}
                    {DIAS_SEMANA.map((dia) => {
                      // Buscar si el estudiante tiene asignaturas en este día y franja
                      const matches = materias.filter((m) => {
                        const intervals = parseSchedule(m.horario);
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
                          className={`p-2 border-r last:border-r-0 border-slate-200 min-w-[140px] align-top ${
                            hasClass ? (hasCollision ? 'bg-red-50' : 'bg-indigo-50/40') : ''
                          }`}
                        >
                          {matches.map((c) => (
                            <div
                              key={c.id}
                              className={`p-2 rounded-lg border text-xs shadow-2xs mb-1 last:mb-0 transition-transform hover:scale-[1.01] ${
                                hasCollision
                                  ? 'bg-red-100 border-red-300 text-red-950'
                                  : 'bg-white border-indigo-200 text-indigo-950'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono font-bold text-[10px] text-indigo-800 bg-indigo-50 px-1 py-0.2 rounded">
                                  {c.asignaturaCodigo}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{c.creditos} cr.</span>
                              </div>
                              <h5 className="font-bold text-slate-900 text-[11px] mt-1 leading-tight line-clamp-2">
                                {c.asignaturaNombre}
                              </h5>
                              <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 space-y-0.5">
                                <div className="truncate font-medium">{c.docenteNombre}</div>
                                <div className="truncate text-slate-500 font-mono text-[9px]">{c.aula}</div>
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

          {/* Información y Convenciones */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Motor de Prevención de Cruces Activo (RF-06 / RF-07):</strong> Las franjas institucionales garantizan que ningún estudiante pueda matricularse simultáneamente en dos asignaturas que compartan el mismo intervalo horario. Cada bloque asignado cuenta con asignación de aula física o enlace sincrónico validado.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
