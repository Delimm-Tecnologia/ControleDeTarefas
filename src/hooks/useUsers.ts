// ============================================================
// HOOK DE USUÁRIOS — src/hooks/useUsers.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const deleteUser = useCallback(
        async (id: string) => {
            // Otimista: remove da UI imediatamente
            setUsers((prev) => prev.filter((u) => u.id !== id));
            try {
                await userService.delete(id);
            } catch (err) {
                // Reverte se der erro
                fetchUsers();
                throw err;
            }
        },
        [fetchUsers]
    );

    return { users, isLoading, error, refetch: fetchUsers, deleteUser };
}
