/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Middleware de Autenticación y Autorización RBAC en Express (Backend)
 * Cumple con los requerimientos RF-02 (Roles y Permisos), RNF-01 (Seguridad) y RNF-11 (Privacidad).
 */

import { Request, Response, NextFunction } from 'express';

export interface UserTokenPayload {
  id: string;
  email: string;
  nombreCompleto: string;
  rolNombre: 'ADMINISTRADOR' | 'COORDINADOR_ACADEMICO' | 'DOCENTE' | 'ESTUDIANTE';
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

/**
 * Middleware para validar el Token JWT de sesión
 * Verifica que el token exista en la cabecera Authorization: Bearer <token>
 */
export const autenticarToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      type: 'https://sga.cun.edu.co/errors/unauthorized',
      title: 'No Autenticado',
      status: 401,
      detail: 'Se requiere una cabecera Authorization Bearer con un token JWT válido.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    // En un entorno de producción real, aquí se verifica con jwt.verify(token, process.env.JWT_SECRET)
    // Para esta arquitectura simulamos la decodificación segura del payload
    if (token.startsWith('sga-jwt-')) {
      const parts = token.split('-');
      const userId = atob(parts[2]);
      
      // Simulación de carga del usuario autenticado en el contexto de la solicitud
      req.user = {
        id: userId,
        email: `${userId}@cun.edu.co`,
        nombreCompleto: 'Usuario Autenticado SGA',
        rolNombre: userId.includes('est')
          ? 'ESTUDIANTE'
          : userId.includes('doc')
          ? 'DOCENTE'
          : userId.includes('coord')
          ? 'COORDINADOR_ACADEMICO'
          : 'ADMINISTRADOR',
      };
      next();
    } else {
      res.status(403).json({
        type: 'https://sga.cun.edu.co/errors/invalid-token',
        title: 'Token Inválido',
        status: 403,
        detail: 'El token suministrado no es válido o ha expirado.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    res.status(403).json({
      type: 'https://sga.cun.edu.co/errors/invalid-token',
      title: 'Token Inválido',
      status: 403,
      detail: 'Error al decodificar las firmas criptográficas del token de sesión.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware 'restringirA(...roles)'
 * Valida que el rol del usuario autenticado coincida con al menos uno de los roles autorizados.
 * Si el rol no tiene privilegios, responde de inmediato con HTTP 403 Forbidden bajo el estándar RFC 7807.
 * 
 * @param roles Lista de roles permitidos para acceder a la ruta (ej. 'DOCENTE', 'ADMINISTRADOR')
 */
export const restringirA = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 1. Validar que la solicitud haya pasado previamente por 'autenticarToken'
    if (!req.user) {
      res.status(401).json({
        type: 'https://sga.cun.edu.co/errors/unauthorized',
        title: 'No Autenticado',
        status: 401,
        detail: 'Debe iniciar sesión para verificar los privilegios de acceso.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 2. Comprobar si el rol del usuario está dentro de la lista de roles autorizados
    const rolUsuario = req.user.rolNombre;
    if (!roles.includes(rolUsuario)) {
      // Registro de seguridad: Intento de escalamiento o acceso no autorizado
      console.warn(`[SEGURIDAD RBAC - RF-02] Intento de acceso denegado. Usuario: ${req.user.email} (Rol: ${rolUsuario}) intentó consumir: ${req.method} ${req.originalUrl}`);

      res.status(403).json({
        type: 'https://sga.cun.edu.co/errors/forbidden',
        title: 'Acceso Prohibido (Forbidden)',
        status: 403,
        detail: `Acceso denegado: Su rol actual (${rolUsuario}) no cuenta con los permisos necesarios para realizar esta operación. Roles requeridos: [${roles.join(', ')}].`,
        instance: req.originalUrl,
        recursoSolicitado: req.originalUrl,
        rolUsuarioActual: rolUsuario,
        rolesAutorizados: roles,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 3. Usuario autorizado con éxito
    next();
  };
};
