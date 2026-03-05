import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Mail,
  Bell,
  MessageSquare,
  Phone,
  Info,
  Save,
  CheckCircle2,
  Loader2,
  Camera,
  User as UserIcon,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { cn } from '../lib/utils';
import { useTheme, COLORS as THEME_COLORS } from '../context/ThemeContext';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import { settingsService } from '../services/settingsService';
import { userService } from '../services/userService';

import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateCurrentUser } = useAuth();
  const isSupervisor = user?.role === 'supervisor';
  const { primaryColor, setPrimaryColor } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    whatsapp: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null); // Limpa arquivo pendente após sincronizar com o store
    }

    const loadSettings = async () => {
      if (user?.id) {
        try {
          const saved = await settingsService.getByUserId(user.id);
          if (saved) {
            setNotifications({
              email: saved.notificacao_email,
              push: saved.notificacao_push,
              whatsapp: saved.notificacao_whatsapp,
            });
            setPhone(saved.telefone || '');
            const themeColor = THEME_COLORS.find(c => c.name === saved.cor_sistema);
            if (themeColor) setPrimaryColor(themeColor);
          }
        } catch (err) {
          console.error('Erro ao carregar configurações:', err);
        }
      }
    };

    loadSettings();
  }, [user?.id, user?.name, user?.email, user?.avatar, setPrimaryColor]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedOk(false);
    try {
      if (!user?.id) return;

      // 1. Atualizar Perfil (Nome, Email, Foto)
      const updatedUser = await userService.update(user.id, {
        name,
        email,
        avatar: avatarFile || avatarPreview || undefined
      });

      // 2. Atualizar Configurações (Notificações, Cor, Telefone)
      await settingsService.update({
        notificacao_email: notifications.email,
        notificacao_push: notifications.push,
        notificacao_whatsapp: notifications.whatsapp,
        cor_sistema: primaryColor.name,
        telefone: phone
      });

      // 3. Atualizar context global
      updateCurrentUser(updatedUser);

      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background-light flex flex-col pb-20">
      <Header
        title="Configurações"
        showBack={true}
        rightElement={
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        }
      />

      <main className="p-4 space-y-6 w-full">
        {/* Perfil Section */}
        <section className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="size-24 rounded-full bg-primary/10 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <UserIcon size={40} className="text-primary/40" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all border-2 border-white"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">{name || 'Usuário'}</h2>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
                placeholder="Seu nome"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </section>

        {/* Branding (opcional mostrar aqui ou no topo) */}
        {!isSupervisor && (
          <div className="flex items-center gap-3 px-1 mt-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CheckCircle2 className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary uppercase tracking-wider">Delimm</h1>
              <p className="text-xs text-slate-500">Controle de Tarefas</p>
            </div>
          </div>
        )}

        {/* Canais de Comunicação */}
        <section className="space-y-2">
          <h3 className="text-slate-900 text-lg font-bold leading-tight tracking-tight pb-2">Canais de Comunicação</h3>
          <div className="space-y-2">
            {[
              { id: 'email', label: 'E-mail', icon: <Mail size={20} /> },
              { id: 'push', label: 'Push Notifications', icon: <Bell size={20} /> },
              { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={20} /> },
            ].map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all shadow-sm"
              >
                <div className="text-slate-500">{channel.icon}</div>
                <p className="text-slate-900 text-base font-medium flex-1">{channel.label}</p>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [channel.id]: !prev[channel.id as keyof typeof prev],
                    }))
                  }
                  className={cn(
                    'relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-all',
                    notifications[channel.id as keyof typeof notifications]
                      ? 'bg-primary justify-end'
                      : 'bg-slate-200 justify-start'
                  )}
                >
                  <div className="h-6 w-6 rounded-full bg-white shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Personalização */}
        <section className="space-y-3">
          <h3 className="text-slate-900 text-lg font-bold leading-tight tracking-tight pb-1">Personalização do Sistema</h3>
          <div className="flex flex-wrap gap-6 bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm">
            {THEME_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setPrimaryColor(color)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={cn('size-10 rounded-full transition-all shadow-sm', primaryColor.name !== color.name && 'hover:scale-110')}
                  style={{
                    backgroundColor: color.value,
                    boxShadow:
                      primaryColor.name === color.name
                        ? `0 0 0 2px white, 0 0 0 4px ${color.value}`
                        : 'none',
                  }}
                />
                <span className={cn('text-xs font-medium', primaryColor.name === color.name ? 'text-primary font-bold' : 'text-slate-500')}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Telefone */}
        <section className="space-y-3">
          <label className="block">
            <span className="text-slate-900 text-base font-bold mb-2 block">Número de Telefone</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="text-slate-400" size={18} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                placeholder="+55 (11) 99999-9999"
              />
            </div>
          </label>
        </section>

        {/* Info Card */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-4 items-start">
          <Info className="text-primary mt-0.5 shrink-0" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Informações sobre Limites de API</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              As notificações via WhatsApp estão sujeitas aos limites da API gratuita. Atualmente, o plano gratuito da{' '}
              <strong>Delimm</strong> permite o envio de até 50 notificações mensais por conta.
            </p>
          </div>
        </section>

        {/* Salvar */}
        <div className="pt-4 pb-10">
          {savedOk && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 font-medium flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Configurações salvas com sucesso!
            </motion.div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Alterações
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-6">Configurações atualizadas em: {formattedDate}</p>
        </div>
      </main>
      <Navigation />
    </div>
  );
}
