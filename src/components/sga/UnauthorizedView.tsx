/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente de Error 403 Forbidden (RBAC - RF-02, RNF-01, RNF-11)
 * Desplegado cuando un usuario intenta acceder a una ruta fuera de sus privilegios autorizados.
 */

import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnauthorizedViewProps {
  rolActual?: string;
  rolesRequeridos?: string[];
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  rolActual,
  rolesRequeridos = [],
}) => {
  const navigate = useNavigate();

  const getHomeRoute = () => {
    if (rolActual === 'ESTUDIANTE') return '/estudiante';
    if (rolActual === 'DOCENTE') return '/docente';
    if (rolActual === 'COORDINADOR_ACADEMICO' || rolActual === 'ADMINISTRADOR') return '/admin';
    return '/login';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 sm:p-8 text-center space-y-5 animate-scaleUp">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            HTTP 403 · Acceso Prohibido (RBAC)
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
            Acceso No Autorizado
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Tu perfil actual no cuenta con los privilegios de seguridad necesarios para acceder a esta vista o módulo del Sistema de Gestión Académica.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tu Rol Activo:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {rolActual || 'NO_DEFINIDO'}
            </span>
          </div>
          {rolesRequeridos.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Roles Requeridos:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                {rolesRequeridos.join(' · ')}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Control de Acceso Basado en Roles (RF-02 / RNF-01 / RNF-11)</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver Atrás</span>
          </button>
          <button
            onClick={() => navigate(getHomeRoute())}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ir a Mi Portal Seguro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
