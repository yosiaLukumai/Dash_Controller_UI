import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useUser } from './../contexts/userContext';

interface ProtectedRouteProps {
  requiredRole: string;
  fallback: string;
  element: React.ReactNode;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, fallback, element, path }) => {
  const { user } = useUser();

  if (!user || user.role !== requiredRole) {
    return <Navigate to={`/${fallback}`} />;
  }

  return <Route path={path} element={element} />;
};
