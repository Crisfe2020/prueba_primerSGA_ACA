/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Definición de Rutas API Express Protegidas por RBAC (Backend)
 * Ejemplos de aplicación del middleware restringirA() en los módulos de Notas, Usuarios, Auditoría y Matrícula.
 */

import { Router, Response } from 'express';
import { autenticarToken, restringirA, AuthenticatedRequest } from './authMiddleware';

export const apiRouter = Router();

// ============================================================================
// 1. MÓDULO DE CALIFICACIONES (RF-08)
// Solo los DOCENTES titulares y COORDINADORES pueden asentar notas.
// Un Estudiante que invoque este endpoint recibirá HTTP 403 Forbidden.
// ============================================================================
apiRouter.post(
  '/api/v1/grades',
  autenticarToken,
  restringirA('DOCENTE', 'COORDINADOR_ACADEMICO'),
  (req: AuthenticatedRequest, res: Response) => {
    const { grupoId, calificaciones, justificacion } = req.body;

    // Validación de negocio en backend
    if (!grupoId || !calificaciones) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios de calificación.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Calificaciones asentadas exitosamente en la base de datos.',
      docenteResponsable: req.user?.email,
      registrosActualizados: calificaciones.length,
      timestamp: new Date().toISOString(),
    });
  }
);

// ============================================================================
// 2. MÓDULO DE USUARIOS Y ROLES (RF-02, RF-03, RF-04)
// Exclusivo para ADMINISTRADORES. Bloquea a Docentes, Coordinadores y Estudiantes.
// ============================================================================
apiRouter.get(
  '/api/v1/users',
  autenticarToken,
  restringirA('ADMINISTRADOR'),
  (req: AuthenticatedRequest, res: Response) => {
    return res.status(200).json({
      status: 'success',
      total: 4,
      usuarios: [
        { id: 'usr-01', email: 'sofia.morales@cun.edu.co', rol: 'ESTUDIANTE', isActive: true },
        { id: 'usr-02', email: 'carlos.mendivelso@cun.edu.co', rol: 'DOCENTE', isActive: true },
        { id: 'usr-03', email: 'andres.valenzuela@cun.edu.co', rol: 'COORDINADOR_ACADEMICO', isActive: true },
        { id: 'usr-04', email: 'elena.rojas@cun.edu.co', rol: 'ADMINISTRADOR', isActive: true },
      ],
      consultadoPor: req.user?.email,
    });
  }
);

apiRouter.patch(
  '/api/v1/users/:id/status',
  autenticarToken,
  restringirA('ADMINISTRADOR'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    return res.status(200).json({
      status: 'success',
      message: `Estado del usuario ${id} modificado a ${isActive ? 'ACTIVO' : 'SUSPENDIDO'}.`,
      auditadoPor: req.user?.email,
    });
  }
);

// ============================================================================
// 3. MÓDULO DE AUDITORÍA DEL SISTEMA (RF-12, RNF-10)
// Solo accesible por ADMINISTRADORES y personal de AUDITORÍA / COORDINACIÓN.
// ============================================================================
apiRouter.get(
  '/api/v1/audit-logs',
  autenticarToken,
  restringirA('ADMINISTRADOR', 'COORDINADOR_ACADEMICO'),
  (req: AuthenticatedRequest, res: Response) => {
    const { modulo } = req.query;

    return res.status(200).json({
      status: 'success',
      moduloFiltrado: modulo || 'TODOS',
      pistaInmutable: [
        {
          id: 104,
          modulo: 'CALIFICACIONES',
          accion: 'REGISTRO_PLANILLA_NOTAS',
          usuario: 'carlos.mendivelso@cun.edu.co',
          ip: '190.158.42.11',
          fechaUtc: new Date().toISOString(),
        },
      ],
      generadoPara: req.user?.email,
    });
  }
);

// ============================================================================
// 4. MÓDULO DE MATRÍCULA ACADÉMICA (RF-07, UC-05)
// Solo accesible por ESTUDIANTES autenticados.
// ============================================================================
apiRouter.post(
  '/api/v1/enrollments',
  autenticarToken,
  restringirA('ESTUDIANTE'),
  (req: AuthenticatedRequest, res: Response) => {
    const { periodoId, gruposIds } = req.body;

    return res.status(201).json({
      status: 'success',
      comprobante: `MAT-2026-1-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      estudianteId: req.user?.id,
      gruposMatriculados: gruposIds,
      fechaTransaccion: new Date().toISOString(),
    });
  }
);
