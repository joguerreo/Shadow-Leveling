import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { HunterAvatar } from '../components/avatars/HunterAvatar';
import { AVATAR_CATALOG } from '../components/avatars/avatarCatalog';

interface LandingPageProps {
  onAwaken: (hunterName: string, avatarId?: string) => void;
  onOpenAuth?: () => void;
  onFastLocalLogin?: (hunterName: string, avatarId?: string) => void;
  isSupabaseConfigured?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onAwaken, 
  onOpenAuth, 
  onFastLocalLogin,
  isSupabaseConfigured = true 
}) => {
  const [name, setName] = useState('Operador Alfa');
  const [selectedAvatarId, setSelectedAvatarId] = useState('monarch-shadow');
  const [clicked, setClicked] = useState(false);

  const handleStartLocal = () => {
    sound.playAwakening();
    setClicked(true);
    setTimeout(() => {
      if (onFastLocalLogin) {
        onFastLocalLogin(name.trim() || 'Operador Alfa', selectedAvatarId);
      } else {
        onAwaken(name.trim() || 'Operador Alfa', selectedAvatarId);
      }
    }, 600);
  };

  const handleOpenAuth = () => {
    sound.playBeep(580, 0.04);
    if (onOpenAuth) onOpenAuth();
  };

  const starterAvatars = AVATAR_CATALOG.slice(0, 6);

  return (
    <div className={`relative min-h-screen bg-[#070b14] flex items-center justify-center overflow-hidden transition-all duration-700 py-10 ${clicked ? 'opacity-0 scale-105' : 'opacity-100'}`}>
      {/* Background Subtle Spatial Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #00f0ff 1px, transparent 1px)', backgroundSize: '36px 36px' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/50 via-transparent to-[#070b14] pointer-events-none" />
      
      <div className="max-w-3xl px-6 md:px-8 flex flex-col items-center text-center z-10 space-y-6">
        {/* System Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SISTEMA DE CONTROL Y HÁBITOS // TERMINAL ACTIVA</span>
        </div>

        {/* Minimalist Tech Headline */}
        <div className="space-y-2">
          <h1 className="font-sans text-white text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-xl">
            SISTEMA DE DISCIPLINA<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Y ALTO RENDIMIENTO
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base font-sans max-w-xl mx-auto leading-relaxed">
            Plataforma biométrica para dominar tus objetivos diarios, forjar compromisos inquebrantables y medir tu enfoque con orbes 3D en tiempo real.
          </p>
        </div>

        {/* Identity Icon / Selected Avatar Preview */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-center">
            <div className="p-1.5 rounded-full bg-[#0c1322] border border-cyan-500/30 shadow-xl shadow-cyan-950/40">
              <HunterAvatar
                avatarId={selectedAvatarId}
                frameId="frame-c"
                size="xl"
                showGlow
                animated
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
              Elige tu Insignia de Identidad:
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
                      ? 'border-cyan-400 scale-110 shadow-md shadow-cyan-500/40 bg-cyan-950/40'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-slate-500'
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

        {/* Operator Name Input */}
        <div className="w-full max-w-xs space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block text-left">
            Nombre / Identificador de Usuario
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduce tu alias o nombre..."
            className="w-full bg-[#0c1322] border border-[#1c2a45] focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white text-sm text-center font-bold tracking-wide focus:outline-none transition-all shadow-inner font-mono placeholder:text-slate-600"
          />
        </div>

        {/* Auth Buttons */}
        <div className="pt-2 flex flex-col items-center gap-2.5 w-full max-w-sm">
          {/* Primary Login Button */}
          <button 
            type="button"
            onClick={handleOpenAuth}
            className="w-full cursor-pointer flex items-center justify-center rounded-xl h-13 px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-sm tracking-wider uppercase gap-2 transition-all hover:scale-[1.02] active:scale-98 shadow-lg shadow-cyan-950/50 border border-cyan-300/30"
          >
            <span className="material-symbols-outlined text-xl">login</span>
            <span>Iniciar Sesión / Nube</span>
          </button>

          {/* Quick Local Access Button */}
          <button
            type="button"
            onClick={handleStartLocal}
            className="w-full flex items-center justify-center gap-2 h-11 px-5 bg-[#0c1322] hover:bg-[#121a2d] border border-[#1c2a45] hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-300 hover:text-white transition-all shadow-md active:scale-98"
            title="Entrar sin cuenta usando almacenamiento local offline"
          >
            <span className="material-symbols-outlined text-cyan-400 text-base">fingerprint</span>
            <span>Acceso Rápido Local (Offline)</span>
          </button>
        </div>

        {/* Status indicator */}
        <div className="pt-1 flex flex-col items-center opacity-60">
          <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500">
            Sincronización de progreso y almacenamiento seguro
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-6 opacity-30 text-[10px] font-mono tracking-widest hidden md:block text-slate-500">
        SYS_VER: 3.8.0 // 3D_SPATIAL_ORBS
      </div>
    </div>
  );
};

export default LandingPage;
