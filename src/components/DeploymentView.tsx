/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NODOS_DESPLIEGUE,
  POLITICAS_RESPALDO_DR,
  CODIGO_MERMAID_DESPLIEGUE,
  DOCUMENTO_MARKDOWN_COMPLETO_6_3,
  NodoDespliegue,
} from '../data/sgaDeploymentData';
import { MermaidViewer } from './MermaidViewer';
import {
  Cloud,
  Server,
  Database,
  ShieldCheck,
  HardDriveDownload,
  Download,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Lock,
  Network,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Globe,
  Radio,
} from 'lucide-react';

export const DeploymentView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'nodos' | 'redes' | 'respaldos' | 'diagrama' | 'doc63'>('nodos');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('NODE-01');
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  const selectedNode = NODOS_DESPLIEGUE.find((n) => n.id === selectedNodeId) || NODOS_DESPLIEGUE[0];

  const handleCopyDoc63 = async () => {
    try {
      await navigator.clipboard.writeText(DOCUMENTO_MARKDOWN_COMPLETO_6_3);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = DOCUMENTO_MARKDOWN_COMPLETO_6_3;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    }
  };

  const handleDownloadDoc63 = () => {
    const blob = new Blob([DOCUMENTO_MARKDOWN_COMPLETO_6_3], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SGA_Seccion_6.3_Modelo_Despliegue_Cloud.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getNodeIcon = (id: string) => {
    switch (id) {
      case 'NODE-01':
        return <ShieldCheck className="w-5 h-5 text-sky-700" />;
      case 'NODE-02':
        return <Globe className="w-5 h-5 text-indigo-700" />;
      case 'NODE-03':
        return <Cpu className="w-5 h-5 text-blue-700" />;
      case 'NODE-04':
        return <Database className="w-5 h-5 text-emerald-700" />;
      case 'NODE-05':
        return <HardDriveDownload className="w-5 h-5 text-amber-700" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.3</span>
          <span aria-hidden="true">·</span>
          <span>Arquitectura Cloud &amp; Infraestructura N-Tier Aislada</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Modelo de Despliegue en Infraestructura Cloud
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Mapeo estricto de la Arquitectura en Capas hacia nodos físicos/cloud aislados en subredes privadas.
              Garantías de seguridad (RNF-01), rendimiento para 300 usuarios concurrentes &lt; 3s (RNF-02),
              disponibilidad 99.5% Multi-AZ (RNF-03), auto-escalado elástico (RNF-04) y respaldo off-site (RNF-09).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadDoc63}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md (6.3)</span>
            </button>
            <button
              onClick={handleCopyDoc63}
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
                  <span>Copiar Markdown 6.3</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Tabs for Section 6.3 */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('nodos')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'nodos' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            1. Mapeo de Nodos &amp; Capas
          </button>
          <button
            onClick={() => setActiveSubTab('redes')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'redes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            2. Topología de Red &amp; Seguridad (VPC)
          </button>
          <button
            onClick={() => setActiveSubTab('respaldos')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'respaldos' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            3. Respaldo &amp; DR (RNF-09: RPO/RTO)
          </button>
          <button
            onClick={() => setActiveSubTab('diagrama')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'diagrama' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            4. Diagrama de Despliegue (Mermaid)
          </button>
          <button
            onClick={() => setActiveSubTab('doc63')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'doc63' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            5. Documento Oficial Markdown
          </button>
        </div>
      </div>

      {/* SUB-SECTION 1: MAPEO DE NODOS & CAPAS */}
      {activeSubTab === 'nodos' && (
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {NODOS_DESPLIEGUE.map((nodo) => {
              const isSelected = nodo.id === selectedNodeId;
              return (
                <button
                  key={nodo.id}
                  onClick={() => setSelectedNodeId(nodo.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="p-2 rounded-lg bg-slate-50 w-fit mb-3 border border-slate-200/80">
                      {getNodeIcon(nodo.id)}
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-400 block mb-0.5">{nodo.id}</span>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{nodo.nombre.split(':')[0]}</h3>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium truncate">
                    {nodo.capaLogicaMapeada.split(':')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Node Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                  {getNodeIcon(selectedNode.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono font-bold text-slate-800">{selectedNode.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-indigo-700">{selectedNode.capaLogicaMapeada}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedNode.nombre}</h3>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                    <span><strong>Infraestructura:</strong> {selectedNode.tipoInfraestructura}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500"><strong>Zona de Red:</strong> {selectedNode.zonaRed}</span>
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs shrink-0">
                <span className="text-slate-500 block text-[11px]">Sizing Recomendado</span>
                <span className="font-medium text-slate-900">{selectedNode.dimensionamientoRecomendado}</span>
              </div>
            </div>

            {/* Responsabilidades & Protocolos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Responsabilidades */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Responsabilidades de Infraestructura</span>
                </h4>
                <ul className="space-y-2">
                  {selectedNode.responsabilidades.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                      <span className="font-mono font-bold text-slate-400 mt-0.5 shrink-0">0{idx + 1}.</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Protocolos & Seguridad */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-700" />
                    <span>Protocolos de Comunicación (Ingress/Egress)</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedNode.protocolosEntradaSalida.map((proto, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-indigo-700">{proto.protocolo} ({proto.puerto})</span>
                          <span className="text-[11px] text-slate-500 font-mono">{proto.origenDestino}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{proto.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Mecanismos de Seguridad Aplicados (RNF-01)</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedNode.mecanismosSeguridad.map((sec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold font-mono">↳</span>
                        <span>{sec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Garantías RNF */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="font-bold text-slate-800">Garantías de Calidad Aportadas por el Nodo:</span>
              <div className="flex flex-wrap items-center gap-3">
                {selectedNode.garantiasRNF.map((g) => (
                  <div key={g.rnf} className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px]">
                      {g.rnf}
                    </span>
                    <span className="text-slate-700 font-medium">{g.metrica}:</span>
                    <span className="text-slate-500">{g.implementacion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: TOPOLOGÍA DE RED & SEGURIDAD */}
      {activeSubTab === 'redes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
                <span>Topología de Red Virtual Privada (VPC)</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Segmentación en Subredes Aisladas (CIDR 10.0.0.0/16)
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Cada capa arquitectónica reside en su propia subred dedicada con reglas de control de acceso de red (Network ACLs)
                y cortafuegos a nivel de instancia (Security Groups), garantizando que ningún salto salte fronteras no autorizadas.
              </p>
            </div>

            {/* Subnets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30">
                <span className="font-mono text-xs font-bold text-sky-800 block mb-1">10.0.1.0/24</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">Subred DMZ Pública</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Aloja Cloud WAF L7 y Load Balancers públicos. Expone puerto 443 hacia internet con terminación TLS 1.3.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                <span className="font-mono text-xs font-bold text-blue-800 block mb-1">10.0.2.0/24</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">Subred App Privada</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Aloja clúster de pods de Node.js (API/Dominio) y Redis. Cero IP pública. Salida a internet solo con Cloud NAT.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <span className="font-mono text-xs font-bold text-emerald-800 block mb-1">10.0.3.0/24</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">Subred DB Aislada</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  PostgreSQL Master, Standby y Read Replica. Solo acepta tráfico en puerto 5432 procedente de la Subred App.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30">
                <span className="font-mono text-xs font-bold text-purple-800 block mb-1">10.0.4.0/24</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">Subred Auditoría &amp; DR</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Conexión privada (VPC Endpoint) hacia la bóveda WORM de Cloud Storage y partición de sga_auditoria.
                </p>
              </div>
            </div>

            {/* Cortafuegos Matrix Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Matriz de Reglas de Cortafuegos (Security Groups Inter-Capa)
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-3 px-3.5 w-32 font-mono">Security Group</th>
                      <th className="py-3 px-3 w-28">Puerto / Proto</th>
                      <th className="py-3 px-3.5 w-44 font-mono">Origen Permitido</th>
                      <th className="py-3 px-3.5 w-44 font-mono">Destino</th>
                      <th className="py-3 px-4 min-w-[280px]">Justificación &amp; Política de Seguridad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-sky-800">SG-DMZ-Ingress</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">443 / TCP</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600">0.0.0.0/0 (Internet)</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-800">10.0.1.0/24 (LB)</td>
                      <td className="py-3.5 px-4 text-slate-700">Entrada pública TLS 1.3 con filtrado de firmas OWASP en WAF.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-blue-800">SG-App-Ingress</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">8443 / TCP</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600">10.0.1.0/24 (SG-DMZ)</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-800">10.0.2.0/24 (App Pods)</td>
                      <td className="py-3.5 px-4 text-slate-700">Reenvío exclusivo desde Load Balancer con cabeceras de trazabilidad. Bloquea todo lo demás.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-emerald-800">SG-DB-Ingress</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">5432 / TCP</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600">10.0.2.0/24 (SG-App)</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-800">10.0.3.0/24 (DB Cluster)</td>
                      <td className="py-3.5 px-4 text-slate-700">Acceso SQL exclusivo del clúster de backend. Cero acceso desde DMZ o internet.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-purple-800">SG-Redis-Ingress</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">6379 / TCP</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600">10.0.2.0/24 (SG-App)</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-800">10.0.2.50 (Redis)</td>
                      <td className="py-3.5 px-4 text-slate-700">Acceso a caché y locks de concurrencia restringido a instancias de aplicación.</td>
                    </tr>
                    <tr className="bg-red-50/30">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-red-900">SG-Default-Deny</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">Cualquiera</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600">0.0.0.0/0</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-800">Toda la VPC</td>
                      <td className="py-3.5 px-4 text-red-800 font-medium">DROP explícito de cualquier paquete que no coincida con las reglas permitidas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: RESPALDO & DR (RNF-09) */}
      {activeSubTab === 'respaldos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 tracking-wider uppercase mb-1">
                <span>Continuidad Operativa &amp; Resiliencia ante Desastres</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Estrategia de Respaldo y Recuperación (RNF-09)
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Mecanismos para garantizar que ante cualquier falla masiva de hardware, corrupción de datos o desastre de centro de datos,
                el SGA restaure la operación respetando taxativamente los objetivos de RPO &le; 1 hora y RTO &le; 4 horas.
              </p>
            </div>

            {/* SLA Target Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">RPO Objetivo (RNF-09)</span>
                  <span className="text-2xl font-black text-emerald-950 font-mono">&le; 1.0 Hora</span>
                  <p className="text-xs text-emerald-800 mt-1">
                    Garantía real con streaming WAL continuo: <strong>RPO &lt; 5 minutos</strong>
                  </p>
                </div>
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="p-5 rounded-xl border border-sky-200 bg-sky-50/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">RTO Objetivo (RNF-09)</span>
                  <span className="text-2xl font-black text-sky-950 font-mono">&le; 4.0 Horas</span>
                  <p className="text-xs text-sky-800 mt-1">
                    Failover Multi-AZ: <strong>&lt; 30s</strong> · Restauración completa DR: <strong>1h 45m</strong>
                  </p>
                </div>
                <RotateCcw className="w-8 h-8 text-sky-600" />
              </div>
            </div>

            {/* Policies Detail List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Políticas Técnicas de Copias de Seguridad y Recuperación
              </h4>
              <div className="space-y-3">
                {POLITICAS_RESPALDO_DR.map((pol, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900">{pol.parametro}</span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded self-start sm:self-auto">
                        {pol.valorObjetivo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 italic">
                      Fundamento Arquitectónico: {pol.justificacionTecnica}
                    </p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                      <strong>Procedimiento:</strong> {pol.procedimientoOperativo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: DIAGRAMA DE DESPLIEGUE */}
      {activeSubTab === 'diagrama' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Diagrama Formal de Despliegue Cloud (Mermaid.js):</strong> Ilustra las fronteras de red (Internet, DMZ, App Privada, DB Aislada y Bóveda Off-site), puertos TCP y topología Multi-AZ.
            </span>
            <span className="font-mono text-slate-500 font-semibold text-[11px]">ISO 42010 Architecture</span>
          </div>
          <MermaidViewer code={CODIGO_MERMAID_DESPLIEGUE} />
        </div>
      )}

      {/* SUB-SECTION 5: DOCUMENTO OFICIAL MARKDOWN */}
      {activeSubTab === 'doc63' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-10 font-sans text-slate-800 leading-relaxed max-w-5xl mx-auto">
          <div className="border-b border-slate-200 pb-5 mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                MEMORIA TÉCNICA DE INFRAESTRUCTURA
              </span>
              <h2 className="text-xl font-bold text-slate-900">Sección 6.3: Modelo de Despliegue en Infraestructura Cloud</h2>
            </div>
            <button
              onClick={handleCopyDoc63}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedDoc ? '¡Copiado!' : 'Copiar Todo'}
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
            <pre className="whitespace-pre-wrap select-text">
              <code>{DOCUMENTO_MARKDOWN_COMPLETO_6_3}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
