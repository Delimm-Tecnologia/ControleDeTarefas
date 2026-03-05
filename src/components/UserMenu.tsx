import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Usuário de fallback enquanto carrega (não deveria acontecer em rota protegida)
  const displayUser = user ?? {
    name: 'Usuário',
    email: '',
    role: 'user' as const,
    avatar: undefined,
    id: '',
  };

  const initials = displayUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt={displayUser.name} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown
          size={14}
          className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-bold text-slate-900">{displayUser.name}</p>
              <p className="text-xs text-slate-500 capitalize">{displayUser.role}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => { navigate('/settings'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <UserIcon size={18} />
                Meu Perfil
              </button>
              <button
                onClick={() => { navigate('/settings'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Settings size={18} />
                Configurações
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
