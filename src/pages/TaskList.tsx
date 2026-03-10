import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Utensils,
  Brush,
  Dog,
  ClipboardPlus,
  LayoutGrid,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';

export default function TaskList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isSupervisor = user?.role === 'supervisor';

  // Supervisor vê todas, usuário comum vê só as suas
  const { tasks, isLoading: tasksLoading, toggleStatus, deleteTask } = useTasks(
    isSupervisor ? undefined : user?.id
  );
  const { users, isLoading: usersLoading } = useUsers();

  const handleEdit = (task: any) => {
    navigate('/tasks/assign', { state: { editTask: task } });
  };

  const handleDeleteTask = async (task: any) => {
    if (window.confirm(`Deseja realmente excluir a tarefa "${task.title}"?`)) {
      try {
        await deleteTask(task.id);
      } catch (err) {
        alert('Erro ao excluir tarefa.');
      }
    }
  };

  const isLoading = tasksLoading || usersLoading;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getTaskIcon = (title: string) => {
    if (title.includes('Cozinha')) return <Utensils size={20} />;
    if (title.includes('Limpar')) return <Brush size={20} />;
    if (title.includes('Pet')) return <Dog size={20} />;
    return <CheckSquare size={20} />;
  };

  return (
    <div className="min-h-screen bg-background-light pb-24 overflow-x-hidden">
      <Header
        title="Delimm"
        showBack={true}
        rightElement={
          <>
            {isSupervisor && (
              <button
                onClick={() => navigate('/tasks/new-base')}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition-colors"
                title="Nova Tarefa"
              >
                <ClipboardPlus size={24} />
              </button>
            )}
            <NotificationBell />
            <UserMenu />
          </>
        }
      />

      {/* Busca por usuário (só supervisor) */}
      {isSupervisor && (
        <div className="px-4 pt-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tarefas por nome do usuário..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 transition-all placeholder:text-slate-400 outline-none shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="mt-4">
        <div className="flex border-b border-slate-200 px-4 gap-8">
          <button className="flex flex-col items-center justify-center border-b-[3px] border-primary text-primary pb-3 pt-2">
            <p className="text-sm font-bold">Minhas Tarefas</p>
          </button>
          <button className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 pb-3 pt-2">
            <p className="text-sm font-bold">Geral</p>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex h-10 shrink-0 items-center justify-center gap-x-2 px-3 sm:px-4 rounded-full text-sm font-bold transition-all',
              filter === f
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white border border-slate-200 text-slate-700'
            )}
          >
            {f === 'all' && <LayoutGrid size={18} />}
            {f === 'pending' && (
              <AlertCircle size={18} className={cn(filter === 'pending' ? 'text-white' : 'text-amber-500')} />
            )}
            {f === 'completed' && (
              <CheckCircle2 size={18} className={cn(filter === 'completed' ? 'text-white' : 'text-emerald-500')} />
            )}
            <span className="hidden sm:inline">
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluídas'}
            </span>
          </button>
        ))}
      </div>

      <main className="px-4 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm font-medium">Carregando tarefas...</span>
          </div>
        )}

        {!isLoading &&
          users
            .filter((u) => {
              if (!isSupervisor) return u.id === user?.id;
              return u.name.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map((u) => {
              const userTasks = filteredTasks.filter((t) => t.assignedTo === u.id);
              if (userTasks.length === 0) return null;

              return (
                <div key={u.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="size-6 rounded-full object-cover" />
                    <h3 className="text-slate-900 text-base font-bold tracking-tight">{u.name}</h3>
                    <span className="bg-slate-200 text-[10px] px-2 py-0.5 rounded-full font-bold text-slate-600 uppercase">
                      {userTasks.length} {userTasks.length === 1 ? 'Tarefa' : 'Tarefas'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {userTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleStatus(task.id)}
                        className={cn(
                          'bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer transition-all',
                          task.status === 'completed' && 'opacity-75'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex-shrink-0 size-10 rounded-xl flex items-center justify-center transition-colors',
                              task.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-amber-100 text-amber-600'
                            )}
                          >
                            {task.status === 'completed' ? <CheckCircle2 size={20} /> : getTaskIcon(task.title)}
                          </div>
                          <div>
                            <h4
                              className={cn(
                                'font-bold text-slate-800 text-sm transition-all',
                                task.status === 'completed' && 'line-through text-slate-400'
                              )}
                            >
                              {task.title}
                            </h4>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                                <Clock size={10} />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {' '}
                                  {new Date(task.dueDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {task.dayOfWeek && (
                                <span className="text-[11px] text-primary font-bold uppercase tracking-tight">
                                  {task.dayOfWeek}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isSupervisor && (
                            <div className="flex items-center gap-1 mr-2 border-r border-slate-100 pr-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(task);
                                }}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                title="Editar tarefa"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title="Excluir tarefa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-1 rounded-lg uppercase transition-colors',
                              task.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {task.status === 'completed' ? 'Concluída' : 'Pendente'}
                          </span>
                          <div
                            className={cn(
                              'size-5 rounded-full border-2 flex items-center justify-center transition-all',
                              task.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-200'
                            )}
                          >
                            {task.status === 'completed' && <CheckCircle2 size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

        {/* Estado vazio */}
        {!isLoading && filteredTasks.length === 0 && (
          <div className="space-y-3">
            <div className="bg-white p-8 rounded-2xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center">
              <AlertCircle size={40} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">Nenhuma tarefa disponível</p>
            </div>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
