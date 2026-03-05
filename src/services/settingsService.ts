import { supabase } from '../lib/supabase';

export interface UserSettings {
    id_usuario: string;
    notificacao_email: boolean;
    notificacao_push: boolean;
    notificacao_whatsapp: boolean;
    cor_sistema: string;
    telefone?: string;
    updated_at?: string;
}

export const settingsService = {
    async getByUserId(userId: string): Promise<UserSettings | null> {
        const { data, error } = await supabase
            .from('configuracao_usuario')
            .select('*')
            .eq('id_usuario', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
        return data;
    },

    async update(settings: Partial<UserSettings>): Promise<UserSettings> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');

        const { data, error } = await supabase
            .from('configuracao_usuario')
            .upsert({
                ...settings,
                id_usuario: user.id,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
