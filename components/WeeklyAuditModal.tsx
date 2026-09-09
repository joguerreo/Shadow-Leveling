import React, { useState, useEffect } from 'react';
import { Player, WeeklyAuditReport } from '../types';
import { sound } from '../utils/sound';

interface WeeklyAuditModalProps {
  player: Player;
  onClose: () => void;
  onSaveAudit?: (report: WeeklyAuditReport) => void;
}

export const WeeklyAuditModal: React.FC<WeeklyAuditModalProps> = ({ player, onClose, onSaveAudit }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<WeeklyAuditReport | null>(player.latestAudit || null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // If no recent audit or requesting new one
    const fetchAudit = async () => {
      try {
        setLoading(true);
        sound.playBeep(520, 0.08);

        const res = await fetch('/api/ai/weekly-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hunterName: player.name,
            rank: player.rank,
            level: player.level,
            streakDays: player.streakDays,
            attributes: player.attributes,
            questsCompletedCount: player.activityHistory?.reduce((acc, d) => acc + d.questsCompleted, 0) || 12,
            totalXp: player.xp,
          }),
        });

        const data = await res.json();
        if (data.report) {
          const generatedReport: WeeklyAuditReport = {
            id: `audit_${Date.now()}`,
            date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
            hunterRating: data.report.hunterRating || 'S',
            consistencyScore: data.report.consistencyScore || 85,
            dominantStat: data.report.dominantStat || 'Fuerza Física',
            laggingStat: data.report.laggingStat || 'Enfoque Mental',
            completedQuestsCount: 14,
            totalXpGained: player.xp,
            aiDiagnosticTitle: data.report.aiDiagnosticTitle || 'DICTAMEN DEL SISTEMA: EVOLUCIÓN CONSTANTE',
            aiAnalysis: data.report.aiAnalysis || 'El cazador mantiene una trayectoria ascendente en su dominio del maná.',
            aiRecommendations: data.report.aiRecommendations || [
              'No descuides la hidratación y el sueño.',
              'Incrementa la lectura para balancear Intelecto.',
            ],
            recommendedFocusCategory: data.report.recommendedFocusCategory || 'discipline',
            hunterAssociationSeal: data.report.hunterAssociationSeal || 'SELLO OFICIAL DE AUDITORÍA',
          };

          setReport(generatedReport);
          onSaveAudit?.(generatedReport);
          sound.playLevelUp();
        }
      } catch (err) {
        console.warn('Weekly audit backend route unreachable, creating client-side evaluation', err);
        const fallbackAudit: WeeklyAuditReport = {
          id: `audit_${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
          hunterRating: player.streakDays > 5 ? 'S' : 'A',
          consistencyScore: Math.min(100, 70 + (player.streakDays || 1) * 4),
          dominantStat: 'Tenacidad & Disciplina',
          laggingStat: 'Claridad Mental y Recuperación',
          completedQuestsCount: player.activityHistory?.reduce((acc, d) => acc + d.questsCompleted, 0) || 12,
          totalXpGained: player.xp,
          aiDiagnosticTitle: 'DICTAMEN DEL SISTEMA: DESPERTAR CONTINUO',
          aiAnalysis: `El cazador ${player.name} mantiene una trayectoria ascendente con una racha activa de ${player.streakDays} días. Tu núcleo de maná se estabiliza. Continúa ejecutando tus protocolos diarios para consolidar tu rango de Monarca.`,
          aiRecommendations: [
            'Incrementa los bloques de foco profundo para balancear INT y WIS.',
            'Mantén la hidratación matutina antes de cualquier incursión física.',
            'Conquista una mazmorra de concentración cada 48 horas.',
          ],
          recommendedFocusCategory: 'discipline',
          hunterAssociationSeal: 'CERTIFICACIÓN OFICIAL DE LA ASOCIACIÓN DE CAZADORES',
        };
        setReport(fallbackAudit);
        onSaveAudit?.(fallbackAudit);
        sound.playLevelUp();
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [player]);

  const handleReadVoice = () => {
    if (!report) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    sound.speakSystemVoice(
      `Informe oficial de la Asociación de Cazadores para ${player.name}. Calificación: Rango ${report.hunterRating}. Puntaje de consistencia: ${report.consistencyScore} por ciento. ${report.aiAnalysis}`
    );
  };

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'SSS':
      case 'SS':
        return 'text-amber-400 border-amber-500/50 bg-amber-500/20';
      case 'S':
        return 'text-rose-400 border-rose-500/50 bg-rose-500/20';
      case 'A':
        return 'text-purple-400 border-purple-500/50 bg-purple-500/20';
      default:
        return 'text-blue-400 border-blue-500/50 bg-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-surface-dark border border-border-dark rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 animate-modal flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        {/* Sticky Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-border-dark flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400 shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">verified_user</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-white text-sm sm:text-lg font-black italic uppercase tracking-wider font-display truncate">
                  Auditoría Semanal de Cazador
                </h3>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] sm:text-[10px] font-black uppercase font-mono shrink-0">
                  IA
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs truncate">
                Evaluación táctica oficial del Sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors shrink-0"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 overscroll-contain touch-pan-y">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-1">
                <p className="text-white font-bold font-mono text-sm tracking-wider uppercase">
                  Analizando Registro de Maná y Hábitos...
                </p>
                <p className="text-slate-500 text-xs">
                  Procesando correlación de estadísticas mediante NVIDIA Nemotron
                </p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Official Seal Banner */}
              <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-surface-card to-slate-900 border border-indigo-500/30 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block">
                    {report.hunterAssociationSeal}
                  </span>
                  <h4 className="text-white text-xl font-bold font-display uppercase">
                    {player.name} • {player.rank}
                  </h4>
                  <p className="text-slate-400 text-xs font-mono">
                    Fecha de Emisión: <span className="text-slate-200 font-bold">{report.date}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Rating Grade */}
                  <div
                    className={`size-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black font-display shadow-lg ${getRatingBadgeColor(
                      report.hunterRating
                    )}`}
                  >
                    <span className="text-[9px] uppercase font-mono tracking-tighter text-slate-300">
                      RATING
                    </span>
                    <span className="text-3xl leading-none">{report.hunterRating}</span>
                  </div>

                  {/* Consistency Gauge */}
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">
                      Consistencia
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {report.consistencyScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Balance Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-surface-card border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Atributo Dominante
                  </span>
                  <span className="text-white font-bold text-sm block font-display">
                    {report.dominantStat}
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Excelente progreso en la ejecución de tus tareas principales.
                  </p>
                </div>

                <div className="p-4 bg-surface-card border border-amber-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    Área a Potenciar
                  </span>
                  <span className="text-white font-bold text-sm block font-display">
                    {report.laggingStat}
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Foco prioritario para desbloquear el siguiente escalón de poder.
                  </p>
                </div>
              </div>

              {/* AI Diagnostic Text */}
              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-indigo-300 text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-indigo-400">psychology</span>
                    {report.aiDiagnosticTitle}
                  </h5>
                  <button
                    onClick={handleReadVoice}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isSpeaking ? 'volume_off' : 'volume_up'}
                    </span>
                    {isSpeaking ? 'Silenciar' : 'Escuchar Dictamen'}
                  </button>
                </div>

                <p className="text-slate-200 text-xs leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                  "{report.aiAnalysis}"
                </p>
              </div>

              {/* Tactical Recommendations */}
              <div className="space-y-2">
                <h5 className="text-white text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">fact_check</span>
                  Directivas Tácticas para los Próximos 7 Días
                </h5>

                <div className="space-y-2">
                  {report.aiRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 bg-surface-card border border-white/5 rounded-xl flex items-start gap-3"
                    >
                      <span className="size-5 rounded bg-primary/20 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 text-xs leading-normal">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all system-glow min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Confirmar Dictamen</span>
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Mobile Sticky Footer */}
        <div className="p-3 bg-slate-950/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            {report ? `Rango ${report.hunterRating} • Consistencia ${report.consistencyScore}%` : 'Auditoría IA'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAuditModal;
