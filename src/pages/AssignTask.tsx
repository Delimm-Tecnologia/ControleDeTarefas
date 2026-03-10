import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardCheck,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { baseTaskService, taskService, AssignTaskPayload } from '../services/taskService';
import Navigation from '../components/Navigation';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';
import { cn } from '../lib/utils';
import { BaseTask, Task } from '../types';

export default function AssignTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const editTask = location.state?.editTask as Task | undefined;
  const isEditMode = !!editTask;

  const [selectedTaskId, setSelectedTaskId] = useState(editTask?.baseTaskId || '');
  const [selectedUserId, setSelectedUserId] = useState(editTask?.assignedTo || '');
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [date, setDate] = useState(editTask?.dueDate.split('T')[0] || '');
  const [time, setTime] = useState(editTask?.dueDate.split('T')[1]?.slice(0, 5) || '');
  const [dayOfWeek, setDayOfWeek] = useState(editTask?.dayOfWeek || '');
  const [notes, setNotes] = useState(editTask?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseTasks, setBaseTasks] = useState<BaseTask[]>([]);

  const taskRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { users } = useUsers();

  // Carregar tarefas base via serviço
  useEffect(() => {
    baseTaskService.getAll().then(setBaseTasks);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (taskRef.current && !taskRef.current.contains(event.target as Node)) {
        setIsTaskOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    if (!isEditMode) {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().split(' ')[0].slice(0, 5));
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditMode]);

  const getIconComponent = (name: string) => {
    const iconObj = AVAILABLE_ICONS.find((i) => i.name === name);
    return iconObj ? iconObj.icon : CheckCircle2;
  };

  const getColorClasses = (name: string) => {
    const colorObj = AVAILABLE_COLORS.find((c) => c.name === name);
    return colorObj ? `${colorObj.bg} ${colorObj.text}` : 'bg-slate-100 text-slate-600';
  };

  const selectedTask = baseTasks.find((t) => t.id === selectedTaskId);
  const TaskIcon = selectedTask ? getIconComponent(selectedTask.icon) : null;
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const availableTasks = baseTasks.filter((t) =>
    taskSearchQuery.trim() === ''
      ? true
      : t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
  );

  const availableUsers = users
    .filter((u) => u.role === 'user')
    .filter((u) =>
      userSearchQuery.trim() === ''
        ? true
        : u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

  const handleAssign = async () => {
    if (!selectedTaskId || !selectedUserId) return;
    setIsSubmitting(true);
    try {
      const payload: AssignTaskPayload = {
        baseTaskId: selectedTaskId,
        assignedTo: selectedUserId,
        dueDate: `${date}T${time}:00`,
        dayOfWeek: dayOfWeek || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditMode && editTask) {
        await taskService.update(editTask.id, payload);
      } else {
        await taskService.assign(payload);
      }
      navigate('/tasks');
    } catch (err: any) {
      console.error('Erro ao atribuir tarefa (DETALHE):', err);
      alert(`Erro ao atribuir tarefa: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="bg-white border-b border-slate-100 px-4 py-2 sticky top-0 z-10">
        <div className="w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">{isEditMode ? 'Editar Atribuição' : 'Atribuir Tarefa'}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-3 space-y-2 pb-20">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Selecionar Tarefa */}
          <div className="flex flex-col gap-1" ref={taskRef}>
            <label className="text-[11px] font-semibold text-slate-700 px-1">Selecionar Tarefa</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIsTaskOpen(!isTaskOpen); setIsUserOpen(false); }}
                className={cn(
                  'w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none transition-all flex items-center justify-between',
                  isTaskOpen ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3 w-full truncate pr-4">
                  {selectedTask ? (
                    <>
                      <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', getColorClasses(selectedTask.color))}>
                        {TaskIcon && <TaskIcon size={14} />}
                      </div>
                      <span className="font-bold text-slate-900 truncate">{selectedTask.title}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">Escolha uma tarefa</span>
                  )}
                </div>
                <ChevronDown className={cn('text-slate-400 shrink-0 transition-transform', isTaskOpen && 'rotate-180 text-primary')} size={16} />
              </button>

              <AnimatePresence>
                {isTaskOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden"
                  >
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Buscar tarefa..."
                          value={taskSearchQuery}
                          onChange={(e) => setTaskSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                      {availableTasks.map((task) => {
                        const Icon = getIconComponent(task.icon);
                        const isSelected = selectedTaskId === task.id;
                        return (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => { setSelectedTaskId(task.id); setIsTaskOpen(false); }}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left',
                              isSelected ? 'bg-primary/5' : 'hover:bg-slate-50'
                            )}
                          >
                            <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', getColorClasses(task.color))}>
                              <Icon size={16} />
                            </div>
                            <h5 className={cn('text-sm truncate', isSelected ? 'font-bold text-primary' : 'font-medium text-slate-900')}>
                              {task.title}
                            </h5>
                            {isSelected && <CheckCircle2 size={16} className="text-primary shrink-0 ml-auto" />}
                          </button>
                        );
                      })}
                      {availableTasks.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">
                          Nenhuma tarefa modelo encontrada.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selecionar Responsável */}
          <div className="flex flex-col gap-1" ref={userRef}>
            <label className="text-[11px] font-semibold text-slate-700 px-1">Responsável</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIsUserOpen(!isUserOpen); setIsTaskOpen(false); }}
                className={cn(
                  'w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none transition-all flex items-center justify-between',
                  isUserOpen ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3 w-full truncate pr-4">
                  {selectedUser ? (
                    <>
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="size-7 rounded-full object-cover shrink-0 border border-slate-100" />
                      <span className="font-bold text-slate-900 truncate">{selectedUser.name}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">Escolha um responsável</span>
                  )}
                </div>
                <ChevronDown className={cn('text-slate-400 shrink-0 transition-transform', isUserOpen && 'rotate-180 text-primary')} size={16} />
              </button>

              <AnimatePresence>
                {isUserOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden"
                  >
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Buscar usuário..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                      {availableUsers.map((u) => {
                        const isSelected = selectedUserId === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUserId(u.id); setIsUserOpen(false); }}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left',
                              isSelected ? 'bg-primary/5' : 'hover:bg-slate-50'
                            )}
                          >
                            <img src={u.avatar} alt={u.name} className="size-8 rounded-full object-cover shrink-0 border border-slate-200" />
                            <h5 className={cn('text-sm truncate', isSelected ? 'font-bold text-primary' : 'font-medium text-slate-900')}>
                              {u.name}
                            </h5>
                            {isSelected && <CheckCircle2 size={16} className="text-primary shrink-0 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        <section className="space-y-1.5 pt-2">
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Agendamento</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-semibold text-slate-700 px-1">Dia da Semana</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="">Selecione o dia</option>
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-semibold text-slate-700 px-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-semibold text-slate-700 px-1">Hora</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-1.5 pt-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-semibold text-slate-700 px-1">Observações (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-[80px]"
              placeholder="Digite detalhes adicionais sobre a tarefa..."
            />
          </div>
        </section>

        <section className="pt-4">
          <button
            disabled={!selectedTaskId || !selectedUserId || isSubmitting}
            onClick={handleAssign}
            className={cn(
              'w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2',
              selectedTaskId && selectedUserId && !isSubmitting
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isEditMode ? 'Salvando...' : 'Atribuindo...'}
              </>
            ) : (
              <>
                {isEditMode ? <RefreshCw size={20} /> : <ClipboardCheck size={20} />}
                {isEditMode ? 'Salvar Alterações' : 'Atribuir Tarefa'}
              </>
            )}
          </button>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
