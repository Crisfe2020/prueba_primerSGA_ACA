-- ============================================================================
-- SISTEMA DE GESTIÓN ACADÉMICA (SGA) - CAMPUS DIGITAL
-- ESQUEMA RELACIONAL POSTGRESQL 16 (TERCERA FORMA NORMAL - 3FN)
-- Conforme a la Sección 6.4 (Modelo Conceptual y Lógico de Datos)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS sga;
SET search_path TO sga, public;

-- Extensiones recomendadas para PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: sga_roles (RF-02 - Control de Acceso RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_roles (
    id VARCHAR(32) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE sga_roles IS 'Catálogo de roles autorizados para el control de acceso RBAC (RF-02)';

-- ============================================================================
-- 2. TABLA: sga_usuarios (RF-01 - Autenticación y Credenciales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_usuarios (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id / bcrypt hash
    nombre_completo VARCHAR(150) NOT NULL,
    rol_id VARCHAR(32) NOT NULL REFERENCES sga_roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_email_formato CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON sga_usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON sga_usuarios(email);

-- ============================================================================
-- 3. TABLA: sga_programas (RF-05 - Programas Académicos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_programas (
    id VARCHAR(32) PRIMARY KEY,
    codigo_snies VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    nivel_academico VARCHAR(30) DEFAULT 'PREGRADO' NOT NULL CHECK (nivel_academico IN ('PREGRADO', 'POSGRADO', 'MAESTRIA', 'DOCTORADO')),
    total_creditos INT NOT NULL CHECK (total_creditos > 0),
    duracion_semestres INT NOT NULL CHECK (duracion_semestres > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. TABLA: sga_docentes (RF-04 - Gestión Docente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_docentes (
    id VARCHAR(32) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL UNIQUE REFERENCES sga_usuarios(id) ON DELETE CASCADE,
    documento_identidad VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    titulo_academico VARCHAR(150) NOT NULL,
    departamento VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_docentes_usuario ON sga_docentes(usuario_id);

-- ============================================================================
-- 5. TABLA: sga_estudiantes (RF-03 - Gestión Estudiantil)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_estudiantes (
    id VARCHAR(32) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL UNIQUE REFERENCES sga_usuarios(id) ON DELETE CASCADE,
    codigo_estudiantil VARCHAR(20) NOT NULL UNIQUE,
    documento_identidad VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    programa_id VARCHAR(32) NOT NULL REFERENCES sga_programas(id) ON DELETE RESTRICT,
    semestre_actual INT DEFAULT 1 NOT NULL CHECK (semestre_actual >= 1),
    promedio_acumulado NUMERIC(3, 2) DEFAULT 0.00 NOT NULL CHECK (promedio_acumulado BETWEEN 0.00 AND 5.00),
    creditos_aprobados INT DEFAULT 0 NOT NULL CHECK (creditos_aprobados >= 0),
    total_creditos INT NOT NULL CHECK (total_creditos > 0),
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL CHECK (estado IN ('ACTIVO', 'INACTIVO', 'GRADUADO', 'SUSPENDIDO')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_estudiantes_usuario ON sga_estudiantes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_codigo ON sga_estudiantes(codigo_estudiantil);
CREATE INDEX IF NOT EXISTS idx_estudiantes_programa ON sga_estudiantes(programa_id);

-- ============================================================================
-- 6. TABLA: sga_periodos_academicos (RF-06 - Periodos y Calendario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_periodos_academicos (
    id VARCHAR(32) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- ej. '2026-1'
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_limite_matricula DATE NOT NULL,
    fecha_cierre_notas DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PLANIFICACION' NOT NULL CHECK (estado IN ('PLANIFICACION', 'ABIERTO', 'CERRADO')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_fechas_periodo CHECK (fecha_fin > fecha_inicio)
);

-- ============================================================================
-- 7. TABLA: sga_asignaturas (RF-05 - Malla Curricular y Créditos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_asignaturas (
    id VARCHAR(32) PRIMARY KEY,
    programa_id VARCHAR(32) NOT NULL REFERENCES sga_programas(id) ON DELETE RESTRICT,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- ej. 'IS-301'
    nombre VARCHAR(150) NOT NULL,
    creditos INT NOT NULL CHECK (creditos BETWEEN 1 AND 10),
    semestre_nivel INT NOT NULL CHECK (semestre_nivel BETWEEN 1 AND 12),
    prerrequisitos TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_asignaturas_codigo ON sga_asignaturas(codigo);
CREATE INDEX IF NOT EXISTS idx_asignaturas_programa ON sga_asignaturas(programa_id);

-- ============================================================================
-- 8. TABLA: sga_grupos (RF-06 - Grupos, Franjas Horarias y Cupos con Concurrencia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_grupos (
    id VARCHAR(32) PRIMARY KEY,
    asignatura_id VARCHAR(32) NOT NULL REFERENCES sga_asignaturas(id) ON DELETE RESTRICT,
    periodo_id VARCHAR(32) NOT NULL REFERENCES sga_periodos_academicos(id) ON DELETE RESTRICT,
    docente_id VARCHAR(32) NOT NULL REFERENCES sga_docentes(id) ON DELETE RESTRICT,
    numero_grupo VARCHAR(10) NOT NULL, -- ej. 'G1'
    cupo_maximo INT NOT NULL CHECK (cupo_maximo > 0),
    cupo_disponible INT NOT NULL CHECK (cupo_disponible >= 0),
    dias_horario VARCHAR(100) NOT NULL, -- ej. 'Lunes y Miércoles 08:00 - 10:00'
    aula_o_enlace VARCHAR(150) NOT NULL,
    version_lock INT DEFAULT 0 NOT NULL, -- Optimistic Locking / Control de Concurrencia (RNF-02)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_grupo_periodo UNIQUE (asignatura_id, periodo_id, numero_grupo),
    CONSTRAINT chk_cupo_logico CHECK (cupo_disponible <= cupo_maximo)
);

CREATE INDEX IF NOT EXISTS idx_grupos_asignatura ON sga_grupos(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_grupos_docente ON sga_grupos(docente_id);
CREATE INDEX IF NOT EXISTS idx_grupos_periodo ON sga_grupos(periodo_id);

-- ============================================================================
-- 9. TABLA: sga_matriculas (RF-07 - Encabezado Transaccional de Matrícula)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_matriculas (
    id VARCHAR(32) PRIMARY KEY,
    estudiante_id VARCHAR(32) NOT NULL REFERENCES sga_estudiantes(id) ON DELETE RESTRICT,
    periodo_id VARCHAR(32) NOT NULL REFERENCES sga_periodos_academicos(id) ON DELETE RESTRICT,
    codigo_comprobante VARCHAR(50) NOT NULL UNIQUE,
    fecha_matricula TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_creditos INT DEFAULT 0 NOT NULL CHECK (total_creditos >= 0),
    estado VARCHAR(20) DEFAULT 'ASENTADA' NOT NULL CHECK (estado IN ('ASENTADA', 'CANCELADA', 'PENDIENTE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_estudiante_periodo_activa UNIQUE (estudiante_id, periodo_id)
);

CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON sga_matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_periodo ON sga_matriculas(periodo_id);

-- ============================================================================
-- 10. TABLA: sga_matricula_detalles (RF-07 / RF-08 - Asignaturas Inscritas y Notas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_matricula_detalles (
    id VARCHAR(64) PRIMARY KEY,
    matricula_id VARCHAR(32) NOT NULL REFERENCES sga_matriculas(id) ON DELETE CASCADE,
    grupo_id VARCHAR(32) NOT NULL REFERENCES sga_grupos(id) ON DELETE RESTRICT,
    creditos INT NOT NULL CHECK (creditos > 0),
    estado VARCHAR(20) DEFAULT 'ASENTADA' NOT NULL CHECK (estado IN ('ASENTADA', 'CANCELADA')),
    corte1 NUMERIC(3, 2) CHECK (corte1 BETWEEN 0.00 AND 5.00), -- 30%
    corte2 NUMERIC(3, 2) CHECK (corte2 BETWEEN 0.00 AND 5.00), -- 30%
    corte3 NUMERIC(3, 2) CHECK (corte3 BETWEEN 0.00 AND 5.00), -- 40% Examen Final
    nota_definitiva NUMERIC(3, 2) CHECK (nota_definitiva BETWEEN 0.00 AND 5.00),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_matricula_grupo UNIQUE (matricula_id, grupo_id)
);

CREATE INDEX IF NOT EXISTS idx_detalles_matricula ON sga_matricula_detalles(matricula_id);
CREATE INDEX IF NOT EXISTS idx_detalles_grupo ON sga_matricula_detalles(grupo_id);

-- ============================================================================
-- 11. TABLA: sga_auditoria (RF-12, RNF-01, RNF-10 - Bitácora Inmutable Append-Only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sga_auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES sga_usuarios(id) ON DELETE RESTRICT,
    usuario_nombre VARCHAR(150) NOT NULL,
    usuario_email VARCHAR(128) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    fecha_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modulo VARCHAR(32) NOT NULL CHECK (modulo IN ('AUTENTICACION', 'MATRICULAS', 'CALIFICACIONES', 'USUARIOS', 'ACADEMICO')),
    accion VARCHAR(64) NOT NULL,
    entidad_afectada VARCHAR(64) NOT NULL,
    registro_afectado_id VARCHAR(64) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB NOT NULL,
    justificacion TEXT
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON sga_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON sga_auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON sga_auditoria(fecha_utc DESC);

-- ============================================================================
-- SEED DATA NORMALIZADO (DATOS INICIALES DEL SGA)
-- ============================================================================

-- Roles
INSERT INTO sga_roles (id, nombre, descripcion) VALUES
('rol-admin', 'ADMINISTRADOR', 'Control total de plataforma, seguridad y auditoría'),
('rol-coord', 'COORDINADOR_ACADEMICO', 'Gestión curricular, asignaturas, docentes y apertura de grupos'),
('rol-docente', 'DOCENTE', 'Gestión de clases asignadas y registro de calificaciones'),
('rol-estudiante', 'ESTUDIANTE', 'Inscripción de asignaturas y consulta de resultados académicos')
ON CONFLICT (id) DO NOTHING;

-- Programas
INSERT INTO sga_programas (id, codigo_snies, nombre, nivel_academico, total_creditos, duracion_semestres) VALUES
('prog-sis', '10421', 'Ingeniería de Sistemas', 'PREGRADO', 160, 10),
('prog-adm', '10188', 'Administración de Empresas', 'PREGRADO', 145, 9)
ON CONFLICT (id) DO NOTHING;

-- Usuarios Iniciales
INSERT INTO sga_usuarios (id, email, password_hash, nombre_completo, rol_id, avatar_url, is_active) VALUES
('usr-est-01', 'sofia.morales@cun.edu.co', '$argon2id$v=19$m=65536,t=3,p=4$sofia123', 'Sofía Morales Salazar', 'rol-estudiante', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
('usr-doc-01', 'carlos.mendivelso@cun.edu.co', '$argon2id$v=19$m=65536,t=3,p=4$carlos123', 'Dr. Carlos Mendivelso', 'rol-docente', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
('usr-coord-01', 'andres.valenzuela@cun.edu.co', '$argon2id$v=19$m=65536,t=3,p=4$andres123', 'Ing. Andrés Valenzuela', 'rol-coord', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true),
('usr-admin-01', 'elena.rojas@cun.edu.co', '$argon2id$v=19$m=65536,t=3,p=4$elena123', 'Mg. Elena Rojas', 'rol-admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', true)
ON CONFLICT (id) DO NOTHING;

-- Docentes
INSERT INTO sga_docentes (id, usuario_id, documento_identidad, nombres, apellidos, titulo_academico, departamento, is_active) VALUES
('doc-01', 'usr-doc-01', '79843219', 'Carlos', 'Mendivelso', 'Ph.D. en Ciencias de la Computación', 'Ingeniería de Software & Sistemas', true)
ON CONFLICT (id) DO NOTHING;

-- Estudiantes
INSERT INTO sga_estudiantes (id, usuario_id, codigo_estudiantil, documento_identidad, nombres, apellidos, programa_id, semestre_actual, promedio_acumulado, creditos_aprobados, total_creditos, estado) VALUES
('est-01', 'usr-est-01', 'EST-2024-001', '1020847291', 'Sofía', 'Morales Salazar', 'prog-sis', 5, 4.42, 78, 160, 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- Periodo Académico
INSERT INTO sga_periodos_academicos (id, codigo, nombre, fecha_inicio, fecha_fin, fecha_limite_matricula, fecha_cierre_notas, estado) VALUES
('per-2026-1', '2026-1', 'Primer Periodo Académico 2026', '2026-02-02', '2026-06-15', '2026-02-28', '2026-06-20', 'ABIERTO')
ON CONFLICT (id) DO NOTHING;

-- Asignaturas
INSERT INTO sga_asignaturas (id, programa_id, codigo, nombre, creditos, semestre_nivel, prerrequisitos) VALUES
('asig-is301', 'prog-sis', 'IS-301', 'Ingeniería de Software', 4, 5, ARRAY['IS-204']),
('asig-is302', 'prog-sis', 'IS-302', 'Arquitectura de Bases de Datos', 3, 5, ARRAY['IS-202']),
('asig-is303', 'prog-sis', 'IS-303', 'Redes y Comunicaciones', 3, 5, ARRAY['IS-203']),
('asig-is304', 'prog-sis', 'IS-304', 'Sistemas Operativos Distribuidos', 3, 5, ARRAY['IS-201']),
('asig-is305', 'prog-sis', 'IS-305', 'Inteligencia Artificial Aplicada', 3, 6, ARRAY['IS-301']),
('asig-is306', 'prog-sis', 'IS-306', 'Seguridad y Criptografía', 3, 6, ARRAY['IS-303'])
ON CONFLICT (id) DO NOTHING;

-- Grupos con Franjas Horarias
INSERT INTO sga_grupos (id, asignatura_id, periodo_id, docente_id, numero_grupo, cupo_maximo, cupo_disponible, dias_horario, aula_o_enlace, version_lock) VALUES
('grp-01', 'asig-is301', 'per-2026-1', 'doc-01', 'G1', 25, 4, 'Lunes y Miércoles 08:00 - 10:00', 'Edificio Central - Aula B-204', 21),
('grp-02', 'asig-is302', 'per-2026-1', 'doc-01', 'G1', 20, 2, 'Martes y Jueves 10:00 - 12:00', 'Laboratorio de Cómputo 3', 18),
('grp-04', 'asig-is304', 'per-2026-1', 'doc-01', 'G1', 25, 12, 'Lunes y Miércoles 14:00 - 16:00', 'Edificio Central - Aula C-102', 13),
('grp-05', 'asig-is305', 'per-2026-1', 'doc-01', 'G1', 30, 15, 'Martes y Jueves 16:00 - 18:00', 'Sala Virtual Sincrónica (Meet)', 15)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FIN DEL ESQUEMA DDL POSTGRESQL 16
-- ============================================================================
