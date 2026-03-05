// ============================================================
// SERVIÇO DE TAREFAS — src/services/taskService.ts
// ============================================================
// Para ativar backend real, troque os blocos MOCK pelos API REAL
// ============================================================

import { supabase } from '../lib/supabase';
import { Task, BaseTask } from '../types';
import { notificationService } from './notificationService';

export interface AssignTaskPayload {
    baseTaskId: string;
    assignedTo: string;
    dueDate: string;
    notes?: string;
}

// ─── Tarefas Atribuídas (Controle de Tarefas) ────────────────
export const taskService = {
    async getAll(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('controle_tarefas')
            .select(`
                id,
                id_usuario,
                id_tarefa,
                data_hora,
                status,
                observacao,
                usuario:id_usuario (nome),
                tarefas:id_tarefa (nome)
            `)
            .order('data_hora', { ascending: false });

        if (error) throw error;

        return data.map((t: any) => ({
            id: t.id,
            title: t.tarefas?.nome || 'Tarefa Removida',
            status: t.status as Task['status'],
            dueDate: t.data_hora,
            assignedTo: t.id_usuario,
            createdBy: 'supervisor', // Simplificado para exibição
            notes: t.observacao,
            baseTaskId: t.id_tarefa,
        }));
    },

    async getByUser(userId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('controle_tarefas')
            .select(`
                id,
                id_usuario,
                id_tarefa,
                data_hora,
                status,
                observacao,
                tarefas:id_tarefa (nome, icone, cor)
            `)
            .eq('id_usuario', userId)
            .order('data_hora', { ascending: false });

        if (error) throw error;

        return data.map((t: any) => ({
            id: t.id,
            title: t.tarefas?.nome || 'Tarefa Removida',
            status: t.status as Task['status'],
            dueDate: t.data_hora,
            assignedTo: t.id_usuario,
            createdBy: 'supervisor',
            notes: t.observacao,
            baseTaskId: t.id_tarefa,
        }));
    },

    async assign(payload: AssignTaskPayload): Promise<Task> {
        const { data: created, error } = await supabase
            .from('controle_tarefas')
            .insert({
                id_usuario: payload.assignedTo,
                id_tarefa: payload.baseTaskId,
                data_hora: payload.dueDate,
                observacao: payload.notes,
                status: 'pending'
            })
            .select('*, tarefas:id_tarefa(nome)')
            .single();

        if (error) throw error;

        // Disparar notificação para o usuário atribuído
        await notificationService.create({
            userId: payload.assignedTo,
            title: 'Nova Tarefa Atribuída',
            message: `Você recebeu a tarefa: ${created.tarefas?.nome || 'Nova Tarefa'}`,
            type: 'success'
        });

        return {
            id: created.id,
            title: created.tarefas?.nome || 'Tarefa',
            status: created.status as Task['status'],
            dueDate: created.data_hora,
            assignedTo: created.id_usuario,
            createdBy: 'supervisor',
            notes: created.observacao,
            baseTaskId: created.id_tarefa,
        };
    },

    async updateStatus(id: string, status: Task['status']): Promise<Task> {
        const { data, error } = await supabase
            .from('controle_tarefas')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, tarefas:id_tarefa(nome), usuario:id_usuario(nome)')
            .single();

        if (error) throw error;

        // Se a tarefa foi concluída, notificar supervisores
        if (status === 'completed') {
            const { data: sups } = await supabase
                .from('usuario')
                .select('id')
                .eq('idperfil', '38113db1-9b4c-4b68-8e3e-7832b9cb6f62'); // ID Supervisor

            if (sups) {
                for (const sup of sups) {
                    await notificationService.create({
                        userId: sup.id,
                        title: 'Tarefa Concluída',
                        message: `${data.usuario?.nome || 'Um usuário'} concluiu a tarefa: ${data.tarefas?.nome}`,
                        type: 'success'
                    });
                }
            }
        } else {
            // Notificar usuário de que o status mudou (caso tenha sido o supervisor)
            await notificationService.create({
                userId: data.id_usuario,
                title: 'Status de Tarefa Alterado',
                message: `O status da sua tarefa "${data.tarefas?.nome}" mudou para ${status}`,
                type: 'info'
            });
        }

        return {
            id: data.id,
            title: data.tarefas?.nome || 'Tarefa',
            status: data.status as Task['status'],
            dueDate: data.data_hora,
            assignedTo: data.id_usuario,
            createdBy: 'supervisor',
            notes: data.observacao,
            baseTaskId: data.id_tarefa,
        };
    },

    async update(id: string, payload: Partial<AssignTaskPayload>): Promise<Task> {
        const { data, error } = await supabase
            .from('controle_tarefas')
            .update({
                ...(payload.assignedTo ? { id_usuario: payload.assignedTo } : {}),
                ...(payload.baseTaskId ? { id_tarefa: payload.baseTaskId } : {}),
                ...(payload.dueDate ? { data_hora: payload.dueDate } : {}),
                ...(payload.notes !== undefined ? { observacao: payload.notes } : {}),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*, tarefas:id_tarefa(nome)')
            .single();

        if (error) throw error;

        // Notificar o usuário da atualização
        await notificationService.create({
            userId: data.id_usuario,
            title: 'Tarefa Atualizada',
            message: `Sua tarefa "${data.tarefas?.nome}" foi atualizada pelo supervisor.`,
            type: 'info'
        });

        return {
            id: data.id,
            title: data.tarefas?.nome || 'Tarefa',
            status: data.status as Task['status'],
            dueDate: data.data_hora,
            assignedTo: data.id_usuario,
            createdBy: 'supervisor',
            notes: data.observacao,
            baseTaskId: data.id_tarefa,
        };
    },

    async delete(id: string): Promise<void> {
        // Buscar dados antes de deletar para notificar
        const { data: taskData } = await supabase
            .from('controle_tarefas')
            .select('id_usuario, tarefas:id_tarefa(nome)')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('controle_tarefas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        if (taskData) {
            await notificationService.create({
                userId: (taskData as any).id_usuario,
                title: 'Tarefa Removida',
                message: `A tarefa "${(taskData as any).tarefas?.nome}" foi removida da sua lista.`,
                type: 'warning'
            });
        }
    },
};

// ─── Tarefas Modelo (Base Tasks) ─────────────────────────────
export const baseTaskService = {
    async getAll(): Promise<BaseTask[]> {
        const { data, error } = await supabase
            .from('tarefas')
            .select('*');

        if (error) throw error;

        return data.map((t: any) => ({
            id: t.id,
            title: t.nome,
            description: t.observacao,
            icon: t.icone,
            color: t.cor,
        }));
    },

    async create(data: Omit<BaseTask, 'id'>): Promise<BaseTask> {
        const { data: created, error } = await supabase
            .from('tarefas')
            .insert({
                nome: data.title,
                observacao: data.description,
                icone: data.icon,
                cor: data.color,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: created.id,
            title: created.nome,
            description: created.observacao,
            icon: created.icone,
            color: created.cor,
        };
    },

    async update(id: string, data: Partial<Omit<BaseTask, 'id'>>): Promise<BaseTask> {
        const { data: updated, error } = await supabase
            .from('tarefas')
            .update({
                ...(data.title ? { nome: data.title } : {}),
                ...(data.description !== undefined ? { observacao: data.description } : {}),
                ...(data.icon ? { icone: data.icon } : {}),
                ...(data.color ? { cor: data.color } : {}),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: updated.id,
            title: updated.nome,
            description: updated.observacao,
            icon: updated.icone,
            color: updated.cor,
        };
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('tarefas')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
