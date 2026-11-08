/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente ProtectedRoute (RBAC - RF-02, RNF-01, RNF-11)
 * Intercepta y valida los privilegios del usuario antes de cargar cualquier ruta en el árbol DOM.
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { SessionUser } from '../../services/apiService';
import { UnauthorizedView } from '../sga/UnauthorizedView';

interface ProtectedRouteProps {
  session: SessionUser | null;
  rolesPermitidos: string[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  session,
  rolesPermitidos,
  children,
}) => {
  const location = useLocation();

  // 1. Verificación de Autenticación (RF-01, RNF-01)
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verificación de Autorización Basada en Roles (RBAC - RF-02, RNF-11)
  const userRole = session.usuario.rolNombre;
  const isAuthorized = rolesPermitidos.includes(userRole);

  if (!isAuthorized) {
    return <UnauthorizedView rolActual={userRole} rolesRequeridos={rolesPermitidos} />;
  }

  // 3. Renderizado del contenido autorizado
  return children ? <>{children}</> : <Outlet />;
};
