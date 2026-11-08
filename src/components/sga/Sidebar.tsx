/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente Sidebar con Renderizado Condicional Estricto por Rol (RBAC - RF-02, RNF-01, RNF-11)
 * Garantiza que cada rol solo visualice en el DOM las opciones para las que está explícitamente autorizado.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Award,
  PlusCircle,
  Calendar,
  Users,
  FileCode,
  Lock,
} from 'lucide-react';
import { SessionUser } from '../../services/apiService';

interface SidebarProps {
  session: SessionUser;
  onOpenLayerInspector: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ session, onOpenLayerInspector }) => {
  const role = session.usuario.rolNombre;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        {/* Header de Rol Activo */}
        <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Menú Autorizado (RBAC)
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>{role}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
            RF-02
          </span>
        </div>

        {/* NAVEGACIÓN ESTRICTAMENTE CONDICIONAL */}
        <nav className="space-y-1 text-xs font-semibold">
          {/* ========================================================= */}
          {/* 1. MÓDULOS EXCLUSIVOS DE ESTUDIANTE                       */}
          {/* ========================================================= */}
          {role === 'ESTUDIANTE' && (
            <>
              <NavLink
                to="/estudiante"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <GraduationCap className="w-4 h-4" />
                <span>Resumen del Periodo</span>
              </NavLink>

              <NavLink
                to="/estudiante/calificaciones"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Award className="w-4 h-4" />
                <span>Mis Calificaciones (RF-09)</span>
              </NavLink>

              <NavLink
                to="/estudiante/matricula"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inscripción de Materias (RF-07)</span>
              </NavLink>

              <NavLink
                to="/estudiante/horario"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                <span>Horario Semanal</span>
              </NavLink>
            </>
          )}

          {/* ========================================================= */}
          {/* 2. MÓDULOS EXCLUSIVOS DE DOCENTE                          */}
          {/* ========================================================= */}
          {role === 'DOCENTE' && (
            <>
              <NavLink
                to="/docente"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                <span>Mis Grupos Asignados</span>
              </NavLink>

              <NavLink
                to="/docente/notas"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Award className="w-4 h-4" />
                <span>Planilla de Calificaciones (RF-08)</span>
              </NavLink>
            </>
          )}

          {/* ========================================================= */}
          {/* 3. MÓDULOS DE COORDINACIÓN ACADÉMICA                      */}
          {/* ========================================================= */}
          {role === 'COORDINADOR_ACADEMICO' && (
            <>
              <NavLink
                to="/admin/oferta"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Building2 className="w-4 h-4" />
                <span>Oferta y Monitoreo de Cupos</span>
              </NavLink>

              <NavLink
                to="/admin/asignaturas"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                <span>Crear Asignatura (RF-05)</span>
              </NavLink>

              <NavLink
                to="/admin/grupos"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                <span>Apertura de Grupos (RF-06)</span>
              </NavLink>

              <NavLink
                to="/admin/auditoria"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Auditoría del Sistema (RF-12)</span>
              </NavLink>
            </>
          )}

          {/* ========================================================= */}
          {/* 4. MÓDULOS DE ADMINISTRACIÓN GENERAL DEL SISTEMA          */}
          {/* ========================================================= */}
          {role === 'ADMINISTRADOR' && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>Gestión de Usuarios (RF-03/04)</span>
              </NavLink>

              <NavLink
                to="/admin/oferta"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Building2 className="w-4 h-4" />
                <span>Gestión Curricular y Grupos</span>
              </NavLink>

              <NavLink
                to="/admin/auditoria"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Bitácora de Auditoría (RF-12)</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Bloque Explicativo de Seguridad RBAC */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-slate-600 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Aislamiento de Privilegios
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            El componente <code>ProtectedRoute</code> intercepta el enrutamiento. Si un estudiante escribe directamente <code>/docente/notas</code> o <code>/admin/usuarios</code>, el sistema bloquea la renderización emitiendo <strong>HTTP 403 Forbidden</strong>.
          </p>
          <button
            onClick={onOpenLayerInspector}
            className="w-full py-2 px-3 bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ver Arquitectura en Capas</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
