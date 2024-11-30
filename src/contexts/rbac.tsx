import React from 'react';
import { useUser } from './userContext';

interface RBACProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RBAC: React.FC<RBACProps> = ({ allowedRoles, children }) => {
  const { user } = useUser();

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null;
};
