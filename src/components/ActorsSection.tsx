/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ACTORES_SISTEMA, Actor, REQUERIMIENTOS_FUNCIONALES } from '../data/sgaArchitectureData';
import { ShieldAlert, GraduationCap, BookOpenCheck, UserCheck, KeyRound, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

export const ActorsSection: React.FC = () => {
  const [selectedActorId, setSelectedActorId] = useState<string>('ACT-01');

  const selectedActor: Actor = ACTORES_SISTEMA.find((a) => a.id === selectedActorId) || ACTORES_SISTEMA[0];

  const getActorIcon = (id: string) => {
    switch (id) {
      case 'ACT-01':
        return <ShieldAlert className="w-5 h-5 text-indigo-700" />;
      case 'ACT-02':
        return <GraduationCap className="w-5 h-5 text-amber-700" />;
      case 'ACT-03':
        return <BookOpenCheck className="w-5 h-5 text-emerald-700" />;
      case 'ACT-04':
        return <UserCheck className="w-5 h-5 text-sky-700" />;
      default:
        return <Layers className="w-5 h-5 text-slate-700" />;
    }
  };

  // Matriz RACI para los 4 actores y los 12 RF
  // R: Responsable (Quien ejecuta la tarea)
  // A: Aprobador / Accountable (Quien responde por el resultado)
  // C: Consultado (Aporta información bidireccional)
  // I: Informado (Recibe notificación o consulta pasiva)
  const raciData: Record<string, { admin: string; coord: string; doc: string; est: string }> = {
    'RF-01': { admin: 'A', coord: 'R', doc: 'R', est: 'R' }, // Autenticación
    'RF-02': { admin: 'R/A', coord: 'I', doc: 'I', est: 'I' }, // Roles y permisos
    'RF-03': { admin: 'R/A', coord: 'C', doc: 'I', est: 'C' }, // Gestión de estudiantes
    'RF-04': { admin: 'R/A', coord: 'C', doc: 'C', est: '-' }, // Gestión de docentes
    'RF-05': { admin: 'I', coord: 'R/A', doc: 'C', est: 'I' }, // Programas y asignaturas
    'RF-06': { admin: 'I', coord: 'R/A', doc: 'C', est: 'I' }, // Grupos y periodos
    'RF-07': { admin: 'I', coord: 'A', doc: 'I', est: 'R' }, // Matrícula académica
    'RF-08': { admin: 'I', coord: 'A', doc: 'R', est: 'I' }, // Registro de calificaciones
    'RF-09': { admin: '-', coord: 'I', doc: 'I', est: 'R' }, // Consulta de resultados
    'RF-10': { admin: 'R', coord: 'R/A', doc: 'R', est: '-' }, // Reportes
    'RF-11': { admin: 'R', coord: 'R', doc: 'R', est: 'R' }, // Búsqueda y filtros
    'RF-12': { admin: 'R/A', coord: 'I', doc: 'I', est: '-' }, // Auditoría
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.1.1</span>
          <span aria-hidden="true">·</span>
          <span>Arquitectura de Seguridad &amp; Modelo de Dominio</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Catálogo Formal de Actores del Sistema (SGA)
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Definición rigurosa de los cuatro (4) roles humanos primarios del Sistema de Gestión Académica. Cada actor
          encapsula un perfil de acceso regido por el principio de mínimo privilegio (RBAC, RF-02 y RNF-11), con
          delimitación estricta de responsabilidades operativas y auditoría forense (RF-12).
        </p>
      </div>

      {/* Grid of 4 Actors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTORES_SISTEMA.map((actor) => {
          const isSelected = actor.id === selectedActorId;
          return (
            <button
              key={actor.id}
              onClick={() => setSelectedActorId(actor.id)}
              className={`text-left p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    {getActorIcon(actor.id)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {actor.rolTecnico}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-400 mb-0.5">{actor.id}</div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{actor.nombre}</h3>
                
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {actor.descripcion}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">RFs Vinculados:</span>
                <span className="font-mono font-semibold text-slate-700">{actor.rfRelacionados.length} módulos</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Actor Deep-Dive Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
              {getActorIcon(selectedActor.id)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-mono font-bold text-slate-700">{selectedActor.id}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {selectedActor.rolTecnico}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-600 font-medium">{selectedActor.perfilAcceso}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedActor.nombre}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px]">Superficie de Interfaz</span>
              <span className="font-medium text-slate-800">{selectedActor.superficieInteraccion}</span>
            </div>
          </div>
        </div>

        {/* Detailed Actor Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Column 1: Responsabilidades */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Responsabilidades Operativas y Funcionales
              </h4>
            </div>
            <ul className="space-y-2.5">
              {selectedActor.responsabilidades.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="font-mono text-slate-400 font-bold shrink-0 mt-0.5">0{idx + 1}.</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">Requerimientos Funcionales Asignados:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedActor.rfRelacionados.map((rf) => (
                  <span
                    key={rf}
                    className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200/80 font-medium"
                  >
                    {rf}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Privilegios de Seguridad y RNF */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Políticas de Seguridad &amp; Control de Acceso (RBAC)
              </h4>
            </div>
            <ul className="space-y-2.5">
              {selectedActor.privilegiosSeguridad.map((priv, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="font-mono text-indigo-500 font-bold shrink-0 mt-0.5">&gt;</span>
                  <span>{priv}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">Requerimientos No Funcionales Clave:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedActor.rnfRelacionados.map((rnf) => (
                  <span
                    key={rnf}
                    className="font-mono text-xs px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded border border-indigo-200/80 font-medium"
                  >
                    {rnf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz RACI */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider uppercase mb-0.5">
              <span>Matriz de Gobernanza Institucional</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Matriz RACI: Roles vs Requerimientos Funcionales (RF-01 a RF-12)</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="inline-flex items-center gap-1"><strong className="text-slate-900">R:</strong> Responsable</span>
            <span className="inline-flex items-center gap-1"><strong className="text-slate-900">A:</strong> Aprobador</span>
            <span className="inline-flex items-center gap-1"><strong className="text-slate-900">C:</strong> Consultado</span>
            <span className="inline-flex items-center gap-1"><strong className="text-slate-900">I:</strong> Informado</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-20">Req.</th>
                <th className="py-3 px-4 min-w-[200px]">Nombre del Requerimiento</th>
                <th className="py-3 px-4 text-center font-mono w-28">Administrador</th>
                <th className="py-3 px-4 text-center font-mono w-32">Coordinador</th>
                <th className="py-3 px-4 text-center font-mono w-28">Docente</th>
                <th className="py-3 px-4 text-center font-mono w-28">Estudiante</th>
                <th className="py-3 px-4 min-w-[220px]">Propósito en Arquitectura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REQUERIMIENTOS_FUNCIONALES.map((rf) => {
                const raci = raciData[rf.id];
                return (
                  <tr key={rf.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{rf.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{rf.nombre}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${raci.admin.includes('R') || raci.admin.includes('A') ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600'}`}>
                        {raci.admin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${raci.coord.includes('R') || raci.coord.includes('A') ? 'bg-amber-100 text-amber-900' : 'text-slate-600'}`}>
                        {raci.coord}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${raci.doc.includes('R') || raci.doc.includes('A') ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'}`}>
                        {raci.doc}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${raci.est.includes('R') || raci.est.includes('A') ? 'bg-sky-100 text-sky-900' : 'text-slate-600'}`}>
                        {raci.est}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{rf.descripcion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
