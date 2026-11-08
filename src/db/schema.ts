/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Definición del Esquema Relacional de Base de Datos SQL (PostgreSQL / Drizzle ORM)
 * Conforme a la Sección 6.4 del SGA: Modela las 11 entidades en Tercera Forma Normal (3FN).
 */

export interface SqlColumnDef {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  isNullable?: boolean;
  description: string;
}

export interface SqlTableDef {
  tableName: string;
  entityName: string;
  description: string;
  columns: SqlColumnDef[];
}

export const SGA_SQL_TABLES: SqlTableDef[] = [
  {
    tableName: 'sga_roles',
    entityName: 'Rol (RF-02)',
    description: 'Catálogo institucional de roles para la matriz de control de acceso RBAC.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'Identificador único del rol (PK)' },
      { name: 'nombre', type: 'VARCHAR(50)', isNullable: false, description: 'Nombre formal del rol (ADMINISTRADOR, DOCENTE, etc.)' },
      { name: 'descripcion', type: 'TEXT', isNullable: false, description: 'Alcance y funciones autorizadas' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, description: 'Fecha de creación en BD' },
    ],
  },
  {
    tableName: 'sga_usuarios',
    entityName: 'Usuario (RF-01)',
    description: 'Credenciales de acceso, hashes de contraseñas y vinculación de rol.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, isNullable: false, description: 'Identificador único de usuario (PK)' },
      { name: 'email', type: 'VARCHAR(128)', isNullable: false, description: 'Correo institucional único' },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: false, description: 'Hash seguro de contraseña (Argon2id)' },
      { name: 'nombre_completo', type: 'VARCHAR(150)', isNullable: false, description: 'Nombres y apellidos completos' },
      { name: 'rol_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_roles', isNullable: false, description: 'Clave foránea hacia sga_roles' },
      { name: 'avatar_url', type: 'TEXT', isNullable: true, description: 'URL de imagen de perfil' },
      { name: 'is_active', type: 'BOOLEAN', isNullable: false, description: 'Bandera de estado de cuenta' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, description: 'Timestamp de creación' },
    ],
  },
  {
    tableName: 'sga_programas',
    entityName: 'Programa Académico (RF-05)',
    description: 'Programas de pregrado y posgrado ofrecidos por la universidad.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'Código interno del programa' },
      { name: 'codigo_snies', type: 'VARCHAR(20)', isNullable: false, description: 'Código del Ministerio de Educación' },
      { name: 'nombre', type: 'VARCHAR(150)', isNullable: false, description: 'Nombre de la carrera' },
      { name: 'nivel_academico', type: 'VARCHAR(30)', isNullable: false, description: 'PREGRADO, POSGRADO o MAESTRÍA' },
      { name: 'total_creditos', type: 'INT', isNullable: false, description: 'Total de créditos del plan de estudios' },
      { name: 'duracion_semestres', type: 'INT', isNullable: false, description: 'Número de semestres estándar' },
    ],
  },
  {
    tableName: 'sga_docentes',
    entityName: 'Docente (RF-04)',
    description: 'Profesores titulares, adscripción departamental y títulos académicos.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID de docente (PK)' },
      { name: 'usuario_id', type: 'VARCHAR(64)', isForeignKey: true, referencesTable: 'sga_usuarios', isNullable: false, description: 'FK a sga_usuarios' },
      { name: 'documento_identidad', type: 'VARCHAR(20)', isNullable: false, description: 'Cédula de ciudadanía única' },
      { name: 'nombres', type: 'VARCHAR(100)', isNullable: false, description: 'Nombres del docente' },
      { name: 'apellidos', type: 'VARCHAR(100)', isNullable: false, description: 'Apellidos del docente' },
      { name: 'titulo_academico', type: 'VARCHAR(150)', isNullable: false, description: 'Máximo grado académico (M.Sc., Ph.D.)' },
      { name: 'departamento', type: 'VARCHAR(150)', isNullable: false, description: 'Departamento académico' },
      { name: 'is_active', type: 'BOOLEAN', isNullable: false, description: 'Estado activo o inactivo' },
    ],
  },
  {
    tableName: 'sga_estudiantes',
    entityName: 'Estudiante (RF-03)',
    description: 'Expediente académico, promedio acumulado y avance crediticio.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID del estudiante (PK)' },
      { name: 'usuario_id', type: 'VARCHAR(64)', isForeignKey: true, referencesTable: 'sga_usuarios', isNullable: false, description: 'FK a sga_usuarios' },
      { name: 'codigo_estudiantil', type: 'VARCHAR(20)', isNullable: false, description: 'Matrícula institucional única' },
      { name: 'documento_identidad', type: 'VARCHAR(20)', isNullable: false, description: 'Documento nacional de identidad' },
      { name: 'nombres', type: 'VARCHAR(100)', isNullable: false, description: 'Nombres del estudiante' },
      { name: 'apellidos', type: 'VARCHAR(100)', isNullable: false, description: 'Apellidos del estudiante' },
      { name: 'programa_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_programas', isNullable: false, description: 'FK a sga_programas' },
      { name: 'semestre_actual', type: 'INT', isNullable: false, description: 'Nivel semestral en curso' },
      { name: 'promedio_acumulado', type: 'NUMERIC(3,2)', isNullable: false, description: 'Ponderado histórico (0.00 - 5.00)' },
      { name: 'creditos_aprobados', type: 'INT', isNullable: false, description: 'Créditos superados exitosamente' },
      { name: 'total_creditos', type: 'INT', isNullable: false, description: 'Total de créditos del programa' },
      { name: 'estado', type: 'VARCHAR(20)', isNullable: false, description: 'ACTIVO, INACTIVO, GRADUADO' },
    ],
  },
  {
    tableName: 'sga_periodos_academicos',
    entityName: 'Periodo Académico (RF-06)',
    description: 'Ciclos lectivos con fechas de corte de matrícula y notas.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID del periodo (PK)' },
      { name: 'codigo', type: 'VARCHAR(20)', isNullable: false, description: 'Código formal (ej. 2026-1)' },
      { name: 'nombre', type: 'VARCHAR(100)', isNullable: false, description: 'Denominación descriptiva' },
      { name: 'fecha_inicio', type: 'DATE', isNullable: false, description: 'Inicio de clases' },
      { name: 'fecha_fin', type: 'DATE', isNullable: false, description: 'Fin de semestre' },
      { name: 'fecha_limite_matricula', type: 'DATE', isNullable: false, description: 'Cierre de adiciones y cancelaciones' },
      { name: 'fecha_cierre_notas', type: 'DATE', isNullable: false, description: 'Fecha máxima para actas' },
      { name: 'estado', type: 'VARCHAR(20)', isNullable: false, description: 'PLANIFICACION, ABIERTO, CERRADO' },
    ],
  },
  {
    tableName: 'sga_asignaturas',
    entityName: 'Asignatura (RF-05)',
    description: 'Materia o curso que forma parte de la estructura curricular.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID de la asignatura (PK)' },
      { name: 'programa_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_programas', isNullable: false, description: 'FK a sga_programas' },
      { name: 'codigo', type: 'VARCHAR(20)', isNullable: false, description: 'Código académico único (ej. IS-301)' },
      { name: 'nombre', type: 'VARCHAR(150)', isNullable: false, description: 'Nombre formal de la materia' },
      { name: 'creditos', type: 'INT', isNullable: false, description: 'Unidades de crédito académico' },
      { name: 'semestre_nivel', type: 'INT', isNullable: false, description: 'Ubicación en la malla (1-10)' },
      { name: 'prerrequisitos', type: 'TEXT[]', isNullable: false, description: 'Array de códigos prerrequisito' },
    ],
  },
  {
    tableName: 'sga_grupos',
    entityName: 'Grupo Académico (RF-06)',
    description: 'Aperturas de clase con franja horaria, aula, docente y cupo.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID del grupo (PK)' },
      { name: 'asignatura_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_asignaturas', isNullable: false, description: 'FK a sga_asignaturas' },
      { name: 'periodo_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_periodos_academicos', isNullable: false, description: 'FK a sga_periodos_academicos' },
      { name: 'docente_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_docentes', isNullable: false, description: 'FK a sga_docentes' },
      { name: 'numero_grupo', type: 'VARCHAR(10)', isNullable: false, description: 'Número de sección (G1, G2)' },
      { name: 'cupo_maximo', type: 'INT', isNullable: false, description: 'Capacidad máxima de alumnos' },
      { name: 'cupo_disponible', type: 'INT', isNullable: false, description: 'Cupos vacantes en tiempo real' },
      { name: 'dias_horario', type: 'VARCHAR(100)', isNullable: false, description: 'Franja y días (ej. Lunes 08:00-10:00)' },
      { name: 'aula_o_enlace', type: 'VARCHAR(150)', isNullable: false, description: 'Aula física o URL Meet' },
      { name: 'version_lock', type: 'INT', isNullable: false, description: 'Versión de bloqueo optimista ACID' },
    ],
  },
  {
    tableName: 'sga_matriculas',
    entityName: 'Matrícula (RF-07)',
    description: 'Cabecera de registro transaccional de inscripción de asignaturas.',
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true, isNullable: false, description: 'ID de la matrícula (PK)' },
      { name: 'estudiante_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_estudiantes', isNullable: false, description: 'FK a sga_estudiantes' },
      { name: 'periodo_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_periodos_academicos', isNullable: false, description: 'FK a sga_periodos_academicos' },
      { name: 'codigo_comprobante', type: 'VARCHAR(50)', isNullable: false, description: 'Comprobante oficial inmutable' },
      { name: 'fecha_matricula', type: 'TIMESTAMPTZ', isNullable: false, description: 'Fecha de transacción ACID' },
      { name: 'total_creditos', type: 'INT', isNullable: false, description: 'Suma de créditos matriculados' },
      { name: 'estado', type: 'VARCHAR(20)', isNullable: false, description: 'ASENTADA o CANCELADA' },
    ],
  },
  {
    tableName: 'sga_matricula_detalles',
    entityName: 'Detalle de Matrícula (RF-07 / RF-08)',
    description: 'Cursos inscritos con notas por corte (30%, 30%, 40%) y definitiva.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, isNullable: false, description: 'ID del detalle (PK)' },
      { name: 'matricula_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_matriculas', isNullable: false, description: 'FK a sga_matriculas' },
      { name: 'grupo_id', type: 'VARCHAR(32)', isForeignKey: true, referencesTable: 'sga_grupos', isNullable: false, description: 'FK a sga_grupos' },
      { name: 'creditos', type: 'INT', isNullable: false, description: 'Créditos adjudicados' },
      { name: 'estado', type: 'VARCHAR(20)', isNullable: false, description: 'ASENTADA o CANCELADA' },
      { name: 'corte1', type: 'NUMERIC(3,2)', isNullable: true, description: 'Primer corte (30%)' },
      { name: 'corte2', type: 'NUMERIC(3,2)', isNullable: true, description: 'Segundo corte (30%)' },
      { name: 'corte3', type: 'NUMERIC(3,2)', isNullable: true, description: 'Examen final (40%)' },
      { name: 'nota_definitiva', type: 'NUMERIC(3,2)', isNullable: true, description: 'Promedio ponderado en BD' },
    ],
  },
  {
    tableName: 'sga_auditoria',
    entityName: 'Auditoría (RF-12, RNF-10)',
    description: 'Bitácora inmutable append-only con deltas JSONB para cumplimiento normativo.',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPrimary: true, isNullable: false, description: 'Secuencia autoincremental (PK)' },
      { name: 'usuario_id', type: 'VARCHAR(64)', isForeignKey: true, referencesTable: 'sga_usuarios', isNullable: false, description: 'FK a sga_usuarios' },
      { name: 'usuario_nombre', type: 'VARCHAR(150)', isNullable: false, description: 'Nombre del autor del cambio' },
      { name: 'usuario_email', type: 'VARCHAR(128)', isNullable: false, description: 'Email del autor' },
      { name: 'ip_origen', type: 'VARCHAR(45)', isNullable: false, description: 'Dirección IP de origen' },
      { name: 'fecha_utc', type: 'TIMESTAMPTZ', isNullable: false, description: 'Timestamp UTC inmutable' },
      { name: 'modulo', type: 'VARCHAR(32)', isNullable: false, description: 'AUTENTICACION, MATRICULAS, NOTAS' },
      { name: 'accion', type: 'VARCHAR(64)', isNullable: false, description: 'Operación ejecutada' },
      { name: 'entidad_afectada', type: 'VARCHAR(64)', isNullable: false, description: 'Nombre de la tabla afectada' },
      { name: 'registro_afectado_id', type: 'VARCHAR(64)', isNullable: false, description: 'ID de la fila impactada' },
      { name: 'datos_anteriores', type: 'JSONB', isNullable: true, description: 'Snapshot previo (deltas)' },
      { name: 'datos_nuevos', type: 'JSONB', isNullable: false, description: 'Snapshot posterior' },
      { name: 'justificacion', type: 'TEXT', isNullable: true, description: 'Motivo formal del cambio' },
    ],
  },
];
