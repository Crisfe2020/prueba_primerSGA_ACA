/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CAPAS_ARQUITECTURA,
  COMPONENTES_INTERNOS,
  FLUJOS_ARQUITECTONICOS,
  CODIGO_MERMAID_COMPONENTES,
  DOCUMENTO_MARKDOWN_COMPLETO_6_2,
  CapaArquitectura,
  ComponenteInterno,
  FlujoModuloArquitectonico,
} from '../data/sgaComponentsData';
import { MermaidViewer } from './MermaidViewer';
import {
  Layers,
  Cpu,
  Database,
  Shield,
  Layout,
  Server,
  ArrowRight,
  Download,
  Copy,
  Check,
  Filter,
  Search,
  CheckCircle2,
  Lock,
  GitCommit,
  Sparkles,
} from 'lucide-react';

export const ComponentsView: React.FC = () => {
  const [subSection, setSubSection] = useState<'capas' | 'componentes' | 'flujos' | 'diagrama' | 'doc62'>('capas');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('CAPA-01');
  const [selectedComponentLayer, setSelectedComponentLayer] = useState<string>('all');
  const [componentSearch, setComponentSearch] = useState<string>('');
  const [selectedRfFlow, setSelectedRfFlow] = useState<string>('RF-07');
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  const selectedLayer = CAPAS_ARQUITECTURA.find((c) => c.id === selectedLayerId) || CAPAS_ARQUITECTURA[0];
  const activeFlow = FLUJOS_ARQUITECTONICOS.find((f) => f.rf === selectedRfFlow) || FLUJOS_ARQUITECTONICOS[0];

  const filteredComponents = COMPONENTES_INTERNOS.filter((comp) => {
    const matchesLayer = selectedComponentLayer === 'all' || comp.capa === selectedComponentLayer;
    const matchesSearch =
      comp.nombre.toLowerCase().includes(componentSearch.toLowerCase()) ||
      comp.responsabilidadPrincipal.toLowerCase().includes(componentSearch.toLowerCase()) ||
      comp.rfAtendido.some((rf) => rf.toLowerCase().includes(componentSearch.toLowerCase()));
    return matchesLayer && matchesSearch;
  });

  const getLayerIcon = (id: string) => {
    switch (id) {
      case 'CAPA-01':
        return <Layout className="w-5 h-5 text-indigo-700" />;
      case 'CAPA-02':
        return <Server className="w-5 h-5 text-sky-700" />;
      case 'CAPA-03':
        return <Cpu className="w-5 h-5 text-blue-700" />;
      case 'CAPA-04':
        return <Database className="w-5 h-5 text-emerald-700" />;
      case 'CAPA-05':
        return <Shield className="w-5 h-5 text-purple-700" />;
      default:
        return <Layers className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleCopyDoc62 = async () => {
    try {
      await navigator.clipboard.writeText(DOCUMENTO_MARKDOWN_COMPLETO_6_2);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = DOCUMENTO_MARKDOWN_COMPLETO_6_2;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    }
  };

  const handleDownloadDoc62 = () => {
    const blob = new Blob([DOCUMENTO_MARKDOWN_COMPLETO_6_2], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SGA_Seccion_6.2_Vista_Logica_y_Componentes.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.2</span>
          <span aria-hidden="true">·</span>
          <span>Arquitectura en Capas (N-Tier) &amp; Modelo Lógico</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Vista Lógica y de Componentes del SGA
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Descomposición formal de las 5 capas arquitectónicas, responsabilidades de componentes internos,
              contratos de entrada/salida (DTOs), diagramas UML y atención explícita a Autenticación, RBAC, Matrícula, Calificaciones y Auditoría.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadDoc62}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md (6.2)</span>
            </button>
            <button
              onClick={handleCopyDoc62}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all shadow-2xs ${
                copiedDoc ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copiedDoc ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Markdown 6.2</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Tabs for Section 6.2 */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setSubSection('capas')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              subSection === 'capas' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            1. Descripción de Capas
          </button>
          <button
            onClick={() => setSubSection('componentes')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              subSection === 'componentes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            2. Contratos &amp; Componentes
          </button>
          <button
            onClick={() => setSubSection('flujos')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              subSection === 'flujos' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            3. Flujos Críticos (RF-01, 02, 07, 08, 12)
          </button>
          <button
            onClick={() => setSubSection('diagrama')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              subSection === 'diagrama' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            4. Diagrama de Componentes (Mermaid)
          </button>
          <button
            onClick={() => setSubSection('doc62')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              subSection === 'doc62' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            5. Documento Oficial Markdown
          </button>
        </div>
      </div>

      {/* SUB-SECTION 1: DESCRIPCIÓN DE CAPAS */}
      {subSection === 'capas' && (
        <div className="space-y-6">
          {/* Layer Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CAPAS_ARQUITECTURA.map((capa) => {
              const isSelected = capa.id === selectedLayerId;
              return (
                <button
                  key={capa.id}
                  onClick={() => setSelectedLayerId(capa.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="p-2 rounded-lg bg-slate-50 w-fit mb-3 border border-slate-200/80">
                      {getLayerIcon(capa.id)}
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-400 block mb-0.5">{capa.id}</span>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{capa.nombre}</h3>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium truncate">
                    {capa.tecnologias.split('/')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Card of Selected Layer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                  {getLayerIcon(selectedLayer.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono font-bold text-slate-800">{selectedLayer.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-indigo-700">{selectedLayer.tecnologias}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedLayer.nombre}</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">{selectedLayer.proposito}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Responsabilidades */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Responsabilidades Técnicas y de Diseño</span>
                </h4>
                <ul className="space-y-2">
                  {selectedLayer.responsabilidades.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                      <span className="font-mono font-bold text-slate-400 mt-0.5 shrink-0">0{idx + 1}.</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Patrones & Mecanismos */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Patrones de Diseño Implementados
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLayer.patronesDiseno.map((pat, idx) => (
                      <span key={idx} className="font-mono text-xs px-2.5 py-1 bg-white text-slate-800 rounded border border-slate-200 font-medium">
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20">
                  <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2.5">
                    Mecanismos de Calidad (RNF)
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedLayer.mecanismosCalidad.map((mec, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-indigo-600 font-bold font-mono">✓</span>
                        <span>{mec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CONTRATOS & COMPONENTES */}
      {subSection === 'componentes' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={componentSearch}
                onChange={(e) => setComponentSearch(e.target.value)}
                placeholder="Buscar componente por nombre, responsabilidad o requerimiento (ej. RF-07)..."
                className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Filtrar por Capa:</span>
              <select
                value={selectedComponentLayer}
                onChange={(e) => setSelectedComponentLayer(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">Todas las Capas</option>
                <option value="Presentación">Presentación</option>
                <option value="Controladores API">Controladores API</option>
                <option value="Lógica de Negocio">Lógica de Negocio</option>
                <option value="Acceso a Datos">Acceso a Datos</option>
                <option value="Servicios Transversales">Servicios Transversales</option>
              </select>
            </div>
          </div>

          {/* Component Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComponents.map((comp) => (
              <div key={comp.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {comp.id}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {comp.capa}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{comp.nombre}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {comp.responsabilidadPrincipal}
                  </p>

                  {/* Contratos */}
                  <div className="space-y-2 text-xs mb-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-1">
                        Contrato de Entrada (Input DTO)
                      </span>
                      {comp.contratoEntrada.map((c, i) => (
                        <div key={i} className="text-slate-600 font-mono text-[11px]">
                          <strong>{c.nombre}</strong>: {c.tipo} — <span className="font-sans text-slate-500">{c.descripcion}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-1">
                        Contrato de Salida (Output)
                      </span>
                      {comp.contratoSalida.map((c, i) => (
                        <div key={i} className="text-slate-600 font-mono text-[11px]">
                          <strong>{c.nombre}</strong>: {c.tipo} — <span className="font-sans text-slate-500">{c.descripcion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Dependencias Inyectadas:</span>
                    <span className="font-mono text-[11px] text-slate-700">{comp.dependenciasInyectadas.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {comp.rfAtendido.map((rf) => (
                      <span key={rf} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                        {rf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: FLUJOS CRÍTICOS */}
      {subSection === 'flujos' && (
        <div className="space-y-6">
          {/* RF Flow Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {FLUJOS_ARQUITECTONICOS.map((flow) => {
              const isSelected = flow.rf === selectedRfFlow;
              return (
                <button
                  key={flow.rf}
                  onClick={() => setSelectedRfFlow(flow.rf)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono mr-1.5">{flow.rf}:</span>
                  <span>{flow.titulo.split('Módulo de ')[1] || flow.titulo}</span>
                </button>
              );
            })}
          </div>

          {/* Active Flow Inspection Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {activeFlow.rf}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">Patrón: {activeFlow.patronArquitectonico}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{activeFlow.titulo}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                {activeFlow.descripcionMecanismo}
              </p>
            </div>

            {/* Step-by-Step Execution Sequence */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Secuencia de Ejecución entre Capas
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-3 px-3 w-14 text-center">Paso</th>
                      <th className="py-3 px-3.5 w-40">Capa</th>
                      <th className="py-3 px-4 w-48 font-mono">Componente</th>
                      <th className="py-3 px-4 min-w-[280px]">Acción Ejecutada</th>
                      <th className="py-3 px-3.5 w-48">Garantía RNF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeFlow.pasosEjecucion.map((p) => (
                      <tr key={p.paso} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                          {p.paso}
                        </td>
                        <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                          {p.capa}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {p.componente}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 leading-relaxed">
                          {p.accion}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-[11px] text-emerald-800 bg-emerald-50/40 rounded">
                          {p.garantiaRNF}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security and Guarantees Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Seguridad y Auditoría Forense</span>
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeFlow.seguridadYAuditoria}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30">
                <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Garantías Técnicas y Rendimiento</span>
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {activeFlow.garantiasTecnicas.map((g, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-indigo-600 font-bold font-mono">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: DIAGRAMA DE COMPONENTES */}
      {subSection === 'diagrama' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Vista de Componentes (Mermaid.js):</strong> Diagrama arquitectónico en 5 capas que ilustra el desacoplamiento de Presentación, Gateway API, Dominio, Repositorios de Persistencia y Servicios Transversales.
            </span>
            <span className="font-mono text-slate-500 font-semibold text-[11px]">N-Tier Architecture</span>
          </div>
          <MermaidViewer code={CODIGO_MERMAID_COMPONENTES} />
        </div>
      )}

      {/* SUB-SECTION 5: DOCUMENTO OFICIAL MARKDOWN */}
      {subSection === 'doc62' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-10 font-sans text-slate-800 leading-relaxed max-w-5xl mx-auto">
          <div className="border-b border-slate-200 pb-5 mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                MEMORIA TÉCNICA INSTITUCIONAL
              </span>
              <h2 className="text-xl font-bold text-slate-900">Sección 6.2: Vista Lógica y de Componentes</h2>
            </div>
            <button
              onClick={handleCopyDoc62}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedDoc ? '¡Copiado!' : 'Copiar Todo'}
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
            <pre className="whitespace-pre-wrap select-text">
              <code>{DOCUMENTO_MARKDOWN_COMPLETO_6_2}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
