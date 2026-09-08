import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { HunterAvatar } from '../components/avatars/HunterAvatar';
import { AVATAR_CATALOG } from '../components/avatars/avatarCatalog';

interface LandingPageProps {
  onAwaken: (hunterName: string, avatarId?: string) => void;
  onOpenAuth?: () => void;
  isSupabaseConfigured?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAwaken, onOpenAuth, isSupabaseConfigured = true }) => {
  const [name, setName] = useState('Sung Jin-Woo');
  const [selectedAvatarId, setSelectedAvatarId] = useState('monarch-shadow');
  const [clicked, setClicked] = useState(false);

  const handleStart = () => {
    sound.playAwakening();
    setClicked(true);
    setTimeout(() => {
      onAwaken(name.trim() || 'Sung Jin-Woo', selectedAvatarId);
    }, 1400);
  };

  const starterAvatars = AVATAR_CATALOG.slice(0, 6);

  return (
    <div className={`relative min-h-screen bg-[#0b0c10] flex items-center justify-center overflow-hidden transition-all duration-1000 py-10 ${clicked ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      {/* Background Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4d6aff 1.5px, transparent 1.5px)', backgroundSize: '45px 45px' }}
      />
      
      <div className="max-w-4xl px-6 md:px-8 flex flex-col items-center text-center z-10 space-y-6">
        {/* System Tag */}
        <span className="text-primary text-xs font-black tracking-[0.4em] uppercase py-1.5 px-5 border border-primary/40 rounded-full bg-primary/10 animate-pulse text-glow">
          [ NOTIFICACIÓN DEL SISTEMA DEL MONARCA ]
        </span>

        {/* Headline */}
        <h1 className="font-display text-white text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-2xl">
          EL MUNDO HA CAMBIADO.<br />
          <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent italic">
            AHORA TÚ PUEDES ASCENDER.
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg font-light italic max-w-2xl leading-relaxed">
          Has sido seleccionado como el único Jugador con el poder del Sistema. 
          Forja tu cuerpo, expande tu intelecto y sube de rango desde la nada.
        </p>

        {/* Selected Avatar Preview & Quick Selector */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-center">
            <HunterAvatar
              avatarId={selectedAvatarId}
              frameId="frame-c"
              size="2xl"
              showGlow
              animated
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Elige tu Avatar Inicial:
            </span>
            <div className="flex justify-center gap-2">
              {starterAvatars.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    sound.playBeep(520, 0.03);
                    setSelectedAvatarId(a.id);
                  }}
                  className={`p-1 rounded-full border transition-all ${
                    selectedAvatarId === a.id
                      ? 'border-primary scale-110 shadow-md shadow-primary/50'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  title={a.name}
                >
                  <HunterAvatar
                    avatarId={a.id}
                    frameId="frame-e"
                    size="sm"
                    showGlow={false}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hunter Name Input */}
        <div className="w-full max-w-xs space-y-1.5 pt-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left">
            Nombre del Cazador
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduce tu nombre..."
            className="w-full bg-surface-dark border border-border-dark focus:border-primary rounded-xl px-4 py-3 text-white text-sm text-center font-bold tracking-wider focus:outline-none transition-all shadow-inner font-mono"
          />
        </div>

        {/* Awaken & Supabase CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <button 
            onClick={handleStart}
            className="group relative flex-1 w-full min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-16 px-8 bg-gradient-to-r from-primary to-accent text-white gap-3 transition-all hover:scale-105 active:scale-95 system-glow shadow-2xl shadow-primary/30"
          >
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            <span className="text-base font-black tracking-[0.2em] uppercase font-mono">Despertar</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {onOpenAuth && (
            <button
              onClick={() => {
                sound.playBeep(580, 0.04);
                onOpenAuth();
              }}
              className="flex items-center justify-center gap-2 h-16 px-6 bg-[#121624] hover:bg-[#181d30] border border-primary/40 hover:border-primary rounded-2xl text-xs font-mono font-bold tracking-wider uppercase text-slate-200 hover:text-white transition-all shadow-lg shadow-black/50 w-full sm:w-auto"
              title="Iniciar sesión con tu cuenta de Supabase"
            >
              <span className="material-symbols-outlined text-primary text-xl">login</span>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

        {/* Neural connection indicator */}
        <div className="pt-4 flex flex-col items-center opacity-50">
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-slate-400">
            Protocolo de interfaz neuronal: SINCRONIZADO
          </p>
          <div className="w-48 h-0.5 bg-primary/30 mt-2 overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-progress" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 opacity-30 text-[10px] font-mono tracking-widest hidden md:block text-slate-400">
        SYS_STATUS: ONLINE<br />
        MONARCH_CORE: STABLE_V2.0
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
