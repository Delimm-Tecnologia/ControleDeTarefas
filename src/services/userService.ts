// ============================================================
// SERVIÇO DE USUÁRIOS — src/services/userService.ts
// ============================================================
// Para ativar backend real, troque os blocos MOCK pelos API REAL
// ============================================================

import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    role?: 'user' | 'supervisor';
    avatar?: string | File;
}

export const userService = {
    async getAll(): Promise<User[]> {
        try {
            const { data, error } = await supabase
                .from('usuario')
                .select(`
                    id,
                    nome,
                    email,
                    foto,
                    perfil (nome)
                `);

            if (error) throw error;

            return data.map((u: any) => ({
                id: u.id,
                name: u.nome,
                email: u.email,
                role: ((Array.isArray(u.perfil) ? u.perfil[0]?.nome : u.perfil?.nome) || 'user') as 'user' | 'supervisor',
                avatar: u.foto,
            }));
        } catch (err) {
            throw new Error('Não foi possível carregar a lista de usuários.');
        }
    },

    async getById(id: string): Promise<User> {
        try {
            const { data, error } = await supabase
                .from('usuario')
                .select(`
                    id,
                    nome,
                    email,
                    foto,
                    perfil (nome)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                name: data.nome,
                email: data.email,
                role: ((Array.isArray((data as any).perfil) ? (data as any).perfil[0]?.nome : (data as any).perfil?.nome) || 'user') as 'user' | 'supervisor',
                avatar: data.foto,
            };
        } catch (err) {
            throw new Error('Usuário não encontrado.');
        }
    },

    async update(id: string, data: UpdateUserPayload): Promise<User> {
        try {
            // Se mudar o cargo, precisamos do ID do novo perfil
            let idperfil;
            if (data.role) {
                const { data: pData } = await supabase
                    .from('perfil')
                    .select('id')
                    .eq('nome', data.role)
                    .single();
                idperfil = pData?.id;
            }

            // Upload de avatar se for File
            let avatarUrl = typeof data.avatar === 'string' ? data.avatar : undefined;

            if (data.avatar instanceof File) {
                const fileExt = data.avatar.name.split('.').pop();
                const fileName = `${id}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, data.avatar, { upsert: true });

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    avatarUrl = publicUrlData.publicUrl;
                }
            }

            const { data: updated, error } = await supabase
                .from('usuario')
                .update({
                    nome: data.name,
                    email: data.email,
                    ...(avatarUrl ? { foto: avatarUrl } : {}),
                    ...(idperfil ? { idperfil } : {}),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select('*, perfil(nome)')
                .single();

            if (error) throw error;

            return {
                id: updated.id,
                name: updated.nome,
                email: updated.email,
                role: ((Array.isArray((updated as any).perfil) ? (updated as any).perfil[0]?.nome : (updated as any).perfil?.nome) || 'user') as 'user' | 'supervisor',
                avatar: updated.foto,
            };
        } catch (err) {
            throw new Error('Erro ao atualizar dados do usuário.');
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const { error } = await supabase.from('usuario').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            throw new Error('Erro ao excluir o usuário.');
        }
    },
};
