import { useUser } from '../contexts/userContext';

export const usePermissions = () => {
    const { user } = useUser();

    const hasPermission = (permission: string) => {
        return user?.permissions.includes(permission) || false;
    };

    const hasRole = (role: string) => {
        return user?.role === role;
    };

    return { hasPermission, hasRole };
};
