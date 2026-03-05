import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isSupervisor = user?.role === 'supervisor';

    const refresh = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await notificationService.getAll(user.id, isSupervisor);
            setNotifications(data);
        } catch (err) {
            console.error('Erro ao buscar notificações:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isSupervisor]);

    useEffect(() => {
        if (!user?.id) return;

        refresh();

        // ─── Realtime: Assinar mudanças para notificações em tempo real ───
        const channelConfig: any = { event: '*', schema: 'public', table: 'notificacao' };

        // Se não for supervisor, escuta APENAS as notificações dele
        if (!isSupervisor) {
            channelConfig.filter = `id_usuario=eq.${user.id}`;
        }

        const channel = supabase
            .channel(`notificacao_${user.id}`)
            .on('postgres_changes', channelConfig, () => refresh())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refresh, user?.id, isSupervisor]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        await notificationService.markAsRead(id);
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        await notificationService.markAllAsRead(user.id);
    }, [user?.id]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, refresh };
}

