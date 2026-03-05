import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Info, CheckCircle2, ArrowLeft, X, Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';
import { baseTaskService } from '../services/taskService';
import { BaseTask } from '../types';

export default function CreateBaseTask() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].name);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].name);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load tasks from service on mount
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await baseTaskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getIconComponent = (name: string) => {
    const iconObj = AVAILABLE_ICONS.find(i => i.name === name);
    return iconObj ? iconObj.icon : CheckCircle2;
  };

  const getColorClasses = (name: string) => {
    const colorObj = AVAILABLE_COLORS.find(c => c.name === name);
    return colorObj ? `${colorObj.bg} ${colorObj.text}` : 'bg-green-100 text-green-600';
  };

  const handleSave = async () => {
    if (!taskName.trim()) return;
    setIsSaving(true);

    try {
      if (editingTaskId) {
        await baseTaskService.update(editingTaskId, {
          title: taskName,
          description: taskDescription,
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        await baseTaskService.create({
          title: taskName,
          description: taskDescription,
          icon: selectedIcon,
          color: selectedColor,
        });
      }
      await loadTasks();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar a tarefa. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTaskId) return;
    if (!confirm('Deseja excluir este modelo de tarefa?')) return;

    setIsSaving(true);
    try {
      await baseTaskService.delete(editingTaskId);
      await loadTasks();
      resetForm();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('Erro ao excluir a tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTask = (task: BaseTask) => {
    setEditingTaskId(task.id);
    setTaskName(task.title);
    setTaskDescription(task.description || '');
    setSelectedIcon(task.icon);
    setSelectedColor(task.color);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setTaskName('');
    setTaskDescription('');
    setSelectedIcon(AVAILABLE_ICONS[0].name);
    setSelectedColor(AVAILABLE_COLORS[0].name);
  };

  const SelectedIcon = getIconComponent(selectedIcon);

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
          <h1 className="text-lg font-bold text-slate-900">Nova Tarefa</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-3 space-y-4 pb-24">
        <div className="py-2 flex justify-between items-start">
          <div>
            <h3 className="text-slate-900 text-2xl font-bold leading-tight">
              {editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h3>
            <p className="text-slate-500 text-sm font-normal">Defina o nome e os detalhes da atividade que será recorrente no sistema.</p>
          </div>
          {editingTaskId && (
            <button
              onClick={resetForm}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              title="Nova Tarefa"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-semibold text-slate-700 px-1">Nome da Tarefa</label>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowPicker(true)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 transition-all shadow-sm shrink-0 ${getColorClasses(selectedColor)}`}
              >
                <SelectedIcon size={20} />
              </button>
              <input
                className="flex-1 h-10 rounded-xl text-slate-900 border border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 px-4 text-sm transition-all outline-none"
                placeholder="Ex: Limpar a Casa"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
              <div className="flex gap-1.5 shrink-0">
                {editingTaskId && (
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="size-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                    title="Excluir"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!taskName.trim() || isSaving}
                  className={`size-10 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50 ${!taskName.trim()
                    ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                    : 'bg-primary text-white border border-primary hover:bg-primary/90'
                    }`}
                  title={editingTaskId ? 'Atualizar' : 'Salvar'}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : (editingTaskId ? <Edit2 size={18} /> : <CheckCircle2 size={18} />)}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-semibold text-slate-700 px-1">Descrição (Opcional)</label>
            <textarea
              className="w-full rounded-xl text-slate-900 border border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px] placeholder:text-slate-400 p-3 text-sm transition-all resize-none outline-none"
              placeholder="Descreva detalhadamente como esta tarefa deve ser executada..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3">
            <Info className="text-primary shrink-0" size={16} />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tarefas funcionam como modelos. Você poderá atribuí-las a colaboradores ou agendá-las posteriormente.
            </p>
          </div>
        </div>

        {/* Task List Section */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-slate-900">Tarefas Cadastradas</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tasks.length} Total</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary/40" />
                <p className="text-sm font-medium">Carregando modelos...</p>
              </div>
            ) : (
              <>
                {tasks.map((task) => {
                  const Icon = getIconComponent(task.icon || 'CheckCircle2');
                  const isSelected = editingTaskId === task.id;

                  return (
                    <button
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getColorClasses(task.color || 'Blue')}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-900 truncate">{task.title}</h5>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 truncate">{task.description}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <Edit2 size={16} className="text-primary" />
                        ) : (
                          <div className="size-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium">Nenhuma tarefa cadastrada</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Navigation />

      {/* Icon & Color Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Personalizar Ícone</h2>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Cor</label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVAILABLE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`h-10 rounded-xl flex items-center justify-center border-2 transition-all ${selectedColor === color.name
                            ? 'border-primary shadow-sm scale-105'
                            : 'border-transparent'
                            } ${color.bg}`}
                        >
                          <div className={`w-5 h-5 rounded-full ${color.text} flex items-center justify-center`}>
                            <div className="w-3 h-3 rounded-full bg-current" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Ícone</label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVAILABLE_ICONS.map((icon) => {
                        const Icon = icon.icon;
                        return (
                          <button
                            key={icon.name}
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`h-10 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIcon === icon.name
                              ? 'border-primary bg-primary/5 text-primary shadow-sm scale-105'
                              : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                              }`}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPicker(false)}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
