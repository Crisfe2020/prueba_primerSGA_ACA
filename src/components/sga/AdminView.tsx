/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  adminService,
  auditService,
  SessionUser,
} from '../../services/apiService';
import { UsuarioEntity } from '../../services/dataStore';

interface AdminViewProps {
  session: SessionUser;
  onRefreshData?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ session, onRefreshData }) => {
  const [usuarios, setUsuarios] = useState<UsuarioEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRol, setNewRol] = useState<'ESTUDIANTE' | 'DOCENTE' | 'COORDINADOR_ACADEMICO' | 'ADMINISTRADOR'>('ESTUDIANTE');
  const [savingUser, setSavingUser] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminService.getUsers();
      setUsuarios(list);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (targetUser: UsuarioEntity) => {
    if (targetUser.id === session.usuario.id) {
      alert('Por seguridad no puede suspender su propia cuenta de administrador activa.');
      return;
    }

    try {
      const newStatus = await adminService.toggleUserStatus(session.usuario, targetUser.id);
      setFeedback({
        type: 'success',
        message: `Estado de la cuenta ${targetUser.email} actualizado a: ${newStatus ? 'ACTIVA' : 'SUSPENDIDA'}. Evento registrado en auditoría (RF-12).`,
      });
      await loadUsers();
      if (onRefreshData) onRefreshData();
    } catch {
      setFeedback({ type: 'error', message: 'Error al cambiar estado del usuario.' });
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim() || !newEmail.trim()) return;

    setSavingUser(true);
    setFeedback(null);
    try {
      const res = await adminService.createUser(session.usuario, {
        nombreCompleto: newNombre.trim(),
        email: newEmail.trim().toLowerCase(),
        rolNombre: newRol,
      });

      if (res.success && res.usuario) {
        setFeedback({
          type: 'success',
          message: `¡Usuario ${res.usuario.nombreCompleto} (${res.usuario.rolNombre}) creado y provisionado con perfil asociado!`,
        });
        setNewNombre('');
        setNewEmail('');
        setShowCreateModal(false);
        await loadUsers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al crear usuario.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión.' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('¿Desea restaurar la base de datos a sus valores iniciales de fábrica (Seed Data)? Todas las notas y matrículas nuevas se restablecerán.')) {
      return;
    }
    await auditService.resetData(session.usuario);
    alert('Base de datos restaurada.');
    await loadUsers();
    if (onRefreshData) onRefreshData();
  };

  const filteredUsers = usuarios.filter((u) => filterRole === 'ALL' || u.rolNombre === filterRole);

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
                <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                  ADMINISTRADOR DEL SISTEMA
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Dirección de Tecnologías de la Información · Gestión de Identidad &amp; RBAC
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                Control de Usuarios (RF-02, RF-03, RF-04) &amp; Políticas de Seguridad (RNF-01)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo Usuario</span>
            </button>
            <button
              onClick={handleResetDatabase}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Restaurar base de datos a valores de prueba iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset BD</span>
            </button>
          </div>
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

      {/* Users Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Gestión de Cuentas de Usuario y Perfiles RBAC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de credenciales con Argon2id, asignación de roles y control de acceso (RF-02/03/04).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-lg p-1 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterRole === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Todos ({usuarios.length})
            </button>
            <button
              onClick={() => setFilterRole('ESTUDIANTE')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterRole === 'ESTUDIANTE' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Estudiantes
            </button>
            <button
              onClick={() => setFilterRole('DOCENTE')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterRole === 'DOCENTE' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Docentes
            </button>
            <button
              onClick={() => setFilterRole('COORDINADOR_ACADEMICO')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterRole === 'COORDINADOR_ACADEMICO' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Coordinación
            </button>
            <button
              onClick={() => setFilterRole('ADMINISTRADOR')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterRole === 'ADMINISTRADOR' ? 'bg-white text-purple-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Admins
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-3">Correo Institucional</th>
                <th className="py-3 px-3 text-center">Rol Asignado</th>
                <th className="py-3 px-3">Fecha Alta</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredUsers.map((u) => {
                let badgeRole = 'bg-slate-100 text-slate-800';
                if (u.rolNombre === 'ESTUDIANTE') badgeRole = 'bg-emerald-100 text-emerald-900 border border-emerald-200';
                if (u.rolNombre === 'DOCENTE') badgeRole = 'bg-blue-100 text-blue-900 border border-blue-200';
                if (u.rolNombre === 'COORDINADOR_ACADEMICO') badgeRole = 'bg-amber-100 text-amber-900 border border-amber-200';
                if (u.rolNombre === 'ADMINISTRADOR') badgeRole = 'bg-purple-100 text-purple-900 border border-purple-200';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.nombreCompleto}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.nombreCompleto}</span>
                          <span className="text-[10px] text-slate-400 font-mono">UUID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{u.email}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${badgeRole}`}>
                        {u.rolNombre}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.isActive ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                          SUSPENDIDO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                          u.isActive
                            ? 'text-red-700 hover:bg-red-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Suspender' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Registrar Nuevo Usuario (RBAC)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mariana Gutiérrez Silva"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Institucional *</label>
                <input
                  type="email"
                  required
                  placeholder="ej. mariana.gutierrez@cun.edu.co"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rol de Acceso (RBAC) *</label>
                <select
                  value={newRol}
                  onChange={(e) => setNewRol(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                >
                  <option value="ESTUDIANTE">ESTUDIANTE (Matrícula y Notas)</option>
                  <option value="DOCENTE">DOCENTE (Grupos y Calificaciones)</option>
                  <option value="COORDINADOR_ACADEMICO">COORDINADOR_ACADEMICO (Oferta y Currículo)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso Total y Logs)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {savingUser ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
