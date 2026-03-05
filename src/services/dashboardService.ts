import { supabase } from '../lib/supabase';

export interface DashboardStats {
    totalTasks: number;
    pendingToday: number;
    overdue: number;
    completedPercent: number;
    completedCount: number;
    weeklyData: Array<{ name: string; tasks: number }>;
    topUsers: Array<{
        id: string | number;
        name: string;
        role: string;
        status: 'ATIVO' | 'AUSENTE';
        completed: number;
        efficiency: number;
        color: string;
    }>;
}

export const dashboardService = {
    async getStats(userId?: string): Promise<DashboardStats> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

        // 1. Total de Tarefas
        let totalQuery = supabase.from('controle_tarefas').select('id', { count: 'exact', head: true });
        if (userId) totalQuery = totalQuery.eq('id_usuario', userId);
        const { count: totalCount } = await totalQuery;

        // 2. Pendentes Hoje
        let pendingQuery = supabase
            .from('controle_tarefas')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')
            .gte('data_hora', startOfDay)
            .lte('data_hora', endOfDay);
        if (userId) pendingQuery = pendingQuery.eq('id_usuario', userId);
        const { count: pendingTodayCount } = await pendingQuery;

        // 3. Atrasadas (Pendente e menor que agora)
        let overdueQuery = supabase
            .from('controle_tarefas')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')
            .lt('data_hora', now.toISOString());
        if (userId) overdueQuery = overdueQuery.eq('id_usuario', userId);
        const { count: overdueCount } = await overdueQuery;

        // 4. Concluídas (Total)
        let completedQuery = supabase
            .from('controle_tarefas')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'completed');
        if (userId) completedQuery = completedQuery.eq('id_usuario', userId);
        const { count: completedCount } = await completedQuery;

        const total = totalCount || 0;
        const completed = completedCount || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            totalTasks: total,
            pendingToday: pendingTodayCount || 0,
            overdue: overdueCount || 0,
            completedPercent: percent,
            completedCount: completed,
            weeklyData: [
                { name: 'Seg', tasks: 0 },
                { name: 'Ter', tasks: 0 },
                { name: 'Qua', tasks: 0 },
                { name: 'Qui', tasks: 0 },
                { name: 'Sex', tasks: 0 },
                { name: 'Sáb', tasks: 0 },
                { name: 'Dom', tasks: 0 },
            ],
            topUsers: [
                { id: '1', name: 'Diego', role: 'Supervisor', status: 'ATIVO', completed: completed, efficiency: 100, color: 'bg-primary/10 text-primary' },
            ],
        };
    },
};
