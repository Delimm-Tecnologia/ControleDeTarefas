// ============================================================
// HOOK DO DASHBOARD — src/hooks/useDashboard.ts
// ============================================================

import { useState, useEffect } from 'react';
import { DashboardStats, dashboardService } from '../services/dashboardService';

export function useDashboard(userId?: string) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        dashboardService
            .getStats(userId)
            .then((data) => setStats(data))
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados do painel.')
            )
            .finally(() => setIsLoading(false));
    }, [userId]);

    return { stats, isLoading, error };
}
