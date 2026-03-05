import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ClipboardList, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      // Redireciona baseado no papel do usuário (Auth context já tem o user)
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-background-light overflow-x-hidden">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-4 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] md:max-w-[480px] lg:max-w-[560px] bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 my-auto"
        >
          <div className="pt-6 pb-4 px-6 sm:pt-10 sm:pb-6 sm:px-8 text-center border-b border-slate-100 bg-slate-50/30">
            <div className="mb-4 sm:mb-6 inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl text-primary">
              <ClipboardList className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest mb-1 sm:mb-2">Delimm</h2>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">Bem-vindo de volta</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Gerencie suas tarefas com eficiência</p>
          </div>

          <form className="p-6 sm:p-8 space-y-4 sm:space-y-5" onSubmit={handleLogin}>
            {/* Mensagem de erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 outline-none"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
              <Link to="#" className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Esqueci minha senha
              </Link>
            </div>
          </form>

          <div className="pt-4 pb-6 px-6 sm:pt-8 sm:pb-12 sm:px-8 text-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-100"></div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-tight">Todos os Direitos Reservados a</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-tight font-semibold">@DelimmTecnologia</span>
              </div>
              <div className="h-[1px] flex-1 bg-slate-100"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
