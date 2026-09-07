import React, { useState } from 'react';
import { Rank, Dungeon } from '../types';

interface CreateDungeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDungeon: (dungeon: Omit<Dungeon, 'id' | 'completed'>) => void;
}

const CreateDungeonModal: React.FC<CreateDungeonModalProps> = ({ isOpen, onClose, onAddDungeon }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rank, setRank] = useState<Rank>(Rank.B);
  const [type, setType] = useState<'focus_timer' | 'fitness_raid' | 'study_trial'>('focus_timer');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let icon = 'hourglass_top';
    if (type === 'fitness_raid') icon = 'fitness_center';
    if (type === 'study_trial') icon = 'psychology';

    const xpBase = durationMinutes * 15;
    const goldBase = durationMinutes * 10;
    const essenceBase = Math.floor(durationMinutes / 3);

    onAddDungeon({
      title: title.trim(),
      description: description.trim() || 'Incursión generada por el cazador para forjar maestría.',
      rank,
      icon,
      type,
      durationMinutes: Number(durationMinutes) || 25,
      tasks: type === 'fitness_raid' ? [
        { id: 'ct_1', title: 'Repeticiones principales', target: 50, current: 0, unit: 'reps', completed: false },
        { id: 'ct_2', title: 'Ejercicios accesorios', target: 30, current: 0, unit: 'reps', completed: false },
      ] : undefined,
      rewards: {
        xp: xpBase,
        gold: goldBase,
        essenceStones: essenceBase,
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-surface-dark border border-primary/40 rounded-2xl shadow-2xl overflow-hidden animate-modal">
        <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-transparent p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">door_front</span>
            <div>
              <h3 className="text-white text-lg font-black uppercase italic tracking-tight">
                Abrir Portal de Mazmorra
              </h3>
              <p className="text-slate-400 text-xs font-medium">Configura una nueva incursión de alta intensidad</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Nombre de la Mazmorra / Incursión
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cripta de Arquitectura de Software, Raid de Cardio HIIT..."
              className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Reglas de Combate / Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Establece los criterios de victoria..."
              rows={2}
              className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Tipo de Incursión
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'focus_timer', label: 'Deep Work (Pomodoro)', icon: 'hourglass_top' },
                { id: 'fitness_raid', label: 'Entrenamiento Físico', icon: 'fitness_center' },
                { id: 'study_trial', label: 'Estudio / Lectura', icon: 'psychology' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    type === t.id
                      ? 'bg-primary/20 border-primary text-white shadow-sm'
                      : 'border-border-dark text-slate-400 hover:border-slate-600 bg-white/[0.02]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg text-primary">{t.icon}</span>
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Duración (Minutos)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(5, parseInt(e.target.value) || 25))}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Rango
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as Rank)}
                className="w-full bg-bg-dark border border-border-dark rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
              >
                <option value={Rank.E}>E-Rank (Ligero)</option>
                <option value={Rank.D}>D-Rank (Intermedio)</option>
                <option value={Rank.C}>C-Rank (Estándar)</option>
                <option value={Rank.B}>B-Rank (Desafiante)</option>
                <option value={Rank.A}>A-Rank (Élite)</option>
                <option value={Rank.S}>S-Rank (Extremo)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-border-dark text-slate-400 font-bold uppercase text-xs rounded-xl hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded-xl system-glow hover:bg-accent transition-all"
            >
              Invocar Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDungeonModal;
