import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings as SettingsIcon, Plus, ClipboardPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isSupervisor = user?.role === 'supervisor';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
    ...(isSupervisor ? [
      { path: '/users', label: 'Equipe', icon: Users },
      { path: '/settings', label: 'Ajustes', icon: SettingsIcon }
    ] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur-md z-50">
      <div className="flex justify-between items-center px-2 h-16 w-full relative">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          // Insert the central button for supervisors at the middle (index 2)
          const isMiddle = index === 2;

          return (
            <React.Fragment key={item.path}>
              {isMiddle && isSupervisor && (
                <div className="relative flex-1 flex justify-center">
                  <button
                    onClick={() => navigate('/tasks/assign')}
                    className="absolute -top-10 size-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 border-4 border-white transition-transform active:scale-90 flex items-center justify-center"
                  >
                    <ClipboardPlus size={28} />
                  </button>
                </div>
              )}
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-slate-500 hover:text-primary"
                )}
              >
                <Icon size={22} />
                <span className="text-[9px] font-bold truncate w-full text-center px-1">{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
