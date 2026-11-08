/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  REQUERIMIENTOS_FUNCIONALES,
  REQUERIMIENTOS_NO_FUNCIONALES,
  MATRIZ_TRAZABILIDAD_RF_RNF,
} from '../data/sgaArchitectureData';
import { Check, ShieldCheck, Zap, Database, ArrowRight } from 'lucide-react';

export const TraceabilityMatrix: React.FC = () => {
  const [selectedRfId, setSelectedRfId] = useState<string>('RF-07');

  const selectedMapping =
    MATRIZ_TRAZABILIDAD_RF_RNF.find((m) => m.rf === selectedRfId) || MATRIZ_TRAZABILIDAD_RF_RNF[0];

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.1.4</span>
          <span aria-hidden="true">·</span>
          <span>Trazabilidad de Requerimientos (RNF-10)</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Matriz de Trazabilidad Bidireccional (RF vs RNF vs Casos de Uso)
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Verificación formal de que la totalidad de los doce (12) Requerimientos Funcionales y doce (12)
          Requerimientos No Funcionales se encuentran cabalmente implementados y salvaguardados por el Modelo de Casos
          de Uso del Sistema de Gestión Académica.
        </p>
      </div>

      {/* Main Traceability Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Matriz de Cobertura Funcional y No Funcional
          </span>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-semibold">
            Cobertura: 100% (12/12 RF &amp; 12/12 RNF)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-3.5 w-16">ID</th>
                <th className="py-3 px-3.5 min-w-[170px]">Requerimiento Funcional</th>
                <th className="py-3 px-3.5 min-w-[130px]">RNF Clave Mapeados</th>
                <th className="py-3 px-3.5 min-w-[130px]">Casos de Uso</th>
                <th className="py-3 px-4 min-w-[340px]">Impacto Arquitectónico y Mecanismos de Software</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MATRIZ_TRAZABILIDAD_RF_RNF.map((item) => {
                const isSelected = item.rf === selectedRfId;
                return (
                  <tr
                    key={item.rf}
                    onClick={() => setSelectedRfId(item.rf)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/40 ring-1 ring-inset ring-indigo-500/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">
                      {item.rf}
                    </td>
                    <td className="py-3.5 px-3.5 font-semibold text-slate-900">
                      {item.nombre}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.rnfClave.map((rnf) => (
                          <span
                            key={rnf}
                            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium"
                          >
                            {rnf}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.casosUso.map((uc) => (
                          <span
                            key={uc}
                            className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold border ${
                              uc === 'UC-05' || uc === 'UC-06'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {uc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                      {item.impactoArquitectura}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid of the 12 Non-Functional Requirements (RNF) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Catálogo de Requerimientos No Funcionales (RNF-01 a RNF-12)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Restricciones de calidad, disponibilidad, latencia y consistencia formalmente impuestas al SGA.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">ISO/IEC 25010</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REQUERIMIENTOS_NO_FUNCIONALES.map((rnf) => (
            <div key={rnf.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {rnf.id}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {rnf.nombre}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {rnf.descripcion}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                <strong className="text-slate-800">Métrica Objetivo:</strong> {rnf.metricaObjetivo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
