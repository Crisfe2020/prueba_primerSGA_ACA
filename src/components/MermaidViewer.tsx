/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw, Code, Eye, Download } from 'lucide-react';

interface MermaidViewerProps {
  code: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'diagram' | 'code'>('diagram');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis'
      }
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const uniqueId = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error al renderizar Mermaid:', err);
          setRenderError(err instanceof Error ? err.message : 'Error al procesar el diagrama Mermaid.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SGA_Diagrama_Casos_de_Uso_Seccion_6.1.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/75">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-1 bg-slate-200/80">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'diagram'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagrama Renderizado</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Código Mermaid.js</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 hidden sm:inline">UML Use Case Model (Sección 6.1)</span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'diagram' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs mr-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Alejar Zoom"
                aria-label="Alejar Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-600 px-2 select-none min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Acercar Zoom"
                aria-label="Acercar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors ml-0.5"
                title="Restablecer Zoom"
                aria-label="Restablecer Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'diagram' && svgContent && (
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Descargar SVG Vectorial"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar SVG</span>
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shadow-2xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Código Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Mermaid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[520px] bg-slate-50/50 flex flex-col">
        {activeTab === 'diagram' ? (
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            {renderError ? (
              <div className="max-w-lg p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-sm font-semibold text-red-800 mb-2">Error de renderizado gráfico de Mermaid</p>
                <p className="text-xs text-red-600 mb-4 font-mono">{renderError}</p>
                <p className="text-xs text-slate-600">
                  Puede alternar a la pestaña <strong>Código Mermaid.js</strong> para visualizar y copiar la definición formal completa.
                </p>
              </div>
            ) : svgContent ? (
              <div
                ref={containerRef}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center py-4 select-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
                <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                <p className="text-xs">Renderizando diagrama formal de arquitectura...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-6 bg-slate-950 text-slate-200 overflow-x-auto font-mono text-xs leading-relaxed">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
              <span>Sintaxis Mermaid.js compatible con Markdown, GitHub y Notion</span>
              <span className="text-[11px] font-mono text-slate-500">Total: {code.split('\n').length} líneas</span>
            </div>
            <pre className="selection:bg-indigo-500/30 selection:text-white">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Legend and Subsystems strip */}
      <div className="px-6 py-3 bg-white border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-800">Convención de Nodos:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-500 inline-block" />
            <span>Casos Críticos (UC-05, UC-06, UC-01)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-500 inline-block" />
            <span>Casos de Criticidad Alta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-100 border border-sky-500 inline-block" />
            <span>Casos de Criticidad Media</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-400 border-dashed inline-block" />
            <span>Relación &lt;&lt;include&gt;&gt;</span>
          </div>
        </div>
        <div className="text-slate-400 text-[11px]">
          Fronteras del Sistema SGA · Conforme a RF-01 .. RF-12 &amp; RNF-01 .. RNF-12
        </div>
      </div>
    </div>
  );
};
