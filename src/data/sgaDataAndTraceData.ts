/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Documento de Arquitectura de Software: Sistema de Gestión Académica (SGA)
 * Secciones 6.4, 6.5 y 6.6
 * - 6.4: Modelo Conceptual de Datos (Entidades, Atributos, Cardinalidades y Diagrama ER)
 * - 6.5: Vista de Secuencia (Flujo Transaccional de Matrícula ACID con Bloqueo de Cupo y Auditoría)
 * - 6.6: Matriz de Trazabilidad Completa (RF-01..12 y RNF-01..12 vs Módulos, Modelos y Evidencias)
 */

export interface EntidadDatos {
  nombre: string;
  tablaSql: string;
  descripcion: string;
  clavePrimaria: string;
  clavesForaneas: string[];
  atributos: { nombre: string; tipo: string; nulable: boolean; descripcion: string }[];
  cardinalidades: string[];
  reglasIntegridad: string[];
}

export interface PasoSecuencia {
  orden: number;
  origen: string;
  destino: string;
  mensaje: string;
  tipo: 'sync' | 'async' | 'return' | 'alt' | 'opt';
  detalleTecnico: string;
}

export interface FilaTrazabilidadCompleta {
  codigo: string;
  tipo: 'RF' | 'RNF';
  nombre: string;
  componenteModulo: string;
  modeloAsociado: string;
  metodoEvidencia: string;
  criterioAceptacion: string;
}

export const ENTIDADES_CONCEPTUALES: EntidadDatos[] = [
  {
    nombre: 'Usuario',
    tablaSql: 'sga_usuario',
    descripcion: 'Entidad central de identidad institucional y credenciales de acceso al sistema (RF-01).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['rol_id -> sga_rol.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único universal del usuario.' },
      { nombre: 'email_institucional', tipo: 'VARCHAR(150)', nulable: false, descripcion: 'Correo institucional único (UNIQUE INDEX).' },
      { nombre: 'password_hash', tipo: 'VARCHAR(255)', nulable: false, descripcion: 'Hash criptográfico derivado con Argon2id (RNF-01).' },
      { nombre: 'rol_id', tipo: 'UUID', nulable: false, descripcion: 'Referencia foránea al rol RBAC asignado.' },
      { nombre: 'is_active', tipo: 'BOOLEAN', nulable: false, descripcion: 'Estado operativo para habilitar/suspender accesos.' },
      { nombre: 'created_at', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Marca temporal de creación en UTC.' },
      { nombre: 'updated_at', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Marca temporal de última modificación.' }
    ],
    cardinalidades: [
      'Usuario (N) : (1) Rol',
      'Usuario (1) : (0..1) Estudiante',
      'Usuario (1) : (0..1) Docente',
      'Usuario (1) : (N) AuditLog'
    ],
    reglasIntegridad: ['Unicidad estricta en email_institucional', 'Borrado lógico para preservar auditoría']
  },
  {
    nombre: 'Rol',
    tablaSql: 'sga_rol',
    descripcion: 'Definición de perfiles de control de acceso basado en roles (RBAC) (RF-02).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: [],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único del rol.' },
      { nombre: 'codigo_rol', tipo: 'VARCHAR(50)', nulable: false, descripcion: 'Clave técnica (ROLE_ADMIN, ROLE_COORDINADOR, ROLE_DOCENTE, ROLE_ESTUDIANTE).' },
      { nombre: 'nombre', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Nombre descriptivo del rol.' },
      { nombre: 'permisos_json', tipo: 'JSONB', nulable: false, descripcion: 'Matriz granular de permisos y scopes autorizados.' }
    ],
    cardinalidades: [
      'Rol (1) : (N) Usuario'
    ],
    reglasIntegridad: ['codigo_rol inmutable y único', 'Principio de menor privilegio (RNF-11)']
  },
  {
    nombre: 'Estudiante',
    tablaSql: 'sga_estudiante',
    descripcion: 'Expediente académico maestro del alumno adscrito a un programa institucional (RF-03).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['usuario_id -> sga_usuario.id', 'programa_id -> sga_programa.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador primario del estudiante.' },
      { nombre: 'usuario_id', tipo: 'UUID', nulable: false, descripcion: 'Vínculo 1:1 con la cuenta de acceso.' },
      { nombre: 'codigo_estudiantil', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'Código de matrícula institucional único.' },
      { nombre: 'programa_id', tipo: 'UUID', nulable: false, descripcion: 'Programa académico que cursa.' },
      { nombre: 'nombres', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Nombres completos del estudiante.' },
      { nombre: 'apellidos', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Apellidos completos.' },
      { nombre: 'estado_academico', tipo: 'VARCHAR(30)', nulable: false, descripcion: 'Estado: ACTIVO, INACTIVO, GRADUADO, SUSPENDIDO.' },
      { nombre: 'semestre_actual', tipo: 'SMALLINT', nulable: false, descripcion: 'Nivel semestral que cursa actualmente.' }
    ],
    cardinalidades: [
      'Estudiante (1) : (1) Usuario',
      'Estudiante (N) : (1) Programa',
      'Estudiante (1) : (N) Matricula'
    ],
    reglasIntegridad: ['codigo_estudiantil único', 'Aislamiento de acceso (un estudiante solo ve sus notas, RNF-11)']
  },
  {
    nombre: 'Docente',
    tablaSql: 'sga_docente',
    descripcion: 'Expediente de la planta profesoral con sus cualificaciones y vinculación (RF-04).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['usuario_id -> sga_usuario.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único del profesor.' },
      { nombre: 'usuario_id', tipo: 'UUID', nulable: false, descripcion: 'Vínculo 1:1 con la cuenta de usuario.' },
      { nombre: 'documento_identidad', tipo: 'VARCHAR(30)', nulable: false, descripcion: 'Documento legal de identidad.' },
      { nombre: 'nombres', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Nombres del docente.' },
      { nombre: 'apellidos', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Apellidos del docente.' },
      { nombre: 'especialidad', tipo: 'VARCHAR(150)', nulable: false, descripcion: 'Área académica de especialización.' },
      { nombre: 'estado', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'ACTIVO o INACTIVO.' }
    ],
    cardinalidades: [
      'Docente (1) : (1) Usuario',
      'Docente (1) : (N) Grupo'
    ],
    reglasIntegridad: ['documento_identidad único', 'Solo docentes activos pueden tener asignación de grupos']
  },
  {
    nombre: 'Programa',
    tablaSql: 'sga_programa',
    descripcion: 'Programa académico o carrera profesional ofertada por la institución (RF-05).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: [],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único del programa.' },
      { nombre: 'codigo_programa', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'Código institucional (ej. ING-SIS).' },
      { nombre: 'nombre', tipo: 'VARCHAR(150)', nulable: false, descripcion: 'Nombre del programa académico.' },
      { nombre: 'nivel_formacion', tipo: 'VARCHAR(50)', nulable: false, descripcion: 'PREGRADO, POSGRADO, TECNOLOGÍA.' },
      { nombre: 'total_creditos', tipo: 'SMALLINT', nulable: false, descripcion: 'Créditos totales para titulación.' }
    ],
    cardinalidades: [
      'Programa (1) : (N) Estudiante',
      'Programa (1) : (N) Asignatura'
    ],
    reglasIntegridad: ['codigo_programa único']
  },
  {
    nombre: 'Asignatura',
    tablaSql: 'sga_asignatura',
    descripcion: 'Materia o unidad curricular con créditos y reglas de prerrequisitos (RF-05).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['programa_id -> sga_programa.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador de la asignatura.' },
      { nombre: 'programa_id', tipo: 'UUID', nulable: false, descripcion: 'Programa curricular al que pertenece.' },
      { nombre: 'codigo_asignatura', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'Código curricular (ej. MAT-101).' },
      { nombre: 'nombre', tipo: 'VARCHAR(150)', nulable: false, descripcion: 'Nombre de la materia.' },
      { nombre: 'creditos', tipo: 'SMALLINT', nulable: false, descripcion: 'Número de créditos académicos.' },
      { nombre: 'semestre_nivel', tipo: 'SMALLINT', nulable: false, descripcion: 'Semestre en la malla curricular.' },
      { nombre: 'prerrequisitos_ids', tipo: 'UUID[]', nulable: true, descripcion: 'Lista de IDs de asignaturas prerrequisito (DAG).' }
    ],
    cardinalidades: [
      'Asignatura (N) : (1) Programa',
      'Asignatura (1) : (N) Grupo',
      'Asignatura (N) : (M) Asignatura (Prerrequisitos DAG)'
    ],
    reglasIntegridad: ['No ciclos en prerrequisitos (Grafo Dirigido Acíclico)', 'Créditos entre 1 y 8']
  },
  {
    nombre: 'PeriodoAcademico',
    tablaSql: 'sga_periodo_academico',
    descripcion: 'Ciclo lectivo institucional con calendario y fechas de matrícula y notas (RF-06).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: [],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único del periodo.' },
      { nombre: 'codigo_periodo', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'Código (ej. 2026-1).' },
      { nombre: 'fecha_inicio', tipo: 'DATE', nulable: false, descripcion: 'Inicio de clases.' },
      { nombre: 'fecha_fin', tipo: 'DATE', nulable: false, descripcion: 'Finalización de clases.' },
      { nombre: 'matricula_abierta', tipo: 'BOOLEAN', nulable: false, descripcion: 'Bandera que habilita inscripciones.' },
      { nombre: 'cierre_calificaciones', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Fecha/hora límite para que docentes publiquen notas.' }
    ],
    cardinalidades: [
      'PeriodoAcademico (1) : (N) Grupo',
      'PeriodoAcademico (1) : (N) Matricula'
    ],
    reglasIntegridad: ['fecha_fin > fecha_inicio', 'Solo un periodo ordinario activo para matrícula a la vez']
  },
  {
    nombre: 'Grupo',
    tablaSql: 'sga_grupo',
    descripcion: 'Oferta de curso en un periodo con cupo disponible, docente, aula y franja horaria (RF-06, RF-07).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['asignatura_id -> sga_asignatura.id', 'periodo_id -> sga_periodo_academico.id', 'docente_id -> sga_docente.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único del grupo.' },
      { nombre: 'asignatura_id', tipo: 'UUID', nulable: false, descripcion: 'Asignatura que se imparte.' },
      { nombre: 'periodo_id', tipo: 'UUID', nulable: false, descripcion: 'Periodo lectivo correspondiente.' },
      { nombre: 'docente_id', tipo: 'UUID', nulable: false, descripcion: 'Docente titular asignado.' },
      { nombre: 'codigo_grupo', tipo: 'VARCHAR(10)', nulable: false, descripcion: 'Nombre del grupo (ej. G1, G2).' },
      { nombre: 'cupo_maximo', tipo: 'INTEGER', nulable: false, descripcion: 'Aforo máximo reglamentario.' },
      { nombre: 'cupo_disponible', tipo: 'INTEGER', nulable: false, descripcion: 'Cupo libre en tiempo real (bloqueado en matrícula).' },
      { nombre: 'horario_json', tipo: 'JSONB', nulable: false, descripcion: 'Días, horas de inicio/fin y aulas asignadas.' },
      { nombre: 'version_lock', tipo: 'INTEGER', nulable: false, descripcion: 'Token de concurrencia optimista (Optimistic Lock).' }
    ],
    cardinalidades: [
      'Grupo (N) : (1) Asignatura',
      'Grupo (N) : (1) PeriodoAcademico',
      'Grupo (N) : (1) Docente',
      'Grupo (1) : (N) MatriculaDetalle'
    ],
    reglasIntegridad: ['cupo_disponible >= 0 (CHECK constraint en BD)', 'Sin solapamiento de horarios en la misma aula']
  },
  {
    nombre: 'Matricula',
    tablaSql: 'sga_matricula',
    descripcion: 'Cabecera de formalización de la inscripción de asignaturas de un estudiante (RF-07).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['estudiante_id -> sga_estudiante.id', 'periodo_id -> sga_periodo_academico.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único de la matrícula.' },
      { nombre: 'estudiante_id', tipo: 'UUID', nulable: false, descripcion: 'Estudiante matriculado.' },
      { nombre: 'periodo_id', tipo: 'UUID', nulable: false, descripcion: 'Periodo académico de la matrícula.' },
      { nombre: 'codigo_comprobante', tipo: 'VARCHAR(64)', nulable: false, descripcion: 'Hash criptográfico único de confirmación.' },
      { nombre: 'total_creditos', tipo: 'SMALLINT', nulable: false, descripcion: 'Suma de créditos inscritos.' },
      { nombre: 'estado', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'ASENTADA, ANULADA, EN_TRAMITE.' },
      { nombre: 'fecha_asentamiento', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Timestamp UTC exacto del commit.' }
    ],
    cardinalidades: [
      'Matricula (N) : (1) Estudiante',
      'Matricula (N) : (1) PeriodoAcademico',
      'Matricula (1) : (N) MatriculaDetalle'
    ],
    reglasIntegridad: ['UNIQUE (estudiante_id, periodo_id): Evita matrículas duplicadas (RF-07)', 'Créditos entre 8 y 20']
  },
  {
    nombre: 'Calificacion',
    tablaSql: 'sga_calificacion',
    descripcion: 'Registro cuantitativo de notas parciales y finales con trazabilidad y porcentaje (RF-08).',
    clavePrimaria: 'id (UUID)',
    clavesForaneas: ['matricula_detalle_id -> sga_matricula_detalle.id', 'docente_id -> sga_docente.id'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador único de la calificación.' },
      { nombre: 'matricula_detalle_id', tipo: 'UUID', nulable: false, descripcion: 'Detalle de la asignatura matriculada.' },
      { nombre: 'corte_evaluativo', tipo: 'SMALLINT', nulable: false, descripcion: 'Corte (1: 30%, 2: 30%, 3: 40%).' },
      { nombre: 'porcentaje', tipo: 'NUMERIC(5,2)', nulable: false, descripcion: 'Ponderación en la nota final.' },
      { nombre: 'valor_nota', tipo: 'NUMERIC(3,2)', nulable: false, descripcion: 'Valor numérico de 0.00 a 5.00.' },
      { nombre: 'estado', tipo: 'VARCHAR(20)', nulable: false, descripcion: 'BORRADOR, PUBLICADA, RECTIFICADA.' },
      { nombre: 'docente_id', tipo: 'UUID', nulable: false, descripcion: 'Profesor que asentó la nota.' },
      { nombre: 'fecha_registro', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Timestamp UTC de registro.' }
    ],
    cardinalidades: [
      'Calificacion (N) : (1) MatriculaDetalle',
      'Calificacion (N) : (1) Docente'
    ],
    reglasIntegridad: ['valor_nota BETWEEN 0.0 AND 5.0 (CHECK constraint)', 'Suma de porcentajes por grupo = 100.0%']
  },
  {
    nombre: 'AuditLog',
    tablaSql: 'sga_auditoria',
    descripcion: 'Bitácora inmutable append-only de eventos críticos, seguridad y cambios de notas (RF-12).',
    clavePrimaria: 'id (BIGSERIAL / UUIDv7)',
    clavesForaneas: ['usuario_id -> sga_usuario.id (opcional para intentos anónimos)'],
    atributos: [
      { nombre: 'id', tipo: 'UUID', nulable: false, descripcion: 'Identificador secuencial/temporal inmutable.' },
      { nombre: 'usuario_id', tipo: 'UUID', nulable: true, descripcion: 'Usuario responsable de la acción.' },
      { nombre: 'rol_ejecutor', tipo: 'VARCHAR(50)', nulable: true, descripcion: 'Rol activo durante la operación.' },
      { nombre: 'ip_origen', tipo: 'INET', nulable: false, descripcion: 'Dirección IP del cliente.' },
      { nombre: 'accion', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'LOGIN, ENROLLMENT_COMMIT, GRADE_UPDATE, ROLE_MUTATION.' },
      { nombre: 'entidad_afectada', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'Nombre de la tabla modificada.' },
      { nombre: 'registro_id', tipo: 'VARCHAR(100)', nulable: false, descripcion: 'ID del registro objeto del cambio.' },
      { nombre: 'valores_anteriores', tipo: 'JSONB', nulable: true, descripcion: 'Snapshot previo de los datos (diferencial).' },
      { nombre: 'valores_nuevos', tipo: 'JSONB', nulable: true, descripcion: 'Snapshot posterior de los datos.' },
      { nombre: 'justificacion', tipo: 'TEXT', nulable: true, descripcion: 'Motivo explícito para cambios de notas o excepciones.' },
      { nombre: 'fecha_utc', tipo: 'TIMESTAMPTZ', nulable: false, descripcion: 'Timestamp UTC inmutable generado en servidor.' }
    ],
    cardinalidades: [
      'AuditLog (N) : (0..1) Usuario'
    ],
    reglasIntegridad: ['INSERT ONLY: Denegados UPDATE y DELETE por reglas de base de datos', 'Retención WORM 5 años']
  }
];

export const PASOS_SECUENCIA_MATRICULA: PasoSecuencia[] = [
  { orden: 1, origen: 'Estudiante', destino: 'Frontend SPA', mensaje: '1. Selecciona grupos y pulsa "Confirmar Matrícula"', tipo: 'sync', detalleTecnico: 'Valida colisiones en cliente y arma payload CreateEnrollmentDTO con studentId, periodId y groupIds.' },
  { orden: 2, origen: 'Frontend SPA', destino: 'API Gateway', mensaje: '2. POST /api/v1/enrollments (HTTPS TLS 1.3)', tipo: 'sync', detalleTecnico: 'Envía credenciales Bearer JWT en encabezado Authorization y X-Correlation-ID.' },
  { orden: 3, origen: 'API Gateway', destino: 'SecurityContext', mensaje: '3. Validar token JWT & claims RBAC (ROLE_ESTUDIANTE)', tipo: 'sync', detalleTecnico: 'Verifica firma asimétrica y comprueba que token no esté revocado en Redis cache.' },
  { orden: 4, origen: 'API Gateway', destino: 'EnrollmentController', mensaje: '4. Enrutar petición saneada a controlador', tipo: 'sync', detalleTecnico: 'Valida DTO con JSON Schema antes de alcanzar la capa de dominio.' },
  { orden: 5, origen: 'EnrollmentController', destino: 'EnrollmentService', mensaje: '5. enrollStudent(command)', tipo: 'sync', detalleTecnico: 'Inicia orquestación transaccional con aislamiento Serializable/Repeatable Read.' },
  { orden: 6, origen: 'EnrollmentService', destino: 'TransactionManager', mensaje: '6. beginTransaction(Isolation: SERIALIZABLE)', tipo: 'sync', detalleTecnico: 'Adquiere conexión exclusiva del pool Hikari con timeout de 3 segundos.' },
  { orden: 7, origen: 'EnrollmentService', destino: 'EnrollmentRepository', mensaje: '7. checkDuplicate(studentId, periodId)', tipo: 'sync', detalleTecnico: 'Verifica restricción de unicidad RN-MAT-01 para evitar dobles matrículas.' },
  { orden: 8, origen: 'EnrollmentService', destino: 'CourseGroupRepository', mensaje: '8. lockGroupAndValidateCupo(groupId) [SELECT ... FOR UPDATE]', tipo: 'sync', detalleTecnico: 'Bloqueo pesimista de fila a nivel de BD para aislar la lectura del cupo contra condiciones de carrera.' },
  { orden: 9, origen: 'CourseGroupRepository', destino: 'EnrollmentService', mensaje: '9. Retorna cupo_disponible actual (> 0)', tipo: 'return', detalleTecnico: 'Si cupo <= 0, dispara OutOfStockCupoException forzando Rollback total.' },
  { orden: 10, origen: 'EnrollmentService', destino: 'CourseGroupRepository', mensaje: '10. decrementCupo(groupId, -1)', tipo: 'sync', detalleTecnico: 'Decremento atómico del cupo en la misma transacción: cupo_disponible = cupo_disponible - 1.' },
  { orden: 11, origen: 'EnrollmentService', destino: 'EnrollmentRepository', mensaje: '11. insertEnrollmentAndDetails(matricula, detalles)', tipo: 'sync', detalleTecnico: 'Inserta fila maestra en sga_matricula y filas hijas en sga_matricula_detalle en estado ASENTADA.' },
  { orden: 12, origen: 'EnrollmentService', destino: 'TransactionManager', mensaje: '12. commitTransaction()', tipo: 'sync', detalleTecnico: 'Confirma atómicamente la transacción en PostgreSQL liberando los locks de cupos.' },
  { orden: 13, origen: 'EnrollmentService', destino: 'AuditService', mensaje: '13. publishAuditEvent(ENROLLMENT_SUCCESS) [Asíncrono]', tipo: 'async', detalleTecnico: 'Despacha evento de auditoría no bloqueante con studentId, groupIds y hash único.' },
  { orden: 14, origen: 'AuditService', destino: 'AuditRepository', mensaje: '14. insertAppendOnly(auditLog)', tipo: 'async', detalleTecnico: 'Persiste registro inmutable en sga_auditoria con IP, usuario y timestamp UTC.' },
  { orden: 15, origen: 'EnrollmentService', destino: 'EnrollmentController', mensaje: '15. Retorna EnrollmentConfirmationRecord', tipo: 'return', detalleTecnico: 'Objeto con id_matricula, código alfanumérico y resumen de horarios.' },
  { orden: 16, origen: 'EnrollmentController', destino: 'Frontend SPA', mensaje: '16. HTTP 201 Created (JSON Response)', tipo: 'return', detalleTecnico: 'Tiempo total de respuesta p95 <= 3.0s con 300 concurrentes (RNF-02).' },
  { orden: 17, origen: 'Frontend SPA', destino: 'Estudiante', mensaje: '17. Despliega Comprobante y Horario Confirmado', tipo: 'return', detalleTecnico: 'Muestra opción de descarga en PDF y actualiza vista de asignaturas.' }
];

export const CODIGO_MERMAID_ER = `erDiagram
    %% ========================================================
    %% MODELO CONCEPTUAL DE DATOS (ER) - SECCIÓN 6.4
    %% SISTEMA DE GESTIÓN ACADÉMICA (SGA)
    %% Conforme a RF-01 a RF-12 y RNF-07 (Integridad ACID)
    %% ========================================================

    USUARIO ||--o{ AUDIT_LOG : "genera"
    ROL ||--|{ USUARIO : "asigna_permisos_a"
    USUARIO ||--o| ESTUDIANTE : "pertenece_a"
    USUARIO ||--o| DOCENTE : "pertenece_a"

    PROGRAMA ||--|{ ESTUDIANTE : "matricula"
    PROGRAMA ||--|{ ASIGNATURA : "contiene"
    ASIGNATURA ||--o{ ASIGNATURA : "prerrequisito_de"

    ASIGNATURA ||--|{ GRUPO : "oferta"
    PERIODO_ACADEMICO ||--|{ GRUPO : "programa"
    DOCENTE ||--o{ GRUPO : "orienta"

    ESTUDIANTE ||--|{ MATRICULA : "formaliza"
    PERIODO_ACADEMICO ||--|{ MATRICULA : "corresponde_a"
    MATRICULA ||--|{ MATRICULA_DETALLE : "contiene"
    GRUPO ||--|{ MATRICULA_DETALLE : "recibe_inscripcion"

    MATRICULA_DETALLE ||--o{ CALIFICACION : "acumula"
    DOCENTE ||--o{ CALIFICACION : "asienta_y_firma"

    USUARIO {
        UUID id PK
        VARCHAR email_institucional UK
        VARCHAR password_hash
        UUID rol_id FK
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    ROL {
        UUID id PK
        VARCHAR codigo_rol UK
        VARCHAR nombre
        JSONB permisos_json
    }

    ESTUDIANTE {
        UUID id PK
        UUID usuario_id FK,UK
        VARCHAR codigo_estudiantil UK
        UUID programa_id FK
        VARCHAR nombres
        VARCHAR apellidos
        VARCHAR estado_academico
        SMALLINT semestre_actual
    }

    DOCENTE {
        UUID id PK
        UUID usuario_id FK,UK
        VARCHAR documento_identidad UK
        VARCHAR nombres
        VARCHAR apellidos
        VARCHAR especialidad
        VARCHAR estado
    }

    PROGRAMA {
        UUID id PK
        VARCHAR codigo_programa UK
        VARCHAR nombre
        VARCHAR nivel_formacion
        SMALLINT total_creditos
    }

    ASIGNATURA {
        UUID id PK
        UUID programa_id FK
        VARCHAR codigo_asignatura UK
        VARCHAR nombre
        SMALLINT creditos
        SMALLINT semestre_nivel
        UUID_ARRAY prerrequisitos_ids
    }

    PERIODO_ACADEMICO {
        UUID id PK
        VARCHAR codigo_periodo UK
        DATE fecha_inicio
        DATE fecha_fin
        BOOLEAN matricula_abierta
        TIMESTAMPTZ cierre_calificaciones
    }

    GRUPO {
        UUID id PK
        UUID asignatura_id FK
        UUID periodo_id FK
        UUID docente_id FK
        VARCHAR codigo_grupo
        INTEGER cupo_maximo
        INTEGER cupo_disponible
        JSONB horario_json
        INTEGER version_lock
    }

    MATRICULA {
        UUID id PK
        UUID estudiante_id FK
        UUID periodo_id FK
        VARCHAR codigo_comprobante UK
        SMALLINT total_creditos
        VARCHAR estado
        TIMESTAMPTZ fecha_asentamiento
    }

    MATRICULA_DETALLE {
        UUID id PK
        UUID matricula_id FK
        UUID grupo_id FK
        NUMERIC nota_definitiva
        VARCHAR estado_asignatura
    }

    CALIFICACION {
        UUID id PK
        UUID matricula_detalle_id FK
        SMALLINT corte_evaluativo
        NUMERIC porcentaje
        NUMERIC valor_nota
        VARCHAR estado
        UUID docente_id FK
        TIMESTAMPTZ fecha_registro
    }

    AUDIT_LOG {
        UUID id PK
        UUID usuario_id FK
        VARCHAR rol_ejecutor
        INET ip_origen
        VARCHAR accion
        VARCHAR entidad_afectada
        VARCHAR registro_id
        JSONB valores_anteriores
        JSONB valores_nuevos
        TEXT justificacion
        TIMESTAMPTZ fecha_utc
    }
`;

export const CODIGO_MERMAID_SECUENCIA = `sequenceDiagram
    %% ========================================================
    %% DIAGRAMA DE SECUENCIA FORMAL - SECCIÓN 6.5
    %% PROCESO TRANSACCIONAL DE MATRÍCULA DE UN ESTUDIANTE
    %% Conforme a RF-07, RNF-01, RNF-02 (p95 <= 3s) y RNF-07 (ACID)
    %% ========================================================

    autonumber
    actor Estudiante as fa:fa-user-graduate Estudiante
    participant SPA as fa:fa-desktop Frontend SPA
    participant GW as fa:fa-shield-halved API Gateway (WAF)
    participant SEC as fa:fa-key SecurityContext (JWT/RBAC)
    participant CTRL as fa:fa-server EnrollmentController
    participant SRV as fa:fa-gears EnrollmentService
    participant TX as fa:fa-database TransactionManager
    participant REPO_GRP as fa:fa-table CourseGroupRepo
    participant REPO_MAT as fa:fa-file-lines EnrollmentRepo
    participant AUDIT as fa:fa-clock-rotate-left AuditService (Async)

    Note over Estudiante,SPA: 1. Inicio de Autoservicio
    Estudiante->>SPA: Selecciona grupos y pulsa "Confirmar Matrícula"
    SPA->>GW: POST /api/v1/enrollments [Authorization: Bearer <JWT>]

    Note over GW,SEC: 2. Validación de Seguridad & RBAC
    GW->>SEC: Verificar token y rol ROLE_ESTUDIANTE
    SEC-->>GW: Token válido (sub: student_uuid, active: true)
    GW->>CTRL: Enrutar payload saneado (CreateEnrollmentDTO)
    CTRL->>SRV: enrollStudent(command)

    Note over SRV,TX: 3. Demarcación Transaccional ACID (RNF-07)
    SRV->>TX: beginTransaction(Isolation: SERIALIZABLE)
    TX-->>SRV: Conexión adquirida de pool Hikari

    SRV->>REPO_MAT: checkDuplicate(studentId, periodId)
    REPO_MAT-->>SRV: Sin matrícula previa en el periodo (RN-MAT-01 OK)

    critical Control de Concurrencia y Bloqueo de Cupo (RNF-07)
        SRV->>REPO_GRP: lockGroup(groupId) [SELECT cupo_disponible FROM grupo FOR UPDATE]
        REPO_GRP-->>SRV: cupo_disponible = 3 (Cupo libre > 0)
        
        alt Cupo Disponible > 0
            SRV->>REPO_GRP: decrementCupo(groupId, 1)
            REPO_GRP-->>SRV: Cupo actualizado a 2 (-1 unidad)
            SRV->>REPO_MAT: insertEnrollment(matricula, detalles)
            REPO_MAT-->>SRV: Filas creadas con estado ASENTADA
            SRV->>TX: commitTransaction()
            TX-->>SRV: Commit confirmado con éxito
        else Cupo Agotado (= 0)
            SRV->>TX: rollbackTransaction()
            TX-->>SRV: Rollback completado (Cero alteraciones)
            SRV-->>CTRL: Throw OutOfStockCupoException
            CTRL-->>SPA: HTTP 409 Conflict ("Cupo agotado en grupo")
            SPA-->>Estudiante: Alerta: "Seleccione otro grupo disponible"
        end
    end

    Note over SRV,AUDIT: 4. Auditoría Forense Asíncrona (RF-12, RNF-10)
    SRV-)AUDIT: publishEvent(ENROLLMENT_SUCCESS, details, hash)
    Note right of AUDIT: Se procesa en worker asíncrono<br/>sin bloquear al estudiante
    AUDIT-)AUDIT: insertAppendOnly en sga_auditoria

    Note over CTRL,Estudiante: 5. Respuesta en Tiempo Réplica (RNF-02 <= 3s)
    SRV-->>CTRL: EnrollmentResult (id, código_comprobante, horario)
    CTRL-->>SPA: HTTP 201 Created (EnrollmentConfirmationDTO)
    SPA-->>Estudiante: Despliega Comprobante y Horario Confirmado (PDF)
`;

export const MATRIZ_TRAZABILIDAD_COMPLETA: FilaTrazabilidadCompleta[] = [
  // REQUERIMIENTOS FUNCIONALES (RF-01 a RF-12)
  {
    codigo: 'RF-01',
    tipo: 'RF',
    nombre: 'Autenticación',
    componenteModulo: 'AuthController, AuthService, SecurityContext, UserRepository',
    modeloAsociado: 'Casos de Uso: UC-01 · Componentes: Capa 2 y 5 · Datos: sga_usuario',
    metodoEvidencia: 'Pruebas automatizadas de integración REST con credenciales válidas e inválidas, verificación de expiración de token JWT y prueba de hash con función Argon2id (cost factor 16).',
    criterioAceptacion: 'HTTP 200 con Bearer JWT ante credenciales válidas; HTTP 401 ante error; cero passwords en texto plano en la BD.'
  },
  {
    codigo: 'RF-02',
    tipo: 'RF',
    nombre: 'Roles y permisos',
    componenteModulo: 'RoleGuard, JwtInterceptor, SecurityContext, sga_rol',
    modeloAsociado: 'Casos de Uso: UC-02 · Componentes: Capa 2 y 5 · Datos: sga_rol',
    metodoEvidencia: 'Matriz de pruebas unitarias y de integración simulando peticiones con tokens de Estudiante hacia endpoints administrativos (ej. /api/v1/audit) verificando rechazo perimetral.',
    criterioAceptacion: 'HTTP 403 Forbidden estricto en cualquier intento de escalamiento horizontal o vertical de privilegios.'
  },
  {
    codigo: 'RF-03',
    tipo: 'RF',
    nombre: 'Gestión de estudiantes',
    componenteModulo: 'StudentController, StudentService, StudentRepository',
    modeloAsociado: 'Casos de Uso: UC-03, UC-10 · Componentes: Capa 2, 3 y 4 · Datos: sga_estudiante',
    metodoEvidencia: 'Pruebas CRUD automatizadas en Cypress/Playwright y Postman, incluyendo verificación de borrado lógico (is_deleted = TRUE).',
    criterioAceptacion: 'Persistencia de expediente con código único; imposibilidad de eliminar físicamente registros con matrículas históricas.'
  },
  {
    codigo: 'RF-04',
    tipo: 'RF',
    nombre: 'Gestión de docentes',
    componenteModulo: 'TeacherController, TeacherService, TeacherRepository',
    modeloAsociado: 'Casos de Uso: UC-04, UC-08 · Componentes: Capa 2, 3 y 4 · Datos: sga_docente',
    metodoEvidencia: 'Pruebas de validación de documento de identidad único y pruebas de integración para habilitar/desactivar docentes.',
    criterioAceptacion: 'Docente registrado disponible para asignación en grupos; validación de duplicidad en documento de identidad.'
  },
  {
    codigo: 'RF-05',
    tipo: 'RF',
    nombre: 'Programas y asignaturas',
    componenteModulo: 'CurriculumController, CurriculumService, CourseRepository',
    modeloAsociado: 'Casos de Uso: UC-07, UC-05 · Componentes: Capa 2 y 3 · Datos: sga_programa, sga_asignatura',
    metodoEvidencia: 'Pruebas unitarias sobre el evaluador de grafos curriculares (DAG) verificando detección de ciclos y validación de créditos (1 a 8).',
    criterioAceptacion: 'Estructuración de mallas con créditos semestrales validados y resolución correcta de prerrequisitos de nivel N-1.'
  },
  {
    codigo: 'RF-06',
    tipo: 'RF',
    nombre: 'Grupos y periodos',
    componenteModulo: 'AcademicPeriodController, GroupController, CourseGroupRepository',
    modeloAsociado: 'Casos de Uso: UC-08, UC-05, UC-06 · Componentes: Capa 2, 3 y 4 · Datos: sga_periodo_academico, sga_grupo',
    metodoEvidencia: 'Pruebas de detección de solapamiento de horarios en la misma aula y validación de ventanas temporales de apertura/cierre de periodos.',
    criterioAceptacion: 'Imposibilidad de asignar la misma aula física en la misma franja horaria a grupos diferentes.'
  },
  {
    codigo: 'RF-07',
    tipo: 'RF',
    nombre: 'Matrícula académica',
    componenteModulo: 'EnrollmentController, EnrollmentService, CourseGroupRepository, EnrollmentRepository',
    modeloAsociado: 'Casos de Uso: UC-05 · Componentes: Capa 2, 3 y 4 · Secuencia: Sección 6.5 · Datos: sga_matricula, sga_grupo',
    metodoEvidencia: 'Pruebas de carga concurrente con Apache JMeter simulando 300 estudiantes intentando matricular el último cupo simultáneamente (Race Condition Test).',
    criterioAceptacion: 'Cero sobrecupos (cupo_disponible >= 0 siempre); rechazo de matrículas duplicadas; comprobante único emitido en < 3s.'
  },
  {
    codigo: 'RF-08',
    tipo: 'RF',
    nombre: 'Registro de calificaciones',
    componenteModulo: 'GradesController, GradesService, GradesRepository',
    modeloAsociado: 'Casos de Uso: UC-06 · Componentes: Capa 2, 3 y 4 · Datos: sga_calificacion',
    metodoEvidencia: 'Pruebas de validación de rangos (0.00 a 5.00), sumatoria estricta de ponderaciones al 100% y prueba de bloqueo al expirar la fecha del calendario.',
    criterioAceptacion: 'Notas almacenadas con precisión de dos decimales; cálculo automático de definitivas en servidor; auditoría obligatoria de cambios.'
  },
  {
    codigo: 'RF-09',
    tipo: 'RF',
    nombre: 'Consulta de resultados',
    componenteModulo: 'StudentSelfServiceController, GradesRepository, RedisCacheManager',
    modeloAsociado: 'Casos de Uso: UC-09 · Componentes: Capa 1, 2 y 5 · Datos: sga_matricula_detalle, sga_calificacion',
    metodoEvidencia: 'Pruebas de rendimiento de lectura bajo carga y pruebas de aislamiento de datos personales (estudiante A no puede ver notas de estudiante B).',
    criterioAceptacion: 'Despliegue del horario y calificaciones publicadas en menos de 2 segundos en clientes móviles y de escritorio.'
  },
  {
    codigo: 'RF-10',
    tipo: 'RF',
    nombre: 'Reportes',
    componenteModulo: 'ReportsController, ReportsService, ReadReplicaDataSource',
    modeloAsociado: 'Casos de Uso: UC-10 · Componentes: Capa 2 y 4 (Read Replica) · Despliegue: Nodo DB Replica',
    metodoEvidencia: 'Ejecución de consultas analíticas sobre la réplica de lectura verificando cero impacto de contención en las transacciones de matrícula del nodo primario.',
    criterioAceptacion: 'Generación de reportes consolidados en PDF/Excel en < 5s sin degradar la latencia de transacciones concurrentes.'
  },
  {
    codigo: 'RF-11',
    tipo: 'RF',
    nombre: 'Búsqueda y filtros',
    componenteModulo: 'SearchService, IndexManager, PostgreSQL Trigram/B-Tree',
    modeloAsociado: 'Casos de Uso: UC-11 · Componentes: Capa 2 y 4 · Datos: Índices en sga_usuario, sga_estudiante',
    metodoEvidencia: 'Pruebas de latencia en consultas con filtros multi-criterio (programa, periodo, estado) sobre tablas con 50,000 registros.',
    criterioAceptacion: 'Tiempo de respuesta de búsqueda < 800ms utilizando índices compuestos B-Tree y pg_trgm.'
  },
  {
    codigo: 'RF-12',
    tipo: 'RF',
    nombre: 'Auditoría',
    componenteModulo: 'AuditInterceptor (AOP), AuditService, AuditRepository, sga_auditoria',
    modeloAsociado: 'Casos de Uso: UC-12 · Componentes: Capa 5 · Secuencia: Sección 6.5 · Datos: sga_auditoria',
    metodoEvidencia: 'Prueba de inserción automática ante eventos de login, matrícula y notas; intento explícito de ejecutar UPDATE o DELETE sobre la tabla de auditoría.',
    criterioAceptacion: 'Base de datos rechaza cualquier mutación o borrado en la tabla de auditoría; registro contiene IP, timestamp UTC, usuario y JSON diferencial.'
  },

  // REQUERIMIENTOS NO FUNCIONALES (RNF-01 a RNF-12)
  {
    codigo: 'RNF-01',
    tipo: 'RNF',
    nombre: 'Seguridad',
    componenteModulo: 'Cloud Armor WAF, TLS 1.3 Termination, Argon2id Hasher, VPC Private Subnets',
    modeloAsociado: 'Despliegue: Sección 6.3 (Nodos 1, 3 y 4) · Componentes: Capa 5',
    metodoEvidencia: 'Escaneo de vulnerabilidades automatizado con OWASP ZAP, verificación de cabeceras de seguridad con SSL Labs (calificación A+) y auditoría de código estático (SAST).',
    criterioAceptacion: '100% de comunicaciones sobre TLS 1.3; cero secretos en código o texto plano; aislamiento total de base de datos sin IP pública.'
  },
  {
    codigo: 'RNF-02',
    tipo: 'RNF',
    nombre: 'Rendimiento',
    componenteModulo: 'Horizontal Pod Autoscaler (HPA), Edge CDN, Connection Pool Hikari, Redis',
    modeloAsociado: 'Despliegue: Sección 6.3 (Nodos 2 y 3) · Secuencia: Paso 16 (p95 <= 3s)',
    metodoEvidencia: 'Prueba de estrés con Apache JMeter ejecutando 300 hilos concurrentes simulando matrículas y consultas de notas durante 30 minutos continuos.',
    criterioAceptacion: 'Al menos el 95% de las peticiones comunes responde en <= 3.0 segundos; tasa de error de servidor < 0.1%.'
  },
  {
    codigo: 'RNF-03',
    tipo: 'RNF',
    nombre: 'Disponibilidad',
    componenteModulo: 'Multi-AZ Standby Failover, Application Load Balancer con Health Checks',
    modeloAsociado: 'Despliegue: Sección 6.3 (Clúster DB Master-Standby Multi-AZ)',
    metodoEvidencia: 'Prueba de inyección de fallos (Chaos Engineering) forzando el apagado abrupto del nodo de base de datos primario en plena carga.',
    criterioAceptacion: 'Conmutación por error automática hacia el nodo Standby en < 30 segundos sin pérdida de transacciones confirmadas (SLA >= 99.5%).'
  },
  {
    codigo: 'RNF-04',
    tipo: 'RNF',
    nombre: 'Escalabilidad',
    componenteModulo: 'Kubernetes HPA, Cloud Run Elastic Scaling, Stateless Backend Architecture',
    modeloAsociado: 'Despliegue: Sección 6.3 (Clúster App 2 a 10 pods) · Componentes: Capa 2 y 3',
    metodoEvidencia: 'Incremento progresivo de carga de 50 a 600 peticiones por segundo monitoreando la creación automática de nuevas réplicas en < 45 segundos.',
    criterioAceptacion: 'Escalado elástico transparente de 2 a 10 instancias sin intervención manual y sin caídas de servicio.'
  },
  {
    codigo: 'RNF-05',
    tipo: 'RNF',
    nombre: 'Mantenibilidad',
    componenteModulo: 'Clean Architecture, Dependency Injection (IoC), TypeScript Strict Mode',
    modeloAsociado: 'Componentes: Sección 6.2 (5 Capas Desacopladas con DTOs)',
    metodoEvidencia: 'Análisis estático con SonarQube evaluando complejidad ciclomática, deuda técnica y cobertura de pruebas unitarias.',
    criterioAceptacion: 'Cobertura de pruebas unitarias >= 80%; cero dependencias cíclicas; acoplamiento eferente controlado entre capas.'
  },
  {
    codigo: 'RNF-06',
    tipo: 'RNF',
    nombre: 'Usabilidad y accesibilidad',
    componenteModulo: 'React Design System, Tailwind Accessibility Utilities, ARIA tags, Responsive Layout',
    modeloAsociado: 'Casos de Uso: UC-05, UC-06 · Componentes: Capa 1 Presentación',
    metodoEvidencia: 'Auditoría automatizada con Google Lighthouse y axe-core, más pruebas de navegación con lector de pantalla (NVDA) y solo teclado.',
    criterioAceptacion: 'Puntuación Lighthouse Accesibilidad >= 95/100; cumplimiento de contraste de color WCAG 2.1 AA (4.5:1); navegación completa por teclado.'
  },
  {
    codigo: 'RNF-07',
    tipo: 'RNF',
    nombre: 'Integridad y consistencia',
    componenteModulo: 'PostgreSQL ACID Engine, Row-Level Lock (FOR UPDATE), TransactionManager',
    modeloAsociado: 'Casos de Uso: UC-05, UC-06 · Secuencia: Sección 6.5 (Pasos 8-12) · Datos: Sección 6.4',
    metodoEvidencia: 'Ejecución de 100 pruebas concurrentes de sobrecupo (Race Condition Test) con 1 cupo restante y 50 solicitudes en el mismo milisegundo.',
    criterioAceptacion: 'Exactamente 1 solicitud tiene éxito y 49 reciben HTTP 409 Conflict; cero sobrecupos registrados en la base de datos.'
  },
  {
    codigo: 'RNF-08',
    tipo: 'RNF',
    nombre: 'Interoperabilidad',
    componenteModulo: 'OpenAPI 3.0 Documentation, RESTful JSON Endpoints, RFC 7807 Error Standard',
    modeloAsociado: 'Componentes: Sección 6.2 (Capa 2 Controladores API)',
    metodoEvidencia: 'Validación del contrato OpenAPI con Swagger Validator y pruebas de consumo desde clientes SDK generados en Python y Java.',
    criterioAceptacion: 'Especificación OpenAPI 3.0 conforme a estándares; respuestas JSON con esquemas tipados y manejo de errores RFC 7807.'
  },
  {
    codigo: 'RNF-09',
    tipo: 'RNF',
    nombre: 'Respaldo y recuperación',
    componenteModulo: 'PostgreSQL WAL Archiver, Cloud Storage Dual-Region, PITR Automation Script',
    modeloAsociado: 'Despliegue: Sección 6.3 (Nodo 5 Bóveda Off-Site y Políticas RPO/RTO)',
    metodoEvidencia: 'Simulacro trimestral de desastre (Dry-Run) restaurando un snapshot en un ambiente aislado midiendo tiempo transcurrido y diferencial de datos.',
    criterioAceptacion: 'RPO comprobado <= 5 minutos (supera objetivo <= 1h); RTO comprobado <= 1h 45m (supera objetivo <= 4h).'
  },
  {
    codigo: 'RNF-10',
    tipo: 'RNF',
    nombre: 'Trazabilidad',
    componenteModulo: 'Matriz Bidireccional de Trazabilidad, Correlation-ID Middleware, Audit Trail',
    modeloAsociado: 'Matriz Completa: Sección 6.6 · Casos de Uso 6.1 · Componentes 6.2 · Despliegue 6.3',
    metodoEvidencia: 'Verificación de que cada requerimiento RF y RNF cuenta con un caso de prueba automatizado y un log de auditoría trazable.',
    criterioAceptacion: 'Cobertura del 100% de requerimientos mapeados con componentes de software y evidencias de validación.'
  },
  {
    codigo: 'RNF-11',
    tipo: 'RNF',
    nombre: 'Privacidad',
    componenteModulo: 'Row-Level Security Filter, DTO Projection, JWT Claim Scopes',
    modeloAsociado: 'Componentes: Capa 2 y 3 · Datos: sga_usuario, sga_estudiante',
    metodoEvidencia: 'Pruebas de inyección de parámetros IDOR (Insecure Direct Object References) intentando consultar expedientes o notas de terceros.',
    criterioAceptacion: 'HTTP 403 / 404 ante intentos de acceso a recursos de terceros; payloads de respuesta no exponen hashes ni datos sensibles.'
  },
  {
    codigo: 'RNF-12',
    tipo: 'RNF',
    nombre: 'Compatibilidad',
    componenteModulo: 'Vite / Babel Transpiler, Tailwind Responsive Breakpoints, Cross-Browser Testing',
    modeloAsociado: 'Componentes: Capa 1 Presentación · Despliegue: Nodo 2 Edge CDN',
    metodoEvidencia: 'Ejecución de suite de pruebas end-to-end con Playwright sobre navegadores Chromium, Firefox y WebKit (Safari), y viewports móviles.',
    criterioAceptacion: 'Compatibilidad certificada en las últimas 2 versiones de Chrome, Edge, Safari y Firefox; interfaz 100% operativa desde 360px de ancho.'
  }
];

export const DOCUMENTO_MARKDOWN_COMPLETO_6_4_6_6 = `# DOCUMENTO DE ESPECIFICACIÓN DE ARQUITECTURA DE SOFTWARE
## SECCIONES 6.4, 6.5 Y 6.6: MODELO DE DATOS, SECUENCIA Y TRAZABILIDAD (SGA)

**Documento:** SGA-ARCH-DOC-6.4-6.6  
**Versión:** 2.4 (Edición Definitiva para Producción)  
**Autor:** Administrador de Bases de Datos (DBA) & Arquitecto de Software Senior  
**Estándar:** ISO/IEC/IEEE 42010:2011, IEEE Std 1016-2009 & ANSI/SPARC Data Models  
**Fecha:** Noviembre 2026  

---

### 1. MODELO CONCEPTUAL DE DATOS (SECCIÓN 6.4)

El modelo conceptual del Sistema de Gestión Académica (SGA) está normalizado en **Tercera Forma Normal (3FN)** con extensiones relacionales optimizadas para PostgreSQL 16. Garantiza integridad referencial estricta, tipos de datos fuertemente tipados, claves primarias mediante identificadores únicos universales (**UUID**) y protección de consistencia ante concurrencia.

#### 1.1 Catálogo de las Once (11) Entidades Principales

1. **Usuario (\`sga_usuario\`):** Almacena las identidades institucionales y el hash criptográfico de contraseñas (Argon2id, RNF-01). Se vincula 1:1 con Estudiante o Docente y N:1 con Rol.
2. **Rol (\`sga_rol\`):** Gobierna los perfiles institucionales (ROLE_ADMIN, ROLE_COORDINADOR, ROLE_DOCENTE, ROLE_ESTUDIANTE) y su matriz de permisos en formato JSONB (RF-02).
3. **Estudiante (\`sga_estudiante\`):** Expediente académico con código único, estado y programa académico.
4. **Docente (\`sga_docente\`):** Hoja de vida del cuerpo de profesores con especialidad y estado de contratación.
5. **Programa (\`sga_programa\`):** Carrera o programa formativo con créditos totales requeridos para grado.
6. **Asignatura (\`sga_asignatura\`):** Materia curricular con créditos, semestre y arreglo de prerrequisitos (Grafo Dirigido Acíclico - DAG).
7. **PeriodoAcademico (\`sga_periodo_academico\`):** Ciclo semestral con banderas de apertura de matrícula y fecha límite de notas.
8. **Grupo (\`sga_grupo\`):** Oferta física de curso con cupo máximo, cupo disponible en tiempo real, horario JSONB y token de versión (Optimistic Lock).
9. **Matricula (\`sga_matricula\`):** Cabecera formal de inscripción con código hash único de comprobante y total de créditos.
10. **Calificacion (\`sga_calificacion\`):** Registro ponderado de notas parciales (escala 0.00 a 5.00 con chequeo de integridad en BD).
11. **AuditLog (\`sga_auditoria\`):** Bitácora inmutable de solo inserción (Append-Only) con usuario, IP, diferencial JSONB y justificación legal.

#### 1.2 Diagrama Entidad-Relación Conceptual (Mermaid.js)

\`\`\`mermaid
${CODIGO_MERMAID_ER}
\`\`\`

---

### 2. VISTA DE SECUENCIA: MATRÍCULA DE UN ESTUDIANTE (SECCIÓN 6.5)

La **Vista de Secuencia** detalla la interacción paso a paso entre los componentes del sistema durante el proceso de **Matrícula de Asignaturas (UC-05, RF-07)**, ilustrando la orquestación transaccional ACID, la verificación de seguridad JWT, el bloqueo pesimista de fila contra condiciones de carrera y la auditoría forense asíncrona.

#### 2.1 Flujo Transaccional Paso a Paso
1. **Inicio en Presentación:** El Estudiante selecciona los grupos en la interfaz web y pulsa "Confirmar Matrícula".
2. **Petición Segura:** La SPA emite \`POST /api/v1/enrollments\` con encabezado \`Authorization: Bearer <JWT>\`.
3. **Inspección de Seguridad:** El API Gateway y el \`SecurityContext\` validan la firma criptográfica del token y el rol \`ROLE_ESTUDIANTE\` (RF-01, RF-02).
4. **Apertura de Transacción ACID:** \`EnrollmentService\` solicita al \`TransactionManager\` una transacción con nivel de aislamiento \`SERIALIZABLE\` o \`REPEATABLE READ\` (RNF-07).
5. **Validación de No Duplicidad:** Se comprueba que no existan registros previos para ese estudiante en el mismo periodo (RN-MAT-01).
6. **Bloqueo Pesimista de Cupo:**
   \`SELECT cupo_disponible FROM sga_grupo WHERE id = :id FOR UPDATE;\`
   - Si \`cupo_disponible <= 0\`: La transacción ejecuta un **ROLLBACK** total y responde con **HTTP 409 Conflict**.
   - Si \`cupo_disponible > 0\`: Se decrementa en 1 unidad (\`-1\`) y se inserta el comprobante y el detalle de asignaturas en estado \`ASENTADA\`.
7. **Commit en Base de Datos:** Se confirman los cambios liberando los bloqueos en PostgreSQL.
8. **Auditoría Asíncrona (RF-12):** Se publica un evento no bloqueante al \`AuditService\` para registrar la transacción inmutable en \`sga_auditoria\` sin degradar la latencia del usuario.
9. **Respuesta Rápida:** Se emite **HTTP 201 Created** con el código de comprobante descargable en menos de 3.0 segundos con hasta 300 usuarios concurrentes (RNF-02).

#### 2.2 Diagrama de Secuencia (Mermaid.js)

\`\`\`mermaid
${CODIGO_MERMAID_SECUENCIA}
\`\`\`

---

### 3. MATRIZ DE TRAZABILIDAD COMPLETA (SECCIÓN 6.6)

Matriz formal que vincula la totalidad de los requerimientos (**RF-01 a RF-12** y **RNF-01 a RNF-12**) con los componentes de software de la arquitectura, los modelos asociados y sus métodos de evidencia técnica:

| Código | Requerimiento | Componente / Módulo que lo Resuelve | Modelo del Sistema Asociado | Método de Evidencia / Validación Propuesto | Criterio de Aceptación Formal |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Autenticación | AuthController, AuthService, SecurityContext, sga_usuario | Casos de Uso: UC-01 · Componentes: Capa 2 y 5 · Datos: 6.4 | Pruebas de integración con tokens JWT y verificación de hash Argon2id (cost factor 16). | HTTP 200 con token válido; HTTP 401 en fallos; cero contraseñas en texto plano. |
| **RF-02** | Roles y permisos | RoleGuard, JwtInterceptor, sga_rol | Casos de Uso: UC-02 · Componentes: Capa 2 y 5 · Datos: 6.4 | Pruebas de escalamiento simulando estudiante consumiendo endpoints administrativos. | HTTP 403 Forbidden estricto en rutas no autorizadas. |
| **RF-03** | Gestión de estudiantes | StudentController, StudentService, StudentRepository | Casos de Uso: UC-03 · Componentes: Capa 2, 3 y 4 · Datos: 6.4 | Pruebas CRUD automatizadas y validación de borrado lógico (is_deleted). | Expediente persistido con código único; soft-delete operativo. |
| **RF-04** | Gestión de docentes | TeacherController, TeacherService, TeacherRepository | Casos de Uso: UC-04 · Componentes: Capa 2, 3 y 4 · Datos: 6.4 | Pruebas de validación de documento de identidad único y estado activo/inactivo. | Docente disponible para carga lectiva; unicidad de identificación. |
| **RF-05** | Programas y asignaturas | CurriculumService, CourseRepository, sga_asignatura | Casos de Uso: UC-07 · Componentes: Capa 2 y 3 · Datos: 6.4 | Pruebas unitarias de evaluación de grafos acíclicos (DAG) de prerrequisitos. | Cero ciclos en prerrequisitos; créditos semestrales validados. |
| **RF-06** | Grupos y periodos | AcademicPeriodController, CourseGroupRepository | Casos de Uso: UC-08 · Componentes: Capa 2, 3 y 4 · Datos: 6.4 | Pruebas de detección de colisiones de horarios en la misma aula física. | Detección de cruces de aula y validación de fechas de calendario. |
| **RF-07** | Matrícula académica | EnrollmentService, CourseGroupRepository, TransactionManager | Casos de Uso: UC-05 · Secuencia: 6.5 · Componentes: 6.2 · Datos: 6.4 | Pruebas de carga concurrente con JMeter simulando 300 estudiantes sobre el último cupo. | Cero sobrecupos; prevención de duplicados; respuesta en < 3s. |
| **RF-08** | Registro de calificaciones | GradesService, GradesRepository, sga_calificacion | Casos de Uso: UC-06 · Componentes: Capa 2, 3 y 4 · Datos: 6.4 | Validación de rangos (0.00-5.00), sumatoria al 100% y bloqueo por calendario. | Cálculo de definitivas en servidor; auditoría obligatoria de cambios. |
| **RF-09** | Consulta de resultados | StudentSelfServiceController, RedisCacheManager | Casos de Uso: UC-09 · Componentes: Capa 1 y 5 · Datos: 6.4 | Pruebas de latencia de lectura y pruebas IDOR de aislamiento de notas de terceros. | Horario y notas desplegados en < 2s; aislamiento estricto por usuario. |
| **RF-10** | Reportes | ReportsController, ReadReplicaDataSource (PostgreSQL Replica) | Casos de Uso: UC-10 · Despliegue: Nodo DB Replica · Componentes: 6.2 | Consultas analíticas pesadas sobre la réplica de lectura bajo carga transaccional. | Reportes en PDF/Excel en < 5s sin degradar transacciones del Master. |
| **RF-11** | Búsqueda y filtros | SearchService, Índices B-Tree y Trigram en PostgreSQL | Casos de Uso: UC-11 · Componentes: Capa 2 y 4 · Datos: 6.4 | Pruebas de latencia en tablas con 50,000 registros usando filtros compuestos. | Búsqueda en < 800ms utilizando índices compuestos y trigram. |
| **RF-12** | Auditoría | AuditInterceptor, AuditService, sga_auditoria | Casos de Uso: UC-12 · Componentes: Capa 5 · Secuencia: 6.5 · Datos: 6.4 | Intento explícito de ejecutar UPDATE o DELETE en BD sobre la tabla sga_auditoria. | BD rechaza cualquier mutación; registro contiene IP, timestamp y JSON diferencial. |
| **RNF-01** | Seguridad | Cloud WAF, TLS 1.3, Argon2id, VPC Private Subnets | Despliegue: 6.3 (Nodos 1, 3, 4) · Componentes: Capa 5 | Escaneo de vulnerabilidades con OWASP ZAP y análisis de código estático (SAST). | Calificación SSL Labs A+; cero secretos en texto plano; red privada. |
| **RNF-02** | Rendimiento | Horizontal Pod Autoscaler (HPA), Edge CDN, Connection Pool | Despliegue: 6.3 (Nodos 2, 3) · Secuencia: Paso 16 | Prueba de estrés con JMeter: 300 usuarios concurrentes durante 30 minutos continuos. | 95% de peticiones responden en <= 3.0s; tasa de error < 0.1%. |
| **RNF-03** | Disponibilidad | Multi-AZ Standby Failover, Load Balancer redundante | Despliegue: 6.3 (Clúster PostgreSQL Multi-AZ) | Chaos Engineering forzando caída abrupta del nodo Master de base de datos. | Failover automático hacia Standby en < 30 segundos (SLA >= 99.5%). |
| **RNF-04** | Escalabilidad | Kubernetes HPA / Cloud Run, Stateless Application Architecture | Despliegue: 6.3 (Clúster App 2 a 10 nodos) · Componentes: 6.2 | Rampa de carga de 50 a 600 req/s evaluando activación de nuevas instancias. | Escalado elástico de 2 a 10 réplicas en < 45s sin interrupción. |
| **RNF-05** | Mantenibilidad | Clean Architecture, Inyección de Dependencias, TypeScript Strict | Componentes: Sección 6.2 (5 Capas Desacopladas con DTOs) | Análisis estático de código con SonarQube midiendo acoplamiento y cobertura. | Cobertura de pruebas unitarias >= 80%; cero dependencias cíclicas. |
| **RNF-06** | Usabilidad y accesibilidad | React SPA, Tailwind WCAG Utilities, Soporte Completo por Teclado | Casos de Uso: UC-05, UC-06 · Componentes: Capa 1 | Auditoría automatizada con Google Lighthouse y pruebas con lector de pantalla NVDA. | Puntuación Lighthouse >= 95/100; contraste WCAG 2.1 AA (4.5:1). |
| **RNF-07** | Integridad y consistencia | PostgreSQL ACID, Bloqueo de fila (SELECT ... FOR UPDATE) | Casos de Uso: UC-05 · Secuencia: 6.5 · Datos: 6.4 | 100 pruebas concurrentes sobre 1 último cupo en el mismo milisegundo. | Exactamente 1 solicitud exitosa y 49 rechazadas con HTTP 409; cero sobrecupos. |
| **RNF-08** | Interoperabilidad | OpenAPI 3.0 Specification, RESTful JSON, RFC 7807 | Componentes: Sección 6.2 (Capa 2 Controladores API) | Validación de esquema OpenAPI con Swagger Validator y clientes SDK en Python/Java. | Especificación OpenAPI 3.0 conforme a estándares; respuestas JSON RFC 7807. |
| **RNF-09** | Respaldo y recuperación | Streaming WAL continuo, Snapshots diarios, Almacenamiento WORM | Despliegue: Sección 6.3 (Nodo 5 Bóveda Off-Site y Políticas RPO/RTO) | Simulacro de desastre (Dry-Run) restaurando snapshot y midiendo tiempos. | RPO comprobado < 5 minutos (<= 1h); RTO comprobado < 1h 45m (<= 4h). |
| **RNF-10** | Trazabilidad | Matriz de Trazabilidad 100%, Correlation-ID, Audit Trail | Matriz Completa: Sección 6.6 · Casos de Uso 6.1 · Componentes 6.2 | Validación de que cada requerimiento posee prueba automatizada y log de auditoría. | 100% de requerimientos cubiertos con evidencias de verificación verificables. |
| **RNF-11** | Privacidad | Row-Level Security, Aislamiento por Token Claims, DTO Projections | Componentes: Capa 2 y 3 · Datos: sga_usuario, sga_estudiante | Pruebas de inyección IDOR intentando acceder a notas o datos de otros usuarios. | HTTP 403 / 404 estricto; cero exposición de datos privados de terceros. |
| **RNF-12** | Compatibilidad | Vite Transpiler, Tailwind Responsive Grid, Cross-Browser Suite | Componentes: Capa 1 Presentación · Despliegue: Nodo 2 Edge CDN | Pruebas end-to-end con Playwright sobre Chrome, Firefox, Safari y móviles. | Compatibilidad en últimas 2 versiones de navegadores; usable desde 360px. |

---

### 4. DICTAMEN INTEGRADO DE ARQUITECTURA

Con la consolidación de las Secciones **6.1 (Casos de Uso)**, **6.2 (Componentes N-Tier)**, **6.3 (Despliegue Cloud)**, **6.4 (Modelo de Datos)**, **6.5 (Vista de Secuencia)** y **6.6 (Matriz de Trazabilidad Completa)**, el Sistema de Gestión Académica (SGA) dispone de una especificación de arquitectura de software formal, exhaustiva y lista para pasar a la fase de construcción y despliegue en producción con garantías verificables de calidad, resiliencia y seguridad legal.
`;
