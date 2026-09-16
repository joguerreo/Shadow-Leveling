import React, { useState, useEffect, useRef } from 'react';
import { Player, Quest, ForbiddenPact, QuestCategory, RealLifeReward, RewardCategory } from '../types';
import { sound } from '../utils/sound';
import { FocusCadenceOrb3D } from './three/FocusCadenceOrb3D';
import { BiometricCoreOrb3D } from './three/BiometricCoreOrb3D';
import { AttributeMesh3D } from './three/AttributeMesh3D';
import { QuestConstellation3D } from './three/QuestConstellation3D';
import { PactContainmentSeal3D } from './three/PactContainmentSeal3D';
import { QuestOrb3D } from './three/QuestOrb3D';
import { PactOrb3D } from './three/PactOrb3D';
import { QuestSpatialCarousel3D } from './three/QuestSpatialCarousel3D';
import { PactSpatialCarousel3D } from './three/PactSpatialCarousel3D';
import { RealRewardsShop } from './RealRewardsShop';

interface PortalHubProps {
  player: Player;
  quests: Quest[];
  currentUser?: any;
  onCompleteQuest: (questId: string) => void;
  onAddQuest?: (questData: Omit<Quest, 'id' | 'completed' | 'createdAt'>) => void;
  onAddBalancedRoutine?: () => void;
  onDeleteQuest?: (questId: string) => void;
  onTriggerPactInfraction: (pactId: string) => void;
  onTogglePactActive?: (pactId: string) => void;
  onAddCustomPact?: (pactData: any) => void;
  onAllocateStat?: (attrKey: 'str' | 'int' | 'vit' | 'agi' | 'wis' | 'cha') => void;
  onOpenTruceModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuth?: () => void;
  onToggleSound?: () => void;
  onClaimRealReward?: (reward: RealLifeReward) => void;
  onAddRealReward?: (reward: Omit<RealLifeReward, 'id' | 'timesClaimed' | 'lastClaimedAt'>) => void;
  onDeleteRealReward?: (rewardId: string) => void;
}

type SceneType = 'hub' | 'gate' | 'stats' | 'pacts' | 'focus' | 'shop';

export const PortalHub: React.FC<PortalHubProps> = ({
  player,
  quests,
  currentUser,
  onCompleteQuest,
  onAddQuest,
  onAddBalancedRoutine,
  onDeleteQuest,
  onTriggerPactInfraction,
  onTogglePactActive,
  onAddCustomPact,
  onAllocateStat,
  onOpenTruceModal,
  onOpenProfileModal,
  onOpenAuth,
  onToggleSound,
  onClaimRealReward,
  onAddRealReward,
  onDeleteRealReward,
}) => {
  const [activeScene, setActiveScene] = useState<SceneType>('hub');
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedPactId, setSelectedPactId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [questCategoryFilter, setQuestCategoryFilter] = useState<string>('all');
  const [pactCategoryFilter, setPactCategoryFilter] = useState<string>('all');
  const [sysMessage, setSysMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Radial "Star" Menu State
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState<boolean>(false);

  // Hold-to-Complete button state
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);

  // FX states
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isLevelFlashing, setIsLevelFlashing] = useState<boolean>(false);
  const [isLevelBumping, setIsLevelBumping] = useState<boolean>(false);

  // New Quest Inline Modal (Manual + IA)
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState<boolean>(false);
  const [questModalTab, setQuestModalTab] = useState<'ai' | 'manual'>('ai');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<QuestCategory>('discipline');
  const [newXp, setNewXp] = useState<number>(25);

  // AI Quest Generator State
  const [aiCategory, setAiCategory] = useState<string>('random');
  const [aiDifficulty, setAiDifficulty] = useState<string>('Normal');
  const [aiGoalPrompt, setAiGoalPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{
    title: string;
    description: string;
    category: QuestCategory;
    xp: number;
    systemMessage?: string;
  } | null>(null);

  // New Pact / Compromiso Modal
  const [isCreatePactOpen, setIsCreatePactOpen] = useState<boolean>(false);
  const [newPactTitle, setNewPactTitle] = useState<string>('');
  const [newPactDesc, setNewPactDesc] = useState<string>('');
  const [newPactCategory, setNewPactCategory] = useState<'nutrition' | 'health' | 'discipline' | 'mind'>('discipline');
  const [newPactVoice, setNewPactVoice] = useState<string>('');

  // Focus (Pomodoro) Timer & Ambient Audio State
  const [focusSeconds, setFocusSeconds] = useState<number>(25 * 60);
  const [focusInitialSeconds, setFocusInitialSeconds] = useState<number>(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [ambientSoundMode, setAmbientSoundMode] = useState<'alpha' | 'rain' | 'noise' | 'off'>('alpha');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.50);
  const [breathChimesEnabled, setBreathChimesEnabled] = useState<boolean>(true);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [focusVisualMode, setFocusVisualMode] = useState<'3d' | 'classic'>('3d');
  const [statsVisualMode, setStatsVisualMode] = useState<'3d' | '2d'>('3d');
  const [hubCoreMode, setHubCoreMode] = useState<'3d' | '2d'>('3d');
  const [isCoreExpanded, setIsCoreExpanded] = useState<boolean>(false);
  const [questVisualMode, setQuestVisualMode] = useState<'spatial' | 'grid' | 'classic'>('spatial');
  const [pactVisualMode, setPactVisualMode] = useState<'spatial' | 'grid' | 'classic'>('spatial');

  // Wipe transition
  const [wipeActive, setWipeActive] = useState<boolean>(false);
  const [wipeOrigin, setWipeOrigin] = useState<{ x: number; y: number }>({ x: 500, y: 400 });
  const [wipeStage, setWipeStage] = useState<'idle' | 'covering' | 'revealing'>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const HOLD_DURATION_MS = 850;

  const RING_CIRCUMFERENCE = 552.92; // 2 * PI * 88
  const HOLD_CIRCUMFERENCE = 376.99; // 2 * PI * 60

  const pendingQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);
  const activePacts = player.forbiddenPacts || [];

  const filteredQuests = quests.filter((q) => {
    if (filterMode === 'pending' && q.completed) return false;
    if (filterMode === 'completed' && !q.completed) return false;
    if (questCategoryFilter !== 'all' && q.category !== questCategoryFilter) return false;
    return true;
  });

  const filteredPacts = activePacts.filter((p) => {
    if (pactCategoryFilter !== 'all' && p.category !== pactCategoryFilter) return false;
    return true;
  });

  const questCategories = Array.from(new Set(quests.map((q) => q.category)));
  const pactCategories = Array.from(new Set(activePacts.map((p) => p.category)));

  const activeQuest = quests.find((q) => q.id === selectedQuestId) || null;
  const activePactDetail = activePacts.find((p) => p.id === selectedPactId) || null;

  // Typewriter effect for system message
  useEffect(() => {
    const pendingCount = pendingQuests.length;
    const initialText =
      pendingCount > 0
        ? `SISTEMA: ${pendingCount} objetivos pendientes en tu ciclo diario.`
        : 'SISTEMA: Todos los objetivos diarios han sido completados.';

    let index = 0;
    setSysMessage('');
    const interval = setInterval(() => {
      index++;
      setSysMessage(initialText.slice(0, index));
      if (index >= initialText.length) {
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [quests.length, pendingQuests.length]);

  // Motivational greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      if (player.personalMotto) {
        sound.speakMotivation(player.personalMotto);
      } else if (pendingQuests.length > 0) {
        sound.speakMotivation(`${player.name}, tienes ${pendingQuests.length} objetivos activos.`);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [player.personalMotto]);

  // Stop ambient sound if switching away from focus
  useEffect(() => {
    if (activeScene !== 'focus') {
      sound.stopAmbientFocus();
      setIsAmbientPlaying(false);
    }
  }, [activeScene]);

  // Focus Timer interval & audio synchronization
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusRunning && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => {
          const nextVal = prev - 1;
          const elapsed = Math.max(0, focusInitialSeconds - nextVal);
          const cycle = elapsed % 16;
          if (breathChimesEnabled) {
            if (cycle === 0) sound.playBreathCue('inhale', ambientVolume);
            else if (cycle === 4) sound.playBreathCue('hold-in', ambientVolume);
            else if (cycle === 8) sound.playBreathCue('exhale', ambientVolume);
            else if (cycle === 12) sound.playBreathCue('hold-out', ambientVolume);
          }
          return nextVal;
        });
      }, 1000);
    } else if (isFocusRunning && focusSeconds === 0) {
      setIsFocusRunning(false);
      sound.stopAmbientFocus();
      setIsAmbientPlaying(false);
      sound.playLevelUp();
      sound.speakMotivation('Sesión de enfoque completada. Excelente disciplina.');
      showToast('Sesión de enfoque concluida (+20 XP, +40 Puntos)');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusSeconds, focusInitialSeconds, breathChimesEnabled, ambientVolume]);

  // Focus Audio Handlers
  const handleToggleFocusAmbient = async (mode?: 'alpha' | 'rain' | 'noise' | 'off') => {
    await sound.resumeContext();
    const nextMode = mode !== undefined ? mode : ambientSoundMode;
    if (mode !== undefined) {
      setAmbientSoundMode(mode);
    }

    if (nextMode === 'off') {
      sound.stopAmbientFocus();
      setIsAmbientPlaying(false);
      return;
    }

    if (isAmbientPlaying && mode === undefined) {
      sound.stopAmbientFocus();
      setIsAmbientPlaying(false);
    } else {
      await sound.startAmbientFocus(nextMode, ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    sound.setAmbientVolume(vol);
  };

  const handleToggleFocusTimer = async () => {
    await sound.resumeContext();
    const nextState = !isFocusRunning;
    sound.playBeep(nextState ? 660 : 440, 0.1);
    setIsFocusRunning(nextState);

    if (nextState) {
      if (ambientSoundMode !== 'off') {
        await sound.startAmbientFocus(ambientSoundMode, ambientVolume);
        setIsAmbientPlaying(true);
      }
      sound.speakMotivation('Iniciando sesión de enfoque profundo.');
    } else {
      sound.stopAmbientFocus();
      setIsAmbientPlaying(false);
    }
  };

  // 16s Box Breathing cycle (4s Inhale, 4s Hold, 4s Exhale, 4s Pause)
  const elapsedFocusSeconds = Math.max(0, focusInitialSeconds - focusSeconds);
  const cycleIndex = elapsedFocusSeconds % 16;
  const breathePhase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out' =
    cycleIndex < 4 ? 'inhale' : cycleIndex < 8 ? 'hold-in' : cycleIndex < 12 ? 'exhale' : 'hold-out';
  const breatheLabel =
    breathePhase === 'inhale'
      ? 'Inhala profundamente (4s)'
      : breathePhase === 'hold-in'
      ? 'Sostén la respiración (4s)'
      : breathePhase === 'exhale'
      ? 'Exhala despacio (4s)'
      : 'Pausa en calma (4s)';

  const showToast = (msg: string) => {
    sound.playBeep(640, 0.04);
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Full-screen circular wipe transition
  const triggerWipeTransition = (
    toScene: SceneType,
    clickEvent?: React.MouseEvent | { clientX: number; clientY: number }
  ) => {
    sound.playBeep(450, 0.04);
    setIsRadialMenuOpen(false);

    if (clickEvent && 'clientX' in clickEvent) {
      setWipeOrigin({ x: clickEvent.clientX, y: clickEvent.clientY });
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setWipeOrigin({ x: rect.width / 2, y: rect.height * 0.4 });
    } else {
      setWipeOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    setWipeActive(true);
    setWipeStage('covering');

    setTimeout(() => {
      setActiveScene(toScene);
      setWipeStage('revealing');

      setTimeout(() => {
        setWipeActive(false);
        setWipeStage('idle');
      }, 420);
    }, 420);
  };

  // Category Color mapping
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'fitness':
        return '#ff5e5e'; // Rojo Fuerza
      case 'intellect':
        return '#38bdf8'; // Azul / Cian Intelecto
      case 'discipline':
        return '#c084fc'; // Púrpura Disciplina / Enfoque
      case 'habit':
      case 'mindfulness':
        return '#34d399'; // Verde Salud / Hábito
      default:
        return '#38bdf8';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'fitness':
        return 'Fuerza';
      case 'intellect':
        return 'Intelecto';
      case 'discipline':
        return 'Disciplina';
      case 'habit':
      case 'mindfulness':
        return 'Hábito';
      default:
        return 'Objetivo';
    }
  };

  // Material Symbols Outlined icons (The original game icons)
  const getCategoryMaterialIcon = (category?: string) => {
    switch (category) {
      case 'fitness':
        return 'fitness_center';
      case 'intellect':
        return 'psychology';
      case 'discipline':
        return 'swords';
      case 'habit':
      case 'mindfulness':
      default:
        return 'shield_with_heart';
    }
  };

  const getPactMaterialIcon = (pact: ForbiddenPact) => {
    if (pact.icon && pact.icon.length > 2 && !pact.icon.includes('/') && !pact.icon.includes('.')) {
      return pact.icon;
    }
    const title = pact.title.toLowerCase();
    if (title.includes('alcohol') || title.includes('cerveza') || title.includes('trago')) return 'local_bar';
    if (title.includes('cigarro') || title.includes('fumar') || title.includes('tabaco') || title.includes('vape')) return 'smoking_rooms';
    if (title.includes('azúcar') || title.includes('chatarra') || title.includes('comida') || title.includes('refresco')) return 'fastfood';
    if (title.includes('desvelo') || title.includes('dormir') || title.includes('pantalla') || title.includes('noche')) return 'bedtime';
    if (title.includes('procrastina') || title.includes('redes') || title.includes('scroll')) return 'smartphone';
    return 'block';
  };

  // Open focused hold-to-complete screen for quests
  const handleOpenQuestDetail = (quest: Quest, e?: React.MouseEvent) => {
    setSelectedQuestId(quest.id);
    setHoldProgress(0);
    setIsHolding(false);
    triggerWipeTransition('gate', e);
  };

  // Hold-to-Complete Animation Loop
  const startHold = () => {
    if (!activeQuest || activeQuest.completed) return;
    setIsHolding(true);
    sound.playBeep(380, 0.04);
    holdStartRef.current = performance.now();

    const loop = (t: number) => {
      if (!holdStartRef.current) return;
      const elapsed = t - holdStartRef.current;
      const pct = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(pct);

      if (pct >= 1) {
        completeActiveQuest();
        return;
      }
      holdRafRef.current = requestAnimationFrame(loop);
    };

    holdRafRef.current = requestAnimationFrame(loop);
  };

  const cancelHold = () => {
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Complete Quest Handler
  const completeActiveQuest = () => {
    if (!activeQuest) return;

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);

    sound.playBeep(880, 0.12);
    sound.speakMotivation(`Objetivo «${activeQuest.title}» completado.`);

    onCompleteQuest(activeQuest.id);

    const nextXp = player.xp + activeQuest.rewards.xp;
    if (nextXp >= player.maxXp) {
      setTimeout(() => {
        setIsLevelFlashing(true);
        setIsLevelBumping(true);
        sound.playLevelUp();
        sound.speakMotivation('¡Has subido de nivel!');
        setTimeout(() => {
          setIsLevelFlashing(false);
          setIsLevelBumping(false);
        }, 1200);
      }, 550);
    }

    setTimeout(() => {
      triggerWipeTransition('hub');
    }, 550);
  };

  // Infraction with sound & voice
  const handlePactInfractionWithVoice = (pact: ForbiddenPact) => {
    sound.playPactViolation(pact.id);
    const voicePrompt =
      pact.customVoicePrompt ||
      `Has registrado un desliz en «${pact.title}». Penalización aplicada. La disciplina se forja al volver a levantarse.`;
    sound.speakMotivation(voicePrompt);

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);

    onTriggerPactInfraction(pact.id);
    showToast(`Desliz registrado: -${pact.hpDamage} HP`);
  };

  // Quick Direct Complete for Quests/Objetivos
  const handleQuickCompleteQuest = (quest: Quest) => {
    if (quest.completed) return;
    sound.playBeep(880, 0.12);
    sound.speakMotivation(`Objetivo «${quest.title}» completado.`);
    onCompleteQuest(quest.id);

    const nextXp = player.xp + quest.rewards.xp;
    if (nextXp >= player.maxXp) {
      setTimeout(() => {
        setIsLevelFlashing(true);
        setIsLevelBumping(true);
        sound.playLevelUp();
        sound.speakMotivation('¡Nivel aumentado!');
        setTimeout(() => {
          setIsLevelFlashing(false);
          setIsLevelBumping(false);
        }, 1200);
      }, 550);
    }
  };

  // Quick Create Quest / Objetivo (Manual)
  const handleCreateQuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddQuest) {
      onAddQuest({
        title: newTitle.trim(),
        description: newDesc.trim() || 'Objetivo diario de disciplina.',
        category: newCategory,
        rank: player.rank,
        isDaily: true,
        rewards: {
          xp: Number(newXp) || 25,
          gold: 10,
        },
      });
      showToast(`Objetivo «${newTitle.trim()}» creado`);
    }
    setNewTitle('');
    setNewDesc('');
    setIsCreateQuestOpen(false);
  };

  // AI Quest Generator Handlers
  const handleGenerateAiQuest = async () => {
    setIsGeneratingAi(true);
    sound.playBeep(640, 0.08, 'sawtooth');

    try {
      const res = await fetch('/api/ai/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hunterName: player.name || 'Usuario',
          rank: player.rank || 'C-RANK',
          level: player.level || 1,
          autonomous: !aiGoalPrompt.trim(),
          goalDescription: aiGoalPrompt.trim() || undefined,
          category: aiCategory === 'random' ? undefined : aiCategory,
          difficulty: aiDifficulty,
        }),
      });

      const data = await res.json();
      if (data.quest) {
        const q = data.quest;
        const cleanTitle = (q.title || 'Objetivo de Disciplina')
          .replace(/^\[(?:Misión Diaria del Sistema|Misión Diaria|Misión|Protocolo del Sistema|Protocolo):\s*/i, '')
          .replace(/\]$/, '')
          .trim();

        let cat: QuestCategory = 'discipline';
        const c = (q.category || '').toLowerCase();
        if (c.includes('fit') || c.includes('fuerza') || c.includes('str')) cat = 'fitness';
        else if (c.includes('intel') || c.includes('int') || c.includes('estudio')) cat = 'intellect';
        else if (c.includes('mind') || c.includes('mente') || c.includes('wis')) cat = 'mindfulness';
        else if (c.includes('disc') || c.includes('vit') || c.includes('hab')) cat = 'discipline';
        else if (aiCategory !== 'random') cat = aiCategory as QuestCategory;

        const calculatedXp = aiDifficulty === 'Intenso' ? 50 : aiDifficulty === 'Desafiante' ? 35 : 25;

        setAiGeneratedResult({
          title: cleanTitle,
          description: q.description || 'Objetivo formulado por el Sistema para elevar tu consistencia diaria.',
          category: cat,
          xp: calculatedXp,
          systemMessage: q.systemMessage,
        });
        sound.playLevelUp();
        if (q.systemMessage) {
          sound.speakSystemVoice(q.systemMessage);
        }
      } else {
        throw new Error('Respuesta no válida del Sistema');
      }
    } catch (err) {
      console.warn('Fallback al generador local de objetivos', err);
      const fallbackTemplates: { cat: QuestCategory; title: string; desc: string; xp: number; msg: string }[] = [
        {
          cat: 'fitness',
          title: 'Sesión de Activación Física Intensa',
          desc: 'Completa 40 flexiones, 50 sentadillas o 25 minutos de carrera/caminata a ritmo ágil.',
          xp: 35,
          msg: 'El cuerpo es el primer templo de la disciplina.',
        },
        {
          cat: 'intellect',
          title: 'Sesión de Estudio & Lectura Profunda',
          desc: 'Dedica 30 minutos ininterrumpidos a lectura de no ficción, estudio técnico o aprendizaje de idioma.',
          xp: 30,
          msg: 'El conocimiento aplicado es la verdadera fuerza.',
        },
        {
          cat: 'discipline',
          title: 'Bloque de Foco Inquebrantable',
          desc: 'Ejecuta tu tarea prioritaria del día durante 45 minutos sin redes sociales ni distracciones.',
          xp: 40,
          msg: 'La consistencia en lo pequeño construye la maestría.',
        },
        {
          cat: 'mindfulness',
          title: 'Desconexión Digital & Claridad Mental',
          desc: 'Pasa 20 minutos al aire libre o en silencio sin teléfono ni estímulos artificiales.',
          xp: 25,
          msg: 'La calma y la claridad potencian cada decisión.',
        },
      ];

      const filtered = aiCategory === 'random' 
        ? fallbackTemplates 
        : fallbackTemplates.filter((t) => t.cat === aiCategory);
      const pool = filtered.length > 0 ? filtered : fallbackTemplates;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      const userCustom = aiGoalPrompt.trim();
      const customTitle = userCustom ? userCustom : chosen.title;
      const customDesc = userCustom 
        ? `Directiva del Sistema: "${userCustom}". Cumple con precisión e implacabilidad.` 
        : chosen.desc;

      const calculatedXp = aiDifficulty === 'Intenso' ? 50 : aiDifficulty === 'Desafiante' ? 35 : 25;

      setAiGeneratedResult({
        title: customTitle,
        description: customDesc,
        category: chosen.cat,
        xp: calculatedXp,
        systemMessage: chosen.msg,
      });
      sound.playLevelUp();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAcceptAiQuest = () => {
    if (!aiGeneratedResult || !onAddQuest) return;
    onAddQuest({
      title: aiGeneratedResult.title,
      description: aiGeneratedResult.description,
      category: aiGeneratedResult.category,
      rank: player.rank,
      isDaily: true,
      rewards: {
        xp: aiGeneratedResult.xp,
        gold: 10,
      },
    });
    showToast(`Objetivo «${aiGeneratedResult.title}» añadido`);
    setAiGeneratedResult(null);
    setAiGoalPrompt('');
    setIsCreateQuestOpen(false);
  };

  // Quick Create Pact / Compromiso
  const handleCreatePactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPactTitle.trim()) return;
    if (onAddCustomPact) {
      onAddCustomPact({
        title: newPactTitle.trim(),
        codeName: newPactTitle.trim().toUpperCase().replace(/\s+/g, '_'),
        description: newPactDesc.trim() || 'Regla innegociable de disciplina.',
        category: newPactCategory,
        severity: 'moderate',
        icon: 'verified_user',
        hpDamage: 20,
        goldPenalty: 25,
        active: true,
        customVoicePrompt: newPactVoice.trim() || undefined,
      });
      showToast(`Compromiso «${newPactTitle.trim()}» registrado`);
    }
    setNewPactTitle('');
    setNewPactDesc('');
    setNewPactVoice('');
    setIsCreatePactOpen(false);
  };

  // XP Progress Calculation
  const xpRatio = Math.min(1, Math.max(0, (player.xp || 0) / (player.maxXp || 100)));
  const ringDashoffset = RING_CIRCUMFERENCE * (1 - xpRatio);

  // Concentric Attributes Calculation
  const attrList = [
    { name: 'FUERZA', code: 'str', val: player.attributes.str.value, color: '#ff5e5e', r: 82, icon: 'fitness_center' },
    { name: 'INTELECTO', code: 'int', val: player.attributes.int.value, color: '#38bdf8', r: 66, icon: 'psychology' },
    { name: 'VITALIDAD', code: 'vit', val: player.attributes.vit.value, color: '#34d399', r: 50, icon: 'shield_with_heart' },
    { name: 'ENFOQUE', code: 'wis', val: player.attributes.wis.value, color: '#c084fc', r: 34, icon: 'visibility' },
  ];

  // Radial "Star" Menu Items - 5 Estaciones Simétricas (Paso de 37.5° centrado exactamente en 270°)
  const radialMenuItems = [
    {
      id: 'hub',
      label: 'OBJETIVOS',
      icon: 'task_alt',
      scene: 'hub' as SceneType,
      angle: 195, // Superior Izquierda (-75° desde 270°)
      color: '#38bdf8',
    },
    {
      id: 'stats',
      label: 'ATRIBUTOS',
      icon: 'insights',
      scene: 'stats' as SceneType,
      angle: 232.5, // Superior Centro-Izquierda (-37.5° desde 270°)
      color: '#c084fc',
    },
    {
      id: 'shop',
      label: 'RECOMPENSAS',
      icon: 'storefront',
      scene: 'shop' as SceneType,
      angle: 270, // Cénit Superior Exacto (0° desviación)
      color: '#fbbf24',
    },
    {
      id: 'pacts',
      label: 'COMPROMISOS',
      icon: 'verified_user',
      scene: 'pacts' as SceneType,
      angle: 307.5, // Superior Centro-Derecha (+37.5° desde 270°)
      color: '#ff5e5e',
    },
    {
      id: 'focus',
      label: 'ENFOQUE',
      icon: 'timer',
      scene: 'focus' as SceneType,
      angle: 345, // Superior Derecha (+75° desde 270°)
      color: '#34d399',
    },
  ];

  return (
    <div
      ref={containerRef}
      id="portal-hub-root"
      className={`fixed inset-0 z-20 w-full h-full max-w-full overflow-hidden bg-[#03040a] text-[#e7edf7] font-sans select-none flex flex-col justify-between ${
        isShaking ? 'animate-shake' : ''
      }`}
    >
      {/* 1. Deep Void Radial Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, #0c182b 0%, #03040a 75%)',
        }}
      />

      {/* 2. Floating Ambient Ascending Particles */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#38bdf8] opacity-0 animate-drift"
            style={{
              left: `${(i * 6.2 + 3) % 96}%`,
              top: `${60 + (i % 6) * 6}%`,
              animationDuration: `${5.5 + (i % 4) * 1.5}s`,
              animationDelay: `${(i * 0.4) % 5}s`,
            }}
          />
        ))}
      </div>

      {/* 3. Sleek Floating Top HUD */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between text-xs font-mono">
        {/* Left: Hunter ID */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
          <span className="text-white font-bold text-sm tracking-tight font-sans">{player.name}</span>
        </div>

        {/* Center: HP & Streak */}
        <div className="flex items-center gap-2 sm:gap-4 text-[11px]">
          {/* Health / Energy */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c1322]/90 border border-red-500/30 backdrop-blur-md cursor-help"
            title={`Energía disponible: ${player.hp}/${player.maxHp}`}
          >
            <span className="material-symbols-outlined text-red-400 text-sm">battery_charging_full</span>
            <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, ((player.hp ?? 100) / (player.maxHp ?? 100)) * 100))}%` }}
              />
            </div>
            <span className="text-red-300 text-[10px] font-bold">{player.hp} ENE</span>
          </div>

          {/* Clean Streak */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c1322]/90 border border-amber-500/30 text-amber-400 backdrop-blur-md"
            title={`Racha de disciplina: ${player.streakDays ?? 0} días consecutivos`}
          >
            <span className="material-symbols-outlined text-sm text-amber-400">local_fire_department</span>
            <span className="font-bold">{player.streakDays ?? 0}d</span>
          </div>
        </div>

        {/* Right: Sound & Profile */}
        <div className="flex items-center gap-2">
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-full bg-[#0c1322]/90 border border-[#1c2a45] text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
              title="Sonido del Sistema"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
            </button>
          )}

          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="p-1.5 rounded-full bg-[#0c1322]/90 border border-[#1c2a45] text-slate-300 hover:text-white transition-all active:scale-95"
              title="Credencial y Configuración"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
            </button>
          )}
        </div>
      </header>

      {/* 4. Central Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y px-2.5 sm:px-4 py-1.5 sm:py-2 w-full max-w-4xl mx-auto scrollbar-none">
        {/* ==================================================================== */}
        {/* SCENE 1: MAIN HUB WITH MISSIONS IN GRID & BRIEF DESCRIPTIONS         */}
        {/* ==================================================================== */}
        {activeScene === 'hub' && (
          <div className="w-full flex flex-col items-center text-center animate-fade-in pb-20 sm:pb-24">
            {/* System Status & Biometric Ribbon */}
            <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-[#0c1322]/85 border border-[#1c2a45] mb-2.5 backdrop-blur-md shadow-lg">
              {/* Left: Mini Level Indicator & Reactor Progress */}
              <div 
                className="flex items-center gap-2 cursor-pointer group shrink-0"
                onClick={() => {
                  sound.playBeep(520, 0.03);
                  setIsCoreExpanded(!isCoreExpanded);
                }}
                title="Toca para expandir o contraer el reactor biométrico"
              >
                <div className="w-8 h-8 rounded-full border border-cyan-500/50 bg-cyan-950/40 flex items-center justify-center text-cyan-300 font-rajdhani font-bold text-sm shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:border-cyan-400">
                  {player.level}
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>NV {player.level}</span>
                    <span className="text-cyan-400 font-mono">({Math.round(xpRatio * 100)}%)</span>
                  </div>
                  <div className="w-20 sm:w-28 h-1.5 bg-[#060a12] rounded-full overflow-hidden border border-white/10 mt-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(xpRatio * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Center: System message typewriter */}
              <div className="hidden xs:flex sm:flex items-center text-xs font-rajdhani text-cyan-300/90 truncate flex-1 px-2 font-medium">
                <span className="text-slate-500 mr-1">&gt;</span>
                <span className="truncate">{sysMessage}</span>
              </div>

              {/* Right: Expand / Collapse Button & 3D/2D toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isCoreExpanded && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBeep(520, 0.03);
                      setHubCoreMode(hubCoreMode === '3d' ? '2d' : '3d');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#060a12] border border-[#1c2a45] text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    title="Alternar entre reactor 3D y anillo 2D"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {hubCoreMode === '3d' ? 'view_in_ar' : 'circle'}
                    </span>
                    <span>{hubCoreMode === '3d' ? '3D' : '2D'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep(520, 0.03);
                    setIsCoreExpanded(!isCoreExpanded);
                  }}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-all flex items-center gap-1 active:scale-95 ${
                    isCoreExpanded
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                      : 'bg-[#060a12] border-[#1c2a45] text-slate-300 hover:text-white hover:border-cyan-500/40'
                  }`}
                  title={isCoreExpanded ? 'Contraer reactor para optimizar espacio' : 'Expandir reactor biométrico'}
                >
                  <span className="material-symbols-outlined text-xs">
                    {isCoreExpanded ? 'expand_less' : 'view_in_ar'}
                  </span>
                  <span>{isCoreExpanded ? 'Cerrar' : 'Reactor'}</span>
                </button>
              </div>
            </div>

            {/* Optional Expanded Central Level Core */}
            {isCoreExpanded && (
              <div className="flex flex-col items-center mb-3 animate-fade-in">
                {hubCoreMode === '3d' ? (
                  <div
                    className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mb-1 cursor-pointer group shrink-0 flex items-center justify-center touch-none"
                    style={{ touchAction: 'none' }}
                    onClick={() => {
                      sound.playBeep(640, 0.05);
                      sound.speakMotivation(`Reactor biométrico activo. Nivel ${player.level}. Energía al ${Math.round(((player.hp ?? 100) / (player.maxHp ?? 100)) * 100)}%.`);
                    }}
                    title="Reactor Biométrico 3D (Toca para inspeccionar)"
                  >
                    <BiometricCoreOrb3D
                      level={player.level}
                      hpPercent={((player.hp ?? 100) / (player.maxHp ?? 100)) * 100}
                      streakDays={player.streakDays ?? 0}
                    />
                    <div className="absolute -bottom-1 flex items-center gap-1 bg-[#0c1322]/90 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 font-bold backdrop-blur-md shadow-md pointer-events-none">
                      <span>NV {player.level}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mb-1 animate-breathe cursor-pointer group shrink-0"
                    onClick={() => {
                      sound.playBeep(640, 0.05);
                      sound.speakMotivation(`Nivel ${player.level}. ${Math.round(xpRatio * 100)}% de progreso.`);
                    }}
                    title="Toca para verificar progreso"
                  >
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="88" fill="none" stroke="#0c1322" strokeWidth="8" />
                      <circle
                        cx="100"
                        cy="100"
                        r="88"
                        fill="none"
                        stroke={isLevelFlashing ? '#ffcf6b' : '#38bdf8'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={ringDashoffset}
                        className={`transition-all duration-700 ease-out ${
                          isLevelFlashing ? 'drop-shadow-[0_0_16px_#ff9d2e]' : 'drop-shadow-[0_0_8px_rgba(56,189,248,0.55)]'
                        }`}
                      />
                    </svg>

                    {/* Core Level */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div
                        className={`font-rajdhani font-bold text-[38px] sm:text-[44px] text-[#e7edf7] leading-none transition-transform duration-300 ${
                          isLevelBumping ? 'scale-125 text-[#ffcf6b]' : 'scale-100'
                        }`}
                      >
                        {player.level}
                      </div>
                      <div className="text-[9px] tracking-[0.2em] font-mono text-[#7c8aa8] mt-0.5 font-semibold">NIVEL</div>
                    </div>
                  </div>
                )}
                <div className="text-[11px] font-mono text-[#7c8aa8]">
                  XP: <span className="text-cyan-300 font-bold">{player.xp}</span> / {player.maxXp}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* OBJETIVOS DIARIOS (CONTROL BAR COMPACTA Y SIN SCROLLING)       */}
            {/* ============================================================== */}
            <div className="w-full text-left">
              {/* Header & Controls: Row 1 has Title on Left and "+ Nuevo" always visible on Right */}
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-cyan-400 text-lg sm:text-xl shrink-0">task_alt</span>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-[#e7edf7] tracking-tight truncate">
                    Objetivos Diarios
                  </h3>
                  <span className="text-xs font-mono text-cyan-400/80 shrink-0 font-bold">
                    ({completedQuests.length}/{quests.length})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onAddBalancedRoutine && quests.length === 0 && (
                    <button
                      type="button"
                      onClick={onAddBalancedRoutine}
                      className="px-2.5 py-1.5 rounded-xl bg-[#0c1322] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all active:scale-95"
                    >
                      Rutina
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCreateQuestOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all active:scale-95 shadow-lg shadow-cyan-600/30 flex items-center gap-1"
                    title="Crear un nuevo objetivo diario"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    <span>Nuevo</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Visual Mode Toggle (Espacial / Cuadrícula / Clásico) & Status Filters */}
              <div className="flex items-center justify-between gap-2 mb-2 px-1 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-0.5 bg-[#0c1322] border border-[#1c2a45] rounded-xl p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBeep(520, 0.03);
                      setQuestVisualMode('spatial');
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      questVisualMode === 'spatial'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Navegación espacial 3D táctil"
                  >
                    <span className="material-symbols-outlined text-xs">cyclone</span>
                    <span>Espacial 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBeep(490, 0.03);
                      setQuestVisualMode('grid');
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      questVisualMode === 'grid'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Cuadrícula de orbes"
                  >
                    <span className="material-symbols-outlined text-xs">grid_view</span>
                    <span className="hidden xs:inline sm:inline">Orbes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBeep(460, 0.03);
                      setQuestVisualMode('classic');
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      questVisualMode === 'classic'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Lista clásica 2D"
                  >
                    <span className="material-symbols-outlined text-xs">adjust</span>
                    <span className="hidden xs:inline sm:inline">Clásico</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-col gap-2 mb-4 px-1 text-xs font-mono">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-full transition-all shrink-0 ${
                      filterMode === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white bg-[#0c1322]/60 border border-transparent'
                    }`}
                  >
                    Todos ({quests.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('pending')}
                    className={`px-3 py-1 rounded-full transition-all shrink-0 ${
                      filterMode === 'pending'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white bg-[#0c1322]/60 border border-transparent'
                    }`}
                  >
                    Pendientes ({pendingQuests.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('completed')}
                    className={`px-3 py-1 rounded-full transition-all shrink-0 ${
                      filterMode === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white bg-[#0c1322]/60 border border-transparent'
                    }`}
                  >
                    Completados ({completedQuests.length})
                  </button>
                </div>

                {/* Category Filter Pills */}
                {questCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    <span className="text-slate-500 text-[10px] shrink-0 uppercase tracking-wider mr-1">Cat:</span>
                    <button
                      onClick={() => setQuestCategoryFilter('all')}
                      className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 ${
                        questCategoryFilter === 'all'
                          ? 'bg-slate-700 text-white font-bold border border-slate-500'
                          : 'text-slate-400 hover:text-white bg-[#0c1322]/70 border border-[#1c2a45]'
                      }`}
                    >
                      Todas
                    </button>
                    {questCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setQuestCategoryFilter(cat)}
                        className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 capitalize ${
                          questCategoryFilter === cat
                            ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200 bg-[#0c1322]/70 border border-[#1c2a45]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Spatial Carousel OR Grid of Circular Orbes */}
              {questVisualMode === 'spatial' ? (
                <div className="w-full touch-none" style={{ touchAction: 'none' }}>
                  <QuestSpatialCarousel3D
                    quests={filteredQuests}
                    onSelectQuest={(q) => handleOpenQuestDetail(q)}
                    onQuickComplete={(q) => handleQuickCompleteQuest(q)}
                  />
                </div>
              ) : filteredQuests.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-slate-500 bg-[#0c1322]/60 rounded-2xl border border-[#1c2a45]">
                  {filterMode === 'completed'
                    ? 'Aún no has completado objetivos hoy.'
                    : 'No hay objetivos en esta sección. Pulsa "+ Nuevo" para crear uno.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                  {filteredQuests.map((quest) => {
                    const color = getCategoryColor(quest.category);
                    const iconName = getCategoryMaterialIcon(quest.category);

                    return (
                      <div
                        key={quest.id}
                        onClick={(e) => handleOpenQuestDetail(quest, e)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between gap-2.5 group backdrop-blur-md relative overflow-hidden ${
                          quest.completed
                            ? 'bg-[#0a0f1a]/50 border-white/5 opacity-65 hover:opacity-90'
                            : 'bg-[#0c1322]/90 border-[#1c2a45] hover:border-cyan-500/60 hover:bg-[#0e1728] shadow-lg hover:shadow-cyan-950/30'
                        }`}
                      >
                        {/* Circular Orb Container: 3D Sphere or 2D Classic Circle */}
                        <div className="relative flex items-center justify-center my-1">
                          {questVisualMode === 'grid' ? (
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <QuestOrb3D
                                category={quest.category}
                                completed={quest.completed}
                                size={64}
                              />
                              {/* Overlay Icon in the center */}
                              <span
                                className={`material-symbols-outlined text-lg absolute pointer-events-none transition-transform group-hover:scale-110 ${
                                  quest.completed ? 'text-emerald-400' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                                }`}
                              >
                                {quest.completed ? 'check_circle' : iconName}
                              </span>
                            </div>
                          ) : (
                            /* Classic 2D Circular Node */
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-105 ${
                                quest.completed
                                  ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-400'
                                  : 'border-cyan-500/40 text-cyan-300'
                              }`}
                              style={{
                                backgroundColor: quest.completed ? undefined : `${color}20`,
                                borderColor: quest.completed ? undefined : color,
                              }}
                            >
                              <span className="material-symbols-outlined text-2xl">
                                {quest.completed ? 'check' : iconName}
                              </span>
                            </div>
                          )}

                          {/* Quick Complete / Status Badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCompleteQuest(quest);
                            }}
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all shadow-md ${
                              quest.completed
                                ? 'bg-emerald-500 border-emerald-300 text-black'
                                : 'bg-[#0c1322] border-slate-600 hover:border-cyan-400 text-slate-400 hover:text-white'
                            }`}
                            title={quest.completed ? 'Completado' : 'Completar rápido'}
                          >
                            <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                          </button>
                        </div>

                        {/* Title & Rewards info */}
                        <div className="w-full min-w-0">
                          <h4
                            className={`text-xs font-semibold font-sans leading-tight transition-colors line-clamp-2 ${
                              quest.completed ? 'text-slate-500 line-through' : 'text-white group-hover:text-cyan-200'
                            }`}
                          >
                            {quest.title}
                          </h4>

                          <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                              style={{ color: color, background: `${color}15`, border: `1px solid ${color}30` }}
                            >
                              {getCategoryLabel(quest.category)}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              +{quest.rewards.xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Hover hint */}
                        <div className="text-[10px] font-mono text-cyan-400/70 group-hover:text-cyan-300 flex items-center justify-center gap-0.5">
                          <span>Inspeccionar</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENE 2: OBJETIVO DETALLE COMPLETO (ENTRANDO YA LA DESCRIPCIÓN)      */}
        {/* ==================================================================== */}
        {activeScene === 'gate' && activeQuest && (
          <div className="w-full max-w-md flex flex-col items-center text-center animate-fade-in py-4 my-auto">
            {/* Back button */}
            <button
              onClick={() => triggerWipeTransition('hub')}
              className="self-start text-xs sm:text-sm text-[#7c8aa8] hover:text-white flex items-center gap-1 font-mono transition-colors mb-3"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Objetivos
            </button>

            {/* Category Pill & XP */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1.5"
                style={{
                  color: getCategoryColor(activeQuest.category),
                  background: `${getCategoryColor(activeQuest.category)}15`,
                  border: `1px solid ${getCategoryColor(activeQuest.category)}35`,
                }}
              >
                <span className="material-symbols-outlined text-sm">
                  {getCategoryMaterialIcon(activeQuest.category)}
                </span>
                <span>{getCategoryLabel(activeQuest.category)}</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                +{activeQuest.rewards.xp} XP
              </span>
            </div>

            {/* Cinematic Expanded 3D Orb - Unfolding at center */}
            <div className="relative my-3 flex items-center justify-center animate-scale-in">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <QuestOrb3D
                  category={activeQuest.category}
                  completed={activeQuest.completed}
                  size={110}
                />
                <span
                  className={`material-symbols-outlined text-2xl absolute pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                    activeQuest.completed ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {activeQuest.completed ? 'check_circle' : getCategoryMaterialIcon(activeQuest.category)}
                </span>
              </div>
            </div>

            {/* Full Title */}
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-3 px-2 leading-tight tracking-tight">
              {activeQuest.title}
            </h2>

            {/* Full Detailed Description ("entrando ya la descripción completa") */}
            <div className="w-full p-4 rounded-xl bg-[#0c1322]/95 border border-[#1c2a45] text-left mb-5 shadow-xl">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-xs">notes</span>
                <span>Descripción Completa</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {activeQuest.description || 'Sin descripción adicional registrada para este objetivo.'}
              </p>
            </div>

            {/* Quantitative Target (if present) */}
            {activeQuest.targetCount && (
              <div className="w-full p-3 rounded-xl bg-[#0c1322] border border-[#1c2a45] flex items-center justify-between mb-5 font-mono text-xs">
                <span className="text-slate-400">Meta requerida:</span>
                <span className="text-white font-bold">
                  {activeQuest.currentCount || 0} / {activeQuest.targetCount} {activeQuest.unit || 'reps'}
                </span>
              </div>
            )}

            {/* Completion Action */}
            {activeQuest.completed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-sm flex items-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Objetivo Completado</span>
                </div>
                <button
                  onClick={() => triggerWipeTransition('hub')}
                  className="text-xs text-slate-400 hover:text-white underline font-mono"
                >
                  Volver a la lista de objetivos
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {/* Circular Hold-To-Complete Button */}
                <div
                  className="relative w-[140px] h-[140px] cursor-pointer select-none active:scale-95 transition-transform"
                  onPointerDown={startHold}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                >
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#0c1322" strokeWidth="6" />
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke={getCategoryColor(activeQuest.category)}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={HOLD_CIRCUMFERENCE}
                      strokeDashoffset={HOLD_CIRCUMFERENCE * (1 - holdProgress)}
                      className="transition-all duration-75"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                    <span
                      className={`text-xs font-sans font-bold leading-tight transition-colors ${
                        isHolding ? 'text-white scale-105' : 'text-[#7c8aa8]'
                      }`}
                    >
                      {holdProgress >= 1
                        ? '¡Completado!'
                        : isHolding
                        ? 'Confirmando...'
                        : 'Mantén presionado\npara completar'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Sostén para confirmar el cumplimiento del objetivo
                </div>

                {/* Direct quick button as alternative */}
                <button
                  onClick={completeActiveQuest}
                  className="text-xs font-mono text-cyan-400/80 hover:text-cyan-300 underline mt-1"
                >
                  o presiona aquí para completar directamente
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENE 3: STATS (ATRIBUTOS DE DISCIPLINA)                             */}
        {/* ==================================================================== */}
        {activeScene === 'stats' && (
          <div className="w-full max-w-md flex flex-col items-center text-center animate-fade-in py-4 my-auto pb-24">
            <button
              onClick={() => triggerWipeTransition('hub')}
              className="self-start text-xs sm:text-sm text-[#7c8aa8] hover:text-white flex items-center gap-1 font-mono transition-colors mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Objetivos
            </button>

            <div className="font-rajdhani font-bold text-2xl text-[#e7edf7] my-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">military_tech</span>
              <span>Competencias & Hábitos</span>
            </div>

            {/* View Switcher: 3D Holographic Pyramid vs 2D Concentric Rings */}
            <div className="flex items-center gap-1.5 mb-3 bg-[#0c1322]/90 p-1 rounded-xl border border-[#1c2a45]">
              <button
                onClick={() => {
                  sound.playBeep(480, 0.03);
                  setStatsVisualMode('3d');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  statsVisualMode === '3d'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">view_in_ar</span>
                <span>Pirámide 3D</span>
              </button>
              <button
                onClick={() => {
                  sound.playBeep(480, 0.03);
                  setStatsVisualMode('2d');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  statsVisualMode === '2d'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">radio_button_checked</span>
                <span>Anillos 2D</span>
              </button>
            </div>

            {/* Visual Display */}
            {statsVisualMode === '3d' ? (
              <div className="w-full h-56 max-w-xs relative my-1 flex items-center justify-center">
                <AttributeMesh3D
                  str={player.attributes.str.value}
                  intVal={player.attributes.int.value}
                  vit={player.attributes.vit.value}
                  wis={player.attributes.wis.value}
                />
                <div className="absolute bottom-1 text-[10px] font-mono text-purple-300/80 pointer-events-none">
                  Arrastra para rotar la pirámide
                </div>
              </div>
            ) : (
              <div className="relative my-2">
                <svg viewBox="0 0 200 200" width="220" height="220">
                  {attrList.map((attr) => {
                    const circ = 2 * Math.PI * attr.r;
                    const off = circ * (1 - Math.min(100, attr.val) / 100);
                    return (
                      <g key={attr.code}>
                        <circle cx="100" cy="100" r={attr.r} fill="none" stroke="#0c1322" strokeWidth="8" />
                        <circle
                          cx="100"
                          cy="100"
                          r={attr.r}
                          fill="none"
                          stroke={attr.color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circ.toFixed(2)}
                          strokeDashoffset={off.toFixed(2)}
                          transform="rotate(-90 100 100)"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Attribute Legend & Stat Points Allocation */}
            <div className="w-full max-w-xs flex flex-col gap-2 mt-2">
              {attrList.map((attr) => (
                <div
                  key={attr.code}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#0c1322]/90 border border-[#1c2a45] text-xs font-mono backdrop-blur-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: attr.color }}>
                      {attr.icon}
                    </span>
                    <span className="text-slate-300 font-bold">{attr.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{attr.val}</span>
                    {player.statPoints > 0 && onAllocateStat && (
                      <button
                        onClick={() => onAllocateStat(attr.code as any)}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-xs font-bold border border-cyan-400/40 active:scale-95"
                        title="Asignar punto de atributo"
                      >
                        +1
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {player.statPoints > 0 && (
              <div className="mt-4 text-xs font-mono text-cyan-400 font-bold animate-pulse">
                Puntos de Disciplina para asignar: {player.statPoints}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENE 4: COMPROMISOS (GRID MINIMALISTA CON DESCRIPCIÓN AL ENTRAR)    */}
        {/* ==================================================================== */}
        {activeScene === 'pacts' && (
          <div className="w-full max-w-4xl flex flex-col py-2 text-left animate-fade-in pb-20 sm:pb-24">
            {/* Header & Controls: Row 1 - Back button + Title on left, Action buttons on right */}
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => triggerWipeTransition('hub')}
                  className="w-8 h-8 rounded-xl bg-[#0c1322] border border-[#1c2a45] text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
                  title="Volver a Objetivos"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-rose-400 text-lg sm:text-xl shrink-0">verified_user</span>
                    <h3 className="font-sans font-bold text-base sm:text-lg text-[#e7edf7] tracking-tight truncate">
                      Compromisos
                    </h3>
                    <span className="text-xs font-mono text-rose-400/80 font-bold shrink-0">
                      ({activePacts.length})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenTruceModal && (
                  <button
                    type="button"
                    onClick={onOpenTruceModal}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-900 active:scale-95 shadow-md flex items-center gap-1"
                    title="Pedir Tregua Temporal"
                  >
                    <span className="material-symbols-outlined text-xs">shield</span>
                    <span className="hidden xs:inline">Tregua</span>
                  </button>
                )}

                {onAddCustomPact && (
                  <button
                    type="button"
                    onClick={() => setIsCreatePactOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-mono font-bold transition-all active:scale-95 shadow-lg shadow-rose-600/30 flex items-center gap-1"
                    title="Crear un nuevo compromiso innegociable"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    <span>Nuevo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: View Mode Toggle & Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 mb-2 px-1 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-0.5 bg-[#0c1322] border border-[#1c2a45] rounded-xl p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep(520, 0.03);
                    setPactVisualMode('spatial');
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    pactVisualMode === 'spatial'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Navegación espacial 3D táctil"
                >
                  <span className="material-symbols-outlined text-xs">cyclone</span>
                  <span>Espacial 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep(490, 0.03);
                    setPactVisualMode('grid');
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    pactVisualMode === 'grid'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cuadrícula de orbes 3D"
                >
                  <span className="material-symbols-outlined text-xs">grid_view</span>
                  <span className="hidden xs:inline sm:inline">Orbes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep(460, 0.03);
                    setPactVisualMode('classic');
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    pactVisualMode === 'classic'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Círculos clásicos 2D"
                >
                  <span className="material-symbols-outlined text-xs">adjust</span>
                  <span className="hidden xs:inline sm:inline">Clásico</span>
                </button>
              </div>

              {/* Category Filter Pills for Pacts */}
              {pactCategories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
                  <span className="text-slate-500 text-[10px] shrink-0 uppercase tracking-wider mr-0.5">Cat:</span>
                  <button
                    type="button"
                    onClick={() => setPactCategoryFilter('all')}
                    className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 ${
                      pactCategoryFilter === 'all'
                        ? 'bg-rose-950 text-rose-200 font-bold border border-rose-500/60'
                        : 'text-slate-400 hover:text-white bg-[#0c1322]/70 border border-[#1c2a45]'
                    }`}
                  >
                    Todos ({activePacts.length})
                  </button>
                  {pactCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPactCategoryFilter(cat)}
                      className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 capitalize ${
                        pactCategoryFilter === cat
                          ? 'bg-rose-600/30 text-rose-200 font-bold border border-rose-400'
                          : 'text-slate-400 hover:text-rose-200 bg-[#0c1322]/70 border border-[#1c2a45]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spatial 3D Carousel OR Circular Orbs Grid */}
            {pactVisualMode === 'spatial' ? (
              <div className="w-full touch-none" style={{ touchAction: 'none' }}>
                <PactSpatialCarousel3D
                  pacts={filteredPacts}
                  onSelectPact={(pact) => setSelectedPactId(selectedPactId === pact.id ? null : pact.id)}
                  onRegisterInfraction={(pact) => handlePactInfractionWithVoice(pact)}
                />

                {/* Unfolded Pact Details when an orb is opened */}
                {activePactDetail && (
                  <div className="w-full max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-[#0e1424] border border-rose-500/50 shadow-2xl animate-fade-in flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-400">shield</span>
                        <h4 className="text-base font-bold text-white font-sans">{activePactDetail.title}</h4>
                      </div>
                      <button
                        onClick={() => setSelectedPactId(null)}
                        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span> Cerrar
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                      {activePactDetail.description || 'Compromiso de disciplina y autocontrol activo en el Sistema.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs text-center">
                      <div className="p-2 rounded-xl bg-[#090d17] border border-[#1c2a45]">
                        <div className="text-[10px] text-slate-400">Racha Limpia</div>
                        <div className="text-emerald-400 font-bold text-sm">{activePactDetail.cleanStreakDays} días</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090d17] border border-[#1c2a45]">
                        <div className="text-[10px] text-slate-400">Deslices Totales</div>
                        <div className="text-rose-400 font-bold text-sm">{activePactDetail.totalInfractions}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090d17] border border-[#1c2a45]">
                        <div className="text-[10px] text-slate-400">Penalización HP</div>
                        <div className="text-rose-300 font-bold text-sm">-{activePactDetail.hpDamage} HP</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090d17] border border-[#1c2a45]">
                        <div className="text-[10px] text-slate-400">Puntos de Disciplina</div>
                        <div className="text-amber-400 font-bold text-sm">-{activePactDetail.goldPenalty}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                {filteredPacts.length === 0 ? (
                  <div className="col-span-full text-xs text-slate-500 font-mono py-10 text-center bg-[#0c1322]/80 rounded-2xl border border-[#1c2a45]">
                    No hay compromisos en este filtro. Pulsa "+ Nuevo" para agregar uno.
                  </div>
                ) : (
                  filteredPacts.map((pact) => {
                    const iconName = getPactMaterialIcon(pact);
                    const isExpanded = selectedPactId === pact.id;

                    return (
                      <div
                        key={pact.id}
                        onClick={() => setSelectedPactId(isExpanded ? null : pact.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between gap-2.5 backdrop-blur-md relative overflow-hidden group ${
                          isExpanded
                            ? 'border-rose-500 shadow-xl shadow-rose-950/40 bg-[#120e17]'
                            : 'bg-[#0c1322]/90 border-[#1c2a45] hover:border-rose-500/50 hover:bg-[#0f111a] shadow-lg'
                        }`}
                      >
                        {/* Circular Orb Container: 3D Sphere or 2D Classic Circle */}
                        <div className="relative flex items-center justify-center my-1">
                          {pactVisualMode === 'grid' ? (
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <PactOrb3D
                                streakDays={pact.cleanStreakDays}
                                totalInfractions={pact.totalInfractions}
                                category={pact.category}
                                size={64}
                              />
                              {/* Overlay Icon in the center */}
                              <span className="material-symbols-outlined text-lg absolute pointer-events-none text-rose-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-110">
                                {iconName}
                              </span>
                            </div>
                          ) : (
                            /* Classic 2D Circular Node */
                            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-rose-500/40 bg-rose-950/30 text-rose-400 transition-transform group-hover:scale-105">
                              <span className="material-symbols-outlined text-2xl">{iconName}</span>
                            </div>
                          )}

                          {/* Infraction quick button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePactInfractionWithVoice(pact);
                            }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-rose-500/50 bg-rose-950/90 hover:bg-rose-700 text-rose-300 hover:text-white flex items-center justify-center text-xs transition-all shadow-md active:scale-95"
                            title="Registrar desliz"
                          >
                            <span className="material-symbols-outlined text-[13px] font-bold">warning</span>
                          </button>
                        </div>

                      {/* Title & Streak info */}
                      <div className="w-full min-w-0">
                        <h4 className="text-xs font-semibold font-sans text-white leading-tight truncate">
                          {pact.title}
                        </h4>

                        <div className="text-[10px] font-mono text-amber-400 flex items-center justify-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-xs text-amber-400">local_fire_department</span>
                          <span>{pact.cleanStreakDays}d limpio</span>
                        </div>
                      </div>

                      {/* Expanded Details Modal / Drawer on Click */}
                      {isExpanded && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="w-full mt-2 pt-2 border-t border-rose-500/20 text-left flex flex-col gap-2 animate-fade-in"
                        >
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                            {pact.description || 'Sin descripción adicional.'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="text-rose-400 font-bold">-{pact.hpDamage} HP</span>
                            <span className="text-amber-400 font-bold">-{pact.goldPenalty} Pts</span>
                          </div>
                        </div>
                      )}

                      {/* Hover hint */}
                      <div className="text-[10px] font-mono text-rose-400/70 group-hover:text-rose-300 flex items-center justify-center gap-0.5">
                        <span>{isExpanded ? 'Cerrar' : 'Detalles'}</span>
                        <span className={`material-symbols-outlined text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          chevron_right
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENE 5: FOCUS (POMODORO INTEGRADO)                                  */}
        {/* ==================================================================== */}
        {activeScene === 'focus' && (
          <div className="w-full max-w-lg flex flex-col items-center text-center animate-fade-in py-2 my-auto pb-24">
            <button
              onClick={() => triggerWipeTransition('hub')}
              className="self-start text-xs sm:text-sm text-[#7c8aa8] hover:text-white flex items-center gap-1 font-mono transition-colors mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Objetivos
            </button>

            <div className="flex items-center justify-between w-full mb-1">
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#e7edf7] flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">timer</span>
                <span>Sesión de Enfoque Profundo</span>
              </h3>

              {/* Visual Mode Selector: 3D Orb vs Digital */}
              <div className="flex items-center gap-1 bg-[#0c1322]/90 p-1 rounded-lg border border-[#1c2a45]">
                <button
                  onClick={() => {
                    sound.playBeep(480, 0.03);
                    setFocusVisualMode('3d');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                    focusVisualMode === '3d'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Esfera 3D de respiración"
                >
                  Esfera 3D
                </button>
                <button
                  onClick={() => {
                    sound.playBeep(480, 0.03);
                    setFocusVisualMode('classic');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                    focusVisualMode === 'classic'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Reloj digital clásico"
                >
                  Digital
                </button>
              </div>
            </div>

            <p className="text-xs font-mono text-purple-300 mb-4 self-start">
              Bloque de Trabajo Profundo, Respiración y Audio Ambiental
            </p>

            {/* Time Presets */}
            <div className="flex items-center gap-2 mb-4">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setIsFocusRunning(false);
                    sound.stopAmbientFocus();
                    setIsAmbientPlaying(false);
                    setFocusInitialSeconds(mins * 60);
                    setFocusSeconds(mins * 60);
                    sound.playBeep(520, 0.09);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                    focusInitialSeconds === mins * 60
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-[#0c1322] border border-[#1c2a45] text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Central Visual & Timer Display */}
            {focusVisualMode === '3d' ? (
              <div className="relative w-56 h-56 flex flex-col items-center justify-center mb-4">
                <FocusCadenceOrb3D
                  isRunning={isFocusRunning}
                  isPaused={!isFocusRunning && focusSeconds < focusInitialSeconds}
                  breathePhase={breathePhase}
                />
                
                {/* Digits & Cadence Overlay */}
                <div className="absolute inset-x-0 bottom-2 flex flex-col items-center pointer-events-none">
                  <span className="font-rajdhani font-bold text-3xl text-white tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {Math.floor(focusSeconds / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(focusSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                    isFocusRunning
                      ? 'text-cyan-300 bg-[#0c1322]/80 border border-cyan-500/40 animate-pulse'
                      : 'text-purple-300 bg-[#0c1322]/80 border border-purple-500/30'
                  }`}>
                    {isFocusRunning ? breatheLabel : 'EN ESPERA'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-48 h-48 rounded-full border-2 border-purple-500/40 bg-[#0c1322] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.25)] mb-4">
                <span className="font-rajdhani font-bold text-5xl text-white tracking-widest">
                  {Math.floor(focusSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(focusSeconds % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono text-purple-400 mt-1 uppercase tracking-wider">
                  {isFocusRunning ? breatheLabel : 'EN ESPERA'}
                </span>
              </div>
            )}

            {/* ============================================================== */}
            {/* AMBIENT AUDIO ENGINE CONTROLS (Mobile Optimized & Tested)      */}
            {/* ============================================================== */}
            <div className="w-full max-w-sm bg-[#0c1322]/95 border border-[#1c2a45] rounded-2xl p-3.5 mb-5 backdrop-blur-md text-left shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-sm ${isAmbientPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>
                    {isAmbientPlaying ? 'graphic_eq' : 'headphones'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Audio Ambiental
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quick test button for mobile phones */}
                  <button
                    onClick={async () => {
                      await sound.resumeContext();
                      sound.playBeep(528, 0.12);
                      sound.testFocusAudio(ambientSoundMode !== 'off' ? ambientSoundMode : 'alpha');
                      showToast('Probando audio en altavoces...');
                    }}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 flex items-center gap-1 active:scale-95 transition-all"
                    title="Emitir prueba de audio para verificar altavoz del móvil"
                  >
                    <span className="material-symbols-outlined text-[11px]">volume_up</span>
                    <span>Probar</span>
                  </button>

                  <button
                    onClick={() => handleToggleFocusAmbient()}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 active:scale-95 ${
                      isAmbientPlaying
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Alternar reproducción de audio"
                  >
                    <span className="material-symbols-outlined text-[11px]">
                      {isAmbientPlaying ? 'play_arrow' : 'pause'}
                    </span>
                    <span>{isAmbientPlaying ? 'Activo' : 'Pausado'}</span>
                  </button>
                </div>
              </div>

              {/* Sound Mode Options */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'alpha', label: 'Alpha 432Hz', icon: 'psychology' },
                  { id: 'rain', label: 'Lluvia Zen', icon: 'rainy' },
                  { id: 'noise', label: 'Ruido Rosa', icon: 'air' },
                  { id: 'off', label: 'Silencio', icon: 'volume_off' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={async () => {
                      await sound.resumeContext();
                      sound.playBeep(480, 0.09);
                      handleToggleFocusAmbient(s.id as any);
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border text-center transition-all active:scale-95 ${
                      ambientSoundMode === s.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-[#070b14] border-[#162238] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                    <span className="text-[9px] font-mono leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">volume_down</span>
                    <span>Intensidad de Sonido</span>
                  </span>
                  <span className="font-bold text-cyan-300">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.00"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  title="Ajustar volumen del audio ambiental"
                />
              </div>

              {/* Breath Cadence Bells Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2a45]/60 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="material-symbols-outlined text-xs text-purple-400">notifications_active</span>
                  <span>Campanas de Respiración (4-4-4-4)</span>
                </div>
                <button
                  onClick={() => {
                    sound.playBeep(breathChimesEnabled ? 380 : 580, 0.08);
                    setBreathChimesEnabled(!breathChimesEnabled);
                    if (!breathChimesEnabled) {
                      sound.playBreathCue('inhale', ambientVolume);
                      showToast('Campanas de respiración activadas');
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all active:scale-95 ${
                    breathChimesEnabled
                      ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Activar o silenciar campanas de guía de respiración"
                >
                  {breathChimesEnabled ? 'Activas' : 'Silenciadas'}
                </button>
              </div>
            </div>

            {/* Play / Pause / Reset / Extended Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFocusTimer}
                className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 shadow-md flex items-center gap-1.5 ${
                  isFocusRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.35)]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isFocusRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isFocusRunning ? 'Pausar' : 'Comenzar Enfoque'}</span>
              </button>

              <button
                onClick={() => {
                  setIsFocusRunning(false);
                  sound.stopAmbientFocus();
                  setIsAmbientPlaying(false);
                  setFocusSeconds(focusInitialSeconds);
                  sound.playBeep(320, 0.09);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0c1322] border border-[#1c2a45] hover:border-slate-500 text-slate-300 font-mono text-xs font-bold active:scale-95 flex items-center gap-1"
                title="Reiniciar temporizador"
              >
                <span className="material-symbols-outlined text-sm">replay</span>
                <span>Reiniciar</span>
              </button>

              <button
                onClick={() => {
                  setFocusSeconds((prev) => prev + 300);
                  sound.playBeep(520, 0.09);
                  showToast('+5 minutos añadidos');
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0c1322] border border-[#1c2a45] hover:border-slate-500 text-cyan-400 font-mono text-xs font-bold active:scale-95"
                title="Añadir 5 minutos de extensión"
              >
                +5m
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENE 6: REAL REWARDS SHOP (TIENDA DE RECOMPENSAS DE VIDA REAL)      */}
        {/* ==================================================================== */}
        {activeScene === 'shop' && (
          <RealRewardsShop
            player={player}
            onBackToHub={() => triggerWipeTransition('hub')}
            onClaimReward={(reward) => {
              if (onClaimRealReward) {
                onClaimRealReward(reward);
              }
            }}
            onAddReward={(rewardData) => {
              if (onAddRealReward) {
                onAddRealReward(rewardData);
              }
            }}
            onDeleteReward={(rewardId) => {
              if (onDeleteRealReward) {
                onDeleteRealReward(rewardId);
              }
            }}
          />
        )}
      </main>

      {/* 5. Full Screen Wipe Transition */}
      {wipeActive && (
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-[#03040a]"
          style={{
            transition: 'clip-path 0.42s cubic-bezier(0.6, 0, 0.4, 1)',
            clipPath:
              wipeStage === 'covering'
                ? `circle(1600px at ${wipeOrigin.x}px ${wipeOrigin.y}px)`
                : `circle(0px at ${wipeOrigin.x}px ${wipeOrigin.y}px)`,
          }}
        />
      )}

      {/* 6. RADIAL "STAR" MENU (EL MENÚ QUE SE ABRE COMO ESTRELLA) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        {/* Backdrop blur overlay when star menu is open */}
        {isRadialMenuOpen && (
          <div
            onClick={() => setIsRadialMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity animate-fade-in"
          />
        )}

        {/* Orbiting Radial Star Items */}
        {radialMenuItems.map((item) => {
          // Convert angle to radians: 0 is right, 270 is top, etc.
          const rad = (item.angle * Math.PI) / 180;
          const radius = isRadialMenuOpen ? 108 : 0;
          const x = Math.round(Math.cos(rad) * radius);
          const y = Math.round(Math.sin(rad) * radius);

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerWipeTransition(item.scene, e);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute z-40 flex flex-col items-center justify-center transition-all duration-300 ease-out ${
                isRadialMenuOpen
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-50 pointer-events-none'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              title={item.label}
            >
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform ${
                  activeScene === item.scene
                    ? 'border-cyan-400 bg-[#0e1b2e]'
                    : 'border-[#1c2a45] bg-[#0c1322] hover:border-slate-400'
                }`}
                style={{
                  boxShadow: `0 0 16px ${item.color}40`,
                }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: item.color }}>
                  {item.icon}
                </span>
              </div>
              <span className="mt-1 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#060a12]/90 border border-white/10 text-white whitespace-nowrap shadow-md">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Central Core Star Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playBeep(isRadialMenuOpen ? 350 : 540, 0.04);
            setIsRadialMenuOpen(!isRadialMenuOpen);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={`relative z-40 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
            isRadialMenuOpen
              ? 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_24px_rgba(56,189,248,0.7)] rotate-45'
              : 'border-cyan-500/50 bg-[#0c1322]/95 text-cyan-400 hover:border-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.4)]'
          }`}
          title="Menú de Navegación del Sistema"
        >
          <span className="material-symbols-outlined text-2xl transition-transform duration-300">
            {isRadialMenuOpen ? 'close' : 'hub'}
          </span>
        </button>
      </div>

      {/* 7. Modal: Create New Objetivo (Manual + IA con Selección de Dificultad & Categoría) */}
      {isCreateQuestOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1322] border border-[#1c2a45] rounded-3xl p-5 sm:p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2a45]/60 mb-4">
              <h3 className="font-sans font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-xl">add_task</span>
                <span>Nuevo Objetivo Diario</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreateQuestOpen(false);
                  setAiGeneratedResult(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Mode Tabs: IA vs Manual */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#060a12] border border-[#1c2a45] rounded-xl mb-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(520, 0.03);
                  setQuestModalTab('ai');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  questModalTab === 'ai'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>Generar con IA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(520, 0.03);
                  setQuestModalTab('manual');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  questModalTab === 'manual'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>Manual</span>
              </button>
            </div>

            {/* TAB 1: GENERACIÓN CON IA */}
            {questModalTab === 'ai' && (
              <div className="space-y-4">
                {/* Configuration: Category & Difficulty */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Categoría</label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 text-xs"
                    >
                      <option value="random">🎲 Aleatoria (Cualquiera)</option>
                      <option value="fitness">💪 Fuerza & Físico</option>
                      <option value="intellect">🧠 Intelecto & Estudio</option>
                      <option value="discipline">🛡️ Disciplina & Hábitos</option>
                      <option value="mindfulness">🧘 Enfoque & Salud</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Dificultad</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 text-xs"
                    >
                      <option value="Normal">Normal (Hábito diario)</option>
                      <option value="Desafiante">Desafiante (Exigente)</option>
                      <option value="Intenso">Intenso (Límite personal)</option>
                    </select>
                  </div>
                </div>

                {/* Optional Custom Goal Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 text-xs font-mono font-semibold">¿Tienes una meta en mente?</label>
                    <span className="text-[10px] font-mono text-slate-500">(Opcional)</span>
                  </div>
                  <input
                    type="text"
                    value={aiGoalPrompt}
                    onChange={(e) => setAiGoalPrompt(e.target.value)}
                    placeholder="Ej: Salir a correr, estudiar 30 min, meditar..."
                    className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 text-xs font-sans placeholder:text-slate-600"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Déjalo vacío para que la IA genere un objetivo aleatorio de acuerdo a tu nivel y categoría.
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiQuest}
                  disabled={isGeneratingAi}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    isGeneratingAi
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 cursor-wait animate-pulse'
                      : 'bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isGeneratingAi ? 'sync' : 'auto_awesome'}
                  </span>
                  <span>{isGeneratingAi ? 'Consultando al Sistema con IA...' : 'Generar Objetivo con IA'}</span>
                </button>

                {/* AI Result Card */}
                {aiGeneratedResult && (
                  <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/40 shadow-xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        {aiGeneratedResult.category === 'fitness' ? 'Fuerza' :
                         aiGeneratedResult.category === 'intellect' ? 'Intelecto' :
                         aiGeneratedResult.category === 'mindfulness' ? 'Enfoque' : 'Disciplina'}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        +{aiGeneratedResult.xp} XP
                      </span>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm text-white leading-snug">
                        {aiGeneratedResult.title}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed mt-1">
                        {aiGeneratedResult.description}
                      </p>
                    </div>

                    {aiGeneratedResult.systemMessage && (
                      <div className="p-2 rounded-lg bg-[#0c1424] border border-blue-500/20 text-[11px] text-cyan-200/90 font-mono italic flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-cyan-400">terminal</span>
                        <span>"{aiGeneratedResult.systemMessage}"</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateAiQuest}
                        disabled={isGeneratingAi}
                        className="flex-1 py-2 rounded-xl border border-[#1c2a45] hover:border-slate-400 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">cached</span>
                        <span>Probar otra</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptAiQuest}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold tracking-wider transition-all shadow-md shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>Aceptar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MANUAL FORM */}
            {questModalTab === 'manual' && (
              <form onSubmit={handleCreateQuestSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Título del Objetivo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 50 flexiones, 30 min de lectura..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Descripción Completa</label>
                  <textarea
                    rows={3}
                    placeholder="Instrucciones detalladas o propósito del objetivo"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 text-xs"
                    >
                      <option value="fitness">Fuerza (Físico)</option>
                      <option value="intellect">Intelecto (Estudio)</option>
                      <option value="discipline">Disciplina (Hábitos)</option>
                      <option value="mindfulness">Enfoque (Mente)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Recompensa XP</label>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      value={newXp}
                      onChange={(e) => setNewXp(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-cyan-400 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateQuestOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#1c2a45] text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 active:scale-95 transition-all"
                  >
                    Crear Objetivo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. Modal: Create New Compromiso */}
      {isCreatePactOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1322] border border-[#1c2a45] rounded-2xl p-5 shadow-2xl animate-scale-up">
            <h3 className="font-sans font-bold text-lg text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400 text-lg">verified_user</span>
              <span>Nuevo Compromiso</span>
            </h3>

            <form onSubmit={handleCreatePactSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título del Compromiso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cero comida chatarra, No posponer alarma..."
                  value={newPactTitle}
                  onChange={(e) => setNewPactTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Descripción / Regla</label>
                <textarea
                  rows={2}
                  placeholder="Define con precisión qué constituye un desliz..."
                  value={newPactDesc}
                  onChange={(e) => setNewPactDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-rose-400 resize-none font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Área</label>
                <select
                  value={newPactCategory}
                  onChange={(e) => setNewPactCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="discipline">Disciplina & Productividad</option>
                  <option value="health">Salud Física & Descanso</option>
                  <option value="nutrition">Nutrición & Dieta</option>
                  <option value="mind">Salud Mental & Tiempo de Pantalla</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Frase de Advertencia (Voz opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Mantente firme, tus metas valen más."
                  value={newPactVoice}
                  onChange={(e) => setNewPactVoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2a45] text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePactOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1c2a45] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md active:scale-95"
                >
                  Guardar Compromiso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#0c1322] border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold shadow-2xl backdrop-blur-md animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
