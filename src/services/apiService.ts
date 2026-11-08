/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Capa de Servicios / API REST Simulada (Service Layer)
 * Implementa la lógica de negocio, validaciones transaccionales, control de acceso RBAC
 * y registro asíncrono de auditoría conforme a la Arquitectura N-Tier (Sección 6.2).
 */

import {
  db,
  UsuarioEntity,
  EstudianteEntity,
  DocenteEntity,
  GrupoEntity,
  AsignaturaEntity,
  MatriculaEntity,
  MatriculaDetalleEntity,
  AuditLogEntity,
} from './dataStore';

import {
  checkTeacherAndRoomConflicts,
  performSystemScheduleAudit,
} from './scheduleUtils';

// Simulación de latencia de red (100ms - 250ms)
const simulateNetworkLatency = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SessionUser {
  token: string;
  usuario: UsuarioEntity;
  perfilEstudiante?: EstudianteEntity;
  perfilDocente?: DocenteEntity;
}

export interface StudentDashboardData {
  estudiante: EstudianteEntity;
  matriculaActiva?: MatriculaEntity;
  asignaturasMatriculadas: MatriculaDetalleEntity[];
  totalCreditosMatriculados: number;
  promedioAcumulado: number;
  porcentajeCarrera: number;
}

export interface TeacherGroupData {
  grupo: GrupoEntity;
  estudiantesMatriculadosCount: number;
}

export interface TeacherRosterItem {
  matriculaDetalleId: string;
  estudianteId: string;
  codigoEstudiantil: string;
  nombreCompleto: string;
  documento: string;
  corte1: number | null;
  corte2: number | null;
  corte3: number | null;
  notaDefinitiva: number | null;
}

// ----------------------------------------------------
// 1. Servicio de Autenticación y Sesión (RF-01, RF-02)
// ----------------------------------------------------
export const authService = {
  async login(emailOrRole: string): Promise<{ success: boolean; session?: SessionUser; error?: string }> {
    await simulateNetworkLatency(200);

    const usuarios = db.getUsuarios();
    // Búsqueda por email o por coincidencia de rol
    let user = usuarios.find((u) => u.email.toLowerCase() === emailOrRole.toLowerCase());
    if (!user) {
      user = usuarios.find((u) => u.rolNombre.toLowerCase() === emailOrRole.toLowerCase());
    }

    if (!user) {
      return { success: false, error: 'Credenciales inválidas o usuario no registrado.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Esta cuenta de usuario se encuentra suspendida o inactiva.' };
    }

    let perfilEstudiante: EstudianteEntity | undefined;
    let perfilDocente: DocenteEntity | undefined;

    if (user.rolNombre === 'ESTUDIANTE') {
      perfilEstudiante = db.getEstudianteByUsuarioId(user.id);
    } else if (user.rolNombre === 'DOCENTE') {
      perfilDocente = db.getDocenteByUsuarioId(user.id);
    }

    const session: SessionUser = {
      token: `sga-jwt-${btoa(user.id)}-${Date.now()}`,
      usuario: user,
      perfilEstudiante,
      perfilDocente,
    };

    // Auditoría inmutable de inicio de sesión (RF-12)
    db.registrarAuditoria({
      usuarioId: user.id,
      usuarioNombre: user.nombreCompleto,
      usuarioEmail: user.email,
      ipOrigen: '192.168.1.100 (Cliente Web)',
      modulo: 'AUTENTICACION',
      accion: 'INICIO_SESION_EXITOSO',
      entidadAfectada: 'sga_usuario',
      registroAfectadoId: user.id,
      datosAnteriores: null,
      datosNuevos: { rol: user.rolNombre, tokenEmitted: true },
    });

    return { success: true, session };
  },

  async logout(user: UsuarioEntity): Promise<void> {
    await simulateNetworkLatency(100);
    db.registrarAuditoria({
      usuarioId: user.id,
      usuarioNombre: user.nombreCompleto,
      usuarioEmail: user.email,
      ipOrigen: '192.168.1.100',
      modulo: 'AUTENTICACION',
      accion: 'CIERRE_SESION',
      entidadAfectada: 'sga_usuario',
      registroAfectadoId: user.id,
      datosAnteriores: null,
      datosNuevos: { status: 'SESSION_TERMINATED' },
    });
  },
};

// ----------------------------------------------------
// 2. Servicio de Estudiantes (RF-07, RF-09)
// ----------------------------------------------------
export const studentService = {
  async getDashboard(usuarioId: string): Promise<StudentDashboardData | null> {
    await simulateNetworkLatency(150);
    const est = db.getEstudianteByUsuarioId(usuarioId);
    if (!est) return null;

    const matricula = db.getMatriculaEstudiante(est.id);
    const asignaturas = matricula ? matricula.detalles.filter((d) => d.estado === 'ASENTADA') : [];
    const totalCreditosMatriculados = asignaturas.reduce((acc, a) => acc + a.creditos, 0);

    const porcentajeCarrera = Math.round((est.creditosAprobados / est.totalCreditos) * 100);

    return {
      estudiante: est,
      matriculaActiva: matricula,
      asignaturasMatriculadas: asignaturas,
      totalCreditosMatriculados,
      promedioAcumulado: est.promedioAcumulado,
      porcentajeCarrera,
    };
  },

  async getAvailableGroups(estudianteId: string, periodoId = 'per-2026-1'): Promise<{ gruposDisponibles: GrupoEntity[]; yaMatriculadosCodigos: string[] }> {
    await simulateNetworkLatency(180);
    const matricula = db.getMatriculaEstudiante(estudianteId, periodoId);
    const yaMatriculadosCodigos = matricula ? matricula.detalles.map((d) => d.asignaturaCodigo) : [];

    const todosGrupos = db.getGrupos(periodoId);
    return {
      gruposDisponibles: todosGrupos,
      yaMatriculadosCodigos,
    };
  },

  async enrollCourses(
    usuario: UsuarioEntity,
    estudianteId: string,
    periodoId: string,
    gruposIds: string[]
  ): Promise<{ success: boolean; matricula?: MatriculaEntity; error?: string }> {
    await simulateNetworkLatency(350); // Simula tiempo de transacción ACID de base de datos

    if (gruposIds.length === 0) {
      return { success: false, error: 'Debe seleccionar al menos una asignatura para matricular.' };
    }

    const resultado = db.transaccionMatricular(estudianteId, periodoId, gruposIds);
    if (!resultado.success) {
      return resultado;
    }

    // Auditoría inmutable de matrícula (RF-12)
    db.registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioEmail: usuario.email,
      ipOrigen: '192.168.1.100',
      modulo: 'MATRICULAS',
      accion: 'ASENTAMIENTO_MATRICULA_ACID',
      entidadAfectada: 'sga_matricula',
      registroAfectadoId: resultado.matricula!.id,
      datosAnteriores: null,
      datosNuevos: {
        comprobante: resultado.matricula!.codigoComprobante,
        totalCreditos: resultado.matricula!.totalCreditos,
        gruposInscritos: gruposIds,
      },
    });

    return resultado;
  },

  async cancelSubject(
    usuario: UsuarioEntity,
    matriculaId: string,
    detalleId: string,
    cursoNombre: string
  ): Promise<{ success: boolean; error?: string }> {
    await simulateNetworkLatency(200);

    const resultado = db.transaccionCancelarMateria(matriculaId, detalleId);
    if (resultado.success) {
      db.registrarAuditoria({
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombreCompleto,
        usuarioEmail: usuario.email,
        ipOrigen: '192.168.1.100',
        modulo: 'MATRICULAS',
        accion: 'CANCELACION_ASIGNATURA',
        entidadAfectada: 'sga_matricula_detalle',
        registroAfectadoId: detalleId,
        datosAnteriores: { estado: 'ASENTADA' },
        datosNuevos: { estado: 'CANCELADA', cupoLiberado: true, asignatura: cursoNombre },
        justificacion: 'Cancelación voluntaria solicitada por el estudiante en periodo hábil',
      });
    }

    return resultado;
  },
};

// ----------------------------------------------------
// 3. Servicio de Docentes (RF-08)
// ----------------------------------------------------
export const teacherService = {
  async getTeacherDashboard(usuarioId: string): Promise<{ docente: DocenteEntity; grupos: TeacherGroupData[] } | null> {
    await simulateNetworkLatency(150);
    const doc = db.getDocenteByUsuarioId(usuarioId);
    if (!doc) return null;

    const grupos = db.getGruposDocente(doc.id);
    const gruposData: TeacherGroupData[] = grupos.map((g) => {
      const matriculados = db.getEstudiantesMatriculadosEnGrupo(g.id);
      return {
        grupo: g,
        estudiantesMatriculadosCount: matriculados.length,
      };
    });

    return { docente: doc, grupos: gruposData };
  },

  async getGroupRoster(grupoId: string): Promise<TeacherRosterItem[]> {
    await simulateNetworkLatency(150);
    const list = db.getEstudiantesMatriculadosEnGrupo(grupoId);

    return list.map((item) => ({
      matriculaDetalleId: item.matriculaDetalle.id,
      estudianteId: item.estudiante.id,
      codigoEstudiantil: item.estudiante.codigoEstudiantil,
      nombreCompleto: `${item.estudiante.nombres} ${item.estudiante.apellidos}`,
      documento: item.estudiante.documentoIdentidad,
      corte1: item.matriculaDetalle.corte1,
      corte2: item.matriculaDetalle.corte2,
      corte3: item.matriculaDetalle.corte3,
      notaDefinitiva: item.matriculaDetalle.notaDefinitiva,
    }));
  },

  async saveGrades(
    usuario: UsuarioEntity,
    grupoNombre: string,
    calificaciones: { matriculaDetalleId: string; estudianteNombre: string; corte1: number | null; corte2: number | null; corte3: number | null }[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    await simulateNetworkLatency(300);

    // Validación de rangos numéricos: 0.00 a 5.00 (RNF-07)
    for (const item of calificaciones) {
      if (item.corte1 !== null && (item.corte1 < 0 || item.corte1 > 5.0)) {
        return { success: false, count: 0, error: `La nota del Corte 1 de ${item.estudianteNombre} debe estar entre 0.0 y 5.0` };
      }
      if (item.corte2 !== null && (item.corte2 < 0 || item.corte2 > 5.0)) {
        return { success: false, count: 0, error: `La nota del Corte 2 de ${item.estudianteNombre} debe estar entre 0.0 y 5.0` };
      }
      if (item.corte3 !== null && (item.corte3 < 0 || item.corte3 > 5.0)) {
        return { success: false, count: 0, error: `La nota del Examen Final de ${item.estudianteNombre} debe estar entre 0.0 y 5.0` };
      }
    }

    let actualizados = 0;
    for (const item of calificaciones) {
      const res = db.guardarCalificacion(item.matriculaDetalleId, item.corte1, item.corte2, item.corte3);
      if (res.success) {
        actualizados++;
      }
    }

    // Auditoría formal inmutable de guardado de notas (RF-08, RF-12)
    db.registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioEmail: usuario.email,
      ipOrigen: '192.168.1.100',
      modulo: 'CALIFICACIONES',
      accion: 'REGISTRO_PLANILLA_NOTAS',
      entidadAfectada: 'sga_calificacion',
      registroAfectadoId: `grupo-${grupoNombre}`,
      datosAnteriores: null,
      datosNuevos: { grupo: grupoNombre, estudiantesActualizados: actualizados },
      justificacion: 'Consolidación de acta de calificaciones por el docente titular en plataforma',
    });

    return { success: true, count: actualizados };
  },
};

// ----------------------------------------------------
// 4. Servicio de Coordinación & Administración (RF-03, RF-04, RF-05, RF-06)
// ----------------------------------------------------
export const adminService = {
  async getAcademicCatalog(): Promise<{ asignaturas: AsignaturaEntity[]; grupos: GrupoEntity[]; docentes: DocenteEntity[] }> {
    await simulateNetworkLatency(150);
    const snap = db.getSnapshot();
    return {
      asignaturas: snap.asignaturas,
      grupos: snap.grupos,
      docentes: snap.docentes,
    };
  },

  async createSubject(
    usuario: UsuarioEntity,
    datos: { codigo: string; nombre: string; creditos: number; semestreNivel: number; prerrequisitosTexto: string }
  ): Promise<{ success: boolean; asignatura?: AsignaturaEntity; error?: string }> {
    await simulateNetworkLatency(200);

    const existentes = db.getAsignaturas();
    if (existentes.some((a) => a.codigo.toUpperCase() === datos.codigo.toUpperCase())) {
      return { success: false, error: `El código de asignatura ${datos.codigo} ya se encuentra registrado.` };
    }

    if (datos.creditos <= 0 || datos.creditos > 10) {
      return { success: false, error: 'Los créditos deben ser un número entre 1 y 10.' };
    }

    const prerreqs = datos.prerrequisitosTexto
      ? datos.prerrequisitosTexto.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const nueva = db.agregarAsignatura({
      codigo: datos.codigo.toUpperCase(),
      nombre: datos.nombre,
      creditos: Number(datos.creditos),
      semestreNivel: Number(datos.semestreNivel),
      programaId: 'prog-sis',
      prerrequisitos: prerreqs,
    });

    db.registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioEmail: usuario.email,
      ipOrigen: '192.168.1.100',
      modulo: 'ACADEMICO',
      accion: 'CREACION_ASIGNATURA',
      entidadAfectada: 'sga_asignatura',
      registroAfectadoId: nueva.id,
      datosAnteriores: null,
      datosNuevos: { codigo: nueva.codigo, nombre: nueva.nombre, creditos: nueva.creditos },
    });

    return { success: true, asignatura: nueva };
  },

  async createGroup(
    usuario: UsuarioEntity,
    datos: { asignaturaId: string; docenteId: string; numeroGrupo: string; cupoMaximo: number; diasHorario: string; aulaOEnlace: string }
  ): Promise<{ success: boolean; grupo?: GrupoEntity; error?: string }> {
    await simulateNetworkLatency(250);

    const asignaturas = db.getAsignaturas();
    const asig = asignaturas.find((a) => a.id === datos.asignaturaId);
    if (!asig) return { success: false, error: 'Asignatura no encontrada.' };

    const snap = db.getSnapshot();
    const docente = snap.docentes.find((d) => d.id === datos.docenteId);
    if (!docente) return { success: false, error: 'Docente no encontrado.' };

    if (datos.cupoMaximo <= 0 || datos.cupoMaximo > 100) {
      return { success: false, error: 'El cupo debe ser un valor entre 1 y 100.' };
    }

    // Validación de Cruce de Horario para Docente y Aula (RF-06, RNF-07)
    const existingGroups = db.getGrupos('per-2026-1');
    const conflict = checkTeacherAndRoomConflicts(
      docente.id,
      datos.diasHorario,
      datos.aulaOEnlace,
      existingGroups
    );

    if (conflict.hasConflict) {
      if (conflict.docenteConflict) {
        return {
          success: false,
          error: `Cruce de horario para el Docente: ${conflict.docenteConflict.reason}`,
        };
      }
      if (conflict.aulaConflict) {
        return {
          success: false,
          error: `Cruce de disponibilidad de Aula: ${conflict.aulaConflict.reason}`,
        };
      }
    }

    const nuevo = db.agregarGrupo({
      asignaturaId: asig.id,
      asignaturaCodigo: asig.codigo,
      asignaturaNombre: asig.nombre,
      creditos: asig.creditos,
      periodoId: 'per-2026-1',
      docenteId: docente.id,
      docenteNombre: `${docente.nombres} ${docente.apellidos}`,
      numeroGrupo: datos.numeroGrupo.toUpperCase(),
      cupoMaximo: Number(datos.cupoMaximo),
      diasHorario: datos.diasHorario,
      aulaOEnlace: datos.aulaOEnlace,
    });

    db.registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioEmail: usuario.email,
      ipOrigen: '192.168.1.100',
      modulo: 'ACADEMICO',
      accion: 'APERTURA_GRUPO_ACADEMICO',
      entidadAfectada: 'sga_grupo',
      registroAfectadoId: nuevo.id,
      datosAnteriores: null,
      datosNuevos: { grupo: nuevo.numeroGrupo, materia: asig.nombre, cupo: nuevo.cupoMaximo },
    });

    return { success: true, grupo: nuevo };
  },

  async runScheduleAudit(): Promise<ReturnType<typeof performSystemScheduleAudit>> {
    await simulateNetworkLatency(200);
    const grupos = db.getGrupos('per-2026-1');
    return performSystemScheduleAudit(grupos);
  },

  async getUsers(): Promise<UsuarioEntity[]> {
    await simulateNetworkLatency(100);
    return db.getUsuarios();
  },

  async createUser(
    adminUser: UsuarioEntity,
    datos: { nombreCompleto: string; email: string; rolNombre: 'ESTUDIANTE' | 'DOCENTE' | 'COORDINADOR_ACADEMICO' | 'ADMINISTRADOR' }
  ): Promise<{ success: boolean; usuario?: UsuarioEntity; error?: string }> {
    await simulateNetworkLatency(200);

    const usuarios = db.getUsuarios();
    if (usuarios.some((u) => u.email.toLowerCase() === datos.email.toLowerCase())) {
      return { success: false, error: 'El correo electrónico ya se encuentra registrado.' };
    }

    const rolIdMap = {
      ADMINISTRADOR: 'rol-admin',
      COORDINADOR_ACADEMICO: 'rol-coord',
      DOCENTE: 'rol-docente',
      ESTUDIANTE: 'rol-estudiante',
    };

    const nuevo = db.agregarUsuario({
      nombreCompleto: datos.nombreCompleto,
      email: datos.email,
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$defaultPass123',
      rolId: rolIdMap[datos.rolNombre],
      rolNombre: datos.rolNombre,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
    });

    db.registrarAuditoria({
      usuarioId: adminUser.id,
      usuarioNombre: adminUser.nombreCompleto,
      usuarioEmail: adminUser.email,
      ipOrigen: '192.168.1.100',
      modulo: 'USUARIOS',
      accion: 'CREACION_USUARIO',
      entidadAfectada: 'sga_usuario',
      registroAfectadoId: nuevo.id,
      datosAnteriores: null,
      datosNuevos: { email: nuevo.email, rol: nuevo.rolNombre },
    });

    return { success: true, usuario: nuevo };
  },

  async toggleUserStatus(adminUser: UsuarioEntity, targetUserId: string): Promise<boolean> {
    await simulateNetworkLatency(150);
    const targetUser = db.getUsuarios().find((u) => u.id === targetUserId);
    const prevStatus = targetUser ? targetUser.isActive : true;
    const newStatus = db.toggleEstadoUsuario(targetUserId);

    db.registrarAuditoria({
      usuarioId: adminUser.id,
      usuarioNombre: adminUser.nombreCompleto,
      usuarioEmail: adminUser.email,
      ipOrigen: '192.168.1.100',
      modulo: 'USUARIOS',
      accion: newStatus ? 'ACTIVACION_USUARIO' : 'SUSPENSION_USUARIO',
      entidadAfectada: 'sga_usuario',
      registroAfectadoId: targetUserId,
      datosAnteriores: { isActive: prevStatus },
      datosNuevos: { isActive: newStatus },
      justificacion: 'Acción administrativa de control de acceso RBAC',
    });

    return newStatus;
  },
};

// ----------------------------------------------------
// 5. Servicio de Auditoría (RF-12)
// ----------------------------------------------------
export const auditService = {
  async getLogs(moduloFilter?: string): Promise<AuditLogEntity[]> {
    await simulateNetworkLatency(100);
    const logs = db.getAuditLogs();
    if (!moduloFilter || moduloFilter === 'ALL') {
      return logs;
    }
    return logs.filter((l) => l.modulo === moduloFilter);
  },

  async resetData(usuario: UsuarioEntity): Promise<void> {
    await simulateNetworkLatency(200);
    db.resetToDefault();
    db.registrarAuditoria({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioEmail: usuario.email,
      ipOrigen: '192.168.1.100',
      modulo: 'USUARIOS',
      accion: 'REINICIO_BASE_DATOS_SEED',
      entidadAfectada: 'sga_schema',
      registroAfectadoId: 'ALL',
      datosAnteriores: null,
      datosNuevos: { status: 'RESTORED_TO_DEFAULT' },
    });
  },
};
