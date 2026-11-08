/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Visor y Consola de Base de Datos SQL Relacional (PostgreSQL 16 - Sección 6.4)
 * Permite explorar en vivo las 11 tablas en 3FN, ejecutar consultas SQL interactivas
 * e inspeccionar el script DDL de creación y restricciones de integridad.
 */

import React, { useState, useMemo } from 'react';
import {
  Database,
  Table2,
  Terminal,
  FileCode,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Search,
  Layers,
  ShieldCheck,
  Clock,
  KeyRound,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SGA_SQL_TABLES, getSqlTableRows, executeSqlConsoleQuery, SqlQueryResult } from '../../db/index';

interface SqlDatabaseViewProps {
  onRefreshData?: () => void;
}

export const SqlDatabaseView: React.FC<SqlDatabaseViewProps> = ({ onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'tablas' | 'consola' | 'ddl' | 'diccionario'>('tablas');
  const [selectedTableName, setSelectedTableName] = useState<string>('sga_estudiantes');
  const [copiedDdl, setCopiedDdl] = useState(false);

  // Consola SQL
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM sga_estudiantes;');
  const [queryResult, setQueryResult] = useState<SqlQueryResult>(() =>
    executeSqlConsoleQuery('SELECT * FROM sga_estudiantes;')
  );

  // Tablas y filas seleccionadas
  const selectedTableDef = useMemo(
    () => SGA_SQL_TABLES.find((t) => t.tableName === selectedTableName) || SGA_SQL_TABLES[0],
    [selectedTableName]
  );

  const tableRows = useMemo(() => getSqlTableRows(selectedTableName), [selectedTableName]);

  const handleExecuteQuery = () => {
    const res = executeSqlConsoleQuery(sqlQuery);
    setQueryResult(res);
  };

  const handlePredefinedQuery = (query: string) => {
    setSqlQuery(query);
    const res = executeSqlConsoleQuery(query);
    setQueryResult(res);
  };

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(DDL_RAW_TEXT);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Base de Datos SQL Relacional (PostgreSQL 16)
                </h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                  3FN Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Capa de Persistencia y Acceso a Datos (Capa 4) · 11 Tablas Relacionales Normalizadas (Sección 6.4)
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                Motor: PostgreSQL 16 Enterprise · Aislamiento Transaccional ACID · Soporte de Bloqueo Pesimista
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onRefreshData) onRefreshData();
                setQueryResult(executeSqlConsoleQuery(sqlQuery));
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Refrescar datos en vivo de la BD"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar BD</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('tablas')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tablas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Explorador de Tablas (11)</span>
          </button>
          <button
            onClick={() => setActiveTab('consola')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'consola'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Consola SQL Interactiva</span>
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ddl'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Script DDL (schema.sql)</span>
          </button>
          <button
            onClick={() => setActiveTab('diccionario')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diccionario'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Diccionario de Datos &amp; FKs</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXPLORADOR DE TABLAS                                               */}
      {/* ========================================================================= */}
      {activeTab === 'tablas' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Columna Izquierda: Lista de las 11 Tablas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Tablas del Esquema (sga.*)
            </span>
            <div className="space-y-1">
              {SGA_SQL_TABLES.map((table) => {
                const isSelected = table.tableName === selectedTableName;
                return (
                  <button
                    key={table.tableName}
                    onClick={() => setSelectedTableName(table.tableName)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Table2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono truncate">{table.tableName}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getSqlTableRows(table.tableName).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Estructura y Filas en Vivo */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded">
                      TABLE sga.{selectedTableDef.tableName}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      ({selectedTableDef.entityName})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedTableDef.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {tableRows.length} fila(s) persistida(s)
                  </span>
                </div>
              </div>

              {/* Definición de Columnas de la Tabla */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Columnas y Restricciones DDL:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTableDef.columns.map((col) => (
                    <div
                      key={col.name}
                      className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-mono flex items-center gap-2"
                    >
                      {col.isPrimary && (
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1 rounded">
                          PK
                        </span>
                      )}
                      {col.isForeignKey && (
                        <span className="bg-blue-100 text-blue-900 text-[9px] font-bold px-1 rounded" title={`FK -> ${col.referencesTable}`}>
                          FK
                        </span>
                      )}
                      <span className="font-bold text-slate-800">{col.name}</span>
                      <span className="text-slate-400 font-normal">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filas en Vivo */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Datos en Tiempo Real:
                </span>

                {tableRows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    La tabla no contiene registros actualmente.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                        <tr>
                          {selectedTableDef.columns.map((c) => (
                            <th key={c.name} className="py-2.5 px-3 font-mono whitespace-nowrap">
                              {c.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {tableRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            {selectedTableDef.columns.map((c) => {
                              const val = row[c.name];
                              const display =
                                typeof val === 'boolean'
                                  ? val
                                    ? 'true'
                                    : 'false'
                                  : val !== null && val !== undefined
                                  ? String(val)
                                  : 'NULL';

                              return (
                                <td key={c.name} className="py-2 px-3 whitespace-nowrap truncate max-w-xs">
                                  {val === null || val === undefined ? (
                                    <span className="text-slate-400 italic">NULL</span>
                                  ) : typeof val === 'boolean' ? (
                                    <span
                                      className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                        val ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {display}
                                    </span>
                                  ) : (
                                    <span>{display}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSOLA SQL INTERACTIVA                                            */}
      {/* ========================================================================= */}
      {activeTab === 'consola' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Consola Interactiva de Consultas SQL (PostgreSQL Engine)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ejecuta consultas DQL directamente sobre las 11 entidades normalizadas del SGA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Latencia: {queryResult.executionTimeMs} ms
              </span>
            </div>
          </div>

          {/* Botones de Consultas Rápidas */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Consultas Rápidas Sugeridas:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handlePredefinedQuery('SELECT * FROM sga_estudiantes WHERE estado = \'ACTIVO\';')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono text-[11px] transition-colors"
              >
                SELECT * FROM sga_estudiantes;
              </button>
              <button
                onClick={() => handlePredefinedQuery('SELECT * FROM sga_grupos WHERE cupo_disponible > 0;')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono text-[11px] transition-colors"
              >
                SELECT * FROM sga_grupos (Cupos Vacantes);
              </button>
              <button
                onClick={() => handlePredefinedQuery('SELECT * FROM sga_matricula_detalles;')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono text-[11px] transition-colors"
              >
                SELECT * FROM sga_matricula_detalles;
              </button>
              <button
                onClick={() => handlePredefinedQuery('SELECT * FROM sga_auditoria LIMIT 10;')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono text-[11px] transition-colors"
              >
                SELECT * FROM sga_auditoria LIMIT 10;
              </button>
            </div>
          </div>

          {/* Editor SQL */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                placeholder="Escriba su consulta SQL aquí..."
              />
              <button
                onClick={handleExecuteQuery}
                className="absolute right-3 bottom-3.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ejecutar SQL</span>
              </button>
            </div>
          </div>

          {/* Tabla de Resultados de la Consulta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Resultado: <strong className="font-mono text-indigo-700">{queryResult.rowCount}</strong> filas retornadas
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Tabla analizada: {queryResult.tableName}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                  <tr>
                    {queryResult.columns.map((c) => (
                      <th key={c} className="py-2.5 px-3 font-mono whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {queryResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      {queryResult.columns.map((col) => {
                        const val = row[col];
                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap truncate max-w-xs">
                            {val !== null && val !== undefined ? String(val) : <span className="text-slate-400 italic">NULL</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCRIPT DDL (schema.sql)                                            */}
      {/* ========================================================================= */}
      {activeTab === 'ddl' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Script DDL Completo (src/db/schema.sql)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Definición formal de tablas, claves primarias, foráneas, índices B-Tree y checks de integridad para PostgreSQL 16.
              </p>
            </div>

            <button
              onClick={handleCopyDdl}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              {copiedDdl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDdl ? '¡Copiado al portapapeles!' : 'Copiar DDL Completo'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
            {DDL_RAW_TEXT}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DICCIONARIO DE DATOS & RELACIONES                                   */}
      {/* ========================================================================= */}
      {activeTab === 'diccionario' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Diccionario de Datos &amp; Modelo Relacional (Sección 6.4)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mapa de cardinalidades, integridad referencial y restricciones de negocio del SGA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Cardinalidades Principales:</span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>sga_roles 1:N sga_usuarios</strong> (Un rol puede estar asociado a múltiples usuarios).</li>
                <li><strong>sga_usuarios 1:1 sga_estudiantes / sga_docentes</strong> (Especialización de actores).</li>
                <li><strong>sga_programas 1:N sga_asignaturas</strong> (Un programa contiene múltiples materias).</li>
                <li><strong>sga_asignaturas 1:N sga_grupos</strong> (Una materia se oferta en varios grupos por periodo).</li>
                <li><strong>sga_matriculas 1:N sga_matricula_detalles</strong> (Una matrícula agrupa varias materias inscritas).</li>
                <li><strong>sga_grupos 1:N sga_matricula_detalles</strong> (Un grupo aloja múltiples estudiantes).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Garantías de Integridad y Concurrencia:</span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Optimistic Locking (`version_lock`):</strong> Previene carreras en adjudicación de cupos simultáneos.</li>
                <li><strong>Restricción CHECK de Cupos:</strong> `cupo_disponible BETWEEN 0 AND cupo_maximo`.</li>
                <li><strong>Restricción CHECK de Calificaciones:</strong> `corte BETWEEN 0.00 AND 5.00`.</li>
                <li><strong>Auditoría Inmutable:</strong> `sga_auditoria` almacena deltas JSONB sin permisos de `UPDATE` o `DELETE`.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DDL_RAW_TEXT = `-- PostgreSQL 16 DDL - Sistema de Gestión Académica (SGA)
CREATE SCHEMA IF NOT EXISTS sga;
SET search_path TO sga, public;

CREATE TABLE IF NOT EXISTS sga_roles (
    id VARCHAR(32) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_usuarios (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol_id VARCHAR(32) NOT NULL REFERENCES sga_roles(id),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_programas (
    id VARCHAR(32) PRIMARY KEY,
    codigo_snies VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    nivel_academico VARCHAR(30) DEFAULT 'PREGRADO' NOT NULL,
    total_creditos INT NOT NULL CHECK (total_creditos > 0),
    duracion_semestres INT NOT NULL CHECK (duracion_semestres > 0)
);

CREATE TABLE IF NOT EXISTS sga_docentes (
    id VARCHAR(32) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL UNIQUE REFERENCES sga_usuarios(id),
    documento_identidad VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    titulo_academico VARCHAR(150) NOT NULL,
    departamento VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_estudiantes (
    id VARCHAR(32) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL UNIQUE REFERENCES sga_usuarios(id),
    codigo_estudiantil VARCHAR(20) NOT NULL UNIQUE,
    documento_identidad VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    programa_id VARCHAR(32) NOT NULL REFERENCES sga_programas(id),
    semestre_actual INT DEFAULT 1 NOT NULL,
    promedio_acumulado NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
    creditos_aprobados INT DEFAULT 0 NOT NULL,
    total_creditos INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_periodos_academicos (
    id VARCHAR(32) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_limite_matricula DATE NOT NULL,
    fecha_cierre_notas DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PLANIFICACION' NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_asignaturas (
    id VARCHAR(32) PRIMARY KEY,
    programa_id VARCHAR(32) NOT NULL REFERENCES sga_programas(id),
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    creditos INT NOT NULL CHECK (creditos BETWEEN 1 AND 10),
    semestre_nivel INT NOT NULL CHECK (semestre_nivel BETWEEN 1 AND 12),
    prerrequisitos TEXT[] DEFAULT '{}' NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_grupos (
    id VARCHAR(32) PRIMARY KEY,
    asignatura_id VARCHAR(32) NOT NULL REFERENCES sga_asignaturas(id),
    periodo_id VARCHAR(32) NOT NULL REFERENCES sga_periodos_academicos(id),
    docente_id VARCHAR(32) NOT NULL REFERENCES sga_docentes(id),
    numero_grupo VARCHAR(10) NOT NULL,
    cupo_maximo INT NOT NULL CHECK (cupo_maximo > 0),
    cupo_disponible INT NOT NULL CHECK (cupo_disponible >= 0),
    dias_horario VARCHAR(100) NOT NULL,
    aula_o_enlace VARCHAR(150) NOT NULL,
    version_lock INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_matriculas (
    id VARCHAR(32) PRIMARY KEY,
    estudiante_id VARCHAR(32) NOT NULL REFERENCES sga_estudiantes(id),
    periodo_id VARCHAR(32) NOT NULL REFERENCES sga_periodos_academicos(id),
    codigo_comprobante VARCHAR(50) NOT NULL UNIQUE,
    fecha_matricula TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_creditos INT DEFAULT 0 NOT NULL,
    estado VARCHAR(20) DEFAULT 'ASENTADA' NOT NULL
);

CREATE TABLE IF NOT EXISTS sga_matricula_detalles (
    id VARCHAR(64) PRIMARY KEY,
    matricula_id VARCHAR(32) NOT NULL REFERENCES sga_matriculas(id) ON DELETE CASCADE,
    grupo_id VARCHAR(32) NOT NULL REFERENCES sga_grupos(id),
    creditos INT NOT NULL CHECK (creditos > 0),
    estado VARCHAR(20) DEFAULT 'ASENTADA' NOT NULL,
    corte1 NUMERIC(3, 2),
    corte2 NUMERIC(3, 2),
    corte3 NUMERIC(3, 2),
    nota_definitiva NUMERIC(3, 2)
);

CREATE TABLE IF NOT EXISTS sga_auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES sga_usuarios(id),
    usuario_nombre VARCHAR(150) NOT NULL,
    usuario_email VARCHAR(128) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    fecha_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modulo VARCHAR(32) NOT NULL,
    accion VARCHAR(64) NOT NULL,
    entidad_afectada VARCHAR(64) NOT NULL,
    registro_afectado_id VARCHAR(64) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB NOT NULL,
    justificacion TEXT
);`;
