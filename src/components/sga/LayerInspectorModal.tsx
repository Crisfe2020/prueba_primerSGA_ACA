/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Layers,
  Server,
  Database,
  ShieldCheck,
  CheckCircle2,
  Code2,
  ArrowRight,
  GitCommit,
  Lock,
} from 'lucide-react';

interface LayerInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayerInspectorModal: React.FC<LayerInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Arquitectura en Capas en Funcionamiento (SGA N-Tier)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demostración de la separación de responsabilidades y flujo de ejecución entre capas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* 5 Layers Visual Pipeline */}
        <div className="space-y-3 text-xs">
          {/* Capa 1 */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Capa 1: Presentación &amp; UI (Frontend Responsive)</span>
              </span>
              <span className="font-mono text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                React 19 + Tailwind v4
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed">
              Componentes visuales desacoplados según el rol del usuario (<code>StudentView</code>, <code>TeacherView</code>, <code>CoordinatorView</code>, <code>AdminView</code>, <code>AuditView</code>). Capturan eventos del usuario y gestionan estados locales sin invocar persistencia directa.
            </p>
          </div>

          {/* Capa 2 */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Capa 2: Controladores / API REST Simulada</span>
              </span>
              <span className="font-mono text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded font-bold">
                src/services/apiService.ts
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed">
              Mapea los endpoints RESTful con promesas asíncronas y simulación de latencia de red (150ms-300ms). Valida esquemas DTO y asegura que las solicitudes cumplan la especificación OpenAPI (RNF-08).
            </p>
          </div>

          {/* Capa 3 */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Capa 3: Lógica de Negocio &amp; Transacciones ACID</span>
              </span>
              <span className="font-mono text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                Reglas de Negocio SGA
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed">
              Ejecuta validación de cruces de horario, cálculo ponderado de definitivas (30% + 30% + 40%), verificación de duplicados de matrícula (RF-07) y algoritmos de bloqueo transaccional pesimista (<code>SELECT ... FOR UPDATE</code>).
            </p>
          </div>

          {/* Capa 4 */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Capa 4: Acceso a Datos (Data Layer Normalizado 3FN)</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                src/services/dataStore.ts
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed">
              Almacena las 11 entidades normalizadas de la Sección 6.4 (Usuarios, Roles, Estudiantes, Docentes, Programas, Asignaturas, Periodos, Grupos, Matrículas, Calificaciones y Auditoría) con persistencia en <code>localStorage</code>.
            </p>
          </div>

          {/* Capa 5 */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Capa 5: Servicios Transversales (Seguridad RBAC &amp; Auditoría RF-12)</span>
              </span>
              <span className="font-mono text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded font-bold">
                Append-Only Audit Trail
              </span>
            </div>
            <p className="text-slate-700 mt-1.5 leading-relaxed">
              Autenticación con hashes Argon2id, autorización por roles (RF-02) y registro asíncrono no bloqueante de deltas de auditoría en <code>sga_auditoria</code> (RF-12, RNF-10).
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 text-[11px] font-mono">
            Conforme a IEEE Std 1016-2009 &amp; ISO/IEC 42010
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Entendido, Volver a la App
          </button>
        </div>
      </div>
    </div>
  );
};
