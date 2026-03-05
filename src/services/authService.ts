// ============================================================
// SERVIÇO DE AUTENTICAÇÃO — src/services/authService.ts
// ============================================================
// Para ativar backend real:
//   1. Remova os blocos marcados com "=== MOCK ==="
//   2. Descomente as linhas marcadas com "=== API REAL ==="
// ============================================================

import { supabase } from '../lib/supabase';
import { User } from '../types';

export const TOKEN_KEY = 'delimm-token';
export const USER_KEY = 'delimm-user';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'supervisor';
    avatar?: string | File;
}

export interface AuthResponse {
    user: User;
    token: string;
}

const translateError = (error: any): string => {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado.';
    if (msg.includes('email not confirmed')) return 'E-mail ainda não confirmado.';
    if (msg.includes('password is too short')) return 'A senha deve ter pelo menos 6 caracteres.';
    return error.message || 'Ocorreu um erro inesperado.';
};

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Login no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (authError) {
            throw new Error(translateError(authError));
        }
        if (!authData.user) throw new Error('Usuário não encontrado após login.');

        // Buscar dados complementares na tabela 'usuario'
        const { data: userData, error: userError } = await supabase
            .from('usuario')
            .select('*, perfil(nome)')
            .eq('id', authData.user.id)
            .single();

        if (userError) {
            console.error('Erro Detalhado Supabase:', userError);
            throw new Error(`Erro ao buscar perfil: ${userError.message} (${userError.code})`);
        }

        if (!userData) {
            throw new Error('Usuário não encontrado no banco de dados.');
        }

        const user: User = {
            id: authData.user.id,
            name: (userData as any).nome,
            email: authData.user.email!,
            role: ((Array.isArray((userData as any).perfil) ? (userData as any).perfil[0]?.nome : (userData as any).perfil?.nome) || 'user') as 'user' | 'supervisor',
            avatar: (userData as any).foto,
        };

        const token = authData.session?.access_token || '';
        const response: AuthResponse = { user, token };

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        return response;
    },

    async register(payload: RegisterPayload): Promise<User> {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
        });

        if (authError) {
            throw new Error(translateError(authError));
        }
        if (!authData.user) throw new Error('Falha ao criar usuário.');

        // 2. Buscar ID do perfil
        const { data: perfilData } = await supabase
            .from('perfil')
            .select('id')
            .eq('nome', payload.role)
            .single();

        // 3. Fazer upload do avatar se existir
        let avatarUrl = typeof payload.avatar === 'string' ? payload.avatar : undefined;

        if (payload.avatar instanceof File) {
            const fileExt = payload.avatar.name.split('.').pop();
            const fileName = `${authData.user.id}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, payload.avatar, { upsert: true });

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);
                avatarUrl = publicUrlData.publicUrl;
            }
        }

        // 4. Criar registro na tabela 'usuario'
        const { error: userError } = await supabase.from('usuario').insert({
            id: authData.user.id,
            nome: payload.name,
            email: payload.email,
            foto: avatarUrl,
            idperfil: perfilData?.id,
        });

        if (userError) throw userError;

        return {
            id: authData.user.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            avatar: avatarUrl,
        };
    },

    async logout(): Promise<void> {
        // === API REAL (opcional — invalida token no servidor) ===
        // try { await api.post('/auth/logout', {}); } catch {}
        // =======================================================

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getStoredUser(): User | null {
        try {
            const stored = localStorage.getItem(USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
