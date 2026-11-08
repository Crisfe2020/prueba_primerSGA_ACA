/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PLANTILLA_UC05, PLANTILLA_UC06, PlantillaCasoDeUso } from '../data/sgaArchitectureData';
import { Copy, Check, ShieldAlert, Cpu, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface DetailedTemplatesProps {
  initialUcId?: 'UC-05' | 'UC-06';
}

export const DetailedTemplates: React.FC<DetailedTemplatesProps> = ({ initialUcId = 'UC-05' }) => {
  const [activeUc, setActiveUc] = useState<'UC-05' | 'UC-06'>(initialUcId);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'markdown'>('visual');

  const plantilla: PlantillaCasoDeUso = activeUc === 'UC-05' ? PLANTILLA_UC05 : PLANTILLA_UC06;

  // Generador de Markdown formal para la plantilla seleccionada
  const getMarkdownTemplate = (p: PlantillaCasoDeUso): string => {
    return `### PLANTILLA DE ESPECIFICACIÓN FORMAL DE CASO DE USO: ${p.id} - ${p.nombre}
**Versión:** ${p.version}  
**Fecha:** ${p.fecha}  
**Autor:** ${p.autor}  
**Actor Principal:** ${p.actorPrincipal}  
**Actores Secundarios:** ${p.actoresSecundarios.join('; ')}  
**Requerimientos Funcionales:** ${p.rfRelacionados.join(', ')}  
**Requerimientos No Funcionales:** ${p.rnfRelacionados.join(', ')}  
**Nivel de Criticidad:** ${p.criticidad}  

---

#### 1. PROPÓSITO Y ALCANCE
- **Propósito:** ${p.proposito}
- **Alcance:** ${p.alcance}

---

#### 2. PRECONDICIONES
${p.precondiciones.map((prec, i) => `${i + 1}. ${prec}`).join('\n')}

---

#### 3. FLUJO PRINCIPAL DE EVENTOS
| Paso | Actor | Acción del Actor | Respuesta / Validación del Sistema |
| :---: | :--- | :--- | :--- |
${p.flujoPrincipal
  .map(
    (f) =>
      `| ${f.paso} | **${f.actor}** | ${f.accion} | ${f.sistema} |`
  )
  .join('\n')}

---

#### 4. FLUJOS ALTERNATIVOS
${p.flujosAlternativos
  .map(
    (fa) => `##### ${fa.id}: ${fa.titulo}
- **Condición:** ${fa.condicion}
- **Secuencia de Pasos:**
${fa.pasos.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
- **Resultado:** ${fa.resultado}
`
  )
  .join('\n')}

---

#### 5. FLUJOS DE EXCEPCIÓN
${p.flujosExcepcion
  .map(
    (fe) => `##### ${fe.id}: ${fe.titulo}
- **Condición de Disparo:** ${fe.condicion}
- **Tratamiento de Excepción:**
${fe.pasos.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
- **Resultado de Resiliencia:** ${fe.resultado}
`
  )
  .join('\n')}

---

#### 6. POSTCONDICIONES
##### 6.1 Postcondiciones de Éxito
${p.postcondicionesExito.map((pe) => `- [x] ${pe}`).join('\n')}

##### 6.2 Postcondiciones de Fallo
${p.postcondicionesFallo.map((pf) => `- [ ] ${pf}`).join('\n')}

---

#### 7. REGLAS DE NEGOCIO VINCULADAS
${p.reglasNegocio.map((rn) => `- **[${rn.codigo}] ${rn.nombre}:** ${rn.definicion}`).join('\n')}

---

#### 8. VINCULACIÓN CON REQUERIMIENTOS NO FUNCIONALES (RNF)
${p.criteriosArquitectura
  .map((c) => `- **${c.rnf} (${c.requisito}):** ${c.mecanismoImplementacion}`)
  .join('\n')}
`;
  };

  const handleCopyMarkdown = async () => {
    const md = getMarkdownTemplate(plantilla);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = md;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.1.3</span>
          <span aria-hidden="true">·</span>
          <span>Especificación Formal Detallada (IEEE 830)</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Plantillas de Casos de Uso Críticos
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Especificación rigurosa de los dos (2) casos de uso de mayor impacto y riesgo arquitectónico:
              <strong> UC-05 (Matricular Estudiante)</strong> y <strong>UC-06 (Registrar Calificaciones)</strong>.
            </p>
          </div>

          {/* UC Selector Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveUc('UC-05')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
                activeUc === 'UC-05'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              UC-05: Matricular Estudiante
            </button>
            <button
              onClick={() => setActiveUc('UC-06')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
                activeUc === 'UC-06'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              UC-06: Registrar Calificaciones
            </button>
          </div>
        </div>
      </div>

      {/* Main Template Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Template Header / Metadata Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/75 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                {plantilla.id}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">v{plantilla.version}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-xs text-slate-600">Criticidad: {plantilla.criticidad}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{plantilla.nombre}</h3>
            <p className="text-xs text-slate-600 mt-1">{plantilla.proposito}</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="inline-flex rounded-lg p-1 bg-slate-200/80 mr-2">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'visual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vista Estructurada
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Markdown Formal
              </button>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Plantilla Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Structured View */}
        {activeTab === 'visual' ? (
          <div className="p-6 lg:p-8 space-y-8">
            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/75 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Actor Principal</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{plantilla.actorPrincipal}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">RFs Asociados</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plantilla.rfRelacionados.map((rf) => (
                    <span key={rf} className="font-mono text-[11px] px-1.5 py-0.2 bg-white rounded border border-slate-200 font-semibold text-slate-700">
                      {rf}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">RNFs Clave</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {plantilla.rnfRelacionados.slice(0, 4).map((rnf) => (
                    <span key={rnf} className="font-mono text-[11px] px-1.5 py-0.2 bg-indigo-50 text-indigo-900 rounded border border-indigo-200 font-semibold">
                      {rnf}
                    </span>
                  ))}
                  {plantilla.rnfRelacionados.length > 4 && (
                    <span className="text-[11px] text-slate-500">+{plantilla.rnfRelacionados.length - 4} más</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Autoría y Fecha</span>
                <span className="text-slate-700 mt-0.5 block">{plantilla.fecha}</span>
              </div>
            </div>

            {/* Precondiciones */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-indigo-700" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Precondiciones del Sistema
                </h4>
              </div>
              <div className="space-y-2">
                {plantilla.precondiciones.map((prec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <span className="font-mono font-bold text-indigo-600 shrink-0">PRE-0{idx + 1}</span>
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flujo Principal de Eventos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-emerald-700" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Flujo Principal de Eventos (Paso a Paso)
                </h4>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-3 px-3.5 w-16 text-center">Paso</th>
                      <th className="py-3 px-3.5 w-36">Actor</th>
                      <th className="py-3 px-4 min-w-[260px]">Acción del Actor</th>
                      <th className="py-3 px-4 min-w-[340px]">Respuesta / Validación del Sistema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plantilla.flujoPrincipal.map((f) => (
                      <tr key={f.paso} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-900">
                          {f.paso}
                        </td>
                        <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                          {f.actor}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 leading-relaxed">
                          {f.accion}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 leading-relaxed bg-slate-50/50">
                          <span className="text-indigo-900 font-medium">{f.sistema}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flujos Alternativos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-amber-700" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Flujos Alternativos de Negocio
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plantilla.flujosAlternativos.map((fa) => (
                  <div key={fa.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {fa.id}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Bifurcación de Flujo</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5">{fa.titulo}</h5>
                    <p className="text-[11px] text-slate-500 mb-2 italic">
                      Condición: {fa.condicion}
                    </p>
                    <ul className="space-y-1.5 mb-3 text-xs text-slate-700">
                      {fa.pasos.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-mono text-[10px] mt-0.5">↳</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{fa.resultado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flujos de Excepción (Resiliencia y Concurrencia) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  4. Flujos de Excepción &amp; Resiliencia Arquitectónica
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plantilla.flujosExcepcion.map((fe) => (
                  <div key={fe.id} className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-red-900 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                        {fe.id}
                      </span>
                      <span className="text-[11px] text-red-700 font-medium">Fallo Crítico / Timeout</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5">{fe.titulo}</h5>
                    <p className="text-[11px] text-red-800/80 mb-2">
                      Disparador: {fe.condicion}
                    </p>
                    <ul className="space-y-1.5 mb-3 text-xs text-slate-700">
                      {fe.pasos.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-mono text-[10px] mt-0.5">!</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-red-200/60 text-[11px] text-red-900 font-semibold">
                      Garantía de Resiliencia: {fe.resultado}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Postcondiciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Postcondiciones de Éxito (Estado Final Válido)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plantilla.postcondicionesExito.map((pe, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold font-mono">✓</span>
                      <span>{pe}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Postcondiciones de Fallo (Rollback Total)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plantilla.postcondicionesFallo.map((pf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold font-mono">✕</span>
                      <span>{pf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reglas de Negocio Vinculadas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  5. Reglas de Negocio Institucionales Invariantes
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plantilla.reglasNegocio.map((rn) => (
                  <div key={rn.codigo} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono text-xs font-bold text-indigo-700 block mb-1">
                      {rn.codigo}
                    </span>
                    <h6 className="text-xs font-bold text-slate-900 mb-1">{rn.nombre}</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{rn.definicion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Criterios de Arquitectura RNF */}
            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/20">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-3">
                6. Mapeo y Garantías de Requerimientos No Funcionales (RNF-01 a RNF-12)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {plantilla.criteriosArquitectura.map((crit) => (
                  <div key={crit.rnf} className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-indigo-700">{crit.rnf}</span>
                      <span className="font-semibold text-slate-800">{crit.requisito}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <strong>Mecanismo de Software:</strong> {crit.mecanismoImplementacion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-950 text-slate-200 overflow-x-auto font-mono text-xs leading-relaxed">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <span>Especificación IEEE 830 en formato Markdown editable</span>
              <span className="text-[11px]">Listo para exportar al repositorio documental</span>
            </div>
            <pre className="selection:bg-indigo-500/30 selection:text-white">
              <code>{getMarkdownTemplate(plantilla)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
