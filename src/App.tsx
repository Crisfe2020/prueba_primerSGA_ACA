/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActorsSection } from './components/ActorsSection';
import { UseCaseTable } from './components/UseCaseTable';
import { DetailedTemplates } from './components/DetailedTemplates';
import { MermaidViewer } from './components/MermaidViewer';
import { TraceabilityMatrix } from './components/TraceabilityMatrix';
import { MarkdownDocumentView } from './components/MarkdownDocumentView';
import { ComponentsView } from './components/ComponentsView';
import { DeploymentView } from './components/DeploymentView';
import { DataAndSequenceView } from './components/DataAndSequenceView';
import { CODIGO_MERMAID_CASOS_DE_USO, DOCUMENTO_MARKDOWN_COMPLETO } from './data/sgaArchitectureData';
import { DOCUMENTO_MARKDOWN_COMPLETO_6_2 } from './data/sgaComponentsData';
import { DOCUMENTO_MARKDOWN_COMPLETO_6_3 } from './data/sgaDeploymentData';
import { DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6 } from './data/sgaDataAndTraceData';
import {
  Users,
  TableProperties,
  FileCheck2,
  GitBranch,
  Network,
  FileText,
  Download,
  Layers,
  Component,
  Cloud,
  Database,
} from 'lucide-react';

type ArchitectureSection = 'sec_6_1' | 'sec_6_2' | 'sec_6_3' | 'sec_6_4_6_6';
type NavTab = 'actores' | 'casos_de_uso' | 'plantillas' | 'diagrama' | 'trazabilidad' | 'documento';

export default function App() {
  const [activeSection, setActiveSection] = useState<ArchitectureSection>('sec_6_4_6_6');
  const [activeTab, setActiveTab] = useState<NavTab>('actores');
  const [selectedCriticalUc, setSelectedCriticalUc] = useState<'UC-05' | 'UC-06'>('UC-05');

  const handleSelectUseCaseFromTable = (ucId: string) => {
    if (ucId === 'UC-05' || ucId === 'UC-06') {
      setSelectedCriticalUc(ucId);
      setActiveTab('plantillas');
      setActiveSection('sec_6_1');
    }
  };

  const handleDownloadActiveDoc = () => {
    let content = DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6;
    let filename = 'SGA_Secciones_6.4_6.5_6.6_Datos_Secuencia_Trazabilidad.md';

    if (activeSection === 'sec_6_3') {
      content = DOCUMENTO_MARKDOWN_COMPLETO_6_3;
      filename = 'SGA_Seccion_6.3_Modelo_Despliegue_Cloud.md';
    } else if (activeSection === 'sec_6_2') {
      content = DOCUMENTO_MARKDOWN_COMPLETO_6_2;
      filename = 'SGA_Seccion_6.2_Vista_Componentes.md';
    } else if (activeSection === 'sec_6_1') {
      content = DOCUMENTO_MARKDOWN_COMPLETO;
      filename = 'SGA_Seccion_6.1_Modelo_Casos_de_Uso.md';
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract: Exactly 3 Zones */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              SGA
            </div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('sec_6_4_6_6');
              }}
              className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-900 transition-colors"
            >
              Arquitectura SGA
            </a>
          </div>

          {/* Zone 2: Section Switcher & concise navigation links */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            {/* Macro Section Switcher */}
            <div className="inline-flex rounded-lg p-1 bg-slate-200/80 mr-2">
              <button
                onClick={() => setActiveSection('sec_6_4_6_6')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeSection === 'sec_6_4_6_6'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>6.4-6.6: Datos &amp; Trazabilidad</span>
              </button>
              <button
                onClick={() => setActiveSection('sec_6_3')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeSection === 'sec_6_3'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-sky-700" />
                <span>6.3: Despliegue Cloud</span>
              </button>
              <button
                onClick={() => setActiveSection('sec_6_2')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeSection === 'sec_6_2'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Component className="w-3.5 h-3.5 text-indigo-700" />
                <span>6.2: Componentes N-Tier</span>
              </button>
              <button
                onClick={() => setActiveSection('sec_6_1')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeSection === 'sec_6_1'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>6.1: Casos de Uso</span>
              </button>
            </div>

            {/* 6.1 Sub-links if 6.1 is active */}
            {activeSection === 'sec_6_1' && (
              <div className="flex items-center gap-1 text-slate-600">
                <button
                  onClick={() => setActiveTab('actores')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === 'actores' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Actores
                </button>
                <button
                  onClick={() => setActiveTab('casos_de_uso')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === 'casos_de_uso' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Casos de Uso
                </button>
                <button
                  onClick={() => setActiveTab('plantillas')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === 'plantillas' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  UC-05/06
                </button>
                <button
                  onClick={() => setActiveTab('diagrama')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === 'diagrama' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Mermaid 6.1
                </button>
                <button
                  onClick={() => setActiveTab('trazabilidad')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === 'trazabilidad' ? 'bg-slate-100 text-slate-950 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Trazabilidad
                </button>
              </div>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadActiveDoc}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {activeSection === 'sec_6_4_6_6'
                  ? 'Descargar 6.4-6.6 (.md)'
                  : activeSection === 'sec_6_3'
                  ? 'Descargar 6.3 (.md)'
                  : activeSection === 'sec_6_2'
                  ? 'Descargar 6.2 (.md)'
                  : 'Descargar 6.1 (.md)'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden border-t border-slate-200 px-4 py-2 bg-slate-50 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveSection('sec_6_4_6_6')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeSection === 'sec_6_4_6_6' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            6.4-6.6 (Datos &amp; Trazabilidad)
          </button>
          <button
            onClick={() => setActiveSection('sec_6_3')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeSection === 'sec_6_3' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            6.3 (Despliegue Cloud)
          </button>
          <button
            onClick={() => setActiveSection('sec_6_2')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeSection === 'sec_6_2' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            6.2 (Componentes N-Tier)
          </button>
          <button
            onClick={() => setActiveSection('sec_6_1')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeSection === 'sec_6_1' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            6.1 (Casos de Uso)
          </button>
        </div>
      </header>

      {/* Hero Strip / Contextual Breadcrumb Banner */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <span>PROYECTO SGA</span>
                <span aria-hidden="true">/</span>
                <span>ARQUITECTURA DE SOFTWARE</span>
                <span aria-hidden="true">/</span>
                <span className="text-indigo-700 font-semibold uppercase">
                  {activeSection === 'sec_6_4_6_6'
                    ? 'SECCIONES 6.4, 6.5 & 6.6: DATOS, SECUENCIA Y TRAZABILIDAD'
                    : activeSection === 'sec_6_3'
                    ? 'SECCIÓN 6.3: MODELO DE DESPLIEGUE CLOUD (N-TIER)'
                    : activeSection === 'sec_6_2'
                    ? 'SECCIÓN 6.2: VISTA DE COMPONENTES (N-TIER)'
                    : 'SECCIÓN 6.1: CASOS DE USO'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeSection === 'sec_6_4_6_6'
                  ? 'Modelo de Datos, Secuencia Transaccional y Matriz de Trazabilidad'
                  : activeSection === 'sec_6_3'
                  ? 'Modelo de Despliegue en Infraestructura Cloud'
                  : activeSection === 'sec_6_2'
                  ? 'Vista Lógica y de Componentes (Arquitectura en Capas)'
                  : 'Modelo de Casos de Uso del SGA'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {activeSection === 'sec_6_4_6_6'
                  ? 'Diccionario de 11 entidades en 3FN, flujo de secuencia ACID para matrícula académica con bloqueo pesimista de cupo (SELECT ... FOR UPDATE) y matriz de cobertura 100% de requisitos funcionales (RF) y no funcionales (RNF).'
                  : activeSection === 'sec_6_3'
                  ? 'Mapeo estricto de la Arquitectura en Capas hacia nodos físicos/cloud aislados en subredes privadas. RNF-01 (Seguridad), RNF-02 (Rendimiento 300 concurr. < 3s), RNF-03 (Disponibilidad 99.5% Multi-AZ), RNF-04 (Escalabilidad) y RNF-09 (Respaldo Off-Site).'
                  : activeSection === 'sec_6_2'
                  ? 'Descomposición formal en 5 capas: Presentación, Controladores API, Lógica de Negocio, Acceso a Datos y Servicios Transversales. Orquestación ACID para Matrícula (RF-07), Notas (RF-08), RBAC (RF-02) y Auditoría (RF-12).'
                  : 'Especificación técnica formal basada en estándares IEEE 830 / ISO 29148. Modela los 4 actores institucionales, 12 casos de uso y plantillas profundas.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[11px] font-semibold">
                  {activeSection === 'sec_6_4_6_6'
                    ? 'Entidades Normalizadas'
                    : activeSection === 'sec_6_3'
                    ? 'Topología de Red'
                    : 'Estilo Arquitectónico'}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeSection === 'sec_6_4_6_6'
                    ? '11 Tablas 3FN (PostgreSQL)'
                    : activeSection === 'sec_6_3'
                    ? 'VPC Multi-Subnet Multi-AZ'
                    : 'N-Tier / Clean Architecture'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[11px] font-semibold">
                  {activeSection === 'sec_6_4_6_6' ? 'Trazabilidad Total' : 'Continuidad &amp; SLA'}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeSection === 'sec_6_4_6_6'
                    ? '24 / 24 Requerimientos (100%)'
                    : activeSection === 'sec_6_3'
                    ? 'RPO <= 1h · RTO <= 4h (99.5%)'
                    : 'p95 <= 3.0s (300 concurr.)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeSection === 'sec_6_4_6_6' ? (
          <DataAndSequenceView />
        ) : activeSection === 'sec_6_3' ? (
          <DeploymentView />
        ) : activeSection === 'sec_6_2' ? (
          <ComponentsView />
        ) : (
          <>
            {activeTab === 'actores' && <ActorsSection />}

            {activeTab === 'casos_de_uso' && (
              <UseCaseTable onSelectUseCase={handleSelectUseCaseFromTable} />
            )}

            {activeTab === 'plantillas' && (
              <DetailedTemplates initialUcId={selectedCriticalUc} />
            )}

            {activeTab === 'diagrama' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
                    <span>Sección 6.1.4</span>
                    <span aria-hidden="true">·</span>
                    <span>Modelo Visual UML</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Diagrama de Casos de Uso del SGA (Mermaid.js)
                  </h2>
                </div>

                <MermaidViewer code={CODIGO_MERMAID_CASOS_DE_USO} />
              </div>
            )}

            {activeTab === 'trazabilidad' && <TraceabilityMatrix />}

            {activeTab === 'documento' && <MarkdownDocumentView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Sistema de Gestión Académica (SGA)</span>
            <span aria-hidden="true">·</span>
            <span>Documento de Arquitectura de Software (Secciones 6.1 a 6.6)</span>
            <span aria-hidden="true">·</span>
            <span>Versión 3.0</span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Conforme a ISO/IEC/IEEE 42010:2011 &amp; IEEE Std 1016-2009
          </div>
        </div>
      </footer>
    </div>
  );
}
