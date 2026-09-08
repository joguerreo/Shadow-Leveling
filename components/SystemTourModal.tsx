import React, { useState } from 'react';
import { sound } from '../utils/sound';

interface SystemTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TourStep {
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  description: string;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '¡DESPERTAR DEL CAZADOR!',
    subtitle: 'Bienvenido al Sistema de Nivelación en las Sombras',
    icon: 'military_tech',
    badge: 'FASE 1: INICIACIÓN',
    description: 'Has sido seleccionado por el Sistema como un Jugador. Al igual que Sung Jin-Woo, tu progreso ya no tiene límites. Cada hábito, tarea y entrenamiento de tu vida real se traduce en estadísticas, nivel y recompensas.',
    tips: [
      'Ganas EXP y Oro completando tus misiones de vida real.',
      'Sube de nivel para ganar puntos de atributos no asignados.',
      'Tu Rango (E ➔ D ➔ C ➔ B ➔ A ➔ S ➔ Monarca) escala con tu disciplina.',
    ],
  },
  {
    title: 'MISIONES DIARIAS & HÁBITOS',
    subtitle: 'El Protocolo de Supervivencia Cotidiano',
    icon: 'task_alt',
    badge: 'FASE 2: MISIONES',
    description: 'En el panel principal encontrarás tus Misiones Diarias y Hábitos. Tienes misiones de Fuerza (ejercicio), Intelecto (estudio/lectura), Disciplina y Mente. Además, puedes presionar "Misión del Sistema" para que el Oráculo IA te formule una prueba según tus necesidades.',
    tips: [
      'Marca el progreso con los botones "+" y "✓".',
      'Mantén tu racha activa para multiplicar recompensas.',
      '¡Cuidado con ignorar tus misiones! El Sistema puede activar el Modo Penalización si fallas.',
    ],
  },
  {
    title: 'ASIGNACIÓN DE ATRIBUTOS & PODER',
    subtitle: 'Construye tu Estilo de Combate',
    icon: 'monitoring',
    badge: 'FASE 3: ESTADÍSTICAS',
    description: 'Cada nivel que asciendas te otorga Puntos de Atributo. Puedes invertirlos libremente en Fuerza (STR), Agilidad (AGI), Inteligencia (INT), Vitalidad (VIT) y Percepción (PER) para aumentar tu Poder de Combate (CP).',
    tips: [
      'STR aumenta tu capacidad física y carga.',
      'INT incrementa tu Maná máximo (MP) para invocar Sombras y habilidades.',
      'VIT fortalece tu resistencia y recuperación.',
    ],
  },
  {
    title: 'MAZMORRAS & FOCUS POMODORO',
    subtitle: 'Entra a los Portales de Concentración',
    icon: 'hourglass_top',
    badge: 'FASE 4: PORTALES',
    description: 'La sección de Mazmorras te permite entrar a portales de concentración profunda cronometrada (Pomodoro cuántico). Elige un rango (Rango E hasta Rango S) y enfócate sin distracciones para conquistar el portal y reclamar gemas de esencia.',
    tips: [
      'Completa los ciclos de enfoque para derrotar al jefe del portal.',
      'Si sales antes de tiempo, el portal colapsará.',
      'Puedes crear tus propias mazmorras para proyectos largos.',
    ],
  },
  {
    title: 'MERCADO, EJÉRCITO & PERSISTENCIA',
    subtitle: 'Sincronización en la Nube y Equipamiento',
    icon: 'groups',
    badge: 'FASE 5: DOMINIO',
    description: 'Visita el Mercado para canjear tu oro por pociones, armas y títulos. Extrae sombras en el Ejército de Sombras para enviarlas a expediciones pasivas. Y en la barra superior, pulsa "LOGIN" para vincular tu cuenta con Supabase.',
    tips: [
      'Tu progreso se guarda automáticamente en tu navegador (LocalStorage).',
      'Conecta tu cuenta de Supabase en el botón superior para sincronizar entre dispositivos.',
      '¡Levántate, Cazador! Tu ascenso comienza ahora.',
    ],
  },
];

export const SystemTourModal: React.FC<SystemTourModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    sound.playBeep(620, 0.04);
    if (isLast) {
      sound.playLevelUp();
      onComplete();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playBeep(450, 0.04);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div
        key={currentStep}
        className="relative w-full max-w-lg bg-[#0d0f18] border-2 border-primary/50 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-white animate-scaleIn"
      >
        {/* Neon Top Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />

        {/* Close / Skip button */}
        <button
          onClick={() => {
            sound.playBeep(400, 0.03);
            onComplete();
            onClose();
          }}
          className="absolute top-4 right-4 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          SALTAR GUÍA
        </button>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 mb-5">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-primary shadow-sm shadow-primary'
                  : idx < currentStep
                  ? 'w-3 bg-primary/40'
                  : 'w-3 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Badge & Icon Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="size-11 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">{step.icon}</span>
          </div>
          <div>
            <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-[9px] font-mono font-black text-primary uppercase tracking-widest">
              {step.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-glow font-display mt-0.5">
              {step.title}
            </h3>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400 mb-3">
          {step.subtitle}
        </p>

        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Tips Box */}
        <div className="bg-surface-dark border border-white/5 rounded-xl p-3.5 mb-6 space-y-2">
          <div className="text-[10px] font-mono font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">tips_and_updates</span>
            DIRECTIVAS DEL SISTEMA:
          </div>
          {step.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-primary font-bold">›</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Anterior
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            <span>{isLast ? '¡DESPERTAR AHORA!' : 'SIGUIENTE'}</span>
            <span className="material-symbols-outlined text-sm">
              {isLast ? 'bolt' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default SystemTourModal;

