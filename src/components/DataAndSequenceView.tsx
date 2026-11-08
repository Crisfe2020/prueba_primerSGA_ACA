/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Database,
  GitCommit,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Server,
  Layers,
  Code,
  Key,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ENTIDADES_CONCEPTUALES,
  PASOS_SECUENCIA_MATRICULA,
  MATRIZ_TRAZABILIDAD_COMPLETA,
  CODIGO_MERMAID_ER,
  CODIGO_MERMAID_SECUENCIA,
  DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6,
  EntidadDatos,
  FilaTrazabilidadCompleta,
} from '../data/sgaDataAndTraceData';
import { MermaidViewer } from './MermaidViewer';

type SubView = 'er_model' | 'sequence_view' | 'traceability_matrix' | 'markdown_doc';

export const DataAndSequenceView: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<SubView>('er_model');
  const [selectedEntity, setSelectedEntity] = useState<EntidadDatos>(ENTIDADES_CONCEPTUALES[0]);
  const [copiedDoc, setCopiedDoc] = useState(false);
  
  // Traceability filters
  const [traceFilter, setTraceFilter] = useState<'ALL' | 'RF' | 'RNF'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTraceability = useMemo(() => {
    return MATRIZ_TRAZABILIDAD_COMPLETA.filter((item) => {
      const matchesType = traceFilter === 'ALL' || item.tipo === traceFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.componenteModulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modeloAsociado.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metodoEvidencia.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [traceFilter, searchQuery]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SGA_Secciones_6.4_6.5_6.6_Datos_Secuencia_Trazabilidad.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Entregables de Ingeniería de Datos y Trazabilidad (6.4 - 6.6)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Modelo de Datos, Secuencia Transaccional y Matriz de Trazabilidad
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Especificación formal del Modelo Conceptual de Datos (11 entidades normalizadas en 3FN), 
              flujo de secuencia ACID para Matrícula Académica con bloqueo de cupos (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">SELECT ... FOR UPDATE</code>) 
              y auditoría asíncrona, complementado con la Matriz de Trazabilidad 100% de requerimientos RF y RNF.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
              title="Copiar documento Markdown formal"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedDoc ? '¡Copiado!' : 'Copiar MD'}</span>
            </button>
            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar 6.4 - 6.6 (.md)</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={() => setActiveSubView('er_model')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubView === 'er_model'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>6.4 Modelo Conceptual (11 Entidades & ER)</span>
          </button>
          <button
            onClick={() => setActiveSubView('sequence_view')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubView === 'sequence_view'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>6.5 Vista de Secuencia (Matrícula ACID & Locking)</span>
          </button>
          <button
            onClick={() => setActiveSubView('traceability_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubView === 'traceability_matrix'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>6.6 Matriz de Trazabilidad Completa (24 Requerimientos)</span>
          </button>
          <button
            onClick={() => setActiveSubView('markdown_doc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeSubView === 'markdown_doc'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documento Formal Integrado</span>
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: MODELO CONCEPTUAL DE DATOS (6.4) */}
      {activeSubView === 'er_model' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Entidades Clave</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">11 Tablas</span>
              <span className="text-xs text-emerald-700 mt-1 block font-medium">3ª Forma Normal (3FN)</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Claves Primarias</span>
              <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">UUID v4</span>
              <span className="text-xs text-slate-600 mt-1 block font-medium">Desacoplado de secuencia</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Seguridad & Hashes</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">Argon2id</span>
              <span className="text-xs text-slate-600 mt-1 block font-medium">Cero contraseñas en plano</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Auditoría Inmutable</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">Append-Only</span>
              <span className="text-xs text-slate-600 mt-1 block font-medium">Deltas JSONB de auditoría</span>
            </div>
          </div>

          {/* Interactive Entity Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Entity Selector List */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Entidades del Sistema ({ENTIDADES_CONCEPTUALES.length})</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">PostgreSQL 16</span>
              </div>
              <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
                {ENTIDADES_CONCEPTUALES.map((ent) => {
                  const isSelected = selectedEntity.nombre === ent.nombre;
                  return (
                    <button
                      key={ent.nombre}
                      onClick={() => setSelectedEntity(ent)}
                      className={`w-full text-left p-3 rounded-lg transition-all text-xs border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ent.nombre}</span>
                        <code className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {ent.tablaSql}
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ent.descripcion}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Entity Detail Specification */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{selectedEntity.nombre}</h3>
                    <code className="text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-semibold">
                      {selectedEntity.tablaSql}
                    </code>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedEntity.descripcion}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">Clave Primaria</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">{selectedEntity.clavePrimaria}</span>
                </div>
              </div>

              {/* Attributes Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Diccionario de Atributos y Tipos de Datos</span>
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Atributo</th>
                        <th className="py-2 px-3">Tipo SQL</th>
                        <th className="py-2 px-3 text-center">Nulable</th>
                        <th className="py-2 px-3">Descripción de Negocio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {selectedEntity.atributos.map((at, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">{at.nombre}</td>
                          <td className="py-2 px-3 font-mono text-emerald-800 text-[11px]">{at.tipo}</td>
                          <td className="py-2 px-3 text-center">
                            {at.nulable ? (
                              <span className="text-[10px] text-slate-400 font-medium">NULL</span>
                            ) : (
                              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded">NOT NULL</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{at.descripcion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cardinalities and Integrity Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Relaciones y Cardinalidades</span>
                  </h5>
                  <ul className="space-y-1 text-slate-600">
                    {selectedEntity.cardinalidades.map((card, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{card}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reglas de Integridad y Restricciones</span>
                  </h5>
                  <ul className="space-y-1 text-slate-600">
                    {selectedEntity.reglasIntegridad.map((regla, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{regla}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Foreign Keys Badge List */}
              {selectedEntity.clavesForaneas.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Claves Foráneas (FK Constraints)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntity.clavesForaneas.map((fk, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-1 rounded-md"
                      >
                        {fk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Diagrama de Entidad-Relación Mermaid.js */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>Diagrama Entidad-Relación Conceptual (Mermaid.js)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Muestra la totalidad de tablas normalizadas, sus relaciones 1:1, 1:N y N:M mediante tablas intermedias, y las claves foráneas.
                </p>
              </div>
            </div>

            <MermaidViewer code={CODIGO_MERMAID_ER} />
          </div>
        </div>
      )}

      {/* SUBVIEW 2: VISTA DE SECUENCIA (6.5) */}
      {activeSubView === 'sequence_view' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="bg-indigo-950 text-white rounded-xl p-6 shadow-md border border-indigo-900">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-800/80 rounded-xl text-indigo-200 shrink-0">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
                  <span>Garantía ACID de Alta Concurrencia</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Secuencia Transaccional de Matrícula Académica (UC-05 / RF-07)
                </h2>
                <p className="text-xs text-indigo-200 mt-1 max-w-3xl leading-relaxed">
                  Para cumplir con <strong className="text-white">RNF-02</strong> (300 usuarios concurrentes en menos de 3.0s) y{' '}
                  <strong className="text-white">RNF-07</strong> (integridad estricta sin sobrecupos), la operación ejecuta un bloqueo pesimista 
                  a nivel de fila (<code className="bg-indigo-900/80 text-amber-300 px-1 py-0.5 rounded font-mono">SELECT cupo_disponible FROM sga_grupo WHERE id = :id FOR UPDATE</code>), 
                  garantizando atomicidad estricta y delegando la auditoría (<strong className="text-white">RF-12</strong>) a una cola de eventos asíncrona.
                </p>
              </div>
            </div>
          </div>

          {/* Sequence Steps Explorer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-indigo-600" />
                  <span>Pasos Técnicos de la Secuencia de Matrícula (17 Pasos ACID)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Mapeo detallado de cada invocación entre el Cliente Web, API Gateway, Controladores, Lógica de Negocio, PostgreSQL y el Servicio de Auditoría.
                </p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                17 Pasos Orquestados
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">#</th>
                    <th className="py-2.5 px-3">Origen</th>
                    <th className="py-2.5 px-3">Destino</th>
                    <th className="py-2.5 px-3">Mensaje / Operación</th>
                    <th className="py-2.5 px-3 text-center">Naturaleza</th>
                    <th className="py-2.5 px-3">Mecanismo Técnico & Protocolo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {PASOS_SECUENCIA_MATRICULA.map((step) => {
                    let badgeClass = 'bg-slate-100 text-slate-700';
                    if (step.tipo === 'sync') badgeClass = 'bg-blue-100 text-blue-800';
                    if (step.tipo === 'async') badgeClass = 'bg-purple-100 text-purple-800';
                    if (step.tipo === 'return') badgeClass = 'bg-emerald-100 text-emerald-800';
                    if (step.tipo === 'alt') badgeClass = 'bg-amber-100 text-amber-800';

                    return (
                      <tr key={step.orden} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-600">{step.orden}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{step.origen}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{step.destino}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-indigo-950 font-medium">{step.mensaje}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeClass}`}>
                            {step.tipo}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px] font-sans">{step.detalleTecnico}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagrama de Secuencia Mermaid.js */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-indigo-600" />
                  <span>Diagrama de Secuencia UML (Mermaid.js)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Render interactivo del flujo de vida de la transacción, incluyendo las ramas alternativas de validación de cupo y confirmación.
                </p>
              </div>
            </div>

            <MermaidViewer code={CODIGO_MERMAID_SECUENCIA} />
          </div>
        </div>
      )}

      {/* SUBVIEW 3: MATRIZ DE TRAZABILIDAD COMPLETA (6.6) */}
      {activeSubView === 'traceability_matrix' && (
        <div className="space-y-6">
          {/* Matrix Header & Stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Trazabilidad Bidireccional Total (100% de Cobertura)</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Matriz de Trazabilidad de Requerimientos (Sección 6.6)
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Vinculación formal entre los 12 Requerimientos Funcionales (RF-01 a RF-12), los 12 Requerimientos No Funcionales (RNF-01 a RNF-12), 
                  los componentes de software del SGA, los modelos arquitectónicos y los métodos de evidencia técnica.
                </p>
              </div>

              {/* Counts Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                  12 Funcionales (RF)
                </span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                  12 No Funcionales (RNF)
                </span>
                <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1.5 rounded-lg">
                  Total: 24 Requisitos
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
              <div className="inline-flex rounded-lg p-1 bg-slate-100 text-xs font-semibold w-full sm:w-auto">
                <button
                  onClick={() => setTraceFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    traceFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos (24)
                </button>
                <button
                  onClick={() => setTraceFilter('RF')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    traceFilter === 'RF' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Funcionales RF (12)
                </button>
                <button
                  onClick={() => setTraceFilter('RNF')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    traceFilter === 'RNF' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  No Funcionales RNF (12)
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por código, módulo, evidencia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Full Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-20 text-center">Código</th>
                    <th className="py-3 px-3 w-40">Requerimiento</th>
                    <th className="py-3 px-3 w-48">Componente / Módulo Resuelve</th>
                    <th className="py-3 px-3 w-48">Modelo del Sistema Asociado</th>
                    <th className="py-3 px-3 w-64">Método de Evidencia / Validación</th>
                    <th className="py-3 px-3 w-64">Criterio de Aceptación Formal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredTraceability.map((item) => (
                    <tr key={item.codigo} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            item.tipo === 'RF'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {item.codigo}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.nombre}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{item.componenteModulo}</td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">{item.modeloAsociado}</td>
                      <td className="py-3 px-3 text-slate-700 text-[11px]">
                        <span className="font-medium text-slate-900 block mb-0.5">{item.metodoEvidencia}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        <span className="text-emerald-900 font-medium bg-emerald-50/70 px-1.5 py-0.5 rounded">
                          {item.criterioAceptacion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTraceability.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron requerimientos que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 4: MARKDOWN DOCUMENT VIEW */}
      {activeSubView === 'markdown_doc' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>Documento Formal Integrado (Secciones 6.4, 6.5 y 6.6 en Markdown)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Texto estructurado con especificación de entidades, pasos de secuencia transaccional y matriz completa de trazabilidad listo para exportar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedDoc ? '¡Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={handleDownloadDoc}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Descargar .md</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[700px] leading-relaxed border border-slate-800">
            <pre>{DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
