import React, { useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/sound';

interface OracleEvaluationModalProps {
  player: Player;
  onClose: () => void;
}

const OracleEvaluationModal: React.FC<OracleEvaluationModalProps> = ({ player, onClose }) => {
  const [weakness, setWeakness] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [oracleAdvice, setOracleAdvice] = useState<string | null>(null);

  const handleConsultOracle = async () => {
    setIsAnalyzing(true);
    sound.playBeep(700, 0.1, 'sawtooth');

    try {
      const res = await fetch('/api/ai/oracle-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerStats: {
            level: player.level,
            rank: player.rank,
            str: player.attributes.str.value,
            agi: player.attributes.agi.value,
            int: player.attributes.int.value,
            vit: player.attributes.vit.value,
            wis: player.attributes.wis.value,
          },
          currentStreak: player.streakDays,
          topWeakness: weakness.trim() || 'Falta de enfoque en las misiones matutinas',
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setOracleAdvice(data.advice);
        sound.playLevelUp();
        sound.speakSystemVoice('Evaluación de estado del Sistema completada.');
      }
    } catch (e) {
      setOracleAdvice(
        'El Sistema ha evaluado tus parámetros. Tu Fuerza y Voluntad son tu mayor activo; enfócate en cumplir tu protocolo de hábitos sin desviarte.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-dark border-2 border-indigo-500/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 animate-modal flex flex-col max-h-[92dvh] sm:max-h-[88vh] system-glow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/80 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-indigo-950 border border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0">
              <span className="material-symbols-outlined text-2xl animate-pulse">psychology</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-white text-base sm:text-lg font-black uppercase italic font-display truncate">
                Oráculo del Sistema (IA)
              </h3>
              <p className="text-slate-400 text-xs truncate">Evaluación táctica de tus hábitos y debilidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain touch-pan-y">
          {!oracleAdvice ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 tracking-wider mb-2">
                  ¿Qué obstáculo o debilidad estás enfrentando actualmente?
                </label>
                <textarea
                  value={weakness}
                  onChange={(e) => setWeakness(e.target.value)}
                  placeholder="ej: Me cuesta levantarme temprano, pierdo el enfoque estudiando, pospongo el entrenamiento..."
                  rows={3}
                  className="w-full bg-surface-card border border-white/10 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 transition-all resize-none"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1 text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Rango Actual:</span>
                  <span className="text-white font-bold">{player.rank} (Nv. {player.level})</span>
                </div>
                <div className="flex justify-between">
                  <span>Racha Registrada:</span>
                  <span className="text-yellow-400 font-bold">{player.streakDays} Días</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConsultOracle}
                disabled={isAnalyzing}
                className={`w-full min-h-[44px] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isAnalyzing
                    ? 'bg-indigo-700/50 text-white cursor-wait animate-pulse'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-primary hover:opacity-90 text-white shadow-indigo-600/40 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isAnalyzing ? 'progress_activity' : 'smart_toy'}
                </span>
                {isAnalyzing ? 'El Oráculo está procesando tu estado...' : 'Consultar Diagnóstico del Sistema'}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono font-black uppercase text-indigo-400 px-2 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30">
                  Respuesta del Sistema
                </span>
                <p className="text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-line font-mono">
                  {oracleAdvice}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOracleAdvice(null)}
                  className="flex-1 min-h-[44px] py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Nueva Consulta
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 min-h-[44px] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OracleEvaluationModal;
