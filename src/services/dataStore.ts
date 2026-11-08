/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Capa de Datos (Data Layer) - Sistema de Gestión Académica (SGA)
 * Simula el almacenamiento relacional (PostgreSQL 16) en memoria con persistencia en localStorage.
 * Modela las 11 entidades de la Sección 6.4:
 * Usuario, Rol, Estudiante, Docente, Programa, Asignatura, PeriodoAcademico, Grupo, Matricula, Calificacion, AuditLog.
 */

import { checkCollisionBetweenSchedules } from './scheduleUtils';

export interface RolEntity {
  id: string;
  nombre: 'ADMINISTRADOR' | 'COORDINADOR_ACADEMICO' | 'DOCENTE' | 'ESTUDIANTE';
  descripcion: string;
}

export interface UsuarioEntity {
  id: string;
  email: string;
  passwordHash: string; // Simulado Argon2id
  nombreCompleto: string;
  rolId: string;
  rolNombre: 'ADMINISTRADOR' | 'COORDINADOR_ACADEMICO' | 'DOCENTE' | 'ESTUDIANTE';
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface EstudianteEntity {
  id: string;
  usuarioId: string;
  codigoEstudiantil: string;
  documentoIdentidad: string;
  nombres: string;
  apellidos: string;
  programaId: string;
  programaNombre: string;
  semestreActual: number;
  promedioAcumulado: number;
  creditosAprobados: number;
  totalCreditos: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'GRADUADO' | 'SUSPENDIDO';
}

export interface DocenteEntity {
  id: string;
  usuarioId: string;
  documentoIdentidad: string;
  nombres: string;
  apellidos: string;
  tituloAcademico: string;
  departamento: string;
  isActive: boolean;
}

export interface ProgramaEntity {
  id: string;
  codigoSnies: string;
  nombre: string;
  nivelAcademico: 'PREGRADO' | 'POSGRADO' | 'MAESTRIA';
  totalCreditos: number;
  duracionSemestres: number;
}

export interface AsignaturaEntity {
  id: string;
  programaId: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestreNivel: number;
  prerrequisitos: string[];
}

export interface PeriodoAcademicoEntity {
  id: string;
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  fechaLimiteMatricula: string;
  fechaCierreNotas: string;
  estado: 'PLANIFICACION' | 'ABIERTO' | 'CERRADO';
}

export interface GrupoEntity {
  id: string;
  asignaturaId: string;
  asignaturaCodigo: string;
  asignaturaNombre: string;
  creditos: number;
  periodoId: string;
  docenteId: string;
  docenteNombre: string;
  numeroGrupo: string;
  cupoMaximo: number;
  cupoDisponible: number;
  diasHorario: string;
  aulaOEnlace: string;
  versionLock: number;
}

export interface MatriculaDetalleEntity {
  id: string;
  matriculaId: string;
  grupoId: string;
  asignaturaCodigo: string;
  asignaturaNombre: string;
  creditos: number;
  docenteNombre: string;
  horario: string;
  aula: string;
  estado: 'ASENTADA' | 'CANCELADA';
  corte1: number | null; // 30%
  corte2: number | null; // 30%
  corte3: number | null; // 40% (Examen Final)
  notaDefinitiva: number | null;
}

export interface MatriculaEntity {
  id: string;
  estudianteId: string;
  periodoId: string;
  codigoComprobante: string;
  fechaMatricula: string;
  totalCreditos: number;
  estado: 'ASENTADA' | 'CANCELADA';
  detalles: MatriculaDetalleEntity[];
}

export interface AuditLogEntity {
  id: number;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  ipOrigen: string;
  fechaUtc: string;
  modulo: 'AUTENTICACION' | 'MATRICULAS' | 'CALIFICACIONES' | 'USUARIOS' | 'ACADEMICO';
  accion: string;
  entidadAfectada: string;
  registroAfectadoId: string;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown>;
  justificacion?: string;
}

const STORAGE_KEY = 'sga_enterprise_db_v1';

// Seed inicial normalizado
const SEED_ROLES: RolEntity[] = [
  { id: 'rol-admin', nombre: 'ADMINISTRADOR', descripcion: 'Control total de plataforma, seguridad y auditoría' },
  { id: 'rol-coord', nombre: 'COORDINADOR_ACADEMICO', descripcion: 'Gestión curricular, asignaturas, docentes y apertura de grupos' },
  { id: 'rol-docente', nombre: 'DOCENTE', descripcion: 'Gestión de clases asignadas y registro de calificaciones' },
  { id: 'rol-estudiante', nombre: 'ESTUDIANTE', descripcion: 'Inscripción de asignaturas y consulta de resultados académicos' },
];

const SEED_PROGRAMAS: ProgramaEntity[] = [
  { id: 'prog-sis', codigoSnies: '10421', nombre: 'Ingeniería de Sistemas', nivelAcademico: 'PREGRADO', totalCreditos: 160, duracionSemestres: 10 },
  { id: 'prog-adm', codigoSnies: '10188', nombre: 'Administración de Empresas', nivelAcademico: 'PREGRADO', totalCreditos: 145, duracionSemestres: 9 },
];

const SEED_USUARIOS: UsuarioEntity[] = [
  {
    id: 'usr-est-01',
    email: 'sofia.morales@cun.edu.co',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$sofia123',
    nombreCompleto: 'Sofía Morales Salazar',
    rolId: 'rol-estudiante',
    rolNombre: 'ESTUDIANTE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'usr-doc-01',
    email: 'carlos.mendivelso@cun.edu.co',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$carlos123',
    nombreCompleto: 'Dr. Carlos Mendivelso',
    rolId: 'rol-docente',
    rolNombre: 'DOCENTE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2023-08-01T08:00:00Z',
  },
  {
    id: 'usr-coord-01',
    email: 'andres.valenzuela@cun.edu.co',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$andres123',
    nombreCompleto: 'Ing. Andrés Valenzuela',
    rolId: 'rol-coord',
    rolNombre: 'COORDINADOR_ACADEMICO',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2022-03-10T08:00:00Z',
  },
  {
    id: 'usr-admin-01',
    email: 'elena.rojas@cun.edu.co',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$elena123',
    nombreCompleto: 'Mg. Elena Rojas',
    rolId: 'rol-admin',
    rolNombre: 'ADMINISTRADOR',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2021-02-01T08:00:00Z',
  },
];

const SEED_ESTUDIANTES: EstudianteEntity[] = [
  {
    id: 'est-01',
    usuarioId: 'usr-est-01',
    codigoEstudiantil: 'EST-2024-001',
    documentoIdentidad: '1020847291',
    nombres: 'Sofía',
    apellidos: 'Morales Salazar',
    programaId: 'prog-sis',
    programaNombre: 'Ingeniería de Sistemas',
    semestreActual: 5,
    promedioAcumulado: 4.42,
    creditosAprobados: 78,
    totalCreditos: 160,
    estado: 'ACTIVO',
  },
  {
    id: 'est-02',
    usuarioId: 'usr-est-02',
    codigoEstudiantil: 'EST-2024-042',
    documentoIdentidad: '1030948112',
    nombres: 'Juan Camilo',
    apellidos: 'Pardo Rivas',
    programaId: 'prog-sis',
    programaNombre: 'Ingeniería de Sistemas',
    semestreActual: 5,
    promedioAcumulado: 3.85,
    creditosAprobados: 74,
    totalCreditos: 160,
    estado: 'ACTIVO',
  },
  {
    id: 'est-03',
    usuarioId: 'usr-est-03',
    codigoEstudiantil: 'EST-2024-089',
    documentoIdentidad: '1019283741',
    nombres: 'Laura Valentina',
    apellidos: 'Méndez Peña',
    programaId: 'prog-sis',
    programaNombre: 'Ingeniería de Sistemas',
    semestreActual: 5,
    promedioAcumulado: 4.60,
    creditosAprobados: 82,
    totalCreditos: 160,
    estado: 'ACTIVO',
  },
];

const SEED_DOCENTES: DocenteEntity[] = [
  {
    id: 'doc-01',
    usuarioId: 'usr-doc-01',
    documentoIdentidad: '79843219',
    nombres: 'Carlos',
    apellidos: 'Mendivelso',
    tituloAcademico: 'Ph.D. en Ciencias de la Computación',
    departamento: 'Ingeniería de Software & Sistemas',
    isActive: true,
  },
  {
    id: 'doc-02',
    usuarioId: 'usr-doc-02',
    documentoIdentidad: '52839210',
    nombres: 'Marcela',
    apellidos: 'Torres Cárdenas',
    tituloAcademico: 'M.Sc. en Seguridad y Redes',
    departamento: 'Telecomunicaciones y Redes',
    isActive: true,
  },
];

const SEED_PERIODOS: PeriodoAcademicoEntity[] = [
  {
    id: 'per-2026-1',
    codigo: '2026-1',
    nombre: 'Primer Periodo Académico 2026',
    fechaInicio: '2026-02-02',
    fechaFin: '2026-06-15',
    fechaLimiteMatricula: '2026-02-28',
    fechaCierreNotas: '2026-06-20',
    estado: 'ABIERTO',
  },
];

const SEED_ASIGNATURAS: AsignaturaEntity[] = [
  { id: 'asig-is301', programaId: 'prog-sis', codigo: 'IS-301', nombre: 'Ingeniería de Software', creditos: 4, semestreNivel: 5, prerrequisitos: ['IS-204'] },
  { id: 'asig-is302', programaId: 'prog-sis', codigo: 'IS-302', nombre: 'Arquitectura de Bases de Datos', creditos: 3, semestreNivel: 5, prerrequisitos: ['IS-202'] },
  { id: 'asig-is303', programaId: 'prog-sis', codigo: 'IS-303', nombre: 'Redes y Comunicaciones', creditos: 3, semestreNivel: 5, prerrequisitos: ['IS-203'] },
  { id: 'asig-is304', programaId: 'prog-sis', codigo: 'IS-304', nombre: 'Sistemas Operativos Distribuidos', creditos: 3, semestreNivel: 5, prerrequisitos: ['IS-201'] },
  { id: 'asig-is305', programaId: 'prog-sis', codigo: 'IS-305', nombre: 'Inteligencia Artificial Aplicada', creditos: 3, semestreNivel: 6, prerrequisitos: ['IS-301'] },
  { id: 'asig-is306', programaId: 'prog-sis', codigo: 'IS-306', nombre: 'Seguridad y Criptografía', creditos: 3, semestreNivel: 6, prerrequisitos: ['IS-303'] },
];

const SEED_GRUPOS: GrupoEntity[] = [
  {
    id: 'grp-01',
    asignaturaId: 'asig-is301',
    asignaturaCodigo: 'IS-301',
    asignaturaNombre: 'Ingeniería de Software',
    creditos: 4,
    periodoId: 'per-2026-1',
    docenteId: 'doc-01',
    docenteNombre: 'Dr. Carlos Mendivelso',
    numeroGrupo: 'G1',
    cupoMaximo: 25,
    cupoDisponible: 4, // 21 matriculados
    diasHorario: 'Lunes y Miércoles 08:00 - 10:00',
    aulaOEnlace: 'Edificio Central - Aula B-204',
    versionLock: 21,
  },
  {
    id: 'grp-02',
    asignaturaId: 'asig-is302',
    asignaturaCodigo: 'IS-302',
    asignaturaNombre: 'Arquitectura de Bases de Datos',
    creditos: 3,
    periodoId: 'per-2026-1',
    docenteId: 'doc-01',
    docenteNombre: 'Dr. Carlos Mendivelso',
    numeroGrupo: 'G1',
    cupoMaximo: 20,
    cupoDisponible: 2, // 18 matriculados
    diasHorario: 'Martes y Jueves 10:00 - 12:00',
    aulaOEnlace: 'Laboratorio de Cómputo 3',
    versionLock: 18,
  },
  {
    id: 'grp-03',
    asignaturaId: 'asig-is303',
    asignaturaCodigo: 'IS-303',
    asignaturaNombre: 'Redes y Comunicaciones',
    creditos: 3,
    periodoId: 'per-2026-1',
    docenteId: 'doc-02',
    docenteNombre: 'Dra. Marcela Torres Cárdenas',
    numeroGrupo: 'G1',
    cupoMaximo: 25,
    cupoDisponible: 9, // 16 matriculados
    diasHorario: 'Viernes 07:00 - 11:00',
    aulaOEnlace: 'Laboratorio Especializado de Redes',
    versionLock: 16,
  },
  {
    id: 'grp-04',
    asignaturaId: 'asig-is304',
    asignaturaCodigo: 'IS-304',
    asignaturaNombre: 'Sistemas Operativos Distribuidos',
    creditos: 3,
    periodoId: 'per-2026-1',
    docenteId: 'doc-02',
    docenteNombre: 'Dra. Marcela Torres Cárdenas',
    numeroGrupo: 'G1',
    cupoMaximo: 25,
    cupoDisponible: 12, // 13 matriculados
    diasHorario: 'Lunes y Miércoles 14:00 - 16:00',
    aulaOEnlace: 'Edificio Central - Aula C-102',
    versionLock: 13,
  },
  {
    id: 'grp-05',
    asignaturaId: 'asig-is305',
    asignaturaCodigo: 'IS-305',
    asignaturaNombre: 'Inteligencia Artificial Aplicada',
    creditos: 3,
    periodoId: 'per-2026-1',
    docenteId: 'doc-01',
    docenteNombre: 'Dr. Carlos Mendivelso',
    numeroGrupo: 'G1',
    cupoMaximo: 30,
    cupoDisponible: 15,
    diasHorario: 'Martes y Jueves 16:00 - 18:00',
    aulaOEnlace: 'Sala Virtual Sincrónica (Meet)',
    versionLock: 15,
  },
];

const SEED_MATRICULAS: MatriculaEntity[] = [
  {
    id: 'mat-01',
    estudianteId: 'est-01',
    periodoId: 'per-2026-1',
    codigoComprobante: 'MAT-2026-1-A9842',
    fechaMatricula: '2026-02-05T09:30:00Z',
    totalCreditos: 7,
    estado: 'ASENTADA',
    detalles: [
      {
        id: 'det-01',
        matriculaId: 'mat-01',
        grupoId: 'grp-01',
        asignaturaCodigo: 'IS-301',
        asignaturaNombre: 'Ingeniería de Software',
        creditos: 4,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Lunes y Miércoles 08:00 - 10:00',
        aula: 'Edificio Central - Aula B-204',
        estado: 'ASENTADA',
        corte1: 4.5,
        corte2: 4.2,
        corte3: null, // Pendiente Examen Final
        notaDefinitiva: 4.35, // Proyectada
      },
      {
        id: 'det-02',
        matriculaId: 'mat-01',
        grupoId: 'grp-02',
        asignaturaCodigo: 'IS-302',
        asignaturaNombre: 'Arquitectura de Bases de Datos',
        creditos: 3,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Martes y Jueves 10:00 - 12:00',
        aula: 'Laboratorio de Cómputo 3',
        estado: 'ASENTADA',
        corte1: 4.8,
        corte2: 4.6,
        corte3: null,
        notaDefinitiva: 4.70,
      },
    ],
  },
  {
    id: 'mat-02',
    estudianteId: 'est-02',
    periodoId: 'per-2026-1',
    codigoComprobante: 'MAT-2026-1-B7712',
    fechaMatricula: '2026-02-06T11:15:00Z',
    totalCreditos: 7,
    estado: 'ASENTADA',
    detalles: [
      {
        id: 'det-03',
        matriculaId: 'mat-02',
        grupoId: 'grp-01',
        asignaturaCodigo: 'IS-301',
        asignaturaNombre: 'Ingeniería de Software',
        creditos: 4,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Lunes y Miércoles 08:00 - 10:00',
        aula: 'Edificio Central - Aula B-204',
        estado: 'ASENTADA',
        corte1: 3.5,
        corte2: 3.8,
        corte3: null,
        notaDefinitiva: 3.65,
      },
      {
        id: 'det-04',
        matriculaId: 'mat-02',
        grupoId: 'grp-02',
        asignaturaCodigo: 'IS-302',
        asignaturaNombre: 'Arquitectura de Bases de Datos',
        creditos: 3,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Martes y Jueves 10:00 - 12:00',
        aula: 'Laboratorio de Cómputo 3',
        estado: 'ASENTADA',
        corte1: 3.2,
        corte2: 3.0,
        corte3: null,
        notaDefinitiva: 3.10,
      },
    ],
  },
  {
    id: 'mat-03',
    estudianteId: 'est-03',
    periodoId: 'per-2026-1',
    codigoComprobante: 'MAT-2026-1-C1094',
    fechaMatricula: '2026-02-04T15:00:00Z',
    totalCreditos: 7,
    estado: 'ASENTADA',
    detalles: [
      {
        id: 'det-05',
        matriculaId: 'mat-03',
        grupoId: 'grp-01',
        asignaturaCodigo: 'IS-301',
        asignaturaNombre: 'Ingeniería de Software',
        creditos: 4,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Lunes y Miércoles 08:00 - 10:00',
        aula: 'Edificio Central - Aula B-204',
        estado: 'ASENTADA',
        corte1: 4.9,
        corte2: 4.8,
        corte3: null,
        notaDefinitiva: 4.85,
      },
      {
        id: 'det-06',
        matriculaId: 'mat-03',
        grupoId: 'grp-02',
        asignaturaCodigo: 'IS-302',
        asignaturaNombre: 'Arquitectura de Bases de Datos',
        creditos: 3,
        docenteNombre: 'Dr. Carlos Mendivelso',
        horario: 'Martes y Jueves 10:00 - 12:00',
        aula: 'Laboratorio de Cómputo 3',
        estado: 'ASENTADA',
        corte1: 4.7,
        corte2: 4.5,
        corte3: null,
        notaDefinitiva: 4.60,
      },
    ],
  },
];

const SEED_AUDITORIA: AuditLogEntity[] = [
  {
    id: 101,
    usuarioId: 'usr-admin-01',
    usuarioNombre: 'Mg. Elena Rojas (Admin)',
    usuarioEmail: 'elena.rojas@cun.edu.co',
    ipOrigen: '192.168.10.45',
    fechaUtc: '2026-02-01T08:00:00Z',
    modulo: 'AUTENTICACION',
    accion: 'INICIO_SESION_EXITOSO',
    entidadAfectada: 'sga_usuario',
    registroAfectadoId: 'usr-admin-01',
    datosAnteriores: null,
    datosNuevos: { method: 'MFA_PASSWORD', userAgent: 'Mozilla/5.0 Chrome 122' },
  },
  {
    id: 102,
    usuarioId: 'usr-coord-01',
    usuarioNombre: 'Ing. Andrés Valenzuela (Coord)',
    usuarioEmail: 'andres.valenzuela@cun.edu.co',
    ipOrigen: '192.168.10.12',
    fechaUtc: '2026-02-02T10:15:00Z',
    modulo: 'ACADEMICO',
    accion: 'APERTURA_GRUPO_CURSO',
    entidadAfectada: 'sga_grupo',
    registroAfectadoId: 'grp-01',
    datosAnteriores: null,
    datosNuevos: { curso: 'IS-301', grupo: 'G1', cupo: 25, docente: 'Dr. Carlos Mendivelso' },
  },
  {
    id: 103,
    usuarioId: 'usr-est-01',
    usuarioNombre: 'Sofía Morales Salazar',
    usuarioEmail: 'sofia.morales@cun.edu.co',
    ipOrigen: '186.28.140.22',
    fechaUtc: '2026-02-05T09:30:00Z',
    modulo: 'MATRICULAS',
    accion: 'ASENTAMIENTO_MATRICULA',
    entidadAfectada: 'sga_matricula',
    registroAfectadoId: 'mat-01',
    datosAnteriores: null,
    datosNuevos: { comprobante: 'MAT-2026-1-A9842', creditos: 7, grupos: ['grp-01', 'grp-02'] },
  },
  {
    id: 104,
    usuarioId: 'usr-doc-01',
    usuarioNombre: 'Dr. Carlos Mendivelso (Docente)',
    usuarioEmail: 'carlos.mendivelso@cun.edu.co',
    ipOrigen: '190.158.42.11',
    fechaUtc: '2026-02-14T17:45:00Z',
    modulo: 'CALIFICACIONES',
    accion: 'REGISTRO_CALIFICACION_CORTE1',
    entidadAfectada: 'sga_calificacion',
    registroAfectadoId: 'det-01',
    datosAnteriores: { corte1: null },
    datosNuevos: { corte1: 4.5, estudiante: 'Sofía Morales', grupo: 'IS-301 G1' },
    justificacion: 'Evaluación Parcial 1 calificada según rúbrica institucional',
  },
];

export interface AppDatabase {
  roles: RolEntity[];
  usuarios: UsuarioEntity[];
  estudiantes: EstudianteEntity[];
  docentes: DocenteEntity[];
  programas: ProgramaEntity[];
  asignaturas: AsignaturaEntity[];
  periodos: PeriodoAcademicoEntity[];
  grupos: GrupoEntity[];
  matriculas: MatriculaEntity[];
  auditoria: AuditLogEntity[];
}

export class DataStore {
  private data: AppDatabase;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): AppDatabase {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using seed data:', e);
    }
    return {
      roles: SEED_ROLES,
      usuarios: SEED_USUARIOS,
      estudiantes: SEED_ESTUDIANTES,
      docentes: SEED_DOCENTES,
      programas: SEED_PROGRAMAS,
      asignaturas: SEED_ASIGNATURAS,
      periodos: SEED_PERIODOS,
      grupos: SEED_GRUPOS,
      matriculas: SEED_MATRICULAS,
      auditoria: SEED_AUDITORIA,
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  public getSnapshot(): AppDatabase {
    return JSON.parse(JSON.stringify(this.data));
  }

  public resetToDefault(): void {
    this.data = {
      roles: SEED_ROLES,
      usuarios: SEED_USUARIOS,
      estudiantes: SEED_ESTUDIANTES,
      docentes: SEED_DOCENTES,
      programas: SEED_PROGRAMAS,
      asignaturas: SEED_ASIGNATURAS,
      periodos: SEED_PERIODOS,
      grupos: SEED_GRUPOS,
      matriculas: SEED_MATRICULAS,
      auditoria: SEED_AUDITORIA,
    };
    this.saveToStorage();
  }

  // Métodos de lectura y mutación atómica
  public getUsuarios(): UsuarioEntity[] {
    return [...this.data.usuarios];
  }

  public getEstudianteByUsuarioId(usuarioId: string): EstudianteEntity | undefined {
    return this.data.estudiantes.find((e) => e.usuarioId === usuarioId);
  }

  public getDocenteByUsuarioId(usuarioId: string): DocenteEntity | undefined {
    return this.data.docentes.find((d) => d.usuarioId === usuarioId);
  }

  public getAsignaturas(): AsignaturaEntity[] {
    return [...this.data.asignaturas];
  }

  public getGrupos(periodoId: string = 'per-2026-1'): GrupoEntity[] {
    return this.data.grupos.filter((g) => g.periodoId === periodoId);
  }

  public getMatriculaEstudiante(estudianteId: string, periodoId: string = 'per-2026-1'): MatriculaEntity | undefined {
    return this.data.matriculas.find((m) => m.estudianteId === estudianteId && m.periodoId === periodoId && m.estado === 'ASENTADA');
  }

  public getAllMatriculas(): MatriculaEntity[] {
    return [...this.data.matriculas];
  }

  public getGruposDocente(docenteId: string): GrupoEntity[] {
    return this.data.grupos.filter((g) => g.docenteId === docenteId);
  }

  public getEstudiantesMatriculadosEnGrupo(grupoId: string) {
    const resultados: { estudiante: EstudianteEntity; matriculaDetalle: MatriculaDetalleEntity }[] = [];
    for (const mat of this.data.matriculas) {
      if (mat.estado !== 'ASENTADA') continue;
      const detalle = mat.detalles.find((d) => d.grupoId === grupoId && d.estado === 'ASENTADA');
      if (detalle) {
        const est = this.data.estudiantes.find((e) => e.id === mat.estudianteId);
        if (est) {
          resultados.push({ estudiante: est, matriculaDetalle: detalle });
        }
      }
    }
    return resultados;
  }

  public getAuditLogs(): AuditLogEntity[] {
    return [...this.data.auditoria].sort((a, b) => b.id - a.id);
  }

  // Mutación: Transacción de Matrícula (ACID Simulado con Bloqueo de Cupo)
  public transaccionMatricular(estudianteId: string, periodoId: string, gruposIds: string[]): { success: boolean; matricula?: MatriculaEntity; error?: string } {
    const estudiante = this.data.estudiantes.find((e) => e.id === estudianteId);
    if (!estudiante) return { success: false, error: 'Estudiante no registrado en el sistema.' };

    // 1. Validar que no exista matrícula asentada previa (RF-07)
    const existente = this.data.matriculas.find((m) => m.estudianteId === estudianteId && m.periodoId === periodoId && m.estado === 'ASENTADA');

    // 2. Bloqueo de fila y verificación de cupos
    const gruposSeleccionados: GrupoEntity[] = [];
    for (const gid of gruposIds) {
      const g = this.data.grupos.find((item) => item.id === gid);
      if (!g) return { success: false, error: `El grupo ${gid} no existe.` };
      if (g.cupoDisponible <= 0) {
        return { success: false, error: `El grupo ${g.numeroGrupo} de ${g.asignaturaNombre} no tiene cupos disponibles (Cupo agotado).` };
      }
      gruposSeleccionados.push(g);
    }

    // 2.1 Validación estricta de cruce de horarios (RF-07, RNF-07)
    // a) Verificar colisión entre las asignaturas que intenta matricular al mismo tiempo
    for (let i = 0; i < gruposSeleccionados.length; i++) {
      for (let j = i + 1; j < gruposSeleccionados.length; j++) {
        const col = checkCollisionBetweenSchedules(gruposSeleccionados[i].diasHorario, gruposSeleccionados[j].diasHorario);
        if (col.hasCollision) {
          return {
            success: false,
            error: `Cruce de horarios detectado: "${gruposSeleccionados[i].asignaturaNombre}" y "${gruposSeleccionados[j].asignaturaNombre}" se cruzan el ${col.conflictingDay} (${col.overlappingHours}).`,
          };
        }
      }
    }

    // b) Verificar colisión contra las asignaturas ya asentadas en el periodo actual
    if (existente) {
      const asignaturasActivas = existente.detalles.filter((d) => d.estado === 'ASENTADA');
      for (const candidato of gruposSeleccionados) {
        for (const inscrita of asignaturasActivas) {
          const col = checkCollisionBetweenSchedules(candidato.diasHorario, inscrita.horario);
          if (col.hasCollision) {
            return {
              success: false,
              error: `Cruce con materia ya inscrita: "${candidato.asignaturaNombre}" (${candidato.diasHorario}) se traslapa con "${inscrita.asignaturaNombre}" (${inscrita.horario}) el ${col.conflictingDay} (${col.overlappingHours}).`,
            };
          }
        }
      }
    }

    // 3. Decrementar cupos atómicamente
    for (const g of gruposSeleccionados) {
      g.cupoDisponible -= 1;
      g.versionLock += 1;
    }

    // 4. Crear o agregar a la matrícula
    const nuevosDetalles: MatriculaDetalleEntity[] = gruposSeleccionados.map((g) => ({
      id: `det-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      matriculaId: existente ? existente.id : `mat-${Date.now()}`,
      grupoId: g.id,
      asignaturaCodigo: g.asignaturaCodigo,
      asignaturaNombre: g.asignaturaNombre,
      creditos: g.creditos,
      docenteNombre: g.docenteNombre,
      horario: g.diasHorario,
      aula: g.aulaOEnlace,
      estado: 'ASENTADA',
      corte1: null,
      corte2: null,
      corte3: null,
      notaDefinitiva: null,
    }));

    let matriculaFinal: MatriculaEntity;

    if (existente) {
      existente.detalles.push(...nuevosDetalles);
      existente.totalCreditos += nuevosDetalles.reduce((acc, d) => acc + d.creditos, 0);
      matriculaFinal = existente;
    } else {
      const totalCred = nuevosDetalles.reduce((acc, d) => acc + d.creditos, 0);
      const randHash = Math.random().toString(36).substring(2, 7).toUpperCase();
      matriculaFinal = {
        id: `mat-${Date.now()}`,
        estudianteId,
        periodoId,
        codigoComprobante: `MAT-2026-1-${randHash}`,
        fechaMatricula: new Date().toISOString(),
        totalCreditos: totalCred,
        estado: 'ASENTADA',
        detalles: nuevosDetalles,
      };
      this.data.matriculas.push(matriculaFinal);
    }

    this.saveToStorage();
    return { success: true, matricula: matriculaFinal };
  }

  // Mutación: Cancelar Asignatura y Devolver Cupo (+1)
  public transaccionCancelarMateria(matriculaId: string, detalleId: string): { success: boolean; error?: string } {
    const mat = this.data.matriculas.find((m) => m.id === matriculaId);
    if (!mat) return { success: false, error: 'Matrícula no encontrada' };

    const idx = mat.detalles.findIndex((d) => d.id === detalleId);
    if (idx === -1) return { success: false, error: 'Asignatura no encontrada en la matrícula' };

    const detalle = mat.detalles[idx];
    const grupo = this.data.grupos.find((g) => g.id === detalle.grupoId);
    if (grupo) {
      grupo.cupoDisponible = Math.min(grupo.cupoMaximo, grupo.cupoDisponible + 1);
    }

    mat.totalCreditos -= detalle.creditos;
    mat.detalles.splice(idx, 1);

    this.saveToStorage();
    return { success: true };
  }

  // Mutación: Registrar / Actualizar Calificaciones (RF-08)
  public guardarCalificacion(detalleId: string, corte1: number | null, corte2: number | null, corte3: number | null): { success: boolean; detalle?: MatriculaDetalleEntity; error?: string } {
    for (const mat of this.data.matriculas) {
      const det = mat.detalles.find((d) => d.id === detalleId);
      if (det) {
        det.corte1 = corte1;
        det.corte2 = corte2;
        det.corte3 = corte3;

        // Cálculo de definitiva ponderada: 30% + 30% + 40%
        let acumulado = 0;
        let pesoTotal = 0;

        if (corte1 !== null) {
          acumulado += corte1 * 0.30;
          pesoTotal += 0.30;
        }
        if (corte2 !== null) {
          acumulado += corte2 * 0.30;
          pesoTotal += 0.30;
        }
        if (corte3 !== null) {
          acumulado += corte3 * 0.40;
          pesoTotal += 0.40;
        }

        det.notaDefinitiva = pesoTotal > 0 ? Number((acumulado / pesoTotal).toFixed(2)) : null;

        this.saveToStorage();
        return { success: true, detalle: det };
      }
    }
    return { success: false, error: 'Detalle de matrícula no encontrado' };
  }

  // Mutación: Crear Asignatura (RF-05)
  public agregarAsignatura(asig: Omit<AsignaturaEntity, 'id'>): AsignaturaEntity {
    const id = `asig-${asig.codigo.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const nueva: AsignaturaEntity = { ...asig, id };
    this.data.asignaturas.push(nueva);
    this.saveToStorage();
    return nueva;
  }

  // Mutación: Crear Grupo (RF-06)
  public agregarGrupo(grupo: Omit<GrupoEntity, 'id' | 'cupoDisponible' | 'versionLock'>): GrupoEntity {
    const id = `grp-${Date.now()}`;
    const nuevo: GrupoEntity = {
      ...grupo,
      id,
      cupoDisponible: grupo.cupoMaximo,
      versionLock: 0,
    };
    this.data.grupos.push(nuevo);
    this.saveToStorage();
    return nuevo;
  }

  // Mutación: Crear Usuario (RF-03, RF-04)
  public agregarUsuario(usr: Omit<UsuarioEntity, 'id' | 'createdAt'>): UsuarioEntity {
    const id = `usr-${Date.now()}`;
    const nuevo: UsuarioEntity = {
      ...usr,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.usuarios.push(nuevo);

    // Si es estudiante o docente, crear perfil asociado
    if (usr.rolNombre === 'ESTUDIANTE') {
      const estId = `est-${Date.now()}`;
      this.data.estudiantes.push({
        id: estId,
        usuarioId: id,
        codigoEstudiantil: `EST-2026-${Math.floor(100 + Math.random() * 900)}`,
        documentoIdentidad: `${Math.floor(1000000000 + Math.random() * 900000000)}`,
        nombres: usr.nombreCompleto.split(' ')[0] || 'Estudiante',
        apellidos: usr.nombreCompleto.split(' ').slice(1).join(' ') || 'Nuevo',
        programaId: 'prog-sis',
        programaNombre: 'Ingeniería de Sistemas',
        semestreActual: 1,
        promedioAcumulado: 0.0,
        creditosAprobados: 0,
        totalCreditos: 160,
        estado: 'ACTIVO',
      });
    } else if (usr.rolNombre === 'DOCENTE') {
      const docId = `doc-${Date.now()}`;
      this.data.docentes.push({
        id: docId,
        usuarioId: id,
        documentoIdentidad: `${Math.floor(10000000 + Math.random() * 90000000)}`,
        nombres: usr.nombreCompleto.split(' ')[0] || 'Docente',
        apellidos: usr.nombreCompleto.split(' ').slice(1).join(' ') || 'Titular',
        tituloAcademico: 'Magíster en Educación y Tecnología',
        departamento: 'Ingeniería de Software & Sistemas',
        isActive: true,
      });
    }

    this.saveToStorage();
    return nuevo;
  }

  // Mutación: Activar / Desactivar Usuario
  public toggleEstadoUsuario(usuarioId: string): boolean {
    const usr = this.data.usuarios.find((u) => u.id === usuarioId);
    if (usr) {
      usr.isActive = !usr.isActive;
      this.saveToStorage();
      return usr.isActive;
    }
    return false;
  }

  // Mutación: Insertar Log Inmutable en Auditoría (RF-12)
  public registrarAuditoria(log: Omit<AuditLogEntity, 'id' | 'fechaUtc'>): AuditLogEntity {
    const nextId = (this.data.auditoria.length > 0 ? Math.max(...this.data.auditoria.map((l) => l.id)) : 100) + 1;
    const nuevoLog: AuditLogEntity = {
      ...log,
      id: nextId,
      fechaUtc: new Date().toISOString(),
    };
    this.data.auditoria.unshift(nuevoLog);
    this.saveToStorage();
    return nuevoLog;
  }
}

// Instancia singleton para toda la aplicación
export const db = new DataStore();
