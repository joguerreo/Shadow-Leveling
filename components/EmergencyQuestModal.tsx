import React, { useState, useEffect } from 'react';
import { Player, Quest, Rank } from '../types';
import { sound } from '../utils/sound';

interface EmergencyQuestModalProps {
  player: Player;
  onClose: () => void;
  onAccept: (quest: Quest) => void;
}

export const EmergencyQuestModal: React.FC<EmergencyQuestModalProps> = ({ player, onClose, onAccept }) => {
  const [loading, setLoading] = useState(true);
  const [questData, setQuestData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Play system warning sound
    sound.playWarning();
    sound.speakSystemVoice('¡Advertencia del Sistema! Se ha detectado una Puerta Roja de Emergencia. Incursión obligatoria.');

    const fetchEmergency = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ai/emergency-quest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hunterName: player.name,
            rank: player.rank,
            level: player.level,
          }),
        });

        const data = await res.json();
        const generated = data.emergencyQuest || data.quest;
        if (generated) {
          setQuestData(generated);
        } else {
          throw new Error('No data');
        }
      } catch (err) {
        console.error('Failed to generate emergency quest', err);
        setError('El enlace de maná falló, pero el Sistema ha impuesto la penalización de contingencia.');
        setQuestData({
          title: '¡PURGA DE EMERGENCIA: 100 FLEXIONES Y AGUA PURA!',
          description: 'Una grieta dimensional de fatiga ha bloqueado tus canales de maná. Restaura tu cuerpo antes de que expire el tiempo.',
          targetCount: 100,
          unit: 'reps',
          timeLimitMinutes: 30,
          xpReward: 1200,
          goldReward: 2500,
          essenceReward: 20,
          warningMessage: '¡LA NEGACIÓN ACEPTARÁ EL CASTIGO DE LA ZONA DE PENALIZACIÓN!',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmergency();
  }, [player]);

  const handleAccept = () => {
    if (!questData) return;

    sound.playLevelUp();
    const newQuest: Quest = {
      id: `emergency_${Date.now()}`,
      title: questData.title,
      description: questData.description,
      rank: Rank.S,
      category: 'discipline',
      isDaily: false,
      targetCount: Number(questData.targetCount) || 1,
      currentCount: 0,
      unit: questData.unit || 'completado',
      rewards: {
        xp: Number(questData.xpReward) || 1500,
        gold: Number(questData.goldReward) || 3000,
        essenceStones: Number(questData.essenceReward) || 25,
        statPoints: 1,
      },
      aiGenerated: true,
      systemMessage: questData.warningMessage || '¡MISIÓN DE EMERGENCIA ACTIVADA!',
      createdAt: new Date().toISOString(),
      completed: false,
    };

    onAccept(newQuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
      {/* Red Alert Backdrop */}
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md animate-pulse"></div>

      <div className="relative w-full max-w-lg bg-surface-dark border-2 border-red-600 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden my-8 animate-modal">
        {/* Warning Bar */}
        <div className="bg-red-600 text-white font-black text-xs py-1.5 px-4 uppercase tracking-widest text-center flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base animate-spin">warning</span>
          ¡ALERTA MÁXIMA DEL SISTEMA: INCURSIÓN DE PUERTA ROJA!
          <span className="material-symbols-outlined text-base animate-spin">warning</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-red-400 font-mono font-bold text-sm tracking-widest uppercase">
                Detectando distorsión en la Mazmorra...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider font-mono">
                    Rango S - Emergencia
                  </span>
                  <span className="text-red-400 font-mono text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    Límite: {questData?.timeLimitMinutes || 30} Minutos
                  </span>
                </div>

                <h3 className="text-white text-xl font-black italic uppercase font-display leading-tight">
                  {questData?.title}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {questData?.description}
                </p>
              </div>

              {/* Requirement Box */}
              <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-wider block">
                    Objetivo Obligatorio:
                  </span>
                  <span className="text-white font-bold font-mono text-base">
                    {questData?.targetCount} {questData?.unit}
                  </span>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Recompensas Épicas</span>
                  <span className="text-emerald-400 font-bold">+{questData?.xpReward} XP</span>
                  <span className="text-amber-400 font-bold ml-2">+{questData?.goldReward} G</span>
                </div>
              </div>

              {questData?.warningMessage && (
                <div className="p-3 bg-black/60 border border-red-600/40 rounded-xl text-red-400 text-xs font-mono font-bold italic flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-base">skull</span>
                  "{questData.warningMessage}"
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cerrar Alerta
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-2 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">swords</span>
                  ¡Aceptar Reto de Emergencia!
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyQuestModal;
