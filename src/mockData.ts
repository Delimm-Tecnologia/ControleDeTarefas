import { User, Task, BaseTask, Notification } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
  {
    id: '2',
    name: 'Marcos Oliveira',
    email: 'marcos@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  },
  {
    id: '3',
    name: 'João Delimm',
    email: 'joao@delimm.com',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Organizar Cozinha',
    status: 'completed',
    dueDate: '2024-05-24T09:00:00',
    assignedTo: '1',
    createdBy: '3',
  },
  {
    id: '2',
    title: 'Limpar Área de Serviço',
    status: 'pending',
    dueDate: '2024-05-24T14:30:00',
    assignedTo: '1',
    createdBy: '3',
  },
  {
    id: '3',
    title: 'Passear com o Pet',
    status: 'pending',
    dueDate: '2024-05-24T17:00:00',
    assignedTo: '2',
    createdBy: '3',
  },
];

export const MOCK_BASE_TASKS: BaseTask[] = [
  { id: '1', title: 'Manutenção Preventiva - Unidade A', icon: 'Shield', color: 'Blue' },
  { id: '2', title: 'Vistoria de Segurança Mensal', icon: 'CheckCircle2', color: 'Green' },
  { id: '3', title: 'Limpeza Técnica de Ar Condicionado', icon: 'Wind', color: 'Cyan' },
  { id: '4', title: 'Revisão de Estoque Trimestral', icon: 'Package', color: 'Orange' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Nova Tarefa Atribuída',
    message: 'Você recebeu uma nova tarefa: "Limpeza Técnica de Ar Condicionado".',
    time: '5 min atrás',
    isRead: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Tarefa Atrasada',
    message: 'A tarefa "Vistoria de Segurança" está com o prazo expirado.',
    time: '2 horas atrás',
    isRead: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'Relatório Concluído',
    message: 'O relatório mensal de produtividade já está disponível.',
    time: '1 dia atrás',
    isRead: true,
    type: 'success',
  },
];
