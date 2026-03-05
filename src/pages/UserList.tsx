import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Search, Shield, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import { cn } from '../lib/utils';
import { useUsers } from '../hooks/useUsers';

export default function UserList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading, error, deleteUser } = useUsers();

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const handleEdit = (user: typeof users[0]) => {
    navigate('/register', { state: { editUser: user } });
  };

  const handleDelete = async (user: typeof users[0]) => {
    if (confirm(`Deseja excluir o usuário "${user.name}"?`)) {
      try {
        await deleteUser(user.id);
      } catch {
        alert('Erro ao excluir usuário. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-light pb-24">
      <Header
        title="Equipe"
        showBack={true}
        rightElement={
          <>
            <NotificationBell />
            <UserMenu />
            <button
              onClick={() => navigate('/register')}
              className="flex size-10 items-center justify-center rounded-full bg-primary text-white"
            >
              <UserPlus size={20} />
            </button>
          </>
        }
      />

      <main className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Estado de loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm font-medium">Carregando colaboradores...</span>
          </div>
        )}

        {/* Estado de erro */}
        {error && !isLoading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {!isLoading && filteredUsers.length === 0 && !error && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-slate-400 text-sm py-8"
              >
                {searchQuery
                  ? `Nenhum colaborador encontrado para "${searchQuery}".`
                  : 'Nenhum colaborador cadastrado ainda.'}
              </motion.p>
            )}

            {!isLoading &&
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-slate-50 overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                        {user.role === 'supervisor' && (
                          <Shield size={14} className="text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block',
                          user.role === 'supervisor'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      title="Editar usuário"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="flex items-center justify-center size-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                      title="Excluir usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
