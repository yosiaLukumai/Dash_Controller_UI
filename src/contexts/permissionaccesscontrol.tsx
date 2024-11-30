import React from 'react';
import { useUser } from './userContext';

interface PermissionProps {
    requiredPermission: string;
    children: React.ReactNode;
}

export const Permission: React.FC<PermissionProps> = ({ requiredPermission, children }) => {
    const { user } = useUser();

    if (user && user.permissions.includes(requiredPermission)) {
        return <>{children}</>;
    }

    return null;
};