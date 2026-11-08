/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DOCUMENTO_MARKDOWN_COMPLETO } from '../data/sgaArchitectureData';
import { Download, Copy, Check, Printer, FileText, CheckCircle2 } from 'lucide-react';

export const MarkdownDocumentView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DOCUMENTO_MARKDOWN_COMPLETO);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = DOCUMENTO_MARKDOWN_COMPLETO;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([DOCUMENTO_MARKDOWN_COMPLETO], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SGA_Seccion_6.1_Modelo_Casos_de_Uso.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-1">
          <span>Sección 6.1.5</span>
          <span aria-hidden="true">·</span>
          <span>Entrega Oficial de Arquitectura</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Documento Formal Exportable (Markdown / IEEE 830)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Texto íntegro y formal del documento <em>Modelo de Casos de Uso (Sección 6.1)</em> listo para ser integrado
              en la memoria de arquitectura institucional, repositorios Git o plataformas de documentación.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Documento Completo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Document View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 lg:p-12 font-sans text-slate-800 leading-relaxed max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-6 mb-8 text-center sm:text-left">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
            DOCUMENTO INSTITUCIONAL DE ARQUITECTURA DE SOFTWARE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sección 6.1: Modelo de Casos de Uso
          </h1>
          <p className="text-base text-slate-600 mt-1 font-medium">
            Sistema de Gestión Académica (SGA) — Edición Formal de Producción
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span><strong>Código:</strong> SGA-ARCH-DOC-6.1</span>
            <span aria-hidden="true">·</span>
            <span><strong>Versión:</strong> 2.4 Definitiva</span>
            <span aria-hidden="true">·</span>
            <span><strong>Estándar:</strong> ISO/IEC/IEEE 29148:2018</span>
            <span aria-hidden="true">·</span>
            <span><strong>Estado:</strong> Aprobado para Construcción</span>
          </div>
        </div>

        {/* Monospace Markdown Preview Container */}
        <div className="bg-slate-950 text-slate-100 p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
          <pre className="whitespace-pre-wrap select-text">
            <code>{DOCUMENTO_MARKDOWN_COMPLETO}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
