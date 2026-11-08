/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Documento de Arquitectura de Software: Sistema de Gestión Académica (SGA)
 * Sección 6.1: Modelo de Casos de Uso
 * Especificación formal basada en estándares IEEE 830 / ISO/IEC/IEEE 29148.
 */

export interface Actor {
  id: string;
  nombre: string;
  rolTecnico: string;
  icono: string;
  descripcion: string;
  responsabilidades: string[];
  privilegiosSeguridad: string[];
  rfRelacionados: string[];
  rnfRelacionados: string[];
  superficieInteraccion: string;
  perfilAcceso: string;
}

export interface CasoDeUso {
  id: string;
  nombre: string;
  actorPrincipal: string;
  actoresSecundarios: string[];
  rfRelacionados: string[];
  rnfRelacionados: string[];
  criticidad: 'Crítica' | 'Alta' | 'Media';
  subsistema: string;
  descripcion: string;
  precondicionBreve: string;
  postcondicionBreve: string;
}

export interface FlujoPaso {
  paso: number;
  actor: string;
  accion: string;
  sistema: string;
}

export interface FlujoAlternativo {
  id: string;
  titulo: string;
  condicion: string;
  pasos: string[];
  resultado: string;
}

export interface PlantillaCasoDeUso {
  id: string;
  nombre: string;
  version: string;
  fecha: string;
  autor: string;
  actorPrincipal: string;
  actoresSecundarios: string[];
  rfRelacionados: string[];
  rnfRelacionados: string[];
  criticidad: 'Crítica' | 'Alta';
  proposito: string;
  alcance: string;
  precondiciones: string[];
  flujoPrincipal: FlujoPaso[];
  flujosAlternativos: FlujoAlternativo[];
  flujosExcepcion: FlujoAlternativo[];
  postcondicionesExito: string[];
  postcondicionesFallo: string[];
  reglasNegocio: { codigo: string; nombre: string; definicion: string }[];
  criteriosArquitectura: { rnf: string; requisito: string; mecanismoImplementacion: string }[];
}

export interface RequerimientoFuncional {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface RequerimientoNoFuncional {
  id: string;
  nombre: string;
  descripcion: string;
  metricaObjetivo: string;
}

export const REQUERIMIENTOS_FUNCIONALES: RequerimientoFuncional[] = [
  { id: 'RF-01', nombre: 'Autenticación', descripcion: 'El sistema debe permitir que los usuarios inicien y cierren sesión mediante credenciales individuales.' },
  { id: 'RF-02', nombre: 'Roles y permisos', descripcion: 'El sistema debe manejar, como mínimo, los roles de administrador, coordinador académico, docente y estudiante, y restringir las funciones según los permisos asignados.' },
  { id: 'RF-03', nombre: 'Gestión de estudiantes', descripcion: 'El administrador o personal autorizado debe poder registrar, consultar, actualizar y desactivar registros de estudiantes.' },
  { id: 'RF-04', nombre: 'Gestión de docentes', descripcion: 'El personal autorizado debe poder registrar, consultar, actualizar y desactivar registros de docentes.' },
  { id: 'RF-05', nombre: 'Programas y asignaturas', descripcion: 'El sistema debe permitir crear y actualizar programas académicos, planes de estudio y asignaturas, incluyendo código, nombre, créditos y semestre o nivel.' },
  { id: 'RF-06', nombre: 'Grupos y periodos', descripcion: 'El sistema debe permitir configurar periodos académicos, grupos, cupos, docentes asignados, horarios y aulas o enlaces de encuentro.' },
  { id: 'RF-07', nombre: 'Matrícula académica', descripcion: 'El sistema debe permitir matricular estudiantes en asignaturas o grupos de un periodo, validar cupos y evitar matrículas duplicadas.' },
  { id: 'RF-08', nombre: 'Registro de calificaciones', descripcion: 'El docente debe poder registrar y actualizar calificaciones de los estudiantes matriculados en sus grupos, dentro de los permisos asignados.' },
  { id: 'RF-09', nombre: 'Consulta de resultados', descripcion: 'El estudiante debe poder consultar sus asignaturas matriculadas, horarios y calificaciones publicadas.' },
  { id: 'RF-10', nombre: 'Reportes', descripcion: 'El sistema debe generar reportes básicos de estudiantes matriculados, grupos, asignaturas y resultados académicos, con filtros por periodo y programa.' },
  { id: 'RF-11', nombre: 'Búsqueda y filtros', descripcion: 'Los usuarios autorizados deben poder buscar registros y filtrar resultados por identificadores, nombres, programa, periodo o estado, según el módulo.' },
  { id: 'RF-12', nombre: 'Auditoría', descripcion: 'El sistema debe registrar eventos relevantes, como inicios de sesión, cambios de roles, matrículas y modificaciones de calificaciones, identificando usuario, fecha, acción y registro afectado.' },
];

export const REQUERIMIENTOS_NO_FUNCIONALES: RequerimientoNoFuncional[] = [
  { id: 'RNF-01', nombre: 'Seguridad', descripcion: 'Comunicaciones protegidas mediante HTTPS; contraseñas nunca en texto plano (hashing bcrypt/argon2); control de acceso por roles (RBAC).', metricaObjetivo: 'TLS 1.3, hashing salteado factor costo >= 12, cero credenciales en logs.' },
  { id: 'RNF-02', nombre: 'Rendimiento', descripcion: 'En condiciones normales, >= 95% de consultas comunes responden en <= 3 segundos con hasta 300 usuarios concurrentes.', metricaObjetivo: 'Latencia p95 <= 3.0s con 300 sesiones activas simultáneas.' },
  { id: 'RNF-03', nombre: 'Disponibilidad', descripcion: 'Disponibilidad mensual objetivo de al menos 99,5%, excluyendo mantenimientos programados informados.', metricaObjetivo: 'SLA >= 99.5% (máximo 3.6 horas de indisponibilidad no planificada/mes).' },
  { id: 'RNF-04', nombre: 'Escalabilidad', descripcion: 'Aumento elástico de cómputo y soporte al crecimiento de usuarios, periodos, cursos y registros sin reescritura arquitectónica.', metricaObjetivo: 'Escalado horizontal stateless en capa web/app; particionamiento lógico de BD.' },
  { id: 'RNF-05', nombre: 'Mantenibilidad', descripcion: 'Separación estricta de responsabilidades (Clean/Hexagonal Architecture), bajo acoplamiento y alta cohesión modular.', metricaObjetivo: 'Cobertura de pruebas unitarias >= 80%, módulos de dominio desacoplados.' },
  { id: 'RNF-06', nombre: 'Usabilidad y accesibilidad', descripcion: 'Interfaz consistente, responsive para desktop y móvil, contraste WCAG AA, navegación por teclado en flujos núcleo.', metricaObjetivo: 'Cumplimiento WCAG 2.1 Nivel AA, soporte completo de tabulación e inputs accesibles.' },
  { id: 'RNF-07', nombre: 'Integridad y consistencia', descripcion: 'Operaciones de matrícula y calificaciones con validación estricta de reglas de negocio y consistencia ACID ante concurrencia.', metricaObjetivo: 'Nivel de aislamiento Serializable/Repeatable Read o Bloqueo Optimista, cero sobrecupos ni notas huérfanas.' },
  { id: 'RNF-08', nombre: 'Interoperabilidad', descripcion: 'Exposición de interfaces documentadas mediante API REST (OpenAPI 3.0) para integración con ecosistemas institucionales.', metricaObjetivo: 'Especificación OpenAPI 3.0 estándar, endpoints RESTful con formato JSON estándar.' },
  { id: 'RNF-09', nombre: 'Respaldo y recuperación', descripcion: 'Copias de seguridad periódicas automatizadas y procedimiento documentado de restauración ante contingencias (RPO/RTO).', metricaObjetivo: 'Backups diarios completos + WAL continuos (RPO <= 1h, RTO <= 4h).' },
  { id: 'RNF-10', nombre: 'Trazabilidad', descripcion: 'Decisiones arquitectónicas y requerimientos vinculados con componentes, modelos de datos y evidencias de auditoría.', metricaObjetivo: 'Matriz bidireccional 100% de cobertura entre RF/RNF y componentes de software.' },
  { id: 'RNF-11', nombre: 'Privacidad', descripcion: 'Principio de menor privilegio; limitación de acceso a datos personales y académicos según el rol, evitando filtraciones.', metricaObjetivo: 'Filtrado de atributos sensibles en capa de servicio, aislamiento estricto de expedientes.' },
  { id: 'RNF-12', nombre: 'Compatibilidad', descripcion: 'Funcionamiento óptimo en versiones recientes de navegadores modernos (Chrome, Firefox, Safari, Edge) y pantallas múltiples.', metricaObjetivo: 'Compatibilidad cross-browser (últimas 2 versiones mayores) y viewport 360px a 2560px.' },
];

export const ACTORES_SISTEMA: Actor[] = [
  {
    id: 'ACT-01',
    nombre: 'Administrador del Sistema',
    rolTecnico: 'ROLE_ADMIN',
    icono: 'ShieldAlert',
    descripcion: 'Custodio técnico y operativo de la infraestructura de la aplicación. Posee el control supremo sobre el aprovisionamiento de cuentas maestras, asignación de roles y privilegios de seguridad (RBAC), monitoreo de salud del sistema, gestión de credenciales y auditoría forense de eventos.',
    responsabilidades: [
      'Aprovisionamiento, modificación y desactivación de cuentas de usuarios del sistema.',
      'Configuración y mantenimiento de la matriz de roles y políticas de permisos (RBAC).',
      'Gestión integral de expedientes maestros de estudiantes y planta docente.',
      'Monitoreo del registro inmutable de auditoría (logs de transacciones, inicios de sesión y mutaciones de estado).',
      'Supervisión de políticas de seguridad, backups y contingencia operativa.'
    ],
    privilegiosSeguridad: [
      'Acceso irrestricto de lectura y escritura sobre el módulo de usuarios y roles.',
      'Capacidad de forzar revocación de tokens y sesiones concurrentes.',
      'Acceso exclusivo a la visualización y exportación de bitácoras de auditoría institucional (RF-12).',
      'Desactivación lógica de registros (soft-delete) para preservar integridad referencial.'
    ],
    rfRelacionados: ['RF-01', 'RF-02', 'RF-03', 'RF-04', 'RF-10', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-03', 'RNF-05', 'RNF-09', 'RNF-10', 'RNF-11'],
    superficieInteraccion: 'Consola Web Administrativa con autenticación de dos factores (2FA/MFA) y sesión con timeout por inactividad.',
    perfilAcceso: 'Superusuario con privilegios elevados de infraestructura y seguridad de datos.'
  },
  {
    id: 'ACT-02',
    nombre: 'Coordinador Académico',
    rolTecnico: 'ROLE_COORDINADOR',
    icono: 'GraduationCap',
    descripcion: 'Líder de la gestión curricular y la planificación de la oferta académica institucional. Diseña mallas curriculares, estructura planes de estudio, abre y parametriza periodos lectivos, configura grupos con cupos, horarios, aulas y asigna docentes titulares a cada grupo.',
    responsabilidades: [
      'Creación y actualización de programas académicos, asignaturas y créditos formativos.',
      'Apertura, parametrización y cierre formal de periodos académicos institucionales.',
      'Programación de la oferta académica: creación de grupos, asignación de cupos máximos, horarios y espacios físicos/virtuales.',
      'Asignación formal de la carga académica docente en los grupos habilitados.',
      'Gestión de matrículas asistidas o excepcionales y resolución de conflictos de cupo o prerrequisitos.',
      'Generación de reportes consolidados de rendimiento curricular, deserción y ocupación.'
    ],
    privilegiosSeguridad: [
      'Permiso de escritura sobre catálogos curriculares, mallas, grupos y calendarios de periodos.',
      'Autorización para ejecutar matrículas directas por excepción y reaperturas extraordinarias de actas.',
      'Acceso de consulta general sobre notas y matrículas del programa bajo su coordinación.'
    ],
    rfRelacionados: ['RF-01', 'RF-02', 'RF-05', 'RF-06', 'RF-07', 'RF-10', 'RF-11'],
    rnfRelacionados: ['RNF-02', 'RNF-06', 'RNF-07', 'RNF-08', 'RNF-10', 'RNF-11'],
    superficieInteraccion: 'Portal de Coordinación Curricular con tableros de control de cupos, mallas y asignación de carga horaria.',
    perfilAcceso: 'Usuario de gestión operativa con facultades de configuración curricular y resolución académica.'
  },
  {
    id: 'ACT-03',
    nombre: 'Docente',
    rolTecnico: 'ROLE_DOCENTE',
    icono: 'BookOpenCheck',
    descripcion: 'Facilitador del proceso de enseñanza y evaluación de los estudiantes matriculados en sus grupos asignados. Es el responsable exclusivo del ingreso oportuno, rectificación fundamentada y publicación de calificaciones cuantitativas y cualitativas de acuerdo al cronograma institucional.',
    responsabilidades: [
      'Consulta de listas oficiales de estudiantes formalmente matriculados en sus grupos activos.',
      'Captura, actualización y verificación de calificaciones parciales, cortes evaluativos y notas definitivas.',
      'Consolidación y cierre de actas de notas dentro de las fechas fijadas en el calendario académico.',
      'Emisión de reportes de asistencia y rendimiento por grupo pedagógico.',
      'Atención a reclamos de notas y registro de modificaciones con justificación auditable.'
    ],
    privilegiosSeguridad: [
      'Escritura restringida únicamente a las columnas de notas de los grupos y estudiantes formalmente bajo su tutela.',
      'Bloqueo automático de edición al vencer la ventana temporal de registro establecida en RF-06.',
      'Imposibilidad de alterar matrículas, crear grupos o acceder a notas de asignaturas de otros docentes.'
    ],
    rfRelacionados: ['RF-01', 'RF-02', 'RF-06', 'RF-08', 'RF-10', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-06', 'RNF-07', 'RNF-10', 'RNF-11', 'RNF-12'],
    superficieInteraccion: 'Libreta Digital de Calificaciones Web/Responsive con validación en tiempo real y confirmación criptográfica de acta.',
    perfilAcceso: 'Usuario operativo con permisos acotados al ámbito pedagógico de sus cursos vigentes.'
  },
  {
    id: 'ACT-04',
    nombre: 'Estudiante',
    rolTecnico: 'ROLE_ESTUDIANTE',
    icono: 'UserCheck',
    descripcion: 'Beneficiario y actor central del autoservicio académico. Realiza la selección e inscripción autónoma de asignaturas en periodos de matrícula vigentes, consulta su horario lectivo, revisa las aulas/enlaces de clase y monitorea en tiempo real sus calificaciones publicadas e historial.',
    responsabilidades: [
      'Autenticación segura en el portal estudiantil para gestión personal.',
      'Selección de asignaturas y grupos conforme al plan de estudios, disponibilidad de cupos y horarios.',
      'Confirmación formal de matrícula académica dentro del periodo reglamentario.',
      'Consulta de carga académica matriculada, horarios y enlaces de encuentro.',
      'Monitoreo continuo de calificaciones parciales y finales registradas por el cuerpo docente.'
    ],
    privilegiosSeguridad: [
      'Permiso de escritura exclusivo sobre la creación/eliminación de sus propias líneas de matrícula durante el periodo habilitado.',
      'Lectura estrictamente aislada a sus propios datos personales, asignaturas y calificaciones (RNF-11 Privacidad).',
      'Prohibición total de acceso a calificaciones o historiales de otros estudiantes.'
    ],
    rfRelacionados: ['RF-01', 'RF-02', 'RF-07', 'RF-09', 'RF-11'],
    rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-06', 'RNF-07', 'RNF-11', 'RNF-12'],
    superficieInteraccion: 'Portal de Autoservicio Estudiantil 100% Mobile-first y Desktop accesible con interfaz intuitiva y confirmaciones claras.',
    perfilAcceso: 'Usuario final de autoservicio con alcance restringido a su propio expediente académico.'
  }
];

export const MATRIZ_CASOS_DE_USO: CasoDeUso[] = [
  {
    id: 'UC-01',
    nombre: 'Autenticar Usuario en el Sistema',
    actorPrincipal: 'Todos los Actores',
    actoresSecundarios: ['Servicio de Auditoría'],
    rfRelacionados: ['RF-01', 'RF-02'],
    rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-10', 'RNF-11'],
    criticidad: 'Crítica',
    subsistema: 'Seguridad y Acceso',
    descripcion: 'Valida las credenciales individuales del usuario (nombre de usuario/correo institucional y contraseña cifrada), genera el token de sesión seguro con sus roles asignados y registra el evento de acceso.',
    precondicionBreve: 'Usuario registrado y activo en el sistema.',
    postcondicionBreve: 'Sesión autenticada con token JWT/Session ID y log emitido en auditoría.'
  },
  {
    id: 'UC-02',
    nombre: 'Gestionar Roles y Políticas de Permisos (RBAC)',
    actorPrincipal: 'Administrador',
    actoresSecundarios: ['Servicio de Auditoría'],
    rfRelacionados: ['RF-02', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-05', 'RNF-10', 'RNF-11'],
    criticidad: 'Alta',
    subsistema: 'Seguridad y Acceso',
    descripcion: 'Permite al Administrador crear, modificar, asociar o revocar perfiles y permisos a usuarios del sistema, garantizando el principio de menor privilegio institucional.',
    precondicionBreve: 'Administrador autenticado con sesión privilegiada activa.',
    postcondicionBreve: 'Permisos actualizados en la base de datos de control de acceso y log de cambio registrado.'
  },
  {
    id: 'UC-03',
    nombre: 'Gestionar Expediente de Estudiantes',
    actorPrincipal: 'Administrador',
    actoresSecundarios: ['Coordinador Académico'],
    rfRelacionados: ['RF-03', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-06', 'RNF-10', 'RNF-11'],
    criticidad: 'Alta',
    subsistema: 'Administración de Usuarios',
    descripcion: 'Permite registrar un nuevo estudiante, actualizar su información de contacto, consultar su ficha académica y desactivar lógicamente su cuenta preservando el historial.',
    precondicionBreve: 'Usuario con rol Administrador o Coordinador autorizado autenticado.',
    postcondicionBreve: 'Estudiante creado/modificado/desactivado con trazabilidad en bitácora.'
  },
  {
    id: 'UC-04',
    nombre: 'Gestionar Planta Docente',
    actorPrincipal: 'Administrador',
    actoresSecundarios: ['Coordinador Académico'],
    rfRelacionados: ['RF-04', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-06', 'RNF-10', 'RNF-11'],
    criticidad: 'Alta',
    subsistema: 'Administración de Usuarios',
    descripcion: 'Permite registrar docentes, actualizar sus especialidades y datos de contacto, y gestionar su estado operativo (activo/inactivo) en la institución.',
    precondicionBreve: 'Administrador autenticado en la consola de gestión.',
    postcondicionBreve: 'Registro docente persistido y disponible para asignación de grupos.'
  },
  {
    id: 'UC-05',
    nombre: 'Matricular Asignaturas / Matricular Estudiante',
    actorPrincipal: 'Estudiante / Coordinador Académico',
    actoresSecundarios: ['Docente', 'Servicio Transaccional de Concurrencia', 'Servicio de Auditoría'],
    rfRelacionados: ['RF-07', 'RF-02', 'RF-05', 'RF-06', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-04', 'RNF-06', 'RNF-07', 'RNF-10', 'RNF-11'],
    criticidad: 'Crítica',
    subsistema: 'Gestión de Matrícula',
    descripcion: 'Permite inscribir formalmente a un estudiante en uno o varios grupos de asignaturas ofertadas en un periodo académico activo, validando estrictamente cupos, prerrequisitos, cruces de horarios y duplicidad bajo aislamiento transaccional estricto.',
    precondicionBreve: 'Estudiante en estado ACTIVO, periodo habilitado para matrícula y oferta académica publicada.',
    postcondicionBreve: 'Cupo reservado de manera atómica, matrícula registrada y evento de auditoría persistido.'
  },
  {
    id: 'UC-06',
    nombre: 'Registrar y Publicar Calificaciones',
    actorPrincipal: 'Docente',
    actoresSecundarios: ['Estudiante', 'Coordinador Académico', 'Servicio de Auditoría'],
    rfRelacionados: ['RF-08', 'RF-02', 'RF-06', 'RF-09', 'RF-11', 'RF-12'],
    rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-06', 'RNF-07', 'RNF-10', 'RNF-11'],
    criticidad: 'Crítica',
    subsistema: 'Gestión Académica y Calificaciones',
    descripcion: 'Permite al docente titular ingresar, actualizar y oficializar las calificaciones parciales y definitivas de los estudiantes matriculados en sus grupos, aplicando reglas de ponderación y generando bitácora inmutable de cambios.',
    precondicionBreve: 'Docente asignado formalmente al grupo y periodo evaluativo abierto según cronograma.',
    postcondicionBreve: 'Calificaciones persistidas con precisión decimal, trazabilidad registrada y estado disponible para consulta.'
  },
  {
    id: 'UC-07',
    nombre: 'Configurar Programas y Mallas Curriculares',
    actorPrincipal: 'Coordinador Académico',
    actoresSecundarios: ['Administrador'],
    rfRelacionados: ['RF-05', 'RF-11'],
    rnfRelacionados: ['RNF-01', 'RNF-05', 'RNF-08', 'RNF-10'],
    criticidad: 'Alta',
    subsistema: 'Gestión Curricular',
    descripcion: 'Permite estructurar los programas académicos, sus planes de estudio y las asignaturas componentes con sus respectivos códigos, créditos, niveles o semestres y reglas de prerrequisitos.',
    precondicionBreve: 'Coordinador autenticado en el módulo curricular.',
    postcondicionBreve: 'Malla curricular y catálogo de asignaturas actualizado y versionado.'
  },
  {
    id: 'UC-08',
    nombre: 'Planificar Periodos Académicos, Grupos y Horarios',
    actorPrincipal: 'Coordinador Académico',
    actoresSecundarios: ['Docente', 'Servicio de Auditoría'],
    rfRelacionados: ['RF-06', 'RF-04', 'RF-05', 'RF-11'],
    rnfRelacionados: ['RNF-02', 'RNF-06', 'RNF-07', 'RNF-10'],
    criticidad: 'Alta',
    subsistema: 'Gestión Curricular',
    descripcion: 'Permite crear periodos académicos (ej. 2026-1), abrir grupos por asignatura, asignar docentes, establecer cupos máximos, programar franjas horarias y asignar aulas físicas o enlaces virtuales de encuentro.',
    precondicionBreve: 'Plan de estudios y asignaturas configuradas previamente.',
    postcondicionBreve: 'Oferta académica del periodo configurada y disponible para la fase de matrícula.'
  },
  {
    id: 'UC-09',
    nombre: 'Consultar Resultados, Horario y Ficha Académica',
    actorPrincipal: 'Estudiante',
    actoresSecundarios: ['Coordinador Académico'],
    rfRelacionados: ['RF-09', 'RF-07', 'RF-08', 'RF-11'],
    rnfRelacionados: ['RNF-02', 'RNF-06', 'RNF-11', 'RNF-12'],
    criticidad: 'Alta',
    subsistema: 'Autoservicio Estudiantil',
    descripcion: 'Permite al estudiante visualizar en cualquier momento su horario de clases consolidado, las asignaturas matriculadas, el docente asignado, los enlaces/aulas y el detalle de notas parciales y finales publicadas.',
    precondicionBreve: 'Estudiante debidamente autenticado con matrícula en el periodo.',
    postcondicionBreve: 'Ficha académica desplegada en interfaz adaptable en menos de 3 segundos.'
  },
  {
    id: 'UC-10',
    nombre: 'Generar Reportes Académicos e Institucionales',
    actorPrincipal: 'Coordinador Académico / Administrador',
    actoresSecundarios: ['Docente'],
    rfRelacionados: ['RF-10', 'RF-03', 'RF-06', 'RF-07', 'RF-08', 'RF-11'],
    rnfRelacionados: ['RNF-02', 'RNF-08', 'RNF-10', 'RNF-11'],
    criticidad: 'Media',
    subsistema: 'Reportes y Analítica',
    descripcion: 'Permite exportar y visualizar reportes consolidados de estudiantes matriculados, listas de asistencia por grupo, actas definitivas de notas y estadísticas de rendimiento por periodo y programa académico.',
    precondicionBreve: 'Usuario con privilegios de reporte autenticado.',
    postcondicionBreve: 'Reporte generado en formato digital (PDF/Excel) conforme a los filtros aplicados.'
  },
  {
    id: 'UC-11',
    nombre: 'Búsqueda y Filtrado Avanzado Multi-Criterio',
    actorPrincipal: 'Todos los Actores Autorizados',
    actoresSecundarios: [],
    rfRelacionados: ['RF-11', 'RF-03', 'RF-04', 'RF-05', 'RF-06'],
    rnfRelacionados: ['RNF-02', 'RNF-06', 'RNF-11', 'RNF-12'],
    criticidad: 'Media',
    subsistema: 'Servicios Transversales',
    descripcion: 'Mecanismo transversal de consulta rápida que permite localizar registros mediante criterios como código, identificación, nombres, programa académico, periodo o estado operativo.',
    precondicionBreve: 'Usuario autenticado dentro del módulo correspondiente a su rol.',
    postcondicionBreve: 'Resultados filtrados paginados desplegados respetando la privacidad del rol.'
  },
  {
    id: 'UC-12',
    nombre: 'Auditar Eventos y Trazabilidad de Seguridad',
    actorPrincipal: 'Administrador',
    actoresSecundarios: ['Servicio de Auditoría'],
    rfRelacionados: ['RF-12', 'RF-01', 'RF-02', 'RF-07', 'RF-08'],
    rnfRelacionados: ['RNF-01', 'RNF-07', 'RNF-09', 'RNF-10', 'RNF-11'],
    criticidad: 'Alta',
    subsistema: 'Auditoría y Seguridad',
    descripcion: 'Permite consultar la bitácora inmutable de transacciones críticas del SGA (inicios de sesión, cambios de roles, transacciones de matrícula y rectificación de calificaciones), identificando autor, IP, timestamp y diferencial de datos.',
    precondicionBreve: 'Administrador autenticado con privilegios de seguridad.',
    postcondicionBreve: 'Bitácora auditable desplegada con filtros de trazabilidad forense.'
  }
];

export const PLANTILLA_UC05: PlantillaCasoDeUso = {
  id: 'UC-05',
  nombre: 'Matricular Asignaturas / Matricular Estudiante',
  version: '2.4 (Definitiva para Producción)',
  fecha: 'Noviembre 2026',
  autor: 'Arquitecto de Software Senior - SGA Architecture Team',
  actorPrincipal: 'Estudiante (en modalidad Autoservicio) / Coordinador Académico (en modalidad Matrícula Asistida/Especial)',
  actoresSecundarios: [
    'Docente (actor pasivo receptor de la nómina de estudiantes matriculados)',
    'Servicio Transaccional de Concurrencia (motor de reservas de cupos con bloqueo optimista/pesimista)',
    'Servicio de Auditoría (registro inmutable del evento de matrícula)'
  ],
  rfRelacionados: ['RF-07', 'RF-01', 'RF-02', 'RF-05', 'RF-06', 'RF-11', 'RF-12'],
  rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-03', 'RNF-04', 'RNF-06', 'RNF-07', 'RNF-10', 'RNF-11', 'RNF-12'],
  criticidad: 'Crítica',
  proposito: 'Garantizar que el estudiante inscriba de forma confiable, consistente y sin sobrecupos las asignaturas correspondientes a su avance curricular dentro del periodo académico vigente, preservando la integridad de los datos ante alta concurrencia.',
  alcance: 'Módulo de Matrícula Académica del SGA, cubriendo la selección de asignaturas, validación de reglas académicas institucionales, asignación atómica de cupos y generación del comprobante oficial de matrícula.',
  precondiciones: [
    'El estudiante debe poseer una cuenta activa (estado ACTIVO) sin bloqueos administrativos o disciplinarios.',
    'El periodo académico debe encontrarse en estado "Vigente - Ventana de Matrícula Abierta" según el calendario configurado (RF-06).',
    'La oferta de grupos, horarios, cupos y docentes para el periodo debe haber sido aprobada por Coordinación Académica.',
    'El estudiante debe haberse autenticado exitosamente en el sistema (RF-01) con rol ROLE_ESTUDIANTE (o Coordinador con ROLE_COORDINADOR).',
    'El estudiante no debe exceder el límite máximo institucional de créditos permitidos para el periodo (RN-MAT-04).'
  ],
  flujoPrincipal: [
    {
      paso: 1,
      actor: 'Estudiante',
      accion: 'Ingresa al módulo "Matrícula Académica" desde el menú principal de su portal de autoservicio.',
      sistema: 'Valida el estado del estudiante y la vigencia del periodo académico. Recupera la malla curricular, el historial de asignaturas aprobadas y la oferta de grupos disponibles.'
    },
    {
      paso: 2,
      actor: 'Estudiante',
      accion: 'Visualiza la lista de asignaturas sugeridas y elegibles de acuerdo a su plan de estudios.',
      sistema: 'Despliega la oferta agrupada por semestre/nivel, indicando código, nombre, créditos, grupos disponibles, horarios, docentes y cupos libres en tiempo real.'
    },
    {
      paso: 3,
      actor: 'Estudiante',
      accion: 'Selecciona la asignatura deseada y elige un grupo específico haciendo clic en "Agregar a Horario Preliminar".',
      sistema: 'Ejecuta validaciones instantáneas en memoria/cliente: (a) Verifica que la asignatura no esté aprobada previamente, (b) Valida que los prerrequisitos estén aprobados, (c) Comprueba que no existan colisiones de horario con otros grupos ya agregados.'
    },
    {
      paso: 4,
      actor: 'Estudiante',
      accion: 'Repite la selección para todas las asignaturas que desea cursar en el periodo y visualiza su horario consolidado.',
      sistema: 'Actualiza el contador de créditos totales seleccionados y renderiza la matriz semanal de horario libre de traslapes.'
    },
    {
      paso: 5,
      actor: 'Estudiante',
      accion: 'Revisa el resumen final de la matrícula y pulsa el botón "Confirmar y Asentar Matrícula Definitiva".',
      sistema: 'Inicia una transacción atómica con nivel de aislamiento serializable en la base de datos (RNF-07). Verifica nuevamente los cupos disponibles de cada grupo seleccionado mediante un bloqueo transaccional (SELECT FOR UPDATE / Optimistic Lock).'
    },
    {
      paso: 6,
      actor: 'Estudiante',
      accion: 'Espera la confirmación de la transacción en la interfaz.',
      sistema: 'Decrementa de forma atómica en una unidad el cupo disponible de cada grupo, inserta los registros en la tabla de matrículas con estado ASENTADA, calcula el total de créditos y genera el código único de comprobante.'
    },
    {
      paso: 7,
      actor: 'Estudiante',
      accion: 'Visualiza en pantalla el comprobante formal de matrícula con el resumen de asignaturas, grupos, horarios y docentes.',
      sistema: 'Dispara en segundo plano el evento de auditoría (RF-12) registrando: ID de usuario, IP de origen, fecha/hora UTC, IDs de grupos matriculados y hash de transacción. Habilita el acceso del estudiante al UC-09.'
    }
  ],
  flujosAlternativos: [
    {
      id: 'FA-01',
      titulo: 'Cupo Agotado al Momento de la Confirmación (Concurrencia RNF-07)',
      condicion: 'En el Paso 5, al validar el cupo en la base de datos, el cupo del grupo seleccionado llegó a 0 debido a una solicitud confirmada milisegundos antes por otro usuario.',
      pasos: [
        'El sistema cancela la reserva para dicho grupo específico y hace rollback parcial de la transacción.',
        'El sistema notifica al estudiante con un mensaje claro: "El grupo [Código] para la asignatura [Nombre] ha agotado sus cupos disponibles durante su selección".',
        'El sistema resalta los demás grupos disponibles con cupos libres para esa misma asignatura.',
        'El estudiante selecciona un grupo alternativo o descarta la asignatura y reintenta la confirmación.'
      ],
      resultado: 'La matrícula continúa con un grupo con cupo válido, sin violar la restricción de sobrecupo (RF-07, RNF-07).'
    },
    {
      id: 'FA-02',
      titulo: 'Cruce o Traslape de Horarios entre Asignaturas Seleccionadas',
      condicion: 'En el Paso 3, el estudiante intenta agregar un grupo cuyo horario coincide en al menos un minuto con otro grupo previamente seleccionado en el horario preliminar.',
      pasos: [
        'El sistema detecta la superposición temporal entre [Grupo A: Martes 08:00-10:00] y [Grupo B: Martes 09:00-11:00].',
        'El sistema bloquea la adición y muestra una alerta visual destacando los bloques horarios en conflicto.',
        'El estudiante selecciona otro grupo con horario compatible o elimina el grupo en conflicto.'
      ],
      resultado: 'El estudiante mantiene un horario pedagógicamente viable y libre de colisiones.'
    },
    {
      id: 'FA-03',
      titulo: 'Intento de Matrícula Duplicada (RF-07)',
      condicion: 'En el Paso 3, el estudiante intenta inscribir una asignatura que ya tiene un grupo agregado en su selección actual o que ya fue matriculada en el mismo periodo.',
      pasos: [
        'El sistema detecta la duplicidad de la clave [EstudianteID + AsignaturaID + PeriodoID].',
        'El sistema rechaza la operación e informa: "La asignatura ya se encuentra registrada en este periodo académico. No es posible matricular múltiples grupos de la misma materia".'
      ],
      resultado: 'Se previene la doble inscripción garantizando la integridad de datos.'
    },
    {
      id: 'FA-04',
      titulo: 'Incumplimiento de Prerrequisitos Académicos (RF-05, RF-07)',
      condicion: 'En el Paso 3, el estudiante selecciona una asignatura cuyos prerrequisitos en la malla curricular no han sido aprobados.',
      pasos: [
        'El sistema consulta el historial académico y verifica que el prerequisito (ej. Cálculo I) no tiene nota aprobatoria registrada.',
        'El sistema desactiva el botón de selección y despliega el mensaje: "Requiere aprobación previa de: [Código - Nombre Prerrequisito]".',
        'El estudiante debe seleccionar asignaturas pendientes de niveles anteriores.'
      ],
      resultado: 'Se respeta la progresión académica curricular.'
    },
    {
      id: 'FA-05',
      titulo: 'Superación del Límite de Créditos Permitidos',
      condicion: 'En el Paso 4, la suma de créditos de los grupos seleccionados excede el límite máximo institucional (ej. 20 créditos).',
      pasos: [
        'El sistema bloquea el botón "Confirmar Matrícula" y muestra la advertencia: "Ha seleccionado [X] créditos. El límite máximo ordinario es de [Y] créditos".',
        'El estudiante elimina una o más asignaturas hasta ubicarse dentro del rango permitido.'
      ],
      resultado: 'La carga académica se mantiene dentro de los márgenes reglamentarios.'
    },
    {
      id: 'FA-06',
      titulo: 'Matrícula Asistida por Excepción por Coordinación Académica',
      condicion: 'El actor es el Coordinador Académico gestionando una matrícula especial (estudiante con reintegro, homologación o ampliación autorizada de cupo).',
      pasos: [
        'El Coordinador busca y selecciona el estudiante en el módulo administrativo (RF-11).',
        'El Coordinador activa la opción "Matrícula Extraordinaria con Justificación".',
        'El Coordinador ingresa el código del grupo, el motivo justificado y el número de resolución administrativa.',
        'El sistema valida que no se superen los cupos físicos del aula y procesa la matrícula registrando la firma digital y el motivo en el log de auditoría (RF-12).'
      ],
      resultado: 'Matrícula procesada bajo supervisión y trazabilidad estricta.'
    }
  ],
  flujosExcepcion: [
    {
      id: 'FE-01',
      titulo: 'Interrupción de Conexión o Fallo de Infraestructura durante el Commit (RNF-07, RNF-09)',
      condicion: 'Ocurre una pérdida de conexión de red o una excepción en el motor de base de datos mientras se ejecuta el Paso 6.',
      pasos: [
        'El gestor de transacciones del backend detecta la falla y ejecuta automáticamente un ROLLBACK integral de toda la operación.',
        'El cupo del grupo se mantiene inalterado y no se guarda ningún registro parcial.',
        'Al restablecerse la conexión, la interfaz muestra: "No fue posible completar la matrícula debido a una interrupción de red. Ningún cambio ha sido guardado. Por favor intente nuevamente".'
      ],
      resultado: 'Consistencia absoluta: la base de datos queda en un estado válido e inalterado.'
    },
    {
      id: 'FE-02',
      titulo: 'Timeout por Alta Concurrencia de Usuarios (RNF-02)',
      condicion: 'En periodos pico con 300 o más usuarios simultáneos, el tiempo de respuesta de la transacción excede los 3.0 segundos fijados en RNF-02.',
      pasos: [
        'El subsistema de cola de transacciones aplica un mecanismo de "Circuit Breaker" o backoff exponencial controlado.',
        'Si la transacción no puede completarse en 3 segundos, se libera el lock de la fila de cupo para no generar cuellos de botella (deadlocks).',
        'Se informa al estudiante con código de error amigable invitándolo a reintentar en 15 segundos.'
      ],
      resultado: 'Protección del pool de conexiones del servidor y prevención de inanición del sistema.'
    }
  ],
  postcondicionesExito: [
    'El cupo libre de cada grupo matriculado se decrementa en 1 unidad de forma atómica en la base de datos.',
    'Se crean los registros de matrícula asociados al estudiante, periodo y grupos con estado "ASENTADA" y fecha/hora exacta.',
    'Se genera el código alfanumérico único de comprobante de matrícula descargable en PDF.',
    'Se inserta un evento inmutable en el registro de auditoría (RF-12) conteniendo usuario, IP, IDs de grupos y timestamp.',
    'El estudiante queda habilitado inmediatamente para consultar su horario y asignaturas en UC-09.',
    'El docente del grupo visualiza de inmediato al estudiante en su lista oficial de curso para el registro de calificaciones (UC-06).'
  ],
  postcondicionesFallo: [
    'Ningún cupo de ningún grupo sufre decremento ni alteración (Rollback atómico total).',
    'No se genera ningún comprobante ni registro en la tabla de matrículas.',
    'El estudiante conserva su estado previo y la interfaz le indica con precisión el motivo del rechazo.',
    'Se emite un log de advertencia en el sistema de telemetría y auditoría en caso de anomalía técnica.'
  ],
  reglasNegocio: [
    { codigo: 'RN-MAT-01', nombre: 'Unicidad de Asignatura por Periodo', definicion: 'Un estudiante no puede registrar dos veces la misma asignatura dentro del mismo periodo lectivo, sin importar el grupo o modalidad.' },
    { codigo: 'RN-MAT-02', nombre: 'Restricción de Cupo Cero', definicion: 'Bajo ninguna circunstancia ordinaria se permite la inscripción en un grupo con cupo disponible menor o igual a cero.' },
    { codigo: 'RN-MAT-03', nombre: 'Validación Estricta de Prerrequisitos', definicion: 'No se puede cursar una asignatura de nivel N sin haber aprobado formalmente todos los prerrequisitos curriculares de nivel N-1 definidos en el plan de estudios.' },
    { codigo: 'RN-MAT-04', nombre: 'Rango de Créditos Semestrales', definicion: 'La matrícula ordinaria debe comprender un mínimo de 8 créditos y un máximo de 20 créditos académicos por estudiante.' },
    { codigo: 'RN-MAT-05', nombre: 'Incompatibilidad Horaria Absoluta', definicion: 'No se permite la inscripción en grupos cuyas franjas de clase compartan días y horas concurrentes.' }
  ],
  criteriosArquitectura: [
    { rnf: 'RNF-02', requisito: 'Rendimiento <= 3s con 300 usuarios concurrentes', mecanismoImplementacion: 'Caché distribuida (Redis) para consulta de oferta académica; índices compuestos en [periodo_id, grupo_id, estudiante_id].' },
    { rnf: 'RNF-07', requisito: 'Integridad y Consistencia de Matrícula', mecanismoImplementacion: 'Transacciones ACID con aislamiento REPEATABLE READ o Bloqueo Optimista con columna version_number para evitar condiciones de carrera (Race Conditions).' },
    { rnf: 'RNF-10', requisito: 'Trazabilidad y Auditoría (RF-12)', mecanismoImplementacion: 'Disparador de auditoría a nivel de aplicación que persiste evento asíncrono pero no bloqueante con snapshot de datos anteriores y posteriores.' },
    { rnf: 'RNF-06', requisito: 'Usabilidad y Accesibilidad', mecanismoImplementacion: 'Parrilla de horarios con soporte total por teclado (Tab, Enter, Flechas), contraste WCAG AA y respuesta háptica/visual de confirmación.' }
  ]
};

export const PLANTILLA_UC06: PlantillaCasoDeUso = {
  id: 'UC-06',
  nombre: 'Registrar y Publicar Calificaciones',
  version: '2.4 (Definitiva para Producción)',
  fecha: 'Noviembre 2026',
  autor: 'Arquitecto de Software Senior - SGA Architecture Team',
  actorPrincipal: 'Docente Titular del Grupo',
  actoresSecundarios: [
    'Estudiante (actor receptor pasivo de notificaciones y notas publicadas)',
    'Coordinador Académico (supervisor de actas y habilitador de reaperturas extraordinarias)',
    'Servicio de Auditoría (registro forense inmutable de toda calificación ingresada o alterada)'
  ],
  rfRelacionados: ['RF-08', 'RF-01', 'RF-02', 'RF-06', 'RF-09', 'RF-11', 'RF-12'],
  rnfRelacionados: ['RNF-01', 'RNF-02', 'RNF-03', 'RNF-06', 'RNF-07', 'RNF-10', 'RNF-11', 'RNF-12'],
  criticidad: 'Crítica',
  proposito: 'Permitir al docente ingresar, validar, calcular ponderaciones, asentar y publicar las evaluaciones de los estudiantes formalmente matriculados en sus grupos, asegurando la consistencia matemática, el cumplimiento de fechas del calendario y la trazabilidad absoluta de cualquier modificación.',
  alcance: 'Módulo de Gestión Académica y Calificaciones, desde la apertura de la sábana de notas del grupo asignado hasta el cierre formal del acta y la notificación de resultados definitivos.',
  precondiciones: [
    'El docente debe encontrarse autenticado con credenciales individuales activas (RF-01) y rol ROLE_DOCENTE (RF-02).',
    'El grupo consultado debe estar asignado formalmente al docente en el periodo académico vigente (RF-06).',
    'Debe existir al menos un estudiante formalmente matriculado con estado ASENTADA en el grupo (RF-07).',
    'El periodo o corte evaluativo específico (ej. Primer Corte 30%, Segundo Corte 30%, Examen Final 40%) debe encontrarse dentro de la ventana de fechas abierta según el calendario académico configurado (RF-06).',
    'El acta de calificaciones del grupo no debe haber sido cerrada de forma definitiva previamente.'
  ],
  flujoPrincipal: [
    {
      paso: 1,
      actor: 'Docente',
      accion: 'Ingresa a la sección "Mis Grupos Asignados" desde el menú de navegación docente.',
      sistema: 'Filtra y despliega los grupos asignados al docente para el periodo activo, mostrando: Código de Asignatura, Nombre, Grupo, Jornada, Cupo Ocupado y Estado de Calificaciones (Abierto/Cerrado).'
    },
    {
      paso: 2,
      actor: 'Docente',
      accion: 'Selecciona un grupo académico específico y elige la opción "Gestionar Calificaciones".',
      sistema: 'Verifica la asignación docente del grupo en la base de datos. Recupera la lista alfabética de estudiantes matriculados activos, el esquema de evaluación configurado (cortes y porcentajes) y las notas previamente guardadas si existen.'
    },
    {
      paso: 3,
      actor: 'Docente',
      accion: 'Selecciona el corte evaluativo a calificar (ej. "Corte 1 - 30%") e ingresa los valores numéricos correspondientes para cada estudiante en la tabla interactiva.',
      sistema: 'Aplica validación en tiempo de entrada en el cliente: restringe el rango numérico entre 0.0 y 5.0 (o escala institucional) con máximo dos cifras decimales. Actualiza dinámicamente en pantalla el promedio ponderado preliminar.'
    },
    {
      paso: 4,
      actor: 'Docente',
      accion: 'Utiliza las herramientas de teclado (Flecha Abajo o Enter) para navegar ágilmente de fila en fila ingresando las notas de toda la lista.',
      sistema: 'Resalta en verde las celdas validadas, calcula automáticamente si la nota es aprobatoria (>= 3.0) o reprobatoria (< 3.0) y muestra el contador de notas completadas vs pendientes.'
    },
    {
      paso: 5,
      actor: 'Docente',
      accion: 'Revisa la sábana completa de calificaciones y pulsa el botón "Guardar y Publicar Corte Evaluativo".',
      sistema: 'Abre una ventana modal de confirmación mostrando el resumen: total de estudiantes evaluados, promedio del grupo, notas aprobadas, reprobadas y advertencias de casillas vacías si las hay.'
    },
    {
      paso: 6,
      actor: 'Docente',
      accion: 'Confirma la publicación en la ventana modal.',
      sistema: 'Inicia una transacción en base de datos. Valida que el corte siga dentro de la fecha permitida. Persiste los registros en la tabla de calificaciones con estado "PUBLICADA", registrando id_docente, timestamp y hash de integridad.'
    },
    {
      paso: 7,
      actor: 'Docente',
      accion: 'Recibe mensaje de confirmación de éxito y opción de descargar el acta provisional en formato PDF con firma criptográfica institucional.',
      sistema: 'Dispara el evento de auditoría en el módulo RF-12 con el detalle completo de notas modificadas. Actualiza la vista para que los estudiantes del grupo puedan consultar de inmediato su calificación en el módulo UC-09.'
    }
  ],
  flujosAlternativos: [
    {
      id: 'FA-01',
      titulo: 'Modificación de Calificación Existente dentro de la Ventana Habilitada (RF-08, RF-12)',
      condicion: 'En el Paso 3, el docente modifica una nota que ya había sido guardada y publicada anteriormente en el mismo corte.',
      pasos: [
        'El sistema detecta un cambio en el valor anterior (ej. 3.2 a 4.0).',
        'El sistema exige obligatoriamente al docente ingresar un "Motivo o Justificación del Cambio" en un campo de texto (mínimo 10 caracteres, ej. "Corrección por revisión de examen presencial").',
        'El docente introduce la justificación y procede con la publicación.',
        'El sistema actualiza la nota y registra en la tabla de auditoría (RF-12) el registro diferencial: valor anterior (3.2), valor nuevo (4.0), docente_id, fecha/hora y motivo ingresado.'
      ],
      resultado: 'La nota se rectifica con plena trazabilidad legal y pedagógica.'
    },
    {
      id: 'FA-02',
      titulo: 'Importación Masiva de Calificaciones desde Archivo de Hoja de Cálculo (CSV/Excel)',
      condicion: 'En el Paso 3, el docente opta por subir una plantilla de Excel con las notas en lugar del ingreso manual celda por celda.',
      pasos: [
        'El docente pulsa "Descargar Plantilla Oficial del Grupo" con las cabeceras preformateadas e identificadores de estudiantes.',
        'El docente diligencia las notas en su equipo y carga el archivo (.xlsx o .csv) a través de la interfaz.',
        'El sistema analiza sintácticamente el archivo, verifica identificaciones contra la nómina de matriculados y valida rangos numéricos.',
        'El sistema muestra una vista previa con el estado de validación de cada fila (Válida / Error de formato / Estudiante no encontrado).',
        'El docente aprueba la carga y el sistema precarga los valores en la tabla interactiva para su confirmación final (Paso 5).'
      ],
      resultado: 'Carga masiva rápida y segura reduciendo el tiempo de operación administrativa.'
    },
    {
      id: 'FA-03',
      titulo: 'Guardado Temporal en Modo Borrador sin Publicación a Estudiantes',
      condicion: 'En el Paso 5, el docente no ha finalizado de evaluar a todos los estudiantes y desea guardar su avance sin que las notas sean visibles aún para los estudiantes.',
      pasos: [
        'El docente pulsa el botón secundario "Guardar como Borrador Temporal".',
        'El sistema persiste las notas ingresadas con el estado "BORRADOR".',
        'Las notas permanecen ocultas en las consultas de los estudiantes (UC-09).',
        'El sistema notifica al docente: "Borrador guardado exitosamente. Las notas no serán visibles para los estudiantes hasta que pulse Publicar".'
      ],
      resultado: 'Flexibilidad operativa para el docente sin comprometer la privacidad o generar falsas expectativas.'
    },
    {
      id: 'FA-04',
      titulo: 'Registro Extemporáneo de Notas con Autorización de Coordinación Académica',
      condicion: 'La fecha límite del calendario para registrar notas ha expirado, pero existe una causa justificada (incapacidad médica o calamidad).',
      pasos: [
        'El sistema bloquea la edición directa al docente e indica: "Ventana de registro cerrada para este corte evaluativo".',
        'El docente solicita formalmente a través del sistema una "Reapertura Extraordinaria" indicando justificativo.',
        'El Coordinador Académico evalúa la solicitud y autoriza una ventana temporal de 24 horas.',
        'El sistema desbloquea la libreta para ese grupo y periodo específico, registrando la autorización del coordinador en la bitácora (RF-12).',
        'El docente procede con el flujo principal.'
      ],
      resultado: 'Resolución de excepciones académicas con control jerárquico auditable.'
    }
  ],
  flujosExcepcion: [
    {
      id: 'FE-01',
      titulo: 'Valor de Calificación Fuera de Rango Válido o Formato Inválido',
      condicion: 'En el Paso 3, el docente ingresa un valor numérico menor a 0.0, mayor a 5.0 o caracteres alfanuméricos.',
      pasos: [
        'El sistema resalta de inmediato la celda en color carmesí con icono de error.',
        'Muestra un tooltip: "La nota debe ser un número decimal entre 0.0 y 5.0 con punto o coma".',
        'El sistema impide enfocar la siguiente casilla o enviar el formulario hasta que el valor sea corregido.'
      ],
      resultado: 'Se evita el almacenamiento de datos corruptos o matemáticamente absurdos.'
    },
    {
      id: 'FE-02',
      titulo: 'Cierre Intempestivo de Ventana de Registro durante la Edición',
      condicion: 'El docente comenzó a diligenciar notas a las 23:55 y la fecha límite del calendario vencía a las 23:59; al enviar los datos a las 00:01 el corte ya cerró.',
      pasos: [
        'El backend valida la hora del servidor contra el cronograma configurado (RF-06).',
        'Detecta que la ventana expiró e impide la persistencia en estado PUBLICADA.',
        'El sistema salva los datos temporalmente en un archivo de recuperación de sesión del docente.',
        'Notifica: "La fecha límite del corte ha expirado. Sus cambios se conservaron en borrador. Contacte a Coordinación Académica para autorizar el asentamiento".'
      ],
      resultado: 'Cumplimiento estricto de las normas institucionales sin pérdida de trabajo manual del docente.'
    },
    {
      id: 'FE-03',
      titulo: 'Edición Simultánea o Pérdida de Concurrencia en la Libreta de Calificaciones',
      condicion: 'El docente abre la misma libreta de notas en dos pestañas o dispositivos distintos simultáneamente.',
      pasos: [
        'El sistema utiliza control de concurrencia optimista mediante un token de versión (ETag / version_number).',
        'Al guardar la segunda sesión, el servidor detecta que la versión base cambió.',
        'El sistema rechaza la sobreescritura ciega y muestra una pantalla de conciliación con las diferencias encontradas.'
      ],
      resultado: 'Prevención de pérdida accidental de datos ingresados.'
    }
  ],
  postcondicionesExito: [
    'Las calificaciones quedan almacenadas de manera definitiva en la base de datos con precisión decimal normalizada.',
    'El estado del corte evaluativo pasa a "PUBLICADA" o "BORRADOR" según la opción seleccionada.',
    'Se actualiza el promedio ponderado de la asignatura en el historial de los estudiantes.',
    'Se inserta un registro inmutable en la bitácora de auditoría (RF-12) detallando: docente, grupo, corte, notas previas, notas nuevas, timestamp y motivo del cambio si aplica.',
    'Las calificaciones quedan disponibles de inmediato para su visualización individual por parte de cada estudiante en el módulo de consulta (UC-09).',
    'Las notas alimentan automáticamente los reportes consolidados de rendimiento para Coordinación Académica (UC-10).'
  ],
  postcondicionesFallo: [
    'Ninguna nota previa sufre alteración en la base de datos.',
    'La sábana de calificaciones conserva el último estado consistente conocido.',
    'Se notifica al docente el motivo específico del error técnico o de validación.',
    'Se registra un log de error en el subsistema de observabilidad del servidor.'
  ],
  reglasNegocio: [
    { codigo: 'RN-CAL-01', nombre: 'Escala Numérica Institucional', definicion: 'Las calificaciones deben registrarse exclusivamente en la escala numérica de 0.0 a 5.0 con un máximo de dos cifras decimales. La nota mínima aprobatoria es de 3.0.' },
    { codigo: 'RN-CAL-02', nombre: 'Suma de Ponderaciones del 100%', definicion: 'La estructura de evaluación de cualquier asignatura debe sumar exactamente el 100% de la nota definitiva, distribuida en los cortes autorizados por el plan de estudios.' },
    { codigo: 'RN-CAL-03', nombre: 'Trazabilidad Obligatoria de Rectificaciones', definicion: 'Cualquier modificación efectuada sobre una nota previamente publicada requiere el ingreso de una justificación textual y queda grabada de forma permanente en la auditoría con fecha, hora e identificación del docente.' },
    { codigo: 'RN-CAL-04', nombre: 'Privacidad Estricta de Notas (RNF-11)', definicion: 'Los estudiantes únicamente podrán visualizar sus propias calificaciones. Queda estrictamente prohibida la publicación abierta de sábanas completas con nombres o documentos de terceros.' }
  ],
  criteriosArquitectura: [
    { rnf: 'RNF-07', requisito: 'Integridad y Consistencia Matemática', mecanismoImplementacion: 'Cálculo de definitivas en capa de dominio (backend) para impedir manipulación de promedios en cliente; transacciones ACID en el guardado masivo.' },
    { rnf: 'RNF-10', requisito: 'Trazabilidad y Auditoría Forense (RF-12)', mecanismoImplementacion: 'Tabla histórica inmutable "calificaciones_auditoria" con triggers o eventos de dominio que capturan antes/después, IP y usuario.' },
    { rnf: 'RNF-11', requisito: 'Privacidad y Aislamiento de Datos', mecanismoImplementacion: 'Políticas de seguridad a nivel de consulta (Row-Level Security o filtros WHERE forzados en ORM) para que cada estudiante solo reciba su payload.' },
    { rnf: 'RNF-06', requisito: 'Usabilidad y Accesibilidad en Carga Masiva', mecanismoImplementacion: 'Navegación tipo hoja de cálculo mediante teclado (Tab/Enter), feedback de validación visual y guardado automático de borrador en localStorage como salvaguarda.' }
  ]
};

export const CODIGO_MERMAID_CASOS_DE_USO = `flowchart TB
    %% ========================================================
    %% DIAGRAMA FORMAL DE CASOS DE USO - SECCIÓN 6.1
    %% SISTEMA DE GESTIÓN ACADÉMICA (SGA)
    %% Basado en Requerimientos Funcionales RF-01 a RF-12
    %% y Requerimientos No Funcionales RNF-01 a RNF-12
    %% ========================================================

    %% ACTORES PRINCIPALES DEL SISTEMA
    subgraph Actores_Principales ["Actores del Sistema SGA"]
        direction TB
        Admin["fa:fa-shield-halved <b>Administrador</b><br/><i>(Control de Acceso, Usuarios y Auditoría)</i>"]
        Coord["fa:fa-graduation-cap <b>Coordinador Académico</b><br/><i>(Gestión Curricular y Periodos)</i>"]
        Docente["fa:fa-chalkboard-user <b>Docente</b><br/><i>(Gestión de Cursos y Calificaciones)</i>"]
        Estudiante["fa:fa-user-graduate <b>Estudiante</b><br/><i>(Autoservicio y Matrícula)</i>"]
    end

    %% SUBSISTEMA SGA
    subgraph SGA_Boundary ["SISTEMA DE GESTIÓN ACADÉMICA (SGA)"]
        direction TB

        %% MÓDULO 1: SEGURIDAD Y ACCESO (RF-01, RF-02)
        subgraph Sub_Seguridad ["1. Seguridad y Control de Acceso"]
            direction TB
            UC01(["<b>UC-01: Iniciar Sesión y Autenticar</b><br/><i>[RF-01, RNF-01]</i>"]):::critico
            UC02(["<b>UC-02: Gestionar Roles y Permisos RBAC</b><br/><i>[RF-02, RNF-01, RNF-11]</i>"]):::alto
        end

        %% MÓDULO 2: ADMINISTRACIÓN DE USUARIOS (RF-03, RF-04)
        subgraph Sub_Usuarios ["2. Administración de Expedientes"]
            direction TB
            UC03(["<b>UC-03: Gestionar Expediente Estudiantes</b><br/><i>[RF-03, RNF-11]</i>"]):::alto
            UC04(["<b>UC-04: Gestionar Planta Docente</b><br/><i>[RF-04, RNF-11]</i>"]):::alto
        end

        %% MÓDULO 3: GESTIÓN CURRICULAR (RF-05, RF-06)
        subgraph Sub_Curricular ["3. Planificación y Gestión Curricular"]
            direction TB
            UC07(["<b>UC-07: Configurar Programas y Asignaturas</b><br/><i>[RF-05, RNF-05]</i>"]):::alto
            UC08(["<b>UC-08: Planificar Periodos, Grupos y Horarios</b><br/><i>[RF-06, RNF-07]</i>"]):::alto
        end

        %% MÓDULO 4: MATRÍCULA ACADÉMICA (RF-07) - CRÍTICO
        subgraph Sub_Matricula ["4. Módulo Transaccional de Matrícula"]
            direction TB
            UC05(["<b>UC-05: Matricular Estudiante / Asignaturas</b><br/><i>[RF-07, RNF-02, RNF-07] (CRÍTICO)</i>"]):::critico
            UC05_Cupo(["<b>Validar Disponibilidad de Cupos</b><br/><i>[RNF-07]</i>"]):::include
            UC05_Horario(["<b>Validar Cruces de Horario</b><br/><i>[RNF-07]</i>"]):::include
            UC05_Prerreq(["<b>Validar Prerrequisitos Curriculares</b><br/><i>[RF-05]</i>"]):::include
            UC05_Excepcion(["<b>Matrícula Asistida por Excepción</b><br/><i>[RF-07]</i>"]):::extend
        end

        %% MÓDULO 5: CALIFICACIONES (RF-08) - CRÍTICO
        subgraph Sub_Calificaciones ["5. Gestión de Calificaciones y Evaluación"]
            direction TB
            UC06(["<b>UC-06: Registrar y Publicar Calificaciones</b><br/><i>[RF-08, RNF-07, RNF-10] (CRÍTICO)</i>"]):::critico
            UC06_Calc(["<b>Calcular Promedios y Ponderaciones</b><br/><i>[RNF-07]</i>"]):::include
            UC06_Justif(["<b>Registrar Justificación de Cambio</b><br/><i>[RF-12, RNF-10]</i>"]):::extend
            UC06_Carga(["<b>Importar Calificaciones Excel/CSV</b><br/><i>[RNF-06]</i>"]):::extend
        end

        %% MÓDULO 6: CONSULTA Y AUTOSERVICIO (RF-09)
        subgraph Sub_Autoservicio ["6. Autoservicio y Consulta de Resultados"]
            direction TB
            UC09(["<b>UC-09: Consultar Resultados, Horario y Ficha</b><br/><i>[RF-09, RNF-02, RNF-11]</i>"]):::alto
        end

        %% MÓDULO 7: REPORTES Y BÚSQUEDA (RF-10, RF-11)
        subgraph Sub_Reportes ["7. Inteligencia y Servicios Transversales"]
            direction TB
            UC10(["<b>UC-10: Generar Reportes Académicos</b><br/><i>[RF-10, RNF-08]</i>"]):::medio
            UC11(["<b>UC-11: Búsqueda y Filtrado Multi-Criterio</b><br/><i>[RF-11, RNF-02]</i>"]):::medio
        end

        %% MÓDULO 8: AUDITORÍA (RF-12)
        subgraph Sub_Auditoria ["8. Auditoría y Trazabilidad Forense"]
            direction TB
            UC12(["<b>UC-12: Auditar Eventos Críticos y Trazabilidad</b><br/><i>[RF-12, RNF-10]</i>"]):::alto
            LogTransac(["<b>Registrar Transacción en Bitácora</b><br/><i>[RF-12, RNF-01]</i>"]):::include
        end
    end

    %% ========================================================
    %% RELACIONES ENTRE ACTORES Y CASOS DE USO
    %% ========================================================

    %% Administrador
    Admin --- UC01
    Admin --- UC02
    Admin --- UC03
    Admin --- UC04
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12

    %% Coordinador Académico
    Coord --- UC01
    Coord --- UC03
    Coord --- UC04
    Coord --- UC07
    Coord --- UC08
    Coord --- UC05
    Coord --- UC10
    Coord --- UC11

    %% Docente
    Docente --- UC01
    Docente --- UC06
    Docente --- UC10
    Docente --- UC11

    %% Estudiante
    Estudiante --- UC01
    Estudiante --- UC05
    Estudiante --- UC09
    Estudiante --- UC11

    %% ========================================================
    %% RELACIONES DE INCLUSIÓN (<<include>>) Y EXTENSIÓN (<<extend>>)
    %% ========================================================

    %% Inclusiones de Matrícula (UC-05)
    UC05 -. "<<include>>" .-> UC05_Cupo
    UC05 -. "<<include>>" .-> UC05_Horario
    UC05 -. "<<include>>" .-> UC05_Prerreq
    UC05 -. "<<include>>" .-> LogTransac
    UC05_Excepcion -. "<<extend>>" .-> UC05

    %% Inclusiones de Calificaciones (UC-06)
    UC06 -. "<<include>>" .-> UC06_Calc
    UC06 -. "<<include>>" .-> LogTransac
    UC06_Justif -. "<<extend>>" .-> UC06
    UC06_Carga -. "<<extend>>" .-> UC06

    %% Dependencia funcional de Consulta con Matrícula y Calificaciones
    UC09 -. "<<depende de>>" .-> UC05
    UC09 -. "<<depende de>>" .-> UC06

    %% Inclusión transversal de Auditoría
    UC01 -. "<<include>>" .-> LogTransac
    UC02 -. "<<include>>" .-> LogTransac

    %% ========================================================
    %% ESTILOS VISUALES FORMALES
    %% ========================================================
    classDef default fill:#f8fafc,stroke:#cbd5e1,stroke-width:1.5px,color:#0f172a,font-size:12px;
    classDef critico fill:#fee2e2,stroke:#dc2626,stroke-width:2.5px,color:#7f1d1d,font-weight:bold;
    classDef alto fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#7c2d12;
    classDef medio fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px,color:#0369a1;
    classDef include fill:#f1f5f9,stroke:#64748b,stroke-width:1.5px,stroke-dasharray: 4 4,color:#334155,font-size:11px;
    classDef extend fill:#fdf4ff,stroke:#a855f7,stroke-width:1.5px,stroke-dasharray: 2 2,color:#581c87,font-size:11px;
`;

export const MATRIZ_TRAZABILIDAD_RF_RNF = [
  { rf: 'RF-01', nombre: 'Autenticación', rnfClave: ['RNF-01', 'RNF-02', 'RNF-11'], casosUso: ['UC-01', 'UC-12'], impactoArquitectura: 'Capa de Seguridad perimetral con tokens JWT, hashing seguro (Argon2id/Bcrypt) y control de expiración.' },
  { rf: 'RF-02', nombre: 'Roles y permisos', rnfClave: ['RNF-01', 'RNF-05', 'RNF-11'], casosUso: ['UC-01', 'UC-02', 'UC-05', 'UC-06'], impactoArquitectura: 'Control de acceso basado en roles (RBAC) validado en middleware y en capa de dominio con menor privilegio.' },
  { rf: 'RF-03', nombre: 'Gestión de estudiantes', rnfClave: ['RNF-06', 'RNF-10', 'RNF-11'], casosUso: ['UC-03', 'UC-10', 'UC-11'], impactoArquitectura: 'Persistencia de expediente maestro con borrado lógico (soft-delete) para preservar integridad de historiales.' },
  { rf: 'RF-04', nombre: 'Gestión de docentes', rnfClave: ['RNF-06', 'RNF-10', 'RNF-11'], casosUso: ['UC-04', 'UC-08', 'UC-11'], impactoArquitectura: 'Catálogo de planta profesoral con validación de estados y asignación a carga lectiva en periodos.' },
  { rf: 'RF-05', nombre: 'Programas y asignaturas', rnfClave: ['RNF-05', 'RNF-08', 'RNF-10'], casosUso: ['UC-07', 'UC-05', 'UC-11'], impactoArquitectura: 'Modelo relacional normalizado de grafos dirigidos acíclicos (DAG) para resolución de prerrequisitos y créditos.' },
  { rf: 'RF-06', nombre: 'Grupos y periodos', rnfClave: ['RNF-02', 'RNF-07', 'RNF-12'], casosUso: ['UC-08', 'UC-05', 'UC-06'], impactoArquitectura: 'Programación de franjas horarias con índices GiST/B-tree para prevención de colisiones temporales de aulas y cupos.' },
  { rf: 'RF-07', nombre: 'Matrícula académica', rnfClave: ['RNF-02', 'RNF-04', 'RNF-07', 'RNF-10'], casosUso: ['UC-05'], impactoArquitectura: 'Transacciones ACID serializables o con bloqueo optimista (version_number); cola de confirmación para 300 concurrentes.' },
  { rf: 'RF-08', nombre: 'Registro de calificaciones', rnfClave: ['RNF-02', 'RNF-07', 'RNF-10', 'RNF-11'], casosUso: ['UC-06'], impactoArquitectura: 'Cálculo de definitivas en el servidor; versionado de calificaciones y persistencia síncrona con snapshot de auditoría.' },
  { rf: 'RF-09', nombre: 'Consulta de resultados', rnfClave: ['RNF-02', 'RNF-06', 'RNF-11', 'RNF-12'], casosUso: ['UC-09', 'UC-11'], impactoArquitectura: 'Vistas materializadas y caché distribuida para garantizar tiempo de respuesta p95 <= 3 segundos en autoservicio.' },
  { rf: 'RF-10', nombre: 'Reportes', rnfClave: ['RNF-02', 'RNF-08', 'RNF-11'], casosUso: ['UC-10'], impactoArquitectura: 'Ejecución de consultas analíticas sobre réplica de sólo lectura o paginación por curso/programa para evitar degradación.' },
  { rf: 'RF-11', nombre: 'Búsqueda y filtros', rnfClave: ['RNF-02', 'RNF-06', 'RNF-12'], casosUso: ['UC-11', 'UC-03', 'UC-04', 'UC-05', 'UC-06'], impactoArquitectura: 'Indexación trigram (pg_trgm) o Full Text Search sobre identificadores y nombres con debounce en cliente.' },
  { rf: 'RF-12', nombre: 'Auditoría', rnfClave: ['RNF-01', 'RNF-07', 'RNF-09', 'RNF-10'], casosUso: ['UC-12', 'UC-01', 'UC-05', 'UC-06'], impactoArquitectura: 'Bitácora inmutable de solo inserción (Append-Only Log) con payload JSON de valores anteriores y posteriores.' }
];

export const DOCUMENTO_MARKDOWN_COMPLETO = `# DOCUMENTO DE ESPECIFICACIÓN DE ARQUITECTURA DE SOFTWARE
## SECCIÓN 6.1: MODELO DE CASOS DE USO (SISTEMA DE GESTIÓN ACADÉMICA - SGA)

**Documento:** SGA-ARCH-DOC-6.1  
**Versión:** 2.4 (Edición Definitiva de Arquitectura)  
**Autor:** Arquitecto de Software Senior Especializado en Sistemas de Gestión Académica  
**Estándar:** ISO/IEC/IEEE 29148:2018 & IEEE Std 830-1998  
**Fecha:** Noviembre 2026  
**Clasificación:** Documento Técnico Institucional de Arquitectura de Software  

---

### 1. INTRODUCCIÓN Y CONTEXTO DEL MODELO DE CASOS DE USO

El presente documento define formalmente la **Sección 6.1: Modelo de Casos de Uso** para el **Sistema de Gestión Académica (SGA)**. Su objetivo es modelar con rigor de ingeniería de software los límites del sistema, las fronteras de interacción entre los actores institucionales y los servicios del aplicativo, garantizando la satisfacción total y trazabilidad bidireccional de los **Requerimientos Funcionales (RF-01 al RF-12)** y los **Requerimientos No Funcionales (RNF-01 al RNF-12)**.

El sistema se concibe como una plataforma transaccional de misión crítica que soporta la operación académica universitaria, desde el diseño curricular y la parametrización de periodos, hasta la matrícula de estudiantes con alta concurrencia (300 usuarios concurrentes sin sobrecupos, RNF-02, RNF-07) y el registro seguro y auditable de calificaciones (RNF-10, RNF-11).

---

### 2. IDENTIFICACIÓN Y DESCRIPCIÓN DE LOS ACTORES DEL SISTEMA

Los actores representan las entidades externas (humanas o de sistema) que interactúan directamente con los casos de uso del SGA. Se han identificado cuatro (4) actores primarios y un actor de soporte transversal:

#### 2.1 Actor 1: Administrador del Sistema (\`ROLE_ADMIN\`)
- **Naturaleza:** Actor Primario Humano.
- **Descripción:** Responsable del soporte técnico, la gestión de infraestructura, la seguridad perimetral del sistema y la custodia de datos institucionales.
- **Responsabilidades Principales:**
  1. Aprovisionar, suspender y reactivar credenciales y cuentas de usuarios (RF-01, RF-03, RF-04).
  2. Gestionar la matriz de roles y privilegios RBAC (RF-02, RNF-01).
  3. Supervisar y auditar la bitácora inmutable de eventos críticos (RF-12, RNF-10).
  4. Monitorear la disponibilidad (RNF-03), respaldos periódicos y políticas de contingencia (RNF-09).
- **Alcance de Privilegios:** Acceso administrativo global, restringido únicamente por auditoría legal obligatoria.

#### 2.2 Actor 2: Coordinador Académico (\`ROLE_COORDINADOR\`)
- **Naturaleza:** Actor Primario Humano.
- **Descripción:** Líder funcional de la gestión curricular y la programación académica de la facultad o programa.
- **Responsabilidades Principales:**
  1. Configurar programas académicos, mallas curriculares, planes de estudio y asignaturas con sus créditos y prerrequisitos (RF-05).
  2. Planificar la oferta académica semestral: creación de grupos, definición de cupos máximos, programación horaria y asignación de aulas/enlaces virtuales (RF-06).
  3. Asignar formalmente la carga docente en los grupos del periodo (RF-04, RF-06).
  4. Gestionar matrículas asistidas o excepcionales y resolver conflictos de prerrequisitos o sobrecupo justificado (RF-07).
  5. Generar reportes analíticos e indicadores de rendimiento, ocupación y deserción (RF-10, RNF-08).

#### 2.3 Actor 3: Docente (\`ROLE_DOCENTE\`)
- **Naturaleza:** Actor Primario Humano.
- **Descripción:** Miembro del cuerpo profesoral titular responsable directo de orientar asignaturas y liderar los procesos evaluativos de los estudiantes matriculados en sus grupos asignados.
- **Responsabilidades Principales:**
  1. Consultar listas oficiales de estudiantes formalmente matriculados en sus cursos (RF-06, RF-07).
  2. Registrar, actualizar y publicar calificaciones parciales y definitivas dentro de las fechas límites del calendario institucional (RF-08, RNF-07).
  3. Registrar justificaciones obligatorias para cualquier rectificación o modificación de notas publicadas (RF-12, RNF-10).
  4. Consolidar y firmar actas de evaluación definitivas del periodo académico.

#### 2.4 Actor 4: Estudiante (\`ROLE_ESTUDIANTE\`)
- **Naturaleza:** Actor Primario Humano.
- **Descripción:** Usuario de autoservicio académico que gestiona su trayectoria curricular individual en la institución.
- **Responsabilidades Principales:**
  1. Autenticarse de forma segura en el portal estudiantil (RF-01).
  2. Seleccionar y formalizar la matrícula académica de asignaturas en el periodo activo, validando cupos y evitando colisiones de horario (RF-07, RNF-07).
  3. Consultar su horario de clases consolidado, docentes asignados y espacios de encuentro (RF-09, RNF-06).
  4. Consultar en tiempo real sus calificaciones parciales y definitivas publicadas por los docentes (RF-09, RNF-11).

#### 2.5 Actor de Soporte: Servicio Transaccional y de Auditoría (\`SYSTEM_DAEMON\`)
- **Naturaleza:** Actor Secundario Automatizado (Sistema).
- **Descripción:** Servicio interno del SGA que gobierna las transacciones ACID con aislamiento serializable para evitar sobrecupos ante alta concurrencia (RNF-07) y que registra de manera inmutable cada mutación de datos para cumplimiento de trazabilidad forense (RF-12, RNF-10).

---

### 3. MATRIZ TABULAR DETALLADA DE CASOS DE USO PRINCIPALES

| ID | Nombre del Caso de Uso | Actor Principal | Actores Secundarios | RF Relacionado | RNF Clave | Criticidad | Descripción Breve |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **UC-01** | Autenticar Usuario en el Sistema | Todos los Actores | Servicio Auditoría | RF-01, RF-02 | RNF-01, RNF-02, RNF-11 | **Crítica** | Valida credenciales individuales, otorga token de sesión con rol RBAC y registra el acceso en auditoría. |
| **UC-02** | Gestionar Roles y Permisos (RBAC) | Administrador | Servicio Auditoría | RF-02, RF-12 | RNF-01, RNF-05, RNF-11 | **Alta** | Administra roles institucionales y asocia permisos por principio de menor privilegio. |
| **UC-03** | Gestionar Expediente de Estudiantes | Administrador | Coordinador Acad. | RF-03, RF-11 | RNF-06, RNF-10, RNF-11 | **Alta** | Registra, consulta, actualiza y desactiva lógicamente cuentas y hojas de vida de estudiantes. |
| **UC-04** | Gestionar Planta Docente | Administrador | Coordinador Acad. | RF-04, RF-11 | RNF-06, RNF-10, RNF-11 | **Alta** | Mantiene el catálogo de profesores, vinculación contractual, áreas de experticia y estado operativo. |
| **UC-05** | Matricular Asignaturas / Matricular Estudiante | Estudiante / Coord. | Docente, Srv. Transaccional | RF-07, RF-02, RF-06 | RNF-02, RNF-04, RNF-07, RNF-10 | **Crítica** | Inscribe asignaturas validando atómicamente cupos, prerrequisitos, duplicidad y cruces de horario. |
| **UC-06** | Registrar y Publicar Calificaciones | Docente | Estudiante, Coord., Auditoría | RF-08, RF-02, RF-06, RF-09 | RNF-01, RNF-07, RNF-10, RNF-11 | **Crítica** | Captura notas por corte, valida escalas (0.0-5.0), calcula promedios y audita cualquier modificación. |
| **UC-07** | Configurar Programas y Asignaturas | Coordinador Acad. | Administrador | RF-05, RF-11 | RNF-05, RNF-08, RNF-10 | **Alta** | Modela programas, mallas curriculares, semestres, códigos de asignaturas y créditos formativos. |
| **UC-08** | Planificar Periodos, Grupos y Horarios | Coordinador Acad. | Docente, Auditoría | RF-06, RF-04, RF-05 | RNF-02, RNF-06, RNF-07 | **Alta** | Configura calendarios académicos, grupos, cupos disponibles, docentes titulares, horarios y aulas. |
| **UC-09** | Consultar Resultados, Horario y Ficha | Estudiante | Coordinador Acad. | RF-09, RF-07, RF-08 | RNF-02, RNF-06, RNF-11, RNF-12 | **Alta** | Despliega horario consolidado, asignaturas activas y calificaciones individuales publicadas en <= 3s. |
| **UC-10** | Generar Reportes Institucionales | Coordinador / Admin | Docente | RF-10, RF-03, RF-06, RF-08 | RNF-02, RNF-08, RNF-10 | **Media** | Exporta reportes consolidados de matrículas, ocupación de grupos y sábanas de resultados por periodo. |
| **UC-11** | Búsqueda y Filtrado Multi-Criterio | Todos los Usuarios | - | RF-11, RF-03, RF-04, RF-06 | RNF-02, RNF-06, RNF-12 | **Media** | Permite filtrar registros por ID, nombre, programa, periodo o estado operativo según permisos del rol. |
| **UC-12** | Auditar Eventos y Trazabilidad Forense | Administrador | Servicio Auditoría | RF-12, RF-01, RF-07, RF-08 | RNF-01, RNF-07, RNF-09, RNF-10 | **Alta** | Consulta el log inmutable de inicios de sesión, mutaciones de roles, matrículas y cambios de notas. |

---

### 4. ESPECIFICACIÓN DETALLADA DE CASOS DE USO CRÍTICOS

#### 4.1 PLANTILLA DE CASO DE USO: UC-05 MATRICULAR ESTUDIANTE

| Campo | Especificación Formal |
| :--- | :--- |
| **Identificador** | **UC-05** |
| **Nombre** | **Matricular Asignaturas / Matricular Estudiante** |
| **Versión** | 2.4 (Revisión de Arquitectura para Producción) |
| **Autor** | Arquitecto de Software Senior - SGA Architecture Team |
| **Actor Principal** | **Estudiante** (modalidad autoservicio) / **Coordinador Académico** (modalidad asistida por excepción) |
| **Actores Secundarios** | Docente (receptor de nómina), Servicio Transaccional de Concurrencia, Servicio de Auditoría |
| **Requerimientos Funcionales** | **RF-07** (Matrícula), RF-01 (Autenticación), RF-02 (Roles), RF-05 (Prerrequisitos), RF-06 (Grupos y Horarios), RF-11 (Filtros), RF-12 (Auditoría) |
| **Requerimientos No Funcionales** | **RNF-01** (Seguridad), **RNF-02** (Latencia <= 3s con 300 concurrentes), **RNF-04** (Escalabilidad), **RNF-06** (Accesibilidad WCAG AA), **RNF-07** (Integridad ACID), **RNF-10** (Trazabilidad), **RNF-11** (Privacidad), **RNF-12** (Multi-dispositivo) |
| **Nivel de Criticidad** | **CRÍTICA** (Módulo central de negocio; fallo paraliza el inicio de semestre) |
| **Propósito** | Garantizar la inscripción formal y confiable de asignaturas respetando cupos, horarios y normativas sin inconsistencias de datos bajo concurrencia. |

##### A. Precondiciones
1. El estudiante debe estar en estado \`ACTIVO\` en el sistema y al día en sus compromisos administrativos.
2. El periodo académico debe encontrarse en estado \`VIGENTE_VENTANA_ABIERTA\` según el cronograma fijado en RF-06.
3. La oferta académica de asignaturas, grupos, horarios y docentes debe estar formalmente publicada.
4. El usuario debe haber iniciado sesión exitosamente (RF-01) con rol \`ROLE_ESTUDIANTE\` o \`ROLE_COORDINADOR\`.
5. La suma de créditos matriculados no debe superar el tope de 20 créditos semestrales (RN-MAT-04).

##### B. Flujo Principal de Eventos
1. **[Actor]**: El Estudiante ingresa a la opción "Matrícula Académica" desde el portal institucional.
2. **[Sistema]**: Valida el estado del estudiante y la vigencia del calendario. Recupera la malla curricular, asignaturas ya aprobadas y grupos disponibles para el periodo.
3. **[Actor]**: El Estudiante consulta la oferta de asignaturas y visualiza horarios, profesores y cupos libres en tiempo real.
4. **[Actor]**: El Estudiante selecciona una asignatura y hace clic en "Inscribir en Grupo".
5. **[Sistema]**: Ejecuta prevalidaciones síncronas en memoria:
   - Verifica que la asignatura no esté aprobada ni matriculada previamente en el periodo (RN-MAT-01).
   - Verifica la aprobación de prerrequisitos según plan de estudios (RN-MAT-03).
   - Valida que el horario del grupo no colisione con asignaturas previamente agregadas a la selección (RN-MAT-05).
6. **[Actor]**: El Estudiante completa la selección de asignaturas deseadas y revisa su horario consolidado y carga de créditos.
7. **[Actor]**: El Estudiante pulsa el botón "Confirmar y Asentar Matrícula Definitiva".
8. **[Sistema]**: Abre una transacción en base de datos con aislamiento serializable (\`SERIALIZABLE\` o Bloqueo Optimista con \`version_number\`):
   - Adquiere bloqueo sobre los registros de cupo de los grupos involucrados.
   - Revalida que \`cupo_disponible > 0\` en cada grupo seleccionado (RN-MAT-02).
   - Decrementa en una unidad (\`-1\`) el cupo disponible de cada grupo de forma atómica.
   - Inserta los registros en la tabla \`matricula_detalle\` con estado \`ASENTADA\`.
   - Asigna un código único alfanumérico de comprobante de matrícula.
   - Hace commit de la transacción en la base de datos (tiempo total <= 3 segundos, RNF-02).
9. **[Sistema]**: Emite un evento asíncrono hacia el Servicio de Auditoría (RF-12, RNF-10) registrando: \`usuario_id\`, \`ip_origen\`, \`timestamp\`, lista de \`grupo_id\` y \`hash_transaccion\`.
10. **[Actor]**: El Estudiante visualiza el comprobante de confirmación y horario definitivo con opción de descarga en PDF.

##### C. Flujos Alternativos
- **FA-01: Cupo Agotado al Momento de la Confirmación (Colisión Concurrente RNF-07):**
  - Si en el Paso 8 el cupo de un grupo llega a cero por otra transacción confirmada instantes antes, el sistema rechaza la reserva de esa asignatura y ejecuta rollback parcial.
  - El sistema informa: *"El grupo seleccionado para [Asignatura] agotó sus cupos. Por favor seleccione un grupo alternativo"*.
  - El estudiante elige otro grupo disponible o retira la asignatura y reintenta la confirmación.
- **FA-02: Conflicto o Cruce de Horario Detectado:**
  - En el Paso 5, si el horario del nuevo grupo coincide en día y hora con una materia ya elegida, el sistema bloquea la adición e ilumina en rojo las franjas horarias en conflicto.
  - El estudiante selecciona otro grupo compatible.
- **FA-03: Asignatura Previamente Matriculada o Aprobada (RF-07):**
  - Si el estudiante intenta agregar una materia ya inscrita en el periodo, el sistema detiene la acción: *"Asignatura ya registrada en este periodo lectivo"*.
- **FA-04: Incumplimiento de Prerrequisitos Curriculares (RF-05):**
  - El sistema detecta que el estudiante no aprobó la asignatura requisito del semestre anterior. Se deshabilita el grupo y se notifica el código del prerrequisito pendiente.
- **FA-05: Exceso del Límite de Créditos Académicos (RN-MAT-04):**
  - Si la suma total supera los 20 créditos, el sistema bloquea el botón de confirmación hasta que el estudiante ajuste su selección.
- **FA-06: Matrícula Asistida por Coordinación Académica con Sobrecupo Autorizado:**
  - El Coordinador Académico accede con rol \`ROLE_COORDINADOR\` a la ficha del estudiante.
  - Activa la bandera *"Matrícula por Excepción"*, adjunta el número de resolución administrativa y el sistema permite bypass de prerrequisito o sobrecupo físico de aula previa validación de aforo.
  - La transacción queda firmada digitalmente y auditada en RF-12 con causal administrativa.

##### D. Flujos de Excepción
- **FE-01: Caída de Red o Interrupción de Conectividad (RNF-07, RNF-09):**
  - Si la conexión se pierde durante el Paso 8 antes del commit, el motor de base de datos aplica \`ROLLBACK\` automático. No se decrementa ningún cupo y no se asienta la matrícula. Al reconectar, la interfaz alerta que no hubo cambios persistidos.
- **FE-02: Saturación del Pool de Conexiones por Alta Concurrencia (RNF-02, RNF-04):**
  - Ante 300 o más peticiones simultáneas, si el tiempo de respuesta supera los 3.0 segundos, el Circuit Breaker libera el hilo de ejecución para evitar deadlocks y devuelve un mensaje amable de reintento en 15 segundos sin corromper el estado.

##### E. Postcondiciones
- **Postcondición de Éxito:**
  - Cupo de cada grupo reducido atómicamente en 1.
  - Matrícula asentada en BD con identificador único e inmutable.
  - Evento de auditoría emitido con hash criptográfico en RF-12.
  - El estudiante queda habilitado inmediatamente para ver sus cursos en UC-09 y el docente lo recibe en su lista oficial (UC-06).
- **Postcondición de Fallo:**
  - Cero alteraciones en cupos o tablas relacionales (Consistencia ACID pura).
  - Notificación contextual clara al usuario del motivo del rechazo.

---

#### 4.2 PLANTILLA DE CASO DE USO: UC-06 REGISTRAR CALIFICACIONES

| Campo | Especificación Formal |
| :--- | :--- |
| **Identificador** | **UC-06** |
| **Nombre** | **Registrar y Publicar Calificaciones** |
| **Versión** | 2.4 (Revisión de Arquitectura para Producción) |
| **Autor** | Arquitecto de Software Senior - SGA Architecture Team |
| **Actor Principal** | **Docente Titular del Grupo** |
| **Actores Secundarios** | Estudiante (receptor de notas), Coordinador Académico (supervisor), Servicio de Auditoría |
| **Requerimientos Funcionales** | **RF-08** (Calificaciones), RF-01 (Autenticación), RF-02 (Roles), RF-06 (Grupos y Fechas), RF-09 (Consulta Resultados), RF-11 (Filtros), RF-12 (Auditoría) |
| **Requerimientos No Funcionales** | **RNF-01** (Seguridad), **RNF-02** (Rendimiento <= 3s), **RNF-06** (Usabilidad Hoja de Cálculo), **RNF-07** (Consistencia Matemática), **RNF-10** (Trazabilidad Forense), **RNF-11** (Privacidad de Datos), **RNF-12** (Multiplataforma) |
| **Nivel de Criticidad** | **CRÍTICA** (Afecta el estatus académico legal de los estudiantes y graduación) |
| **Propósito** | Permitir al docente ingresar, validar, ponderar y asentar calificaciones parciales y definitivas con rigor matemático y trazabilidad forense de cada cambio. |

##### A. Precondiciones
1. El docente debe haberse autenticado exitosamente (RF-01) con rol \`ROLE_DOCENTE\`.
2. El grupo académico debe estar formalmente asignado a la carga lectiva del docente en el periodo lectivo activo (RF-06).
3. Debe existir al menos un estudiante con matrícula en estado \`ASENTADA\` en dicho grupo.
4. El corte evaluativo (ej. Parcial 1: 30%, Parcial 2: 30%, Final: 40%) debe encontrarse dentro de las fechas de apertura fijadas en el cronograma académico.
5. El acta de notas no debe haber sido cerrada con firma definitiva por Coordinación.

##### B. Flujo Principal de Eventos
1. **[Actor]**: El Docente ingresa al menú "Mis Grupos" y selecciona la asignatura y grupo a calificar.
2. **[Sistema]**: Valida los permisos del docente sobre el grupo. Despliega la nómina de estudiantes matriculados en orden alfabético junto a las ponderaciones oficiales de la asignatura.
3. **[Actor]**: El Docente selecciona el corte evaluativo activo (ej. "Corte 1 - 30%").
4. **[Actor]**: El Docente ingresa las calificaciones numéricas de los estudiantes utilizando navegación por teclado (Enter o flechas).
5. **[Sistema]**: Valida en tiempo real que cada calificación esté dentro del rango 0.0 a 5.0 con hasta dos cifras decimales. Calcula instantáneamente el promedio ponderado y resalta en verde notas aprobatorias (>= 3.0) y en rojo reprobatorias (< 3.0).
6. **[Actor]**: El Docente verifica el resumen de notas del grupo y hace clic en "Guardar y Publicar Calificaciones".
7. **[Sistema]**: Despliega modal de confirmación con las estadísticas del curso: estudiantes evaluados, promedio general del grupo, aprobados y reprobados.
8. **[Actor]**: El Docente confirma la operación.
9. **[Sistema]**: Inicia transacción en BD:
   - Valida la vigencia de la fecha en el servidor (previene desfases horarios de cliente).
   - Persiste los registros con estado \`PUBLICADA\`, asociando \`docente_id\`, \`fecha_grabacion\` y \`hash_acta\`.
   - Si existían notas previas, graba el registro diferencial en la tabla histórica de auditoría (RF-12).
   - Recalcula la nota definitiva acumulada de cada estudiante en el backend.
10. **[Sistema]**: Notifica al docente el éxito de la publicación y genera el comprobante digital de calificaciones.
11. **[Sistema]**: Las calificaciones quedan habilitadas de inmediato para que cada estudiante consulte exclusivamente su nota en UC-09 (RNF-11).

##### C. Flujos Alternativos
- **FA-01: Modificación de Calificación Publicada con Justificación Obligatoria (RF-08, RF-12):**
  - Si el docente altera una calificación previamente asentada dentro de la ventana habilitada, el sistema solicita un campo de texto obligatorio: *"Motivo justificado del cambio de nota"*.
  - El docente ingresa la justificación (ej. "Revisión presencial de reclamo en punto 3 de examen").
  - El sistema guarda la nueva nota y almacena en auditoría: valor anterior, valor nuevo, usuario, IP, fecha y justificación textual.
- **FA-02: Importación Masiva mediante Archivo CSV o Excel (RNF-06):**
  - El docente descarga la plantilla oficial (.xlsx o .csv) con la nómina del grupo.
  - Diligencia las notas de forma local y sube el archivo a la plataforma.
  - El sistema analiza la estructura sintáctica, coteja códigos de estudiantes y muestra una previsualización con semáforo de validación.
  - El docente confirma y los valores se precargan en la libreta para publicación (Paso 6).
- **FA-03: Guardado en Modo Borrador Temporal:**
  - El docente pulsa "Guardar Borrador". Las notas se almacenan con estado \`BORRADOR\` sin ser visibles para los estudiantes en UC-09 hasta su publicación formal.
- **FA-04: Solicitud de Modificación Extemporánea:**
  - Si la fecha límite expiró, el docente solicita apertura extraordinaria al Coordinador Académico a través de la plataforma, adjuntando justificación y soportes.

##### D. Flujos de Excepción
- **FE-01: Nota Fuera de Rango o Carácter Inválido:**
  - Si el docente teclea un valor menor a 0.0 o mayor a 5.0 (ej. 5.5 o letras), la celda se bloquea en rojo, emite sonido/alerta accesible y no permite avanzar ni guardar hasta corregir el valor.
- **FE-02: Expiración de la Ventana de Calificaciones en Plena Edición:**
  - Si el docente envía las notas luego del límite fijado en el cronograma (RF-06), el servidor rechaza el cambio y conserva una copia local en borrador, sugiriendo tramitar reapertura por Coordinación.
- **FE-03: Conflicto de Concurrencia por Doble Sesión Abierta:**
  - Si el docente abrió dos ventanas simultáneas, el token de concurrencia optimista (\`version_number\`) rechaza la sobreescritura ciega y muestra las diferencias.

##### E. Postcondiciones
- **Postcondición de Éxito:**
  - Calificaciones registradas en BD con precisión de punto fijo (\`numeric(3,2)\`).
  - Cálculo de nota definitiva actualizado en tiempo real.
  - Bitácora de auditoría enriquecida con trazabilidad forense (RF-12).
  - Estudiantes del grupo habilitados para consultar su nota individual en UC-09.
- **Postcondición de Fallo:**
  - La base de datos mantiene las notas preexistentes inalteradas.
  - Ninguna calificación corrupta o fuera de rango es almacenada.

---

### 5. CÓDIGO MERMAID.JS FORMAL DEL MODELO DE CASOS DE USO

A continuación se presenta el código completo en sintaxis estándar Mermaid.js para su renderizado vectorial y documentación en herramientas como Notion, GitHub, GitLab o visualizadores Mermaid:

\`\`\`mermaid
${CODIGO_MERMAID_CASOS_DE_USO}
\`\`\`

---

### 6. MATRIZ DE TRAZABILIDAD CRUZADA: REQUERIMIENTOS (RF/RNF) VS CASOS DE USO

La siguiente matriz evidencia la cobertura total del 100% de los requerimientos de la sección 4:

1. **RF-01 (Autenticación)** -> UC-01, UC-12 | *Satisface RNF-01 (HTTPS, Bcrypt/Argon2id), RNF-11 (Menor privilegio).*
2. **RF-02 (Roles y permisos)** -> UC-01, UC-02, UC-05, UC-06 | *Satisface RNF-01 (RBAC granular), RNF-05 (Cohesión modular).*
3. **RF-03 (Gestión de estudiantes)** -> UC-03, UC-10, UC-11 | *Satisface RNF-06 (Accesibilidad), RNF-11 (Privacidad de datos personales).*
4. **RF-04 (Gestión de docentes)** -> UC-04, UC-08, UC-11 | *Satisface RNF-06, RNF-11.*
5. **RF-05 (Programas y asignaturas)** -> UC-07, UC-05, UC-11 | *Satisface RNF-05 (Mantenibilidad), RNF-08 (API REST curricular).*
6. **RF-06 (Grupos y periodos)** -> UC-08, UC-05, UC-06 | *Satisface RNF-07 (Consistencia de cupos y horarios).*
7. **RF-07 (Matrícula académica)** -> UC-05 | *Satisface RNF-02 (<=3s con 300 usuarios), RNF-07 (Transacción ACID serializable), RNF-10 (Trazabilidad).*
8. **RF-08 (Registro de calificaciones)** -> UC-06 | *Satisface RNF-07 (Consistencia matemática), RNF-10 (Auditoría de cambios), RNF-11 (Privacidad).*
9. **RF-09 (Consulta de resultados)** -> UC-09, UC-11 | *Satisface RNF-02 (Respuesta rápida), RNF-06 (Responsive móvil), RNF-11 (Aislamiento de notas ajenas).*
10. **RF-10 (Reportes)** -> UC-10 | *Satisface RNF-02 (Consultas indexadas), RNF-08 (Formatos estándar JSON/PDF).*
11. **RF-11 (Búsqueda y filtros)** -> UC-11 | *Satisface RNF-02, RNF-06, RNF-12 (Cross-browser).*
12. **RF-12 (Auditoría)** -> UC-12, UC-01, UC-05, UC-06 | *Satisface RNF-01, RNF-07, RNF-09, RNF-10 (Trazabilidad forense inmutable).*

---

### 7. CONCLUSIÓN Y DICTAMEN DE ARQUITECTURA

El presente **Modelo de Casos de Uso (Sección 6.1)** establece una arquitectura robusta, desacoplada y orientada al cumplimiento riguroso de las reglas de negocio académicas. Al desacoplar la lógica de presentación de las transacciones atómicas de matrícula (**UC-05**) y calificaciones (**UC-06**), se garantiza la solidez del sistema ante picos de demanda estacionales, blindando a la institución contra pérdida de datos, sobrecupos y adulteraciones de calificaciones.
`;
