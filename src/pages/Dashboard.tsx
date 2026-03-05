import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  MoreVertical,
  ClipboardList as Assignment,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.role === 'supervisor';
  const { stats, isLoading, error } = useDashboard(isSupervisor ? undefined : user?.id);

  const PIE_DATA = stats
    ? [
      { name: 'Concluídas', value: stats.completedCount, color: '#5048e5' },
      { name: 'Pendentes', value: stats.totalTasks - stats.completedCount, color: '#e2e8f0' },
    ]
    : [];

  return (
    <div className="min-h-screen bg-background-light pb-20 overflow-x-hidden">
      <Header
        title="Painel Delimm"
        showBack={false}
        rightElement={
          <>
            <NotificationBell />
            <UserMenu />
          </>
        }
      />

      <main className="p-4 lg:p-6 w-full space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-medium">Carregando painel...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 font-medium">
            {error}
          </div>
        )}

        {stats && !isLoading && (
          <>
            {/* Cards de Resumo */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-col gap-2 rounded-2xl p-6 bg-white shadow-sm border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">Total de Tarefas</p>
                  <Assignment className="text-primary" size={20} />
                </div>
                <p className="text-3xl font-bold">{stats.totalTasks.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 font-medium text-sm">
                  <TrendingUp size={14} />
                  <span>+5% este mês</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-col gap-2 rounded-2xl p-6 bg-white shadow-sm border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">Pendentes Hoje</p>
                  <Clock className="text-amber-500" size={20} />
                </div>
                <p className="text-3xl font-bold">{stats.pendingToday}</p>
                <div className="flex items-center gap-1 mt-1 text-slate-500 font-medium text-sm">
                  <Clock size={14} />
                  <span>Próximo vencimento: 2h</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-col gap-2 rounded-2xl p-6 bg-white shadow-sm border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">Atrasadas</p>
                  <AlertTriangle className="text-rose-500" size={20} />
                </div>
                <p className="text-3xl font-bold">{stats.overdue}</p>
                <div className="flex items-center gap-1 mt-1 text-rose-600 font-medium text-sm">
                  <TrendingDown size={14} />
                  <span>-2% que ontem</span>
                </div>
              </motion.div>
            </section>

            {/* Gráficos */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Status Geral de Tarefas</h2>
                  <MoreVertical className="text-slate-400 cursor-pointer" size={20} />
                </div>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black">{stats.completedPercent}%</span>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Concluído</span>
                  </div>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  {PIE_DATA.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">{entry.name}</span>
                        <span className="font-bold text-sm">{entry.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Tarefas por Data</h2>
                  <span className="text-xs text-slate-500 font-medium">Últimos 7 dias</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="tasks" fill="#5048e5" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Top Performance (Somente Supervisor) */}
            {isSupervisor && (
              <section className="rounded-2xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Top Performance</h2>
                    <p className="text-sm text-slate-500">Usuários com mais tarefas concluídas esta semana</p>
                  </div>
                  <button
                    onClick={() => navigate('/users')}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100">
                      <tr>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Usuário</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Concluídas</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Eficiência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stats.topUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center font-bold', user.color)}>
                                {user.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-full text-[10px] font-bold',
                                user.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              )}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 font-bold">{user.completed}</td>
                          <td className="py-4">
                            <div className="w-full max-w-24 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={cn('h-1.5 rounded-full', user.efficiency > 80 ? 'bg-emerald-500' : 'bg-primary')}
                                style={{ width: `${user.efficiency}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
}
