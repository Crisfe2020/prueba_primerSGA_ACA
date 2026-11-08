/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo de Franjas Horarias y Motor de Detección de Cruces (SGA - RF-06, RF-07, RNF-07)
 * Provee parsing robusto de horarios, cálculo de intersección de intervalos de tiempo,
 * y validación en tiempo real de colisiones para docentes, aulas y estudiantes.
 */

import { GrupoEntity } from './dataStore';

export interface FranjaHorariaDef {
  id: string;
  nombre: string;
  horaInicio: string; // "08:00"
  horaFin: string;    // "10:00"
  startMin: number;   // 480
  endMin: number;     // 600
  turno: 'MAÑANA' | 'TARDE' | 'NOCHE';
}

export const FRANJAS_HORARIAS_PREDEFINIDAS: FranjaHorariaDef[] = [
  { id: 'f-07-09', nombre: '07:00 - 09:00 (Matutina 1)', horaInicio: '07:00', horaFin: '09:00', startMin: 420, endMin: 540, turno: 'MAÑANA' },
  { id: 'f-08-10', nombre: '08:00 - 10:00 (Matutina 2)', horaInicio: '08:00', horaFin: '10:00', startMin: 480, endMin: 600, turno: 'MAÑANA' },
  { id: 'f-10-12', nombre: '10:00 - 12:00 (Mediodía)', horaInicio: '10:00', horaFin: '12:00', startMin: 600, endMin: 720, turno: 'MAÑANA' },
  { id: 'f-12-14', nombre: '12:00 - 14:00 (Intermedia)', horaInicio: '12:00', horaFin: '14:00', startMin: 720, endMin: 840, turno: 'TARDE' },
  { id: 'f-14-16', nombre: '14:00 - 16:00 (Vespertina 1)', horaInicio: '14:00', horaFin: '16:00', startMin: 840, endMin: 960, turno: 'TARDE' },
  { id: 'f-16-18', nombre: '16:00 - 18:00 (Vespertina 2)', horaInicio: '16:00', horaFin: '18:00', startMin: 960, endMin: 1080, turno: 'TARDE' },
  { id: 'f-18-20', nombre: '18:00 - 20:00 (Nocturna 1)', horaInicio: '18:00', horaFin: '20:00', startMin: 1080, endMin: 1200, turno: 'NOCHE' },
  { id: 'f-20-22', nombre: '20:00 - 22:00 (Nocturna 2)', horaInicio: '20:00', horaFin: '22:00', startMin: 1200, endMin: 1320, turno: 'NOCHE' },
];

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];

export interface ScheduleInterval {
  dia: DiaSemana;
  horaInicio: string; // "08:00"
  horaFin: string;    // "10:00"
  startMin: number;   // 480
  endMin: number;     // 600
}

/**
 * Normaliza nombres de días eliminando tildes y mayúsculas
 */
export function normalizeDay(dia: string): string {
  return dia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Convierte formato HH:MM a minutos desde medianoche
 */
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

/**
 * Parsea cadenas como:
 * - "Lunes y Miércoles 08:00 - 10:00"
 * - "Martes y Jueves 10:00 - 12:00"
 * - "Viernes 07:00 - 11:00"
 * - "Sábado 08:00 - 12:00"
 */
export function parseSchedule(diasHorarioStr: string): ScheduleInterval[] {
  if (!diasHorarioStr || typeof diasHorarioStr !== 'string') return [];

  // Extraer las horas "HH:MM - HH:MM"
  const timeMatch = diasHorarioStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!timeMatch) return [];

  const horaInicio = timeMatch[1].padStart(5, '0');
  const horaFin = timeMatch[2].padStart(5, '0');
  const startMin = timeStringToMinutes(horaInicio);
  const endMin = timeStringToMinutes(horaFin);

  // Extraer los días
  const daysPart = diasHorarioStr.substring(0, timeMatch.index).trim();
  const intervals: ScheduleInterval[] = [];

  for (const standardDay of DIAS_SEMANA) {
    const normStandard = normalizeDay(standardDay);
    const normDaysPart = normalizeDay(daysPart);

    if (normDaysPart.includes(normStandard) || normDaysPart.includes(normStandard.substring(0, 3))) {
      intervals.push({
        dia: standardDay,
        horaInicio,
        horaFin,
        startMin,
        endMin,
      });
    }
  }

  return intervals;
}

/**
 * Evalúa si dos conjuntos de intervalos colisionan en tiempo y día
 * [S1, E1) intersecta con [S2, E2) ssi S1 < E2 && S2 < E1
 */
export function checkCollisionBetweenSchedules(
  scheduleStrA: string,
  scheduleStrB: string
): { hasCollision: boolean; reason?: string; conflictingDay?: DiaSemana; overlappingHours?: string } {
  const intervalsA = parseSchedule(scheduleStrA);
  const intervalsB = parseSchedule(scheduleStrB);

  for (const a of intervalsA) {
    for (const b of intervalsB) {
      if (a.dia === b.dia) {
        // Validación de traslape matemático de intervalos
        if (a.startMin < b.endMin && b.startMin < a.endMin) {
          const overlapStart = Math.max(a.startMin, b.startMin);
          const overlapEnd = Math.min(a.endMin, b.endMin);
          const startHours = Math.floor(overlapStart / 60).toString().padStart(2, '0');
          const startMins = (overlapStart % 60).toString().padStart(2, '0');
          const endHours = Math.floor(overlapEnd / 60).toString().padStart(2, '0');
          const endMins = (overlapEnd % 60).toString().padStart(2, '0');
          const overlapStr = `${startHours}:${startMins} - ${endHours}:${endMins}`;

          return {
            hasCollision: true,
            conflictingDay: a.dia,
            overlappingHours: overlapStr,
            reason: `Cruce detectado el ${a.dia} entre las ${overlapStr} (Intervalos: ${a.horaInicio}-${a.horaFin} y ${b.horaInicio}-${b.horaFin}).`,
          };
        }
      }
    }
  }

  return { hasCollision: false };
}

/**
 * Verifica si un docente o un aula ya tienen una clase asignada en el horario propuesto
 */
export function checkTeacherAndRoomConflicts(
  docenteId: string,
  nuevoHorarioStr: string,
  aulaOEnlace: string,
  allGroups: GrupoEntity[],
  excludeGroupId?: string
): {
  hasConflict: boolean;
  type?: 'DOCENTE' | 'AULA' | 'AMBOS';
  docenteConflict?: { grupo: GrupoEntity; reason: string };
  aulaConflict?: { grupo: GrupoEntity; reason: string };
} {
  let docConflict: { grupo: GrupoEntity; reason: string } | undefined;
  let roomConflict: { grupo: GrupoEntity; reason: string } | undefined;

  for (const g of allGroups) {
    if (excludeGroupId && g.id === excludeGroupId) continue;

    const collision = checkCollisionBetweenSchedules(nuevoHorarioStr, g.diasHorario);
    if (!collision.hasCollision) continue;

    // Verificar si es el mismo docente
    if (g.docenteId === docenteId && !docConflict) {
      docConflict = {
        grupo: g,
        reason: `El docente ya tiene asignado el grupo ${g.numeroGrupo} de ${g.asignaturaNombre} (${g.diasHorario}) en ${g.aulaOEnlace}.`,
      };
    }

    // Verificar si es la misma aula (ignora clases virtuales sincrónicas como Meet/Teams)
    const isVirtual = /meet|teams|zoom|virtual|online/i.test(aulaOEnlace);
    const gIsVirtual = /meet|teams|zoom|virtual|online/i.test(g.aulaOEnlace);

    if (!isVirtual && !gIsVirtual && g.aulaOEnlace.trim().toLowerCase() === aulaOEnlace.trim().toLowerCase() && !roomConflict) {
      roomConflict = {
        grupo: g,
        reason: `El aula "${aulaOEnlace}" ya está ocupada por ${g.asignaturaNombre} (${g.numeroGrupo}) en el horario ${g.diasHorario}.`,
      };
    }
  }

  if (docConflict && roomConflict) {
    return { hasConflict: true, type: 'AMBOS', docenteConflict: docConflict, aulaConflict: roomConflict };
  }
  if (docConflict) {
    return { hasConflict: true, type: 'DOCENTE', docenteConflict: docConflict };
  }
  if (roomConflict) {
    return { hasConflict: true, type: 'AULA', aulaConflict: roomConflict };
  }

  return { hasConflict: false };
}

/**
 * Revisa si un grupo candidato tiene cruce de horario con:
 * 1. Materias ya matriculadas del estudiante.
 * 2. Otras materias seleccionadas actualmente en el carrito de matrícula.
 */
export function checkStudentEnrollmentConflict(
  candidateGroup: GrupoEntity,
  alreadyEnrolledGroups: { asignaturaCodigo: string; asignaturaNombre: string; diasHorario: string }[],
  otherSelectedGroups: GrupoEntity[]
): {
  hasConflict: boolean;
  conflictSource?: 'ENROLLED' | 'SELECTED';
  conflictingSubject?: string;
  reason?: string;
} {
  // 1. Validar contra materias ya matriculadas
  for (const enrolled of alreadyEnrolledGroups) {
    const col = checkCollisionBetweenSchedules(candidateGroup.diasHorario, enrolled.diasHorario);
    if (col.hasCollision) {
      return {
        hasConflict: true,
        conflictSource: 'ENROLLED',
        conflictingSubject: `${enrolled.asignaturaCodigo} - ${enrolled.asignaturaNombre}`,
        reason: `Cruce con materia ya inscrita "${enrolled.asignaturaNombre}" los ${col.conflictingDay} (${col.overlappingHours}).`,
      };
    }
  }

  // 2. Validar contra otras materias seleccionadas en la sesión actual
  for (const selected of otherSelectedGroups) {
    if (selected.id === candidateGroup.id) continue;
    const col = checkCollisionBetweenSchedules(candidateGroup.diasHorario, selected.diasHorario);
    if (col.hasCollision) {
      return {
        hasConflict: true,
        conflictSource: 'SELECTED',
        conflictingSubject: `${selected.asignaturaCodigo} - ${selected.asignaturaNombre}`,
        reason: `Cruce con "${selected.asignaturaNombre}" los ${col.conflictingDay} (${col.overlappingHours}).`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Auditoría Global del Sistema: revisa todos los grupos de un periodo
 * buscando cualquier traslape existente entre profesores o aulas.
 */
export function performSystemScheduleAudit(allGroups: GrupoEntity[]) {
  const teacherCollisions: { docenteNombre: string; grupo1: GrupoEntity; grupo2: GrupoEntity; detalle: string }[] = [];
  const roomCollisions: { aula: string; grupo1: GrupoEntity; grupo2: GrupoEntity; detalle: string }[] = [];

  for (let i = 0; i < allGroups.length; i++) {
    for (let j = i + 1; j < allGroups.length; j++) {
      const g1 = allGroups[i];
      const g2 = allGroups[j];

      const col = checkCollisionBetweenSchedules(g1.diasHorario, g2.diasHorario);
      if (!col.hasCollision) continue;

      // Colisión docente
      if (g1.docenteId === g2.docenteId) {
        teacherCollisions.push({
          docenteNombre: g1.docenteNombre,
          grupo1: g1,
          grupo2: g2,
          detalle: `${g1.asignaturaCodigo} (${g1.numeroGrupo}) vs ${g2.asignaturaCodigo} (${g2.numeroGrupo}) los ${col.conflictingDay} (${col.overlappingHours})`,
        });
      }

      // Colisión aula
      const isVirtual1 = /meet|teams|zoom|virtual|online/i.test(g1.aulaOEnlace);
      const isVirtual2 = /meet|teams|zoom|virtual|online/i.test(g2.aulaOEnlace);
      if (!isVirtual1 && !isVirtual2 && g1.aulaOEnlace.trim().toLowerCase() === g2.aulaOEnlace.trim().toLowerCase()) {
        roomCollisions.push({
          aula: g1.aulaOEnlace,
          grupo1: g1,
          grupo2: g2,
          detalle: `${g1.asignaturaNombre} vs ${g2.asignaturaNombre} en ${g1.aulaOEnlace} los ${col.conflictingDay} (${col.overlappingHours})`,
        });
      }
    }
  }

  return {
    totalGruposAuditados: allGroups.length,
    teacherCollisions,
    roomCollisions,
    isClean: teacherCollisions.length === 0 && roomCollisions.length === 0,
  };
}
