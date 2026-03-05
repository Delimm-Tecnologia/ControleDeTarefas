import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export const notificationService = {
    async getAll(userId: string, isSupervisor: boolean): Promise<Notification[]> {
        if (!userId) return [];

        let query = supabase
            .from('notificacao')
            .select('*')
            .order('created_at', { ascending: false });

        // Se não for supervisor, traz apenas as suas notificações
        if (!isSupervisor) {
            query = query.eq('id_usuario', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((n: any) => ({
            id: n.id,
            title: n.titulo,
            message: n.mensagem,
            time: new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isRead: n.lida,
            type: n.tipo as any,
        }));
    },

    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('notificacao')
            .update({ lida: true })
            .eq('id', id);

        if (error) throw error;
    },

    async markAllAsRead(userId: string): Promise<void> {
        if (!userId) return;

        const { error } = await supabase
            .from('notificacao')
            .update({ lida: true })
            .eq('id_usuario', userId)
            .eq('lida', false);

        if (error) throw error;
    },

    async create(notification: Omit<Notification, 'id' | 'isRead' | 'time'> & { userId: string }): Promise<void> {
        const { error } = await supabase
            .from('notificacao')
            .insert({
                id_usuario: notification.userId,
                titulo: notification.title,
                mensagem: notification.message,
                tipo: notification.type,
                lida: false,
            });

        if (error) {
            console.error('Erro ao criar notificação:', error);
        }
    }
};
