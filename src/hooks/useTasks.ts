// ============================================================
// HOOK DE TAREFAS — src/hooks/useTasks.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { taskService } from '../services/taskService';

export function useTasks(userId?: string) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = userId
                ? await taskService.getByUser(userId)
                : await taskService.getAll();
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const toggleStatus = useCallback(
        async (id: string) => {
            const task = tasks.find((t) => t.id === id);
            if (!task) return;
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';

            // Atualização otimista — UI muda imediatamente
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
            );

            try {
                await taskService.updateStatus(id, newStatus);
            } catch {
                // Reverte se der erro na API
                setTasks((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, status: task.status } : t))
                );
            }
        },
        [tasks]
    );

    const deleteTask = useCallback(async (id: string) => {
        try {
            await taskService.delete(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            throw err;
        }
    }, []);

    return { tasks, isLoading, error, refetch: fetchTasks, toggleStatus, deleteTask };
}
