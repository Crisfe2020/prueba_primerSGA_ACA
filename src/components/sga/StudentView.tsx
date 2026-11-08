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
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Oferta de Cursos Disponibles para Inscripción
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableGroups.map((g) => {
                const isAlreadyEnrolled = enrolledCodes.includes(g.asignaturaCodigo);
                const isSelected = selectedGroupIds.includes(g.id);
                const isExhausted = g.cupoDisponible <= 0;

                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-xl border transition-all text-xs ${
                      isAlreadyEnrolled
                        ? 'bg-slate-100 border-slate-200 opacity-60'
                        : isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                            {g.asignaturaCodigo} · Grupo {g.numeroGrupo}
                          </span>
                          <span className="font-bold text-slate-700 text-[11px]">{g.creditos} Créditos</span>
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
                        <span>{g.diasHorario}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.aulaOEnlace}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 flex items-center justify-between">
                      {isAlreadyEnrolled ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ya Inscrita
                        </span>
                      ) : isExhausted ? (
                        <span className="text-xs text-red-600 font-bold">Sin Cupo Disponible</span>
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

      {/* TAB 4: HORARIO SEMANAL */}
      {activeTab === 'horario' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Horario Semanal de Clases (Periodo 2026-1)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Programación de encuentros sincrónicos y presenciales según los grupos matriculados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia) => {
              const clasesDia = materias.filter((m) =>
                m.horario.toLowerCase().includes(dia.toLowerCase().substring(0, 3))
              );

              return (
                <div key={dia} className="border border-slate-200 rounded-xl bg-slate-50/60 p-3 min-h-[220px]">
                  <div className="pb-2 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider text-center">
                    {dia}
                  </div>
                  <div className="mt-3 space-y-2">
                    {clasesDia.length === 0 ? (
                      <span className="text-[11px] text-slate-400 block text-center mt-6">Sin clases</span>
                    ) : (
                      clasesDia.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs">
                          <span className="font-bold text-indigo-950 block text-[11px]">{c.asignaturaNombre}</span>
                          <span className="text-[10px] text-indigo-700 font-mono block mt-1">{c.horario.split(' ')[2] || c.horario}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{c.aula}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
