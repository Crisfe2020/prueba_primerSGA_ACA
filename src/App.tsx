/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sistema de Gestión Académica (SGA)
 * Enrutamiento Principal con Control de Acceso Estricto por Roles (RBAC - RF-02, RNF-01, RNF-11)
 */

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Layers,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { authService, SessionUser } from './services/apiService';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/sga/Sidebar';
import { LoginView } from './components/sga/LoginView';
import { StudentView } from './components/sga/StudentView';
import { TeacherView } from './components/sga/TeacherView';
import { CoordinatorView } from './components/sga/CoordinatorView';
import { AdminView } from './components/sga/AdminView';
import { AuditView } from './components/sga/AuditView';
import { UnauthorizedView } from './components/sga/UnauthorizedView';
import { LayerInspectorModal } from './components/sga/LayerInspectorModal';

function AppContent() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [layerInspectorOpen, setLayerInspectorOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [systemSyncCount, setSystemSyncCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Inicializar sesión por defecto como Estudiante (Sofía Morales) para interactividad inmediata
  useEffect(() => {
    const initDefault = async () => {
      const res = await authService.login('ESTUDIANTE');
      if (res.success && res.session) {
        setSession(res.session);
      }
    };
    initDefault();
  }, []);

  const handleRoleSwitch = async (roleName: string, defaultPath: string) => {
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    const res = await authService.login(roleName);
    if (res.success && res.session) {
      setSession(res.session);
      navigate(defaultPath);
    }
  };

  const handleLogout = async () => {
    if (session) {
      await authService.logout(session.usuario);
    }
    setSession(null);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const triggerDataRefresh = () => {
    setSystemSyncCount((c) => c + 1);
  };

  // Si no está autenticado y está en /login
  if (!session && location.pathname === '/login') {
    return (
      <LoginView
        onLoginSuccess={(sess) => {
          setSession(sess);
          if (sess.usuario.rolNombre === 'ESTUDIANTE') navigate('/estudiante');
          else if (sess.usuario.rolNombre === 'DOCENTE') navigate('/docente');
          else navigate('/admin');
        }}
      />
    );
  }

  // Si aún no carga la sesión inicial
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        Iniciando contexto de seguridad SGA...
      </div>
    );
  }

  const user = session.usuario;

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* TOP BAR INSTITUCIONAL                                                     */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zona 1: Logo Institucional */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  SGA · Campus Digital
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  RBAC Activo (RF-02)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Periodo Académico 2026-1 · En Línea
              </span>
            </div>
          </div>

          {/* Zona 2: Selector Rápido de Roles para Pruebas RBAC */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-2 transition-colors"
                title="Cambiar perfil activo para probar restricción de rutas"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rol Activo: <strong className="text-indigo-950">{user.rolNombre}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scaleUp">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simular Persona y Probar RBAC
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('ESTUDIANTE', '/estudiante')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold">Estudiante</div>
                      <div className="text-[10px] text-slate-500 font-normal">Sofía Morales (Solo /estudiante/*)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('DOCENTE', '/docente')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold">Docente</div>
                      <div className="text-[10px] text-slate-500 font-normal">Dr. Carlos Mendivelso (Solo /docente/*)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('COORDINADOR_ACADEMICO', '/admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold">Coordinador Académico</div>
                      <div className="text-[10px] text-slate-500 font-normal">Ing. Andrés Valenzuela (/admin/*)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('ADMINISTRADOR', '/admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs font-bold">Administrador del Sistema</div>
                      <div className="text-[10px] text-slate-500 font-normal">Mg. Elena Rojas (Acceso Total)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setLayerInspectorOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Arquitectura en Capas</span>
            </button>
          </div>

          {/* Zona 3: Info Usuario & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 text-right">
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user.nombreCompleto}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.email}
                </span>
              </div>
              <img
                src={user.avatarUrl}
                alt={user.nombreCompleto}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 px-4 py-3 bg-white space-y-2 text-xs font-bold">
            <div className="text-slate-500 text-[11px]">
              Rol activo: <span className="font-bold text-slate-900">{user.rolNombre}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleRoleSwitch('ESTUDIANTE', '/estudiante')}
                className="p-2 bg-slate-50 rounded-lg text-left"
              >
                🎓 Estudiante
              </button>
              <button
                onClick={() => handleRoleSwitch('DOCENTE', '/docente')}
                className="p-2 bg-slate-50 rounded-lg text-left"
              >
                👨‍🏫 Docente
              </button>
              <button
                onClick={() => handleRoleSwitch('COORDINADOR_ACADEMICO', '/admin')}
                className="p-2 bg-slate-50 rounded-lg text-left"
              >
                📋 Coordinador
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMINISTRADOR', '/admin')}
                className="p-2 bg-slate-50 rounded-lg text-left"
              >
                🛡️ Administrador
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL: SIDEBAR CONDICIONAL + RUTAS PROTEGIDAS                   */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar con Renderizado Condicional Estricto por Rol */}
        <Sidebar
          session={session}
          onOpenLayerInspector={() => setLayerInspectorOpen(true)}
        />

        {/* Contenedor de Vistas Enrutadas */}
        <main className="flex-1 min-w-0">
          <Routes>
            {/* Redirección Inicial Inteligente según el Rol */}
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    user.rolNombre === 'ESTUDIANTE'
                      ? '/estudiante'
                      : user.rolNombre === 'DOCENTE'
                      ? '/docente'
                      : '/admin'
                  }
                  replace
                />
              }
            />

            {/* ================================================================= */}
            {/* 1. RUTAS PROTEGIDAS PARA ESTUDIANTE (/estudiante/*)               */}
            {/* Solo accesibles por ESTUDIANTE. Bloquea a Docentes y Admins.     */}
            {/* ================================================================= */}
            <Route
              path="/estudiante/*"
              element={
                <ProtectedRoute session={session} rolesPermitidos={['ESTUDIANTE']}>
                  <StudentView
                    key={`est-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            {/* ================================================================= */}
            {/* 2. RUTAS PROTEGIDAS PARA DOCENTE (/docente/*)                     */}
            {/* Solo accesibles por DOCENTES y personal autorizado.               */}
            {/* Si un ESTUDIANTE ingresa aquí, ProtectedRoute emite HTTP 403.     */}
            {/* ================================================================= */}
            <Route
              path="/docente/*"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['DOCENTE', 'COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <TeacherView
                    key={`doc-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            {/* ================================================================= */}
            {/* 3. RUTAS PROTEGIDAS PARA ADMINISTRACIÓN Y COORDINACIÓN            */}
            {/* ================================================================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  {user.rolNombre === 'ADMINISTRADOR' ? (
                    <AdminView
                      key={`admin-${systemSyncCount}`}
                      session={session}
                      onRefreshData={triggerDataRefresh}
                    />
                  ) : (
                    <CoordinatorView
                      key={`coord-${systemSyncCount}`}
                      session={session}
                      onRefreshData={triggerDataRefresh}
                    />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute session={session} rolesPermitidos={['ADMINISTRADOR']}>
                  <AdminView
                    key={`admin-usr-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/oferta"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <CoordinatorView
                    key={`coord-of-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/asignaturas"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <CoordinatorView
                    key={`coord-asig-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/grupos"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <CoordinatorView
                    key={`coord-grp-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/auditoria"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <AuditView
                    key={`audit-adm-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            {/* Ruta explícita para la Bitácora de Auditoría */}
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute
                  session={session}
                  rolesPermitidos={['COORDINADOR_ACADEMICO', 'ADMINISTRADOR']}
                >
                  <AuditView
                    key={`audit-${systemSyncCount}`}
                    session={session}
                    onRefreshData={triggerDataRefresh}
                  />
                </ProtectedRoute>
              }
            />

            {/* Pantalla Formal de Error 403 Forbidden */}
            <Route
              path="/unauthorized"
              element={
                <UnauthorizedView
                  rolActual={user.rolNombre}
                  rolesRequeridos={['ROL_AUTORIZADO']}
                />
              }
            />

            {/* Fallback de Rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modal Inspector de Arquitectura N-Tier */}
      <LayerInspectorModal
        isOpen={layerInspectorOpen}
        onClose={() => setLayerInspectorOpen(false)}
      />

      {/* Footer Institucional */}
      <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Sistema de Gestión Académica (SGA)</span>
            <span>·</span>
            <span>Control de Acceso Basado en Roles (RBAC)</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              RF-02 / RNF-01 / RNF-11 Cumplidos
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            ProtectedRoute Activo · Middleware restringirA() en Backend
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
