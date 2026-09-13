import React, { useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/sound';

interface HunterProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<Player>) => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  currentUser?: { displayName?: string | null; email?: string | null; id?: string } | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onResetSystem?: () => void;
}

export const HunterProfileModal: React.FC<HunterProfileModalProps> = ({
  player,
  onClose,
  onUpdateProfile,
  onManualSync,
  isSyncing = false,
  currentUser,
  onOpenAuth,
  onLogout,
  onResetSystem,
}) => {
  const [name, setName] = useState<string>(player.name || '');
  const [personalMotto, setPersonalMotto] = useState<string>(
    player.personalMotto || 'La disciplina es el puente entre las metas y el logro.'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(player.soundEnabled !== false);
  const [voiceVoiceTestActive, setVoiceTestActive] = useState<boolean>(false);
  const [resetHour, setResetHour] = useState<number>(player.resetHour ?? 0);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleSave = () => {
    sound.playBeep(640, 0.05);
    sound.enabled = soundEnabled;
    onUpdateProfile({
      name: name.trim() || player.name,
      personalMotto: personalMotto.trim(),
      soundEnabled,
      resetHour,
    });
    onClose();
  };

  const handleTestVoice = () => {
    sound.playBeep(520, 0.04);
    setVoiceTestActive(true);
    sound.speakMotivation(
      personalMotto.trim() || 'Constancia y enfoque absoluto en cada objetivo diario.'
    );
    setTimeout(() => setVoiceTestActive(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#080c16] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.85)] text-slate-100 my-auto">
        {/* Header: Credencial del Sistema */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#0b1220]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                Credencial de Disciplina
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Identidad, Configuración y Estado del Sistema
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBeep(400, 0.03);
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh] scrollbar-none font-sans text-xs">
          {/* SECTION 1: IDENTIDAD & MANDATO */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm text-cyan-400">fingerprint</span>
              <span>Identidad & Principios</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 block">
                Nombre / Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Tu nombre o identificador..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d1527] border border-[#1e2b45] focus:border-cyan-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">
                  Mandato Personal (Motto)
                </label>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={!soundEnabled || voiceVoiceTestActive}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-40"
                  title="Escuchar locución del mandato"
                >
                  <span className="material-symbols-outlined text-xs">volume_up</span>
                  <span>{voiceVoiceTestActive ? 'Reproduciendo...' : 'Probar Voz'}</span>
                </button>
              </div>
              <textarea
                value={personalMotto}
                onChange={(e) => setPersonalMotto(e.target.value)}
                rows={2}
                maxLength={140}
                placeholder="El principio o recordatorio que guía tus acciones..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d1527] border border-[#1e2b45] focus:border-cyan-400 text-white placeholder-slate-500 text-xs focus:outline-none transition-colors resize-none"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Este mandato es utilizado en las locuciones de voz motivacionales al iniciar tus ciclos.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* SECTION 2: CONFIGURACIÓN DEL SISTEMA */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm text-cyan-400">tune</span>
              <span>Preferencias del Sistema</span>
            </div>

            {/* Toggle Audio & Voces */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d1527] border border-[#1e2b45]">
              <div className="space-y-0.5 pr-3">
                <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-cyan-400">graphic_eq</span>
                  <span>Audio & Síntesis de Voz</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Efectos acústicos binaurales y recordatorios por voz del Sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(soundEnabled ? 400 : 600, 0.03);
                  setSoundEnabled(!soundEnabled);
                }}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                  soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
                aria-label="Alternar audio"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* Hora de Reinicio Diario */}
            <div className="p-3 rounded-lg bg-[#0d1527] border border-[#1e2b45] space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-cyan-400">schedule</span>
                    <span>Hora de Reinicio Diario</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Momento en que tus objetivos y ciclo diario se renuevan.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#070b14] border border-[#1e2b45] text-cyan-400 font-mono text-[11px] font-bold">
                  {String(resetHour).padStart(2, '0')}:00 hrs
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={resetHour}
                onChange={(e) => setResetHour(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>00:00 (Medianoche)</span>
                <span>06:00 (Amanecer)</span>
                <span>12:00 (Mediodía)</span>
                <span>23:00</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* SECTION 3: CUENTA Y SINCRONIZACIÓN */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm text-cyan-400">cloud_sync</span>
              <span>Sincronización & Almacenamiento</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1527] border border-[#1e2b45] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentUser ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
                      }`}
                    />
                    <span>{currentUser ? 'Cuenta Conectada' : 'Modo Local (Offline)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentUser?.email ? currentUser.email : 'Datos guardados únicamente en este navegador.'}
                  </p>
                </div>

                {currentUser ? (
                  onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBeep(450, 0.04);
                        onLogout();
                      }}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  )
                ) : (
                  onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBeep(560, 0.04);
                        onOpenAuth();
                      }}
                      className="px-3 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-medium transition-colors"
                    >
                      Conectar Nube
                    </button>
                  )
                )}
              </div>

              {currentUser && onManualSync && (
                <button
                  type="button"
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="w-full py-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-[11px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-sm text-cyan-400 ${
                      isSyncing ? 'animate-spin' : ''
                    }`}
                  >
                    sync
                  </span>
                  <span>{isSyncing ? 'Sincronizando estado...' : 'Forzar Sincronización Ahora'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Restablecimiento del Sistema */}
          {onResetSystem && (
            <div className="pt-1">
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[10px] text-slate-500 hover:text-red-400 font-mono transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  <span>Restablecer sistema y datos locales</span>
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 space-y-2">
                  <p className="text-[11px] text-red-300">
                    ¿Confirmas restablecer todos tus datos locales a los valores iniciales?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBeep(300, 0.1);
                        onResetSystem();
                        onClose();
                      }}
                      className="px-3 py-1 bg-red-500/30 hover:bg-red-500/40 border border-red-400/40 text-red-200 text-[10px] rounded font-medium transition-colors"
                    >
                      Sí, restablecer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 bg-white/5 text-slate-400 hover:text-white text-[10px] rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-white/5 bg-[#0b1220]/80 flex justify-end items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HunterProfileModal;
