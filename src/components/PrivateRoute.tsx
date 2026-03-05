// ============================================================
// PROTEÇÃO DE ROTAS — src/components/PrivateRoute.tsx
// ============================================================
// Redireciona para /login se o usuário não estiver autenticado.
// Use como wrapper de rotas protegidas no App.tsx.
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    supervisorOnly?: boolean;
}

export default function PrivateRoute({ supervisorOnly = false }: PrivateRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (supervisorOnly && user?.role !== 'supervisor') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
