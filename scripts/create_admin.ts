
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente manualmente para o script
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
    console.log('--- Iniciando criação do usuário Diego ---');

    // 1. Tentar fazer signUp
    const email = 'diegomoura777@gmail.com';
    const password = '051187';
    const nome = 'Diego';

    console.log(`Fazendo registro no Auth: ${email}...`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: nome }
        }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('Usuário já existe no Auth. Vamos apenas garantir que ele esteja na tabela usuario.');
            // Se já existe, precisamos do ID. Como não podemos pegar o ID de um usuário existente via signUp, 
            // precisaremos que o usuário faça login ou usar a Admin API se estivesse disponível.
            // Mas vamos tentar o insert caso ele já tenha o ID de auth (fallback).
        } else {
            console.error('Erro no Auth:', error.message);
            return;
        }
    }

    const userId = data.user?.id;
    if (!userId) {
        console.error('Não foi possível obter o ID do usuário.');
        return;
    }

    console.log('Usuário registrado com ID:', userId);

    // 2. Buscar ID do perfil supervisor
    const { data: perfilData } = await supabase
        .from('perfil')
        .select('id')
        .eq('nome', 'supervisor')
        .single();

    if (!perfilData) {
        console.error('Erro: Perfil "supervisor" não encontrado na tabela perfil.');
        return;
    }

    // 3. Inserir/Atualizar na tabela usuario
    console.log('Salvando dados na tabela public.usuario...');
    const { error: userError } = await supabase.from('usuario').upsert({
        id: userId,
        nome: nome,
        email: email,
        foto: `https://ui-avatars.com/api/?name=${nome}&background=0D8ABC&color=fff`,
        idperfil: perfilData.id,
    });

    if (userError) {
        console.error('Erro ao salvar na tabela usuario:', userError.message);
    } else {
        console.log('SUCESSO: Usuário Diego criado e promovido a Supervisor!');
    }
}

createAdminUser();
