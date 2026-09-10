import React, { useState } from 'react';
import { sound } from '../utils/sound';

interface TruceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTruceActive: boolean;
  truceExpiresAt?: string;
  truceReason?: string;
  onActivateTruce: (hours: number, reason: string) => void;
  onDeactivateTruce: () => void;
}

const PRESET_REASONS = [
  { icon: 'coronavirus', label: 'Enfermedad / Malestar físico (Reposo)' },
  { icon: 'flight_takeoff', label: 'Viaje extenuante o fuerza mayor' },
  { icon: 'bedtime', label: 'Sobrecarga mental / Descanso biológico' },
  { icon: 'healing', label: 'Recuperación muscular / Lesión' },
];

export const TruceModal: React.FC<TruceModalProps> = ({
  isOpen,
  onClose,
  isTruceActive,
  truceExpiresAt,
  truceReason,
  onActivateTruce,
  onDeactivateTruce,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0].label);
  const [customReason, setCustomReason] = useState<string>('');
  const [durationHours, setDurationHours] = useState<number>(24);

  if (!isOpen) return null;

  const handleActivate = () => {
    const finalReason = customReason.trim() || selectedReason;
    sound.playAwakening();
    onActivateTruce(durationHours, finalReason);
    onClose();
  };

  const handleDeactivate = () => {
    sound.playBeep(440, 0.08);
    onDeactivateTruce();
    onClose();
  };

  // Remaining time calculation if active
  let timeLeftString = '';
  if (isTruceActive && truceExpiresAt) {
    const remainingMs = new Date(truceExpiresAt).getTime() - Date.now();
    if (remainingMs > 0) {
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      timeLeftString = `${hours}h ${mins}m restantes`;
    } else {
      timeLeftString = 'Expirando hoy';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d0f17] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                [ PROTOCOLO DE PRESERVACIÓN ]
              </span>
              <h3 className="text-white text-lg font-black tracking-wide font-display">
                Escudo de Tregua del Monarca
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playBeep(400, 0.04);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isTruceActive ? (
          /* Active Truce State */
          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full bg-amber-400 animate-ping" />
                  ESCUDO ACTIVO
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {timeLeftString}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white">Motivo:</strong> {truceReason || 'Reposo justificado'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Tus rachas de misiones y tus puntos de salud (HP) están protegidos. El Sistema no aplicará penalizaciones durante este periodo.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDeactivate}
                className="flex-1 py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Desactivar Escudo Ahora
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-surface-dark border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs uppercase transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Form to Activate Truce */
          <div className="space-y-4 relative z-10">
            <p className="text-xs text-slate-300 leading-relaxed">
              El Sistema comprende que los humanos requieren regeneración biológica. Si estás atravesando una enfermedad, lesión o viaje de fuerza mayor, activa el <strong>Escudo de Tregua</strong> para evitar la pérdida injusta de rachas y puntos de salud.
            </p>

            {/* Reasons selector */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Selecciona la causa del reposo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_REASONS.map((p) => {
                  const isSelected = selectedReason === p.label && !customReason;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setSelectedReason(p.label);
                        setCustomReason('');
                        sound.playBeep(480, 0.03);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-surface-dark/60 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base shrink-0 text-amber-400">
                        {p.icon}
                      </span>
                      <span className="text-[11px] font-medium leading-snug">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                O escribe un motivo personalizado:
              </label>
              <input
                type="text"
                placeholder="Ej. Cita médica, guardia laboral de 24h..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-[#131622] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Duración del Escudo:
              </label>
              <div className="flex items-center gap-3">
                {[
                  { hours: 24, label: '24 Horas (1 Día)' },
                  { hours: 48, label: '48 Horas (2 Días)' },
                ].map((d) => (
                  <button
                    key={d.hours}
                    type="button"
                    onClick={() => {
                      setDurationHours(d.hours);
                      sound.playBeep(520, 0.03);
                    }}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                      durationHours === d.hours
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-surface-dark border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleActivate}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">security</span>
                Desplegar Escudo de Tregua
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-surface-dark border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs uppercase transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruceModal;
