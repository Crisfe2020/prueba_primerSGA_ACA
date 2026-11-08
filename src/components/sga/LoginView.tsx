/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Building2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { authService, SessionUser } from '../../services/apiService';

interface LoginViewProps {
  onLoginSuccess: (session: SessionUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickLogin = async (roleName: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.login(roleName);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.error || 'Error de autenticación.');
      }
    } catch {
      setErrorMessage('Error al conectar con el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor ingrese su correo institucional.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.login(email.trim());
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas.');
      }
    } catch {
      setErrorMessage('Error en el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg mb-4 ring-4 ring-indigo-500/20">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          SGA · Campus Digital
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sistema de Gestión Académica Institucional
        </p>
        <div className="mt-1 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Servicios en Línea · Periodo 2026-1 Activo</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80 space-y-6">
          {/* Quick Access Roles Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Acceso Rápido por Rol (Demostración)</span>
              </span>
              <span className="text-[11px] text-slate-400">1-Click Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Estudiante */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('ESTUDIANTE')}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-750 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">Estudiante</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1 rounded">Sem 5</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">Sofía Morales</p>
                  <p className="text-[10px] text-slate-400">Matrículas y Calificaciones</p>
                </div>
              </button>

              {/* Docente */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('DOCENTE')}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-750 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-700 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">Docente</span>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-400 px-1 rounded">Titular</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">Dr. Carlos Mendivelso</p>
                  <p className="text-[10px] text-slate-400">Planilla y Registro de Notas</p>
                </div>
              </button>

              {/* Coordinador */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('COORDINADOR_ACADEMICO')}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-750 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">Coordinador</span>
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-1 rounded">Gestión</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">Ing. Andrés Valenzuela</p>
                  <p className="text-[10px] text-slate-400">Cursos, Grupos y Cupos</p>
                </div>
              </button>

              {/* Administrador */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('ADMINISTRADOR')}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-750 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-700 text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">Administrador</span>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-400 px-1 rounded">Root</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">Mg. Elena Rojas</p>
                  <p className="text-[10px] text-slate-400">Seguridad, Usuarios y Logs</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-semibold tracking-wider">
                O ingresa con credenciales
              </span>
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Institucional
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. sofia.morales@cun.edu.co"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando en Servidor...</span>
              ) : (
                <>
                  <span>Iniciar Sesión en el SGA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso protegido por RBAC (RF-02) &amp; Auditoría inmutable (RF-12)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
