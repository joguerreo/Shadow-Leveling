import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    sound.playBeep(520, 0.05);

    try {
      if (isLogin) {
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error);
          sound.playWarning();
        } else if (user) {
          sound.playAwakening();
          onSuccess(user);
          onClose();
        }
      } else {
        const { user, error } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMsg(error);
          sound.playWarning();
        } else {
          sound.playLevelUp();
          setSuccessMsg('¡Registro completado! Si Supabase tiene confirmación de email activada, revisa tu bandeja de entrada o inicia sesión.');
          if (user) {
            onSuccess(user);
            setTimeout(() => onClose(), 1500);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d0f18] border border-primary/40 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-white animate-scaleIn">
        {/* Top glow ornament */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

        {/* Close button */}
        <button
          onClick={() => {
            sound.playBeep(420, 0.04);
            onClose();
          }}
          className="absolute top-4 right-4 size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/20 border border-primary/50 text-primary mb-3 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">fingerprint</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider font-mono text-glow">
            {isLogin ? 'AUTENTICACIÓN DEL CAZADOR' : 'REGISTRO DE NUEVO CAZADOR'}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Conexión directa con la base de datos Supabase
          </p>
        </div>

        {/* Supabase Status Alert if not configured */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">warning</span>
            <div>
              <p className="font-bold">Variables de Supabase no detectadas</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Agrega <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">VITE_SUPABASE_URL</code> y <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</code> en tu proyecto de Vercel. Tus datos continúan seguros en modo LocalStorage mientras tanto.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-lg">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cazador@ejemplo.com"
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
              Contraseña Cuántica
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-lg">
                lock
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                <span>ACCEDIENDO AL SISTEMA...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>{isLogin ? 'INICIAR SESIÓN' : 'REGISTRARME EN EL SISTEMA'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isLogin ? (
            <span>
              ¿Aún no has despertado tus poderes?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setIsLogin(false);
                }}
                className="text-primary hover:underline font-bold"
              >
                Registrarse
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes una cuenta del Sistema?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setIsLogin(true);
                }}
                className="text-primary hover:underline font-bold"
              >
                Inicia Sesión
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
