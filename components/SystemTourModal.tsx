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
    title: '¡BIENVENIDO AL SISTEMA!',
    subtitle: 'Tu Centro de Evolución Personal y Hábitos',
    icon: 'military_tech',
    badge: 'FASE 1: INICIACIÓN',
    description: 'Este es tu entorno de desarrollo y consistencia. Cada hábito, objetivo diario y sesión de concentración de tu vida real se traduce en progreso real, nivel de disciplina y métricas cuantificables.',
    tips: [
      'Ganas experiencia (XP) y puntos de disciplina al cumplir tus compromisos diarios.',
      'Sube de nivel para ganar puntos de atributos y desbloquear mayor temple personal.',
      'Tu nivel de disciplina y energía aumentan directamente con tu consistencia.',
    ],
  },
  {
    title: 'OBJETIVOS DIARIOS',
    subtitle: 'Consistencia y Cumplimiento Cotidiano',
    icon: 'task_alt',
    badge: 'FASE 2: OBJETIVOS',
    description: 'En el Hub principal visualizas tus Objetivos Diarios en vista Espacial 3D, Cuadrícula de Orbes o Lista Clásica. Toca o mantén presionado un objetivo para registrar su cumplimiento y avanzar en tu barra de progreso diario.',
    tips: [
      'Filtra rápidamente entre Todos, Pendientes o Completados.',
      'Usa el botón "+ Nuevo" en la cabecera para incorporar nuevas metas.',
      'Mantén tu racha diaria activa para consolidar hábitos sólidos.',
    ],
  },
  {
    title: 'COMPROMISOS INNEGOCIABLES',
    subtitle: 'Líneas Rojas y Reglas de Conducta',
    icon: 'verified_user',
    badge: 'FASE 3: COMPROMISOS',
    description: 'Los Compromisos representan tus líneas rojas (cero alcohol, cero desvelo, cero ultraprocesados, cero distracciones digitales). Cada compromiso cuenta con un contador de días limpios e impacto directo en tu barra de energía y salud.',
    tips: [
      'Si tienes un desliz, regístralo honestamente: el sistema te recordará tu pacto con voz reflexiva.',
      'Si estás enfermo o en un viaje justificado, solicita una Tregua Temporal para proteger tu racha.',
      'Añade tus propios compromisos personalizados según tus estándares de vida.',
    ],
  },
  {
    title: 'ENFOQUE & CADENCIA',
    subtitle: 'Sesiones de Concentración y Respiración Cuadrada',
    icon: 'timer',
    badge: 'FASE 4: ENFOQUE',
    description: 'Accede al modo Enfoque con temporizador personalizable, orbe de cadencia visual 3D guiada por el protocolo de respiración de 16 segundos (Inhala, Sostén, Exhala, Pausa) y paisajes sonoros ambientales relajantes (Lluvia, Bosque, Ruido Blanco).',
    tips: [
      'Configura bloques de 15, 25, 45 o 60 minutos según tu sesión.',
      'Elige el audio ambiental que mejor te sumerja en estado de flujo profundo.',
      'Utiliza la respiración sincronizada para calmar la ansiedad y afilar la concentración.',
    ],
  },
  {
    title: 'MENÚ ESTRELLA & ANALÍTICA',
    subtitle: 'Navegación Rápida y Auditoría de Resultados',
    icon: 'insights',
    badge: 'FASE 5: DOMINIO',
    description: 'El botón central con forma de estrella en la barra inferior despliega de forma radial el acceso directo a tus Objetivos, Competencias, Compromisos, Sesiones de Enfoque y tu nueva pantalla de Analítica Integral con trazabilidad de deslices.',
    tips: [
      'En Analítica consulta tu tasa de cumplimiento, deslices por compromiso y diagnóstico.',
      'Sincroniza tus datos de forma local o en la nube para mantener tu historial seguro.',
      'Tu viaje hacia el dominio de tus hábitos comienza ahora.',
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
            <span>{isLast ? '¡COMENZAR AHORA!' : 'SIGUIENTE'}</span>
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

