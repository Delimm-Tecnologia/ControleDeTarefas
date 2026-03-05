// ============================================================
// CONTEXTO DE AUTENTICAÇÃO — src/context/AuthContext.tsx
// ============================================================
// Centraliza o usuário logado em toda a aplicação.
// Use o hook useAuth() para acessar em qualquer componente.
// ============================================================

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Tenta restaurar o usuário salvo no localStorage ao iniciar
    const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const { user } = await authService.login(credentials);
            setUser(user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const updateCurrentUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('delimm-user', JSON.stringify(updatedUser));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
    }
    return context;
}
