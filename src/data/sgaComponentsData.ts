/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Documento de Arquitectura de Software: Sistema de Gestión Académica (SGA)
 * Sección 6.2: Vista Lógica y de Componentes (Arquitectura en Capas N-Tier)
 * Especificación formal basada en estándares IEEE 1016-2009 / ISO/IEC/IEEE 42010.
 */

export interface CapaArquitectura {
  id: string;
  nombre: string;
  tecnologias: string;
  proposito: string;
  responsabilidades: string[];
  patronesDiseno: string[];
  mecanismosCalidad: string[];
}

export interface ComponenteInterno {
  id: string;
  nombre: string;
  capa: 'Presentación' | 'Controladores API' | 'Lógica de Negocio' | 'Acceso a Datos' | 'Servicios Transversales';
  responsabilidadPrincipal: string;
  contratoEntrada: { nombre: string; tipo: string; descripcion: string }[];
  contratoSalida: { nombre: string; tipo: string; descripcion: string }[];
  dependenciasInyectadas: string[];
  moduloRelacionado: string;
  rfAtendido: string[];
  rnfGarantizado: string[];
}

export interface FlujoModuloArquitectonico {
  rf: string;
  titulo: string;
  capasInvolucradas: string[];
  descripcionMecanismo: string;
  patronArquitectonico: string;
  pasosEjecucion: {
    paso: number;
    capa: string;
    componente: string;
    accion: string;
    garantiaRNF: string;
  }[];
  seguridadYAuditoria: string;
  garantiasTecnicas: string[];
}

export const CAPAS_ARQUITECTURA: CapaArquitectura[] = [
  {
    id: 'CAPA-01',
    nombre: 'Capa de Presentación (Frontend SPA / Mobile)',
    tecnologias: 'React 19 / TypeScript / Tailwind CSS / Web Standards WCAG 2.1 AA',
    proposito: 'Proporcionar la interfaz de usuario reactiva, accesible y adaptativa tanto para navegadores de escritorio como para dispositivos móviles.',
    responsabilidades: [
      'Renderizado de vistas dinámicas y componentes de interfaz accesibles (WCAG AA, RNF-06).',
      'Gestión de estado local en memoria y enrutamiento seguro por roles de usuario (RBAC).',
      'Validaciones síncronas preliminares en cliente (máscaras numéricas, cruces horarios preliminares, formatos).',
      'Consumo seguro de servicios backend mediante cliente HTTP con interceptores de tokens JWT y manejo uniforme de errores.',
      'Caché de consultas de lectura frecuentes (SWR/React Query) para garantizar tiempos de respuesta p95 <= 3s (RNF-02).'
    ],
    patronesDiseno: ['Component-Based Architecture', 'Presenter Pattern', 'Observer / State Store', 'Interceptor Pattern'],
    mecanismosCalidad: ['Responsive Design (RNF-12)', 'Accesibilidad por teclado (RNF-06)', 'Feedback visual sin parpadeos (RNF-02)']
  },
  {
    id: 'CAPA-02',
    nombre: 'Capa de Controladores API / Gateway REST',
    tecnologias: 'Node.js / Express con TypeScript / OpenAPI 3.0 / JSON Schema',
    proposito: 'Exponer la superficie de interacción externa mediante una API REST estandarizada, documentada e interoperable (RNF-08), actuando como frontera perimetral del backend.',
    responsabilidades: [
      'Exposición y enrutamiento de endpoints RESTful con códigos de estado HTTP semánticos (200, 201, 400, 401, 403, 404, 409, 500).',
      'Deserialización, saneamiento de entradas (XSS/SQLi) y validación estricta de esquemas DTO (Data Transfer Objects).',
      'Traducción de excepciones de negocio de dominio a respuestas JSON uniformes conforme a RFC 7807 (Problem Details).',
      'Aplicación de Rate Limiting (Throttling) perimetral para mitigar ataques de denegación de servicio (DoS) y proteger el pool ante picos concurrentes (RNF-02, RNF-04).',
      'Generación y propagación del encabezado de correlación de peticiones (X-Correlation-ID / Request-ID).'
    ],
    patronesDiseno: ['Controller / Front Controller', 'DTO (Data Transfer Object)', 'API Gateway / Reverse Proxy', 'Filter Chain'],
    mecanismosCalidad: ['Interoperabilidad OpenAPI (RNF-08)', 'Protección HTTPS/TLS 1.3 (RNF-01)', 'Manejo seguro de errores sin stack-traces expuestos (RNF-11)']
  },
  {
    id: 'CAPA-03',
    nombre: 'Capa de Lógica de Negocio / Dominio',
    tecnologias: 'Servicios de Aplicación / Domain Entities / Transaction Manager',
    proposito: 'Orquestar las reglas del negocio universitario, salvaguardar las invariantes curriculares y coordinar transacciones atómicas complejas.',
    responsabilidades: [
      'Ejecución rigurosa de las reglas de matrícula: verificación de créditos, prelaciones/prerrequisitos y unicidad (RN-MAT-01..05).',
      'Orquestación de la concurrencia de cupos mediante bloqueos transaccionales (Optimistic/Pessimistic Locking) para prevenir sobrecupos (RNF-07).',
      'Cálculo centralizado de calificaciones ponderadas en el servidor para evitar manipulaciones cliente (RN-CAL-01..04).',
      'Demarcación declarativa de fronteras transaccionales ACID (Commit / Rollback).',
      'Despacho de eventos de dominio hacia los servicios transversales de auditoría y notificación.'
    ],
    patronesDiseno: ['Domain Model Pattern', 'Service Layer', 'Unit of Work', 'Strategy / Specification Pattern', 'Domain Events'],
    mecanismosCalidad: ['Aislamiento transaccional Serializable (RNF-07)', 'Mantenibilidad y bajo acoplamiento (RNF-05)', 'Validación de invariantes de negocio']
  },
  {
    id: 'CAPA-04',
    nombre: 'Capa de Acceso a Datos / Persistencia',
    tecnologias: 'Repository Pattern / ORM & Query Builders / PostgreSQL / Pool Hikari-Node',
    proposito: 'Abstraer y gestionar la persistencia y recuperación de datos relacionales, garantizando integridad referencial, transaccionalidad y alto rendimiento.',
    responsabilidades: [
      'Implementación del patrón Repositorio para encapsular las sentencias SQL (DQL/DML) y evitar fugas de infraestructura hacia el dominio.',
      'Gestión eficiente del pool de conexiones para soportar 300 usuarios concurrentes sin saturar el RDBMS (RNF-02, RNF-04).',
      'Mapeo objeto-relacional entre tablas normalizadas y entidades de dominio con carga perezosa/ansiosa optimizada.',
      'Aplicación de borrado lógico (soft-delete con bandera is_deleted) para preservar el historial académico de expedientes (RNF-10).',
      'Soporte a réplicas de lectura para consultas pesadas de reportes (RF-10) evitando bloqueos en tablas transaccionales de matrícula y notas.'
    ],
    patronesDiseno: ['Repository Pattern', 'Data Mapper', 'Connection Pooling', 'Optimistic Locking via Version Column'],
    mecanismosCalidad: ['Integridad referencial ACID (RNF-07)', 'Tiempos de respuesta optimizados con índices B-Tree y GiST (RNF-02)', 'Respaldos automáticos continuos (RNF-09)']
  },
  {
    id: 'CAPA-05',
    nombre: 'Capa de Servicios Transversales (Cross-Cutting)',
    tecnologias: 'JWT (Json Web Tokens) / Argon2id / AOP / Audit Event Bus / Redis / Pino Logger',
    proposito: 'Brindar servicios horizontales de seguridad, trazabilidad inmutable, monitoreo y resiliencia que atraviesan todas las capas del sistema sin acoplarlas.',
    responsabilidades: [
      'Autenticación e inspección de credenciales criptográficas individuales (RF-01, RNF-01).',
      'Control de Autorización RBAC mediante interceptores y guardas de seguridad en endpoints y métodos de servicio (RF-02).',
      'Registro inmutable de auditoría (RF-12, RNF-10) en tabla append-only con usuario, IP, timestamp y diferencial antes/después.',
      'Caché distribuida en memoria (Redis) para catálogo curricular y horarios, reduciendo carga a la base de datos.',
      'Gestión centralizada de excepciones y métricas de observabilidad (APM, p95 latency tracking).'
    ],
    patronesDiseno: ['Interceptor / Middleware Pattern', 'Aspect-Oriented Programming (AOP)', 'Singleton', 'Observer / Publish-Subscribe'],
    mecanismosCalidad: ['Seguridad HTTPS y secreto no volátil (RNF-01)', 'Trazabilidad 100% auditable (RNF-10)', 'Aislamiento de datos sensibles (RNF-11)']
  }
];

export const COMPONENTES_INTERNOS: ComponenteInterno[] = [
  // CAPA PRESENTACIÓN
  {
    id: 'COMP-01',
    nombre: 'AuthView & SessionManager',
    capa: 'Presentación',
    responsabilidadPrincipal: 'Captura segura de credenciales, gestión del ciclo de vida del token JWT en memoria y refresco silencioso.',
    contratoEntrada: [{ nombre: 'loginCredentials', tipo: 'LoginRequestDTO', descripcion: 'Email institucional y clave en texto plano protegida por TLS.' }],
    contratoSalida: [{ nombre: 'sessionState', tipo: 'SessionContext', descripcion: 'Datos de usuario autenticado, roles RBAC y token Bearer.' }],
    dependenciasInyectadas: ['HttpClient', 'SecureStorageProvider'],
    moduloRelacionado: 'Autenticación',
    rfAtendido: ['RF-01', 'RF-02'],
    rnfGarantizado: ['RNF-01', 'RNF-06']
  },
  {
    id: 'COMP-02',
    nombre: 'EnrollmentPlannerView',
    capa: 'Presentación',
    responsabilidadPrincipal: 'Matriz visual e interactiva de horarios, selección de asignaturas en tiempo real y confirmación de matrícula.',
    contratoEntrada: [{ nombre: 'periodId', tipo: 'string', descripcion: 'Identificador del periodo académico activo.' }],
    contratoSalida: [{ nombre: 'enrollmentSelection', tipo: 'EnrollmentPayloadDTO', descripcion: 'Lista de grupos seleccionados para matriculación.' }],
    dependenciasInyectadas: ['EnrollmentApiClient', 'ScheduleConflictValidator'],
    moduloRelacionado: 'Matrícula Académica',
    rfAtendido: ['RF-07', 'RF-05', 'RF-06'],
    rnfGarantizado: ['RNF-02', 'RNF-06', 'RNF-12']
  },
  {
    id: 'COMP-03',
    nombre: 'GradeSheetGridComponent',
    capa: 'Presentación',
    responsabilidadPrincipal: 'Libreta de calificaciones editable tipo hoja de cálculo con validación inline por teclado y cálculo instantáneo de promedios.',
    contratoEntrada: [{ nombre: 'groupId, corteId', tipo: 'string, number', descripcion: 'Grupo académico y corte evaluativo activo.' }],
    contratoSalida: [{ nombre: 'gradeUpdates', tipo: 'GradeSheetBatchDTO', descripcion: 'Lote de notas ingresadas con justificaciones si hubo cambios.' }],
    dependenciasInyectadas: ['GradesApiClient', 'GradeRangeValidator'],
    moduloRelacionado: 'Calificaciones',
    rfAtendido: ['RF-08', 'RF-12'],
    rnfGarantizado: ['RNF-06', 'RNF-07']
  },

  // CAPA CONTROLADORES API
  {
    id: 'COMP-04',
    nombre: 'AuthController',
    capa: 'Controladores API',
    responsabilidadPrincipal: 'Exposición de endpoints POST /api/v1/auth/login, POST /api/v1/auth/logout y POST /api/v1/auth/refresh.',
    contratoEntrada: [{ nombre: 'req.body', tipo: 'LoginRequestDTO', descripcion: 'Credenciales del usuario { email, password }' }],
    contratoSalida: [{ nombre: 'res.json', tipo: 'AuthResponseDTO (HTTP 200/401)', descripcion: 'Tokens JWT de acceso y refresco, perfil del usuario y roles.' }],
    dependenciasInyectadas: ['IAuthService', 'IAuditLogger'],
    moduloRelacionado: 'Autenticación & Acceso',
    rfAtendido: ['RF-01', 'RF-02', 'RF-12'],
    rnfGarantizado: ['RNF-01', 'RNF-08']
  },
  {
    id: 'COMP-05',
    nombre: 'EnrollmentController',
    capa: 'Controladores API',
    responsabilidadPrincipal: 'Endpoints POST /api/v1/enrollments (asentar matrícula) y GET /api/v1/enrollments/student/:id (horarios y cursos).',
    contratoEntrada: [{ nombre: 'req.body', tipo: 'CreateEnrollmentDTO', descripcion: 'Payload con studentId, periodId y groupIds[]' }],
    contratoSalida: [{ nombre: 'res.json', tipo: 'EnrollmentConfirmationDTO (HTTP 201/409)', descripcion: 'Comprobante formal con código hash o detalle de error.' }],
    dependenciasInyectadas: ['IEnrollmentService', 'JwtAuthGuard'],
    moduloRelacionado: 'Matrícula Académica',
    rfAtendido: ['RF-07', 'RF-09', 'RF-11'],
    rnfGarantizado: ['RNF-02', 'RNF-07', 'RNF-08']
  },
  {
    id: 'COMP-06',
    nombre: 'GradesController',
    capa: 'Controladores API',
    responsabilidadPrincipal: 'Endpoints PUT /api/v1/grades/batch (asentar notas por grupo) y GET /api/v1/grades/student (consulta privada).',
    contratoEntrada: [{ nombre: 'req.body', tipo: 'SaveGradesBatchDTO', descripcion: 'Lote de notas con studentId, score, justification' }],
    contratoSalida: [{ nombre: 'res.json', tipo: 'BatchGradeResultDTO (HTTP 200/400/403)', descripcion: 'Resumen de notas asentadas y promedios calculados.' }],
    dependenciasInyectadas: ['IGradesService', 'JwtAuthGuard', 'RoleGuard'],
    moduloRelacionado: 'Calificaciones',
    rfAtendido: ['RF-08', 'RF-09', 'RF-12'],
    rnfGarantizado: ['RNF-07', 'RNF-11']
  },
  {
    id: 'COMP-07',
    nombre: 'CurriculumController',
    capa: 'Controladores API',
    responsabilidadPrincipal: 'Gestión de programas, mallas, periodos lectivos y oferta de grupos (CRUD administrativo/coordinador).',
    contratoEntrada: [{ nombre: 'req.body, req.query', tipo: 'ProgramDTO / GroupFilterDTO', descripcion: 'Filtros y payloads curriculares.' }],
    contratoSalida: [{ nombre: 'res.json', tipo: 'CurriculumResponseDTO[]', descripcion: 'Estructuras curriculares y grupos disponibles.' }],
    dependenciasInyectadas: ['ICurriculumService', 'RoleGuard'],
    moduloRelacionado: 'Gestión Curricular',
    rfAtendido: ['RF-05', 'RF-06', 'RF-11'],
    rnfGarantizado: ['RNF-05', 'RNF-08']
  },

  // CAPA LÓGICA DE NEGOCIO / DOMINIO
  {
    id: 'COMP-08',
    nombre: 'AuthService',
    capa: 'Lógica de Negocio',
    responsabilidadPrincipal: 'Verificación de contraseñas mediante función criptográfica Argon2id, validación de estado del usuario y emisión de tokens con claims RBAC.',
    contratoEntrada: [{ nombre: 'credentials', tipo: 'CredentialsObject', descripcion: 'Usuario y contraseña en texto plano.' }],
    contratoSalida: [{ nombre: 'authResult', tipo: 'TokenClaimsResult', descripcion: 'Token JWT firmado, claims de rol y permisos asociados.' }],
    dependenciasInyectadas: ['IUserRepository', 'IPasswordHasher', 'ITokenProvider', 'IAuditService'],
    moduloRelacionado: 'Autenticación',
    rfAtendido: ['RF-01', 'RF-02', 'RF-12'],
    rnfGarantizado: ['RNF-01', 'RNF-11']
  },
  {
    id: 'COMP-09',
    nombre: 'EnrollmentService',
    capa: 'Lógica de Negocio',
    responsabilidadPrincipal: 'Orquestación de matrícula atómica con bloqueo transaccional, validación de prerrequisitos, límites de créditos y decremento de cupos.',
    contratoEntrada: [{ nombre: 'studentId, periodId, groupIds[]', tipo: 'EnrollmentCommand', descripcion: 'Comando de matrícula para ejecución.' }],
    contratoSalida: [{ nombre: 'enrollmentResult', tipo: 'EnrollmentRecord', descripcion: 'Entidad de matrícula creada con estado ASENTADA y hash único.' }],
    dependenciasInyectadas: ['IEnrollmentRepository', 'ICourseGroupRepository', 'IStudentRepository', 'ITransactionManager', 'IAuditService'],
    moduloRelacionado: 'Matrícula Académica',
    rfAtendido: ['RF-07', 'RF-05', 'RF-06', 'RF-12'],
    rnfGarantizado: ['RNF-02', 'RNF-07', 'RNF-10']
  },
  {
    id: 'COMP-10',
    nombre: 'GradesService',
    capa: 'Lógica de Negocio',
    responsabilidadPrincipal: 'Validación de ventanas temporales de registro, aplicación de reglas de ponderación (100%), cálculo de definitivas y detección de modificaciones.',
    contratoEntrada: [{ nombre: 'docenteId, groupId, gradesList[]', tipo: 'RegisterGradesCommand', descripcion: 'Comando de asentamiento de notas.' }],
    contratoSalida: [{ nombre: 'persistedGrades', tipo: 'GradeCalculationSummary', descripcion: 'Resumen matemático con notas definitivas actualizadas.' }],
    dependenciasInyectadas: ['IGradesRepository', 'ICourseGroupRepository', 'ITransactionManager', 'IAuditService'],
    moduloRelacionado: 'Calificaciones',
    rfAtendido: ['RF-08', 'RF-06', 'RF-12'],
    rnfGarantizado: ['RNF-07', 'RNF-10', 'RNF-11']
  },

  // CAPA ACCESO A DATOS / PERSISTENCIA
  {
    id: 'COMP-11',
    nombre: 'EnrollmentRepository',
    capa: 'Acceso a Datos',
    responsabilidadPrincipal: 'Consultas y operaciones atómicas sobre las tablas matricula y matricula_detalle en PostgreSQL.',
    contratoEntrada: [{ nombre: 'entity / criteria', tipo: 'EnrollmentEntity', descripcion: 'Entidad relacional a persistir o criterios de búsqueda.' }],
    contratoSalida: [{ nombre: 'dbResult', tipo: 'Promise<EnrollmentEntity>', descripcion: 'Fila persistida con identificador primario y timestamps.' }],
    dependenciasInyectadas: ['DatabaseConnectionPool', 'IQueryBuilder'],
    moduloRelacionado: 'Matrícula Académica',
    rfAtendido: ['RF-07', 'RF-09'],
    rnfGarantizado: ['RNF-07', 'RNF-09']
  },
  {
    id: 'COMP-12',
    nombre: 'CourseGroupRepository',
    capa: 'Acceso a Datos',
    responsabilidadPrincipal: 'Gestión de cupos con bloqueos pesimistas / optimistas (SELECT ... FOR UPDATE) y validación de cruces de franjas horarias.',
    contratoEntrada: [{ nombre: 'groupId, quantity', tipo: 'string, number', descripcion: 'ID del grupo y cantidad de cupos a decrementar/incrementar.' }],
    contratoSalida: [{ nombre: 'updatedGroup', tipo: 'Promise<CourseGroupEntity>', descripcion: 'Estado actualizado del cupo disponible del grupo.' }],
    dependenciasInyectadas: ['DatabaseConnectionPool'],
    moduloRelacionado: 'Matrícula & Curricular',
    rfAtendido: ['RF-06', 'RF-07'],
    rnfGarantizado: ['RNF-02', 'RNF-07']
  },
  {
    id: 'COMP-13',
    nombre: 'GradesRepository',
    capa: 'Acceso a Datos',
    responsabilidadPrincipal: 'Persistencia de calificaciones por corte y cálculo de definitivas acumuladas mediante consultas optimizadas.',
    contratoEntrada: [{ nombre: 'gradesBatch', tipo: 'GradeEntity[]', descripcion: 'Arreglo de entidades de calificación a insertar/actualizar.' }],
    contratoSalida: [{ nombre: 'affectedRows', tipo: 'Promise<number>', descripcion: 'Número de registros afectados en la base de datos.' }],
    dependenciasInyectadas: ['DatabaseConnectionPool'],
    moduloRelacionado: 'Calificaciones',
    rfAtendido: ['RF-08', 'RF-09'],
    rnfGarantizado: ['RNF-07', 'RNF-10']
  },
  {
    id: 'COMP-14',
    nombre: 'AuditRepository',
    capa: 'Acceso a Datos',
    responsabilidadPrincipal: 'Inserción append-only inmutable en la tabla sga_auditoria con particionamiento mensual por fecha.',
    contratoEntrada: [{ nombre: 'auditRecord', tipo: 'AuditLogEntity', descripcion: 'Objeto de auditoría con usuario, IP, acción y payloads JSON.' }],
    contratoSalida: [{ nombre: 'logId', tipo: 'Promise<string>', descripcion: 'Identificador del registro de auditoría insertado.' }],
    dependenciasInyectadas: ['DatabaseConnectionPool'],
    moduloRelacionado: 'Auditoría Forense',
    rfAtendido: ['RF-12'],
    rnfGarantizado: ['RNF-01', 'RNF-10']
  },

  // CAPA SERVICIOS TRANSVERSALES
  {
    id: 'COMP-15',
    nombre: 'SecurityContext & JwtInterceptor',
    capa: 'Servicios Transversales',
    responsabilidadPrincipal: 'Extracción, decodificación y validación criptográfica de tokens Bearer JWT; inyección del contexto de seguridad en la petición.',
    contratoEntrada: [{ nombre: 'Authorization Header', tipo: 'string (Bearer token)', descripcion: 'Token JWT remitido por el cliente en cada petición HTTPS.' }],
    contratoSalida: [{ nombre: 'req.userContext', tipo: 'UserPrincipal', descripcion: 'Identidad verificada del usuario, rol RBAC y scopes autorizados.' }],
    dependenciasInyectadas: ['TokenVerifier', 'RevocationBlacklistCache'],
    moduloRelacionado: 'Seguridad Transversal',
    rfAtendido: ['RF-01', 'RF-02'],
    rnfGarantizado: ['RNF-01', 'RNF-11']
  },
  {
    id: 'COMP-16',
    nombre: 'AuditService & EventBus',
    capa: 'Servicios Transversales',
    responsabilidadPrincipal: 'Captura asíncrona no bloqueante de eventos críticos del sistema y enrutamiento hacia la persistencia inmutable.',
    contratoEntrada: [{ nombre: 'domainEvent', tipo: 'DomainAuditEvent', descripcion: 'Evento emitido por Auth, Enrollment o Grades con datos previos y nuevos.' }],
    contratoSalida: [{ nombre: 'void', tipo: 'Promise<void>', descripcion: 'Confirmación de persistencia asíncrona sin frenar el flujo de la transacción principal.' }],
    dependenciasInyectadas: ['IAuditRepository', 'AsyncEventQueue'],
    moduloRelacionado: 'Auditoría Institucional',
    rfAtendido: ['RF-12'],
    rnfGarantizado: ['RNF-02', 'RNF-10']
  }
];

export const FLUJOS_ARQUITECTONICOS: FlujoModuloArquitectonico[] = [
  {
    rf: 'RF-01',
    titulo: 'Módulo de Autenticación de Usuarios',
    capasInvolucradas: ['Presentación', 'Controladores API', 'Lógica de Negocio', 'Acceso a Datos', 'Servicios Transversales'],
    patronArquitectonico: 'Token-Based Authentication (Stateless JWT) + Password Hashing (Argon2id)',
    descripcionMecanismo: 'Gobierna el ingreso y cierre de sesión de credenciales individuales mediante un esquema sin estado (stateless) basado en tokens JWT firmados con clave asimétrica RSA-256 o HMAC-SHA256 y expiración corta (15 min) más refresh tokens seguros con rotación en cookies HttpOnly.',
    pasosEjecucion: [
      { paso: 1, capa: 'Presentación', componente: 'AuthView', accion: 'Captura el email institucional y contraseña; valida formato y emite POST HTTPS /api/v1/auth/login.', garantiaRNF: 'RNF-01 (TLS 1.3)' },
      { paso: 2, capa: 'Controladores API', componente: 'AuthController', accion: 'Sanitiza la entrada, valida LoginRequestDTO y delega a AuthService.', garantiaRNF: 'RNF-08 (OpenAPI REST)' },
      { paso: 3, capa: 'Lógica de Negocio', componente: 'AuthService', accion: 'Solicita el registro de usuario activo al repositorio y contrasta el hash con Argon2id (cost factor 16).', garantiaRNF: 'RNF-01 (Sin texto plano)' },
      { paso: 4, capa: 'Servicios Transversales', componente: 'AuditService', accion: 'Registra el intento de autenticación (exitoso o fallido) con IP, User-Agent y timestamp UTC.', garantiaRNF: 'RNF-10 (Trazabilidad)' },
      { paso: 5, capa: 'Lógica de Negocio', componente: 'AuthService', accion: 'Genera el JWT de acceso con claims { sub, email, role, permissions } y emite la respuesta.', garantiaRNF: 'RNF-11 (Menor privilegio)' }
    ],
    seguridadYAuditoria: 'Protegido contra fuerza bruta mediante Rate Limiting en API Gateway (máximo 5 intentos fallidos por IP/minuto). Evento de LOGIN_SUCCESS o LOGIN_FAILURE auditado en RF-12.',
    garantiasTecnicas: ['Algoritmo de derivación de claves Argon2id', 'Tokens JWT con firma criptográfica', 'Tiempos de respuesta < 500ms (RNF-02)']
  },
  {
    rf: 'RF-02',
    titulo: 'Módulo de Autorización y Control de Acceso RBAC',
    capasInvolucradas: ['Controladores API', 'Lógica de Negocio', 'Servicios Transversales'],
    patronArquitectonico: 'Role-Based Access Control (RBAC) Interceptor + Policy Enforcement Point (PEP)',
    descripcionMecanismo: 'Restringe el acceso a cada endpoint y método de servicio contrastando los roles (ROLE_ADMIN, ROLE_COORDINADOR, ROLE_DOCENTE, ROLE_ESTUDIANTE) y permisos declarados en el token contra las políticas de seguridad del recurso solicitado.',
    pasosEjecucion: [
      { paso: 1, capa: 'Servicios Transversales', componente: 'SecurityContext', accion: 'Extrae el header Authorization Bearer, verifica la firma criptográfica del JWT y el tiempo de expiración.', garantiaRNF: 'RNF-01 (Verificación continua)' },
      { paso: 2, capa: 'Controladores API', componente: 'RoleGuard / PermissionsFilter', accion: 'Comprueba si el rol del usuario posee los privilegios requeridos para el endpoint (ej. ROLE_DOCENTE para registrar notas).', garantiaRNF: 'RNF-11 (Aislamiento de acceso)' },
      { paso: 3, capa: 'Controladores API', componente: 'Controller Dispatcher', accion: 'Si el rol no coincide, retorna HTTP 403 Forbidden sin procesar la petición. Si coincide, inyecta req.user.', garantiaRNF: 'RNF-08 (RFC 7807)' },
      { paso: 4, capa: 'Lógica de Negocio', componente: 'Domain Service Layer', accion: 'Aplica validaciones de pertenencia de datos (ej. un docente solo accede a sus propios grupos asignados).', garantiaRNF: 'RNF-07 (Integridad)' }
    ],
    seguridadYAuditoria: 'Cero exposición de datos a roles no autorizados (RNF-11). Todo intento de acceso denegado (HTTP 403) emite una alerta en la bitácora de auditoría (RF-12).',
    garantiasTecnicas: ['Guarda declarativa en rutas', 'Inspección de scopes a nivel de servicio', 'Principio de menor privilegio institucional']
  },
  {
    rf: 'RF-07',
    titulo: 'Módulo Transaccional de Matrícula Académica',
    capasInvolucradas: ['Presentación', 'Controladores API', 'Lógica de Negocio', 'Acceso a Datos', 'Servicios Transversales'],
    patronArquitectonico: 'ACID Transaction Manager + Concurrency Lock (Optimistic/Pessimistic) + Unit of Work',
    descripcionMecanismo: 'Orquesta la inscripción simultánea de asignaturas por hasta 300 estudiantes concurrentes (RNF-02). Valida prerrequisitos, cruces de horarios y cupos de grupos bajo aislamiento transaccional estricto, garantizando cero sobrecupos ni matrículas duplicadas.',
    pasosEjecucion: [
      { paso: 1, capa: 'Controladores API', componente: 'EnrollmentController', accion: 'Recibe POST /api/v1/enrollments con studentId, periodId y los grupos elegidos. Valida DTO sintácticamente.', garantiaRNF: 'RNF-08 (REST OpenAPI)' },
      { paso: 2, capa: 'Lógica de Negocio', componente: 'EnrollmentService', accion: 'Abre transacción de base de datos con nivel de aislamiento Repeatable Read / Serializable.', garantiaRNF: 'RNF-07 (ACID Consistency)' },
      { paso: 3, capa: 'Lógica de Negocio', componente: 'EnrollmentService', accion: 'Verifica no duplicidad (RN-MAT-01), prerrequisitos aprobados (RN-MAT-03) y ausencia de colisión horaria (RN-MAT-05).', garantiaRNF: 'RNF-07 (Invariantes de negocio)' },
      { paso: 4, capa: 'Acceso a Datos', componente: 'CourseGroupRepository', accion: 'Ejecuta bloqueo de fila (SELECT cupo_disponible FROM grupo WHERE id = :id FOR UPDATE). Si cupo <= 0, aborta con rollback.', garantiaRNF: 'RNF-07 (Cero sobrecupos)' },
      { paso: 5, capa: 'Acceso a Datos', componente: 'EnrollmentRepository', accion: 'Decrementa cupo en 1 unidad e inserta las filas en matricula_detalle con código de confirmación único.', garantiaRNF: 'RNF-02 (Latencia < 3s)' },
      { paso: 6, capa: 'Servicios Transversales', componente: 'AuditService', accion: 'Registra el evento de matrícula exitosa en sga_auditoria con los IDs de grupo y hash de comprobante.', garantiaRNF: 'RNF-10 (Trazabilidad)' }
    ],
    seguridadYAuditoria: 'La transacción completa es atómica: o se inscriben todas las materias válidas o ninguna si falla una invariante. Emisión de comprobante firmado y registro inmutable en RF-12.',
    garantiasTecnicas: ['Bloqueo de fila a nivel de BD para evitar Race Conditions', 'Pool de conexiones dimensionado para 300 hilos concurrentes', 'Rollback automático ante fallos de red']
  },
  {
    rf: 'RF-08',
    titulo: 'Módulo de Registro y Publicación de Calificaciones',
    capasInvolucradas: ['Presentación', 'Controladores API', 'Lógica de Negocio', 'Acceso a Datos', 'Servicios Transversales'],
    patronArquitectonico: 'Domain Calculation Engine + Audit Snapshot + Optimistic Concurrency Token',
    descripcionMecanismo: 'Permite al docente capturar, ponderar y asentar calificaciones parciales y definitivas (escala 0.0 a 5.0) para sus estudiantes adscritos, validando ventanas del cronograma (RF-06), consistencia matemática del 100% y capturando el historial de cambios.',
    pasosEjecucion: [
      { paso: 1, capa: 'Controladores API', componente: 'GradesController', accion: 'Recibe PUT /api/v1/grades/batch con notas del corte, docenteId y justificaciones si hay modificaciones.', garantiaRNF: 'RNF-08 (JSON DTO)' },
      { paso: 2, capa: 'Lógica de Negocio', componente: 'GradesService', accion: 'Verifica que el docente esté formalmente asignado al grupo y que el corte esté abierto según calendario.', garantiaRNF: 'RNF-07 (Reglas de calendario)' },
      { paso: 3, capa: 'Lógica de Negocio', componente: 'GradesService', accion: 'Valida rango numérico de cada nota [0.0 - 5.0] y recalcula la nota definitiva en backend.', garantiaRNF: 'RNF-07 (Consistencia matemática)' },
      { paso: 4, capa: 'Acceso a Datos', componente: 'GradesRepository', accion: 'Persiste las calificaciones en tabla calificacion con estado PUBLICADA y token de versión.', garantiaRNF: 'RNF-07 (Persistencia atómica)' },
      { paso: 5, capa: 'Servicios Transversales', componente: 'AuditService', accion: 'Si una nota preexistente fue modificada, guarda en sga_auditoria: { nota_anterior, nota_nueva, justificacion, docente_id }.', garantiaRNF: 'RNF-10 (Auditoría forense)' }
    ],
    seguridadYAuditoria: 'Aislamiento estricto de visibilidad: los estudiantes únicamente pueden consultar su propia nota (RNF-11, UC-09). Cualquier rectificación requiere justificación obligatoria y es inmutable.',
    garantiasTecnicas: ['Cálculo de promedio en capa de dominio (anti-manipulación cliente)', 'Escala numérica normalizada numeric(3,2)', 'Auditoría diferencial obligatoria']
  },
  {
    rf: 'RF-12',
    titulo: 'Módulo Transversal de Auditoría y Trazabilidad Forense',
    capasInvolucradas: ['Controladores API', 'Lógica de Negocio', 'Acceso a Datos', 'Servicios Transversales'],
    patronArquitectonico: 'Aspect-Oriented Audit Interceptor (AOP) + Append-Only Log Store',
    descripcionMecanismo: 'Registra de manera automática e inalterable cada evento relevante del SGA (inicios de sesión, cambios de roles, transacciones de matrícula y rectificación de notas). Almacena usuario_id, IP origen, fecha/hora UTC, acción ejecutada, entidad afectada y snapshot diferencial en formato JSON.',
    pasosEjecucion: [
      { paso: 1, capa: 'Lógica de Negocio', componente: 'Domain Services', accion: 'Al completarse una mutación de datos (login, matrícula, notas), despacha un evento DomainAuditEvent.', garantiaRNF: 'RNF-10 (Trazabilidad)' },
      { paso: 2, capa: 'Servicios Transversales', componente: 'AuditService', accion: 'Interrumpe el evento mediante cola asíncrona no bloqueante (evita penalizar el p95 de la petición).', garantiaRNF: 'RNF-02 (Rendimiento <= 3s)' },
      { paso: 3, capa: 'Acceso a Datos', componente: 'AuditRepository', accion: 'Inserta el registro en la tabla append-only sga_auditoria (sin permisos de UPDATE ni DELETE para ningún usuario).', garantiaRNF: 'RNF-01 (Inmutabilidad)' },
      { paso: 4, capa: 'Controladores API', componente: 'AuditController', accion: 'Expone endpoints GET /api/v1/audit exclusivamente al Administrador (ROLE_ADMIN) para consulta forense.', garantiaRNF: 'RNF-11 (Privacidad)' }
    ],
    seguridadYAuditoria: 'La tabla de auditoría carece de operaciones de actualización o borrado a nivel de motor de base de datos (INSERT ONLY). Se generan hashes de verificación para detectar alteraciones.',
    garantiasTecnicas: ['Cola en memoria/Worker asíncrono para desacoplar I/O', 'Estructura JSONB indexada en PostgreSQL', 'Trazabilidad bidireccional con requerimientos']
  }
];

export const CODIGO_MERMAID_COMPONENTES = `flowchart TB
    %% ========================================================
    %% DIAGRAMA FORMAL DE COMPONENTES - SECCIÓN 6.2
    %% ARQUITECTURA EN CAPAS (N-TIER) DEL SGA
    %% Conforme a RF-01 a RF-12 y RNF-01 a RNF-12
    %% ========================================================

    %% ACTORES EXTERNOS
    subgraph Actores_Externos ["Clientes y Actores del SGA"]
        direction LR
        UserAdmin["fa:fa-shield-halved Administrador"]
        UserCoord["fa:fa-graduation-cap Coordinador"]
        UserDocente["fa:fa-chalkboard-user Docente"]
        UserEstudiante["fa:fa-user-graduate Estudiante"]
    end

    %% CAPA 1: PRESENTACIÓN
    subgraph Capa_Presentacion ["Capa 1: Presentación (Frontend SPA / Mobile - React 19)"]
        direction TB
        subgraph Views_UI ["Vistas y Componentes React"]
            AuthView["AuthView & SessionManager<br/><i>(Login, 2FA, JWT in-memory)</i>"]
            EnrollView["EnrollmentPlannerView<br/><i>(Horario interactivo, Cupos)</i>"]
            GradesView["GradeSheetGridComponent<br/><i>(Sábana de notas, Validación)</i>"]
            CurricView["CurriculumManagerView<br/><i>(Mallas, Grupos, Docentes)</i>"]
            AuditView["AuditLogViewerComponent<br/><i>(Bitácora Forense Admin)</i>"]
        end
        HttpInterceptor["HttpService & TokenInterceptor<br/><i>(Bearer injection, RFC 7807 handler)</i>"]
        Views_UI --> HttpInterceptor
    end

    %% CANAL SEGURO HTTPS / TLS
    HttpInterceptor == "HTTPS / TLS 1.3 (JSON REST API)" ==> ApiGateway

    %% CAPA 2: CONTROLADORES API
    subgraph Capa_Controladores ["Capa 2: Controladores API / Gateway REST (Node.js / Express)"]
        direction TB
        ApiGateway["API Gateway & Reverse Proxy<br/><i>(Rate Limiter, CORS, Request ID)</i>"]

        subgraph Rest_Controllers ["Controladores RESTful"]
            C_Auth["AuthController<br/><i>/api/v1/auth/*</i>"]
            C_Enroll["EnrollmentController<br/><i>/api/v1/enrollments/*</i>"]
            C_Grades["GradesController<br/><i>/api/v1/grades/*</i>"]
            C_Curric["CurriculumController<br/><i>/api/v1/curriculum/*</i>"]
            C_Audit["AuditController<br/><i>/api/v1/audit/*</i>"]
        end

        ApiGateway --> C_Auth
        ApiGateway --> C_Enroll
        ApiGateway --> C_Grades
        ApiGateway --> C_Curric
        ApiGateway --> C_Audit
    end

    %% CAPA 5: SERVICIOS TRANSVERSALES (CROSS-CUTTING)
    subgraph Capa_Transversal ["Capa 5: Servicios Transversales (Cross-Cutting Concerns)"]
        direction TB
        SecContext["SecurityContext & JwtGuard<br/><i>(RBAC Validator, Claims inspector)</i>"]:::transversal
        AuditEngine["AuditService & EventBus<br/><i>(Asynchronous inmutable logging)</i>"]:::transversal
        CacheService["CacheManager (Redis)<br/><i>(Catálogos & Horarios p95 <= 3s)</i>"]:::transversal
        ErrorHandler["GlobalExceptionHandler<br/><i>(RFC 7807 Error Responses)</i>"]:::transversal
    end

    %% Inyección transversal en controladores
    SecContext -. "Verifica Claims" .-> Rest_Controllers
    Rest_Controllers -. "Errores" .-> ErrorHandler

    %% CAPA 3: LÓGICA DE NEGOCIO / DOMINIO
    subgraph Capa_Dominio ["Capa 3: Lógica de Negocio / Dominio (Clean Domain Services)"]
        direction TB
        subgraph Domain_Services ["Servicios de Aplicación & Reglas"]
            S_Auth["AuthService<br/><i>(Argon2id, Session policy)</i>"]:::dominio
            S_Enroll["EnrollmentService<br/><i>(Transaction Coordinator, ACID)</i>"]:::dominio
            S_Grades["GradesService<br/><i>(Promedios 100%, Validación fechas)</i>"]:::dominio
            S_Curric["CurriculumService<br/><i>(Prerrequisitos DAG, Mallas)</i>"]:::dominio
        end

        subgraph Invariants_Rules ["Invariantes de Negocio (Rules Engine)"]
            RuleCupo{"Validar Cupo > 0<br/>& Cruce Horario"}
            RulePrerreq{"Validar Prerrequisitos<br/>& Créditos"}
            RuleGrade{"Validar Escala 0-5<br/>& Ponderación 100%"}
        end

        S_Enroll --> RuleCupo
        S_Enroll --> RulePrerreq
        S_Grades --> RuleGrade
    end

    %% Controladores llaman Servicios
    C_Auth --> S_Auth
    C_Enroll --> S_Enroll
    C_Grades --> S_Grades
    C_Curric --> S_Curric
    C_Audit --> AuditEngine

    %% Despacho de auditoría desde servicios
    S_Auth -. "Evento Login" .-> AuditEngine
    S_Enroll -. "Evento Matrícula" .-> AuditEngine
    S_Grades -. "Evento Cambio Nota" .-> AuditEngine
    S_Enroll -. "Consulta Horarios" .-> CacheService

    %% CAPA 4: ACCESO A DATOS / PERSISTENCIA
    subgraph Capa_Datos ["Capa 4: Acceso a Datos / Persistencia (Repository Pattern)"]
        direction TB
        subgraph Repositories ["Repositorios de Datos"]
            R_User["UserRepository<br/><i>(findActive, updateLogin)</i>"]
            R_Enroll["EnrollmentRepository<br/><i>(insertDetail, checkDuplicate)</i>"]
            R_Group["CourseGroupRepository<br/><i>(lockForUpdate, decrementCupo)</i>"]
            R_Grades["GradesRepository<br/><i>(saveBatch, calculateAverage)</i>"]
            R_Audit["AuditRepository<br/><i>(insertAppendOnly)</i>"]
        end

        TxManager["TransactionManager (ACID)<br/><i>(Isolation: Repeatable Read / Serializable)</i>"]
        ConnPool["ConnectionPool (Hikari / Pool Pg)<br/><i>(Max 100 connections, Timeout 3s)</i>"]

        Repositories --> TxManager
        TxManager --> ConnPool
    end

    %% Servicios llaman Repositorios
    S_Auth --> R_User
    S_Enroll --> R_Enroll
    S_Enroll --> R_Group
    S_Grades --> R_Grades
    S_Curric --> R_Group
    AuditEngine --> R_Audit

    %% BASE DE DATOS
    subgraph Persistencia_Fisica ["Base de Datos Relacional (PostgreSQL 16)"]
        direction TB
        DB_Master[("PostgreSQL Master<br/><i>(Transacciones Matrícula y Notas)</i>")]
        DB_Audit[("sga_auditoria Partition<br/><i>(Append-Only, Inmutable)</i>")]
        DB_Master --- DB_Audit
    end

    ConnPool ==> DB_Master

    %% Clientes a UI
    UserAdmin --> AuthView
    UserAdmin --> AuditView
    UserCoord --> CurricView
    UserDocente --> GradesView
    UserEstudiante --> EnrollView

    %% ESTILOS VISUALES
    classDef default fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px,color:#0f172a;
    classDef dominio fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,font-weight:bold;
    classDef transversal fill:#faf5ff,stroke:#9333ea,stroke-width:2px,color:#581c87,font-weight:bold;
`;

export const DOCUMENTO_MARKDOWN_COMPLETO_6_2 = `# DOCUMENTO DE ESPECIFICACIÓN DE ARQUITECTURA DE SOFTWARE
## SECCIÓN 6.2: VISTA LÓGICA Y DE COMPONENTES (SISTEMA DE GESTIÓN ACADÉMICA - SGA)

**Documento:** SGA-ARCH-DOC-6.2  
**Versión:** 2.4 (Edición Definitiva para Producción)  
**Autor:** Arquitecto de Software Senior Especializado en Sistemas de Gestión Académica  
**Estándar:** ISO/IEC/IEEE 42010:2011 & IEEE Std 1016-2009  
**Estilo Arquitectónico:** Arquitectura en Capas (N-Tier Layered Architecture) con Inversión de Dependencias  
**Fecha:** Noviembre 2026  

---

### 1. INTRODUCCIÓN Y ENFOQUE ARQUITECTÓNICO

La **Vista Lógica y de Componentes (Sección 6.2)** formaliza la descomposición estructural y modular del **Sistema de Gestión Académica (SGA)**, organizándolo bajo el patrón canónico de **Arquitectura en Capas (N-Tier)**. 

Este enfoque desacopla taxativamente la interacción con el usuario de las reglas de negocio universitarias y de los mecanismos de almacenamiento físico, garantizando la satisfacción rigurosa de los requerimientos de:
- **Mantenibilidad y bajo acoplamiento (RNF-05)**.
- **Rendimiento bajo concurrencia (RNF-02, 300 usuarios simultáneos en $\le$ 3 segundos)**.
- **Integridad y consistencia transaccional ACID (RNF-07)**.
- **Seguridad perimetral y menor privilegio (RNF-01, RNF-11)**.
- **Trazabilidad forense inmutable de eventos (RF-12, RNF-10)**.

---

### 2. DESCRIPCIÓN DETALLADA DE LAS CAPAS DEL SISTEMA

#### 2.1 Capa 1: Capa de Presentación (Frontend SPA / Mobile)
- **Tecnologías:** React 19, TypeScript, Tailwind CSS, Web Components accesibles (WCAG AA).
- **Propósito:** Proveer interfaces gráficas fluidas, responsivas y accesibles para los cuatro roles de usuario (Administrador, Coordinador, Docente, Estudiante).
- **Responsabilidades Técnicas:**
  1. Renderizado de componentes UI adaptables a móviles y escritorio (**RNF-06**, **RNF-12**).
  2. Prevalidación de formularios en el cliente para minimizar llamadas innecesarias al servidor.
  3. Manejo de estado en memoria y almacenamiento seguro de tokens volátiles (nunca almacenar JWT en LocalStorage desprotegido).
  4. Interceptor HTTP de peticiones para inyectar cabeceras de autorización \`Bearer <token>\` y cabeceras de correlación \`X-Correlation-ID\`.
  5. Caché de vistas de consulta rápida para garantizar tiempos de visualización inmediatos (**RNF-02**).

#### 2.2 Capa 2: Capa de Controladores API / Gateway REST
- **Tecnologías:** Node.js, Express, TypeScript, OpenAPI 3.0, JSON Schema Validators.
- **Propósito:** Actuar como la fachada perimetral que recibe las solicitudes HTTP, aplica rate-limiting, verifica la sintaxis de los datos y enruta la ejecución.
- **Responsabilidades Técnicas:**
  1. Exposición de endpoints RESTful con verbos y códigos de estado semánticos (GET, POST, PUT, DELETE).
  2. Validación estricta de esquemas DTO (Data Transfer Objects) descartando payloads malformados antes de invocar el dominio.
  3. Traducción estandarizada de errores y excepciones de negocio según la especificación **RFC 7807 (Problem Details for HTTP APIs)**.
  4. Protección perimetral contra ataques de denegación de servicio (Rate Limiting de 100 peticiones/minuto por cliente).
  5. Terminación TLS y sanitización de encabezados HTTP.

#### 2.3 Capa 3: Capa de Lógica de Negocio / Dominio
- **Tecnologías:** Domain Services, Entities, Specification Pattern, Transaction Coordinator.
- **Propósito:** Corazón del sistema donde residen las reglas académicas, la orquestación de transacciones y las invariantes institucionales.
- **Responsabilidades Técnicas:**
  1. Orquestación del proceso de matrícula académica (**RF-07**), validando prerrequisitos, límites de créditos y prevención de traslapes.
  2. Control de concurrencia y reserva atómica de cupos para evitar el problema de sobrecupo (Race Conditions).
  3. Motor de cálculo de calificaciones (**RF-08**), asegurando la normalización en escala 0.0 - 5.0 y ponderaciones al 100%.
  4. Coordinación declarativa de transacciones ACID (\`TransactionManager.runInTransaction\`).
  5. Despacho asíncrono de eventos de dominio hacia la capa transversal de auditoría (**RF-12**).

#### 2.4 Capa 4: Capa de Acceso a Datos / Persistencia
- **Tecnologías:** Repository Pattern, PostgreSQL 16, Connection Pool (Hikari/PgPool), Drizzle/Prisma ORM.
- **Propósito:** Aislar las operaciones de base de datos relacionales, garantizando persistencia confiable, mapeo de datos y transaccionalidad.
- **Responsabilidades Técnicas:**
  1. Abstracción del almacenamiento relacional mediante el patrón Repositorio (\`IEnrollmentRepository\`, \`IGradesRepository\`, etc.).
  2. Ejecución de sentencias de bloqueo pesimista (\`SELECT ... FOR UPDATE\`) o validación de versión optimista (\`version_number\`).
  3. Administración del pool de conexiones dimensionado para atender 300 peticiones concurrentes sin encolamiento excesivo.
  4. Preservación del histórico de datos mediante borrado lógico (\`soft-delete\`) en entidades de estudiantes y docentes.
  5. Mantenimiento de particiones físicas en la tabla de auditoría para garantizar lecturas rápidas sin degradar la escritura.

#### 2.5 Capa 5: Servicios Transversales (Cross-Cutting Concerns)
- **Tecnologías:** Json Web Tokens (JWT), Argon2id, Event Bus, Redis Cache, Pino Structured Logger.
- **Propósito:** Proveer funcionalidades no funcionales que atraviesan horizontalmente todas las capas sin acoplarlas a una infraestructura particular.
- **Responsabilidades Técnicas:**
  1. Autenticación criptográfica individual y firma de tokens JWT (**RF-01**, **RNF-01**).
  2. Guardas de autorización RBAC (**RF-02**, **RNF-11**) a nivel de rutas y servicios.
  3. Registro inmutable de auditoría forense (**RF-12**, **RNF-10**) con política \`INSERT ONLY\`.
  4. Mecanismo de caché distribuida (Redis) para consultas frecuentes de asignaturas y horarios.
  5. Interceptor global de excepciones y emisión de telemetría de rendimiento (p95 latency).

---

### 3. CONTRATOS, RESPONSABILIDADES Y DEPENDENCIAS DE COMPONENTES INTERNOS

| Componente | Capa | Responsabilidad Principal | Contrato de Entrada (DTO) | Contrato de Salida | Dependencias Inyectadas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AuthController** | Controladores API | Enrutamiento de autenticación (login, logout, refresh). | \`LoginRequestDTO { email, password }\` | \`AuthResponseDTO (200) / Error (401)\` | \`IAuthService\`, \`IAuditService\` |
| **EnrollmentController** | Controladores API | Exposición de endpoints de matrícula y horarios. | \`CreateEnrollmentDTO { studentId, groupIds[] }\` | \`EnrollmentResultDTO (201/409)\` | \`IEnrollmentService\`, \`JwtGuard\` |
| **GradesController** | Controladores API | Exposición de registro de notas por corte y consulta. | \`BatchGradesDTO { groupId, grades[] }\` | \`GradeSummaryDTO (200/400)\` | \`IGradesService\`, \`RoleGuard\` |
| **CurriculumController** | Controladores API | Gestión de programas, periodos, grupos y mallas. | \`ProgramDTO / GroupFilterDTO\` | \`CurriculumDTO[] (200)\` | \`ICurriculumService\` |
| **AuditController** | Controladores API | Consulta de bitácora forense para Administrador. | \`AuditQueryDTO { userId, entity, from, to }\` | \`AuditLogRecordDTO[] (200)\` | \`IAuditService\`, \`AdminGuard\` |
| **AuthService** | Lógica Negocio | Verificación con Argon2id y generación de tokens JWT. | \`CredentialsObject\` | \`TokenClaimsResult\` | \`IUserRepository\`, \`ITokenProvider\` |
| **EnrollmentService** | Lógica Negocio | Orquestación transaccional ACID de matrícula y cupos. | \`EnrollmentCommand\` | \`EnrollmentRecord\` | \`IEnrollmentRepo\`, \`IGroupRepo\`, \`ITxManager\` |
| **GradesService** | Lógica Negocio | Validación matemática, cálculo 100% y fechas límite. | \`RegisterGradesCommand\` | \`GradeCalculationSummary\` | \`IGradesRepo\`, \`IGroupRepo\`, \`ITxManager\` |
| **EnrollmentRepository** | Acceso a Datos | Inserción atómica de detalles de matrícula en PostgreSQL. | \`EnrollmentEntity\` | \`Promise<EnrollmentEntity>\` | \`DatabaseConnectionPool\` |
| **CourseGroupRepository**| Acceso a Datos | Bloqueo de fila \`FOR UPDATE\` y decremento de cupos. | \`groupId, deltaQuantity\` | \`Promise<CourseGroupEntity>\` | \`DatabaseConnectionPool\` |
| **GradesRepository** | Acceso a Datos | Persistencia de calificaciones por corte y promedios. | \`GradeEntity[]\` | \`Promise<number>\` | \`DatabaseConnectionPool\` |
| **AuditRepository** | Acceso a Datos | Inserción append-only inmutable en tabla sga_auditoria. | \`AuditLogEntity\` | \`Promise<string>\` | \`DatabaseConnectionPool\` |
| **SecurityContext** | Transversal | Verificación de firma JWT e inyección de identidad. | \`Authorization: Bearer <token>\` | \`UserPrincipal { sub, role, perms }\` | \`TokenVerifier\`, \`BlacklistCache\` |
| **AuditService** | Transversal | Recepción asíncrona de eventos y registro inmutable. | \`DomainAuditEvent\` | \`Promise<void>\` (Non-blocking) | \`IAuditRepository\`, \`EventQueue\` |

---

### 4. ATENCIÓN EXPLÍCITA A LOS MÓDULOS CRÍTICOS

#### 4.1 Autenticación (RF-01) y Seguridad (RNF-01)
1. El usuario envía sus credenciales al endpoint seguro \`POST /api/v1/auth/login\` sobre **TLS 1.3**.
2. \`AuthController\` valida el esquema del DTO y delega en \`AuthService\`.
3. \`AuthService\` recupera la cuenta activa desde \`UserRepository\` y evalúa la contraseña usando la función de derivación de claves **Argon2id** (o Bcrypt con costo 12).
4. Si la verificación es exitosa:
   - Se genera un token de acceso JWT con tiempo de vida corto (15 min) firmado criptográficamente, incluyendo los claims \`role\` y \`permissions\`.
   - Se genera un \`refresh_token\` opaco con rotación obligatoria almacenado en cookie segura \`HttpOnly\`, \`SameSite=Strict\`.
5. Se emite un evento al \`AuditService\` registrando la IP de origen, usuario y estado del acceso (**RF-12**).

#### 4.2 Autorización RBAC (RF-02) y Privacidad (RNF-11)
1. Para cada solicitud protegida, el interceptor \`SecurityContext\` extrae el JWT, comprueba la firma y verifica que no esté en la lista negra de revocación en memoria (**Redis**).
2. La guarda de seguridad (\`RoleGuard\`) valida si el rol del usuario (\`ROLE_ADMIN\`, \`ROLE_COORDINADOR\`, \`ROLE_DOCENTE\`, \`ROLE_ESTUDIANTE\`) está habilitado para el recurso solicitado.
3. Si el rol no cuenta con el permiso, el interceptor aborta inmediatamente con **HTTP 403 Forbidden**, registrando el intento en la bitácora (**RF-12**).
4. En la capa de dominio, los servicios aplican **Row-Level Security lógico**: un estudiante solo recibe sus propias notas; un docente solo recibe sus grupos asignados.

#### 4.3 Matrícula Académica (RF-07) y Consistencia Concurrente (RNF-02, RNF-07)
1. El estudiante envía la lista de asignaturas y grupos seleccionados a \`POST /api/v1/enrollments\`.
2. \`EnrollmentService\` inicia una transacción con nivel de aislamiento **Repeatable Read / Serializable** mediante el \`TransactionManager\`.
3. Se ejecutan las validaciones de negocio en el siguiente orden:
   - **RN-MAT-01:** Verificación de unicidad en \`EnrollmentRepository\` (no estar matriculado previamente en el periodo).
   - **RN-MAT-03:** Consulta del grafo de prerrequisitos aprobados en el expediente del estudiante.
   - **RN-MAT-05:** Comprobación algorítmica de ausencia de cruces de franjas horarias entre los grupos solicitados.
4. Para cada grupo seleccionado, \`CourseGroupRepository\` ejecuta una consulta con bloqueo pesimista:
   \`SELECT cupo_disponible FROM grupo WHERE id = :id FOR UPDATE;\`
5. Si \`cupo_disponible <= 0\`, la transacción dispara una excepción de negocio que fuerza un **ROLLBACK** integral, informando al estudiante sin inconsistencias.
6. Si hay cupo, se decrementa en 1 unidad el cupo de cada grupo, se insertan los registros en \`matricula_detalle\`, se hace **COMMIT** y se emite el evento a \`AuditService\` (**RF-12**).
7. Todo el flujo se completa en menos de 3.0 segundos con hasta 300 solicitudes simultáneas (**RNF-02**).

#### 4.4 Registro de Calificaciones (RF-08) e Integridad (RNF-07, RNF-10)
1. El docente remite el lote de calificaciones a \`PUT /api/v1/grades/batch\`.
2. \`GradesService\` valida que el \`docente_id\` coincida con el profesor asignado al grupo y que el corte evaluativo esté dentro de la fecha del calendario (**RF-06**).
3. Se valida que cada calificación numérica cumpla el rango institucional \`0.0 \le nota \le 5.0\` con precisión decimal de dos cifras.
4. El motor de cálculo en el backend computa la definitiva ponderada con base en los porcentajes oficiales (sumatoria exacta al 100%).
5. En caso de modificación de una nota previamente asentada, el servicio exige obligatoriamente un campo \`justification\`.
6. Se realiza el commit de las calificaciones y se despacha a \`AuditService\` un registro diferencial con: nota anterior, nota nueva, docente, justificación y timestamp UTC (**RF-12**).
7. Las calificaciones quedan disponibles para visualización individual del estudiante en **UC-09**.

#### 4.5 Auditoría Transversal (RF-12) y Trazabilidad Forense (RNF-10)
1. Las operaciones críticas publican eventos de dominio (\`DomainAuditEvent\`).
2. \`AuditService\` procesa los eventos mediante un bus asíncrono no bloqueante para no penalizar el tiempo de respuesta p95 de las peticiones de usuario.
3. \`AuditRepository\` inserta los eventos en la tabla \`sga_auditoria\` configurada como **Append-Only** (sin permisos de \`UPDATE\` ni \`DELETE\` a nivel de usuario de base de datos).
4. El registro incluye: \`id\`, \`usuario_id\`, \`rol\`, \`ip_origen\`, \`accion\`, \`entidad_afectada\`, \`id_entidad\`, \`valores_previos (JSON)\`, \`valores_nuevos (JSON)\`, \`fecha_utc\` y \`hash_integridad\`.
5. Exclusivamente el rol \`ROLE_ADMIN\` tiene acceso a consultar la bitácora mediante el \`AuditController\`.

---

### 5. CÓDIGO MERMAID.JS FORMAL DE LA VISTA DE COMPONENTES

\`\`\`mermaid
${CODIGO_MERMAID_COMPONENTES}
\`\`\`

---

### 6. CONCLUSIÓN ARQUITECTÓNICA DE LA SECCIÓN 6.2

La **Vista Lógica y de Componentes (Sección 6.2)** consolida un diseño desacoplado, escalable y mantenible para el Sistema de Gestión Académica (SGA). Mediante el aislamiento estricto de responsabilidades entre la Presentación, Controladores, Dominio, Persistencia y Servicios Transversales, el sistema garantiza:
1. Resiliencia ante picos de concurrencia en épocas de matrícula (300 usuarios sin degradación ni sobrecupos).
2. Seguridad perimetral y trazabilidad forense inmutable ante rectificaciones de notas y cambios de roles.
3. Apego total a los estándares internacionales de ingeniería de software (ISO/IEC/IEEE 42010 y IEEE Std 1016).
`;
