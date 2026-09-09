import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured, supabaseUrl } from '../utils/supabase';
import { loginWithGoogle } from '../utils/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, allowClose = true }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
          setSuccessMsg('¡Registro completado! Si tu proyecto tiene confirmación de email activada, revisa tu correo o inicia sesión.');
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

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    sound.playBeep(580, 0.05);
    try {
      const fbUser = await loginWithGoogle();
      if (fbUser) {
        sound.playAwakening();
        onSuccess({
          id: fbUser.uid,
          email: fbUser.email,
          user_metadata: { name: fbUser.displayName },
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error con Google Sign-In');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = () => {
    sound.playAwakening();
    onSuccess({
      id: 'hunter_local_player',
      email: 'cazador.local@monarca.shadow',
      user_metadata: { name: 'Cazador Despierto' },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0d0f18] border border-primary/40 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden text-white animate-scaleIn my-auto">
        {/* Top glow ornament */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

        {/* Close button with high visibility on mobile */}
        {allowClose && (
          <button
            onClick={() => {
              sound.playBeep(420, 0.04);
              onClose();
            }}
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all z-20"
            title="Cerrar modal"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/20 border border-primary/50 text-primary mb-2.5 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">fingerprint</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider font-mono text-glow">
            {isLogin ? 'AUTENTICACIÓN DEL CAZADOR' : 'REGISTRO DE NUEVO CAZADOR'}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Conexión con el Sistema Central de Cazadores
          </p>
        </div>

        {/* Supabase Status Alert if not configured */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
            <div>
              <p className="font-bold">Modo de Respaldo Local Activo</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Tus datos de cazador se guardan en tu dispositivo. Puedes iniciar con tu cuenta de Google o continuar como Cazador Local con 1 toque.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
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
                className="w-full bg-black/40 border border-white/10 focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
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

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-[#0d0f18] px-2 text-slate-500">Otras vías de acceso</span>
          </div>
        </div>

        {/* Alternate Auth Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="min-h-[44px] py-2 px-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all text-slate-200"
          >
            <span className="material-symbols-outlined text-base text-red-400">account_circle</span>
            <span>{googleLoading ? 'Conectando...' : 'Google Auth'}</span>
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="min-h-[44px] py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all text-indigo-300"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Modo Local</span>
          </button>
        </div>

        {/* Toggle Login / Register */}
        <div className="mt-4 text-center text-xs text-slate-400">
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
                className="text-primary hover:underline font-bold ml-1"
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
                className="text-primary hover:underline font-bold ml-1"
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
