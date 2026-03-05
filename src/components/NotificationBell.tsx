import { Bell, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Notificações</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Ler todas
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50',
                        !notification.isRead && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'size-10 rounded-full flex items-center justify-center shrink-0',
                          notification.type === 'info' && 'bg-blue-100 text-blue-600',
                          notification.type === 'warning' && 'bg-amber-100 text-amber-600',
                          notification.type === 'success' && 'bg-emerald-100 text-emerald-600'
                        )}
                      >
                        {notification.type === 'info' && <Info size={20} />}
                        {notification.type === 'warning' && <AlertTriangle size={20} />}
                        {notification.type === 'success' && <CheckCircle2 size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={cn('text-sm font-bold truncate', !notification.isRead ? 'text-slate-900' : 'text-slate-600')}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notification.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500 text-sm">Nenhuma notificação por aqui.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                Ver histórico completo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
