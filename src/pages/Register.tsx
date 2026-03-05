import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, User as UserIcon, Eye, EyeOff, UserCheck, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Header from '../components/Header';
import { User } from '../types';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const editUser = location.state?.editUser as User | undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'user' | 'supervisor'>(editUser?.role || 'user');
  const [name, setName] = useState(editUser?.name || '');
  const [email, setEmail] = useState(editUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(editUser?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editUser;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEditMode && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!isEditMode && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name,
        email,
        role,
        avatar: avatarFile || avatarPreview || undefined
      };

      if (isEditMode && editUser) {
        await userService.update(editUser.id, userData);
      } else {
        await authService.register({ ...userData, password });
      }
      navigate('/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col overflow-x-hidden">
      <Header title={isEditMode ? 'Atualizar Colaborador' : 'Cadastro Delimm'} showBack={true} />

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl pb-24"
      >
        <div className="w-full space-y-8 bg-white/50 sm:bg-white sm:shadow-sm sm:border border-slate-100 rounded-3xl p-4 sm:p-8">
          <div className="flex flex-col gap-6 items-center mb-8">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="bg-primary/10 aspect-square rounded-full min-h-32 w-32 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : name ? (
                  <span className="text-primary text-3xl font-bold">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                ) : (
                  <UserIcon size={48} className="text-primary/40" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-slate-900 text-xl font-bold">Sua Foto</p>
              <p className="text-slate-500 text-sm">Toque na câmera para alterar</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <p className="text-slate-700 text-sm font-semibold ml-1">Nome Completo</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-slate-700 text-sm font-semibold ml-1">E-mail</p>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="exemplo@delimm.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-slate-700 text-sm font-semibold ml-1">Senha</p>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={isEditMode ? '(Não alterar)' : '••••••••'}
                    required={!isEditMode}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-slate-700 text-sm font-semibold ml-1">Confirmar</p>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={isEditMode ? '(Não alterar)' : '••••••••'}
                  required={!isEditMode}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 text-sm font-semibold ml-1">Perfil de Acesso</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border transition-all',
                    role === 'user'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-primary/50'
                  )}
                >
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">Usuário</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supervisor')}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border transition-all',
                    role === 'supervisor'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-primary/50'
                  )}
                >
                  <ShieldCheck size={18} />
                  <span className="text-sm font-medium">Supervisor</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isEditMode ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? 'Atualizar' : 'Cadastrar'}
                    {isEditMode ? <RefreshCw size={20} /> : <UserCheck size={20} />}
                  </>
                )}
              </button>
              <p className="text-center text-slate-500 text-xs mt-4">
                Ao se cadastrar, você concorda com nossos{' '}
                <Link to="#" className="text-primary hover:underline">
                  Termos de Uso
                </Link>
                .
              </p>
            </div>
          </form>
        </div>
      </motion.main>
    </div>
  );
}
