import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import DungeonList from './pages/DungeonList';
import Shop from './pages/Shop';
import ShadowArmy from './pages/ShadowArmy';
import SkillTree from './pages/SkillTree';
import WorldBosses from './pages/WorldBosses';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import QuickMobileWidget from './components/QuickMobileWidget';
import QuestModal from './components/QuestModal';
import CreateDungeonModal from './components/CreateDungeonModal';
import PenaltyModal from './components/PenaltyModal';
import SystemModal, { SystemModalData } from './components/SystemModal';
import HunterProfileModal from './components/HunterProfileModal';
import EmergencyQuestModal from './components/EmergencyQuestModal';
import HunterSagasModal from './components/HunterSagasModal';
import WeeklyAuditModal from './components/WeeklyAuditModal';
import FocusDungeonModal from './components/FocusDungeonModal';
import MirrorShadowModal from './components/MirrorShadowModal';
import HunterLicenseModal from './components/HunterLicenseModal';
import AuthModal from './components/AuthModal';
import SystemTourModal from './components/SystemTourModal';
import { 
  onHunterAuthStateChange, 
  signOutHunter, 
  syncHunterProfile, 
  syncQuestsToSupabase, 
  deleteQuestFromSupabase,
  loadHunterProfile, 
  loadQuestsFromSupabase,
  syncCompleteGameState,
  isSupabaseConfigured
} from './utils/supabase';

import { Player, Quest, Item, Dungeon, ShopItem, SystemLog, ShadowExpedition, HunterSkill, HunterAchievement, WorldBoss, HunterSaga, WeeklyAuditReport, ForbiddenPact } from './types';
import {
  loadStoredPlayer,
  saveStoredPlayer,
  loadStoredQuests,
  saveStoredQuests,
  loadStoredDungeons,
  saveStoredDungeons,
  loadStoredExpeditions,
  saveStoredExpeditions,
  loadStoredSkills,
  saveStoredSkills,
  loadStoredAchievements,
  saveStoredAchievements,
  loadStoredWorldBosses,
  saveStoredWorldBosses,
  loadStoredSagas,
  saveStoredSagas,
  loadIsAwakened,
  saveIsAwakened,
  loadSystemLogs,
  saveSystemLogs,
  checkDailyReset,
  forceDailyReset,
} from './utils/storage';
import { INITIAL_PLAYER, INITIAL_QUESTS, INITIAL_DUNGEONS, INITIAL_SHADOW_EXPEDITIONS, INITIAL_SKILLS, INITIAL_ACHIEVEMENTS, INITIAL_WORLD_BOSSES } from './constants';
import { getRankFromLevel, getTitleFromLevel } from './utils/calculator';
import { sound } from './utils/sound';
import { getRandomDailyQuests } from './utils/dailyQuestCatalog';
import { sanitizePlayerData } from './utils/playerSanitizer';
import confetti from 'canvas-confetti';
type Page = 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [awakened, setAwakened] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player>(loadStoredPlayer);
  const [quests, setQuests] = useState<Quest[]>(loadStoredQuests);
  const [dungeons, setDungeons] = useState<Dungeon[]>(loadStoredDungeons);
  const [expeditions, setExpeditions] = useState<ShadowExpedition[]>(loadStoredExpeditions);
  const [skills, setSkills] = useState<HunterSkill[]>(loadStoredSkills);
  const [achievements, setAchievements] = useState<HunterAchievement[]>(loadStoredAchievements);
  const [bosses, setBosses] = useState<WorldBoss[]>(loadStoredWorldBosses);
  const [sagas, setSagas] = useState<HunterSaga[]>(loadStoredSagas);
  const [logs, setLogs] = useState<SystemLog[]>(loadSystemLogs);

  // Modals
  const [isQuestModalOpen, setIsQuestModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isCreateDungeonOpen, setIsCreateDungeonOpen] = useState<boolean>(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSagasModalOpen, setIsSagasModalOpen] = useState<boolean>(false);
  const [isWeeklyAuditModalOpen, setIsWeeklyAuditModalOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [isMirrorModalOpen, setIsMirrorModalOpen] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [systemModal, setSystemModal] = useState<SystemModalData>({
    isOpen: false,
    title: '',
    type: 'info',
    onClose: () => {},
  });

  // Supabase Auth Listener
  useEffect(() => {
    const unsubscribe = onHunterAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudData = await loadHunterProfile(user.id);
          const cloudQuests = await loadQuestsFromSupabase(user.id);

          if (cloudData && cloudData.player && Object.keys(cloudData.player).length > 0) {
            setPlayer((prev) => {
              const merged = sanitizePlayerData({ ...prev, ...cloudData.player });
              saveStoredPlayer(merged);
              return merged;
            });

            if (cloudData.skills && cloudData.skills.length > 0) {
              setSkills(cloudData.skills);
              saveStoredSkills(cloudData.skills);
            }
            if (cloudData.dungeons && cloudData.dungeons.length > 0) {
              setDungeons(cloudData.dungeons);
              saveStoredDungeons(cloudData.dungeons);
            }
            if (cloudData.expeditions && cloudData.expeditions.length > 0) {
              setExpeditions(cloudData.expeditions);
              saveStoredExpeditions(cloudData.expeditions);
            }
            if (cloudData.achievements && cloudData.achievements.length > 0) {
              setAchievements(cloudData.achievements);
              saveStoredAchievements(cloudData.achievements);
            }
            if (cloudData.bosses && cloudData.bosses.length > 0) {
              setBosses(cloudData.bosses);
              saveStoredWorldBosses(cloudData.bosses);
            }
            if (cloudData.sagas && cloudData.sagas.length > 0) {
              setSagas(cloudData.sagas);
              saveStoredSagas(cloudData.sagas);
            }

            setAwakened(true);
            saveIsAwakened(true);
            setCurrentPage('dashboard');
            addLog(`Progreso total (100%) recuperado de la base de datos para ${user.email}.`, 'system');
          } else {
            // First time this user logs in: sync local state to Supabase completely
            await syncCompleteGameState(user.id, {
              player,
              quests,
              dungeons,
              expeditions,
              skills,
              achievements,
              bosses,
              sagas,
            });
            setAwakened(true);
            saveIsAwakened(true);
            setCurrentPage('dashboard');
            addLog('Perfil y todos los elementos registrados en la nube de Supabase.', 'system');
          }

          if (cloudQuests && cloudQuests.length > 0) {
            setQuests(cloudQuests);
            saveStoredQuests(cloudQuests);
          }
        } catch (err) {
          console.warn('Initial Supabase sync check:', err);
          setAwakened(true);
          saveIsAwakened(true);
          setCurrentPage('dashboard');
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-sync full game state changes to Supabase when logged in
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await syncHunterProfile(currentUser.id, player, {
            skills,
            dungeons,
            expeditions,
            achievements,
            bosses,
            sagas,
          });
          await syncQuestsToSupabase(currentUser.id, quests);
        } catch (e) {
          console.warn('Auto-sync error:', e);
        } finally {
          setIsSyncing(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [player, quests, skills, dungeons, expeditions, achievements, bosses, sagas, currentUser]);

  // Manual Full Sync Handler
  const handleManualSync = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSyncing(true);
    sound.playBeep(700, 0.08);
    try {
      const res = await syncCompleteGameState(currentUser.id, {
        player,
        quests,
        dungeons,
        expeditions,
        skills,
        achievements,
        bosses,
        sagas,
      });
      if (res.success) {
        sound.playLevelUp();
        addLog(res.message, 'system');
        setSystemModal({
          isOpen: true,
          title: '¡SINCRONIZACIÓN EXITOSA!',
          subtitle: 'El 100% de tus elementos (Perfil, Atributos, Inventario, Equipamiento, Habilidades, Mazmorras, Sombras, Logros y Sagas) han sido asegurados en la Base de Datos.',
          type: 'info',
          onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        addLog(res.message, 'system');
      }
    } catch (e: any) {
      addLog(`Error al sincronizar: ${e.message}`, 'system');
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load of awakening, tour check & periodic daily check
  useEffect(() => {
    const isAwake = loadIsAwakened();
    setAwakened(isAwake);
    sound.enabled = player.soundEnabled;

    // Check if player has seen the system tour
    const hasSeenTour = localStorage.getItem('shadow_system_tour_seen');
    if (!hasSeenTour && isAwake) {
      setIsTourModalOpen(true);
    }

    const runDailyCheck = () => {
      checkDailyReset(player, quests, (updatedPlayer, updatedQuests) => {
        setPlayer(updatedPlayer);
        setQuests(updatedQuests);
        addLog('Nuevo ciclo diario comenzado. Misiones diarias reseteadas.', 'quest');
      });
    };

    runDailyCheck();

    const interval = setInterval(runDailyCheck, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runDailyCheck();
      }
    };
    window.addEventListener('focus', runDailyCheck);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', runDailyCheck);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [player.lastActiveDate, quests]);

  // Sync sound setting
  const toggleSound = () => {
    const nextVal = !player.soundEnabled;
    sound.enabled = nextVal;
    const updated = { ...player, soundEnabled: nextVal };
    setPlayer(updated);
    saveStoredPlayer(updated);
    if (nextVal) {
      sound.playBeep(800, 0.08);
    }
  };

  const addLog = (message: string, type: SystemLog['type'] = 'quest') => {
    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message,
      type,
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      saveSystemLogs(updated);
      return updated;
    });
  };

  const handleAwaken = (hunterName: string, avatarId?: string) => {
    const updated: Player = {
      ...player,
      name: hunterName,
      avatarId: avatarId || player.avatarId || 'monarch-shadow',
    };
    setPlayer(updated);
    saveStoredPlayer(updated);
    setAwakened(true);
    saveIsAwakened(true);
    addLog(`El cazador ${hunterName} ha despertado con éxito.`, 'level_up');
  };

  // Level Up Logic
  useEffect(() => {
    if (player.xp >= player.maxXp) {
      const newLevel = player.level + 1;
      const newRank = getRankFromLevel(newLevel);
      const newTitle = getTitleFromLevel(newLevel);
      const leftoverXp = player.xp - player.maxXp;
      const nextMaxXp = Math.floor(player.maxXp * 1.25);
      const goldReward = newLevel * 400;
      const addedStatPoints = 3;

      const updatedPlayer: Player = {
        ...player,
        level: newLevel,
        rank: newRank,
        title: newTitle,
        xp: leftoverXp,
        maxXp: nextMaxXp,
        gold: player.gold + goldReward,
        statPoints: player.statPoints + addedStatPoints,
      };

      setPlayer(updatedPlayer);
      saveStoredPlayer(updatedPlayer);

      sound.playLevelUp();
      sound.speakSystemVoice(`¡Subida de nivel! Ahora eres nivel ${newLevel}.`);
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#4d6aff', '#8b5cf6', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      setSystemModal({
        isOpen: true,
        title: `¡HAS SUBIDO AL NIVEL ${newLevel}!`,
        subtitle: `Tu presencia de combate se intensifica. Has alcanzado el rango [ ${newRank} ].`,
        type: 'level_up',
        rewards: {
          gold: goldReward,
          statPoints: addedStatPoints,
        },
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });

      addLog(`¡Subida de Nivel! Ahora eres Nivel ${newLevel} (${newRank}). +3 Puntos de Estadística.`, 'level_up');
    }
  }, [player.xp]);

  // Complete Quest
  const completeQuest = (id: string) => {
    const targetQuest = quests.find((q) => q.id === id);
    if (!targetQuest || targetQuest.completed) return;

    sound.playQuestComplete();
    sound.speakSystemVoice(`Misión cumplida: ${targetQuest.title}.`);

    // Dificultad del juego (Casual / Cazador / Monarca)
    const difficultyMult = player.gameDifficulty === 'casual' ? 1.25 : player.gameDifficulty === 'monarch' ? 1.5 : 1.0;

    // Afinidades de Arquetipo de Estilo de Vida
    let archetypeBonusXp = 0;
    let archetypeBonusHp = 10; // Recuperación vital basal por cumplir objetivos
    let archetypeBonusMp = 10;

    if (player.lifestyleArchetype === 'guardian' && targetQuest.category === 'fitness') {
      archetypeBonusXp = Math.round(targetQuest.rewards.xp * 0.25);
      archetypeBonusHp = 25; // Bonificación de vitalidad extra para guardianes del ejercicio
    } else if (player.lifestyleArchetype === 'scholar' && targetQuest.category === 'intellect') {
      archetypeBonusXp = Math.round(targetQuest.rewards.xp * 0.25);
      archetypeBonusMp = 30; // Regeneración de maná para eruditos del estudio
    } else if (player.lifestyleArchetype === 'shadow' && (targetQuest.category === 'mindfulness' || targetQuest.category === 'discipline')) {
      archetypeBonusXp = Math.round(targetQuest.rewards.xp * 0.25);
    } else if (player.lifestyleArchetype === 'monarch') {
      archetypeBonusXp = Math.round(targetQuest.rewards.xp * 0.15);
    }

    const xpEarned = Math.round((targetQuest.rewards.xp * difficultyMult) + archetypeBonusXp);
    const goldEarned = Math.round(targetQuest.rewards.gold * difficultyMult);
    const essenceEarned = targetQuest.rewards.essenceStones || 0;
    const statPtsEarned = targetQuest.rewards.statPoints || 0;

    const maxHp = player.maxHp ?? 100;
    const currentHp = player.hp ?? 100;
    const newHp = Math.min(maxHp, currentHp + archetypeBonusHp);

    const maxMp = player.maxMp ?? 300;
    const currentMp = player.mp ?? 300;
    const newMp = Math.min(maxMp, currentMp + archetypeBonusMp);

    const updatedQuests = quests.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          completed: true,
          currentCount: q.targetCount || q.currentCount,
          completedAt: new Date().toISOString(),
        };
      }
      return q;
    });

    const updatedPlayer: Player = {
      ...player,
      hp: newHp,
      mp: newMp,
      xp: player.xp + xpEarned,
      gold: player.gold + goldEarned,
      essenceStones: player.essenceStones + essenceEarned,
      statPoints: player.statPoints + statPtsEarned,
    };

    setQuests(updatedQuests);
    saveStoredQuests(updatedQuests);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: 'MISIÓN COMPLETADA',
      subtitle: `Has cumplido con éxito: "${targetQuest.title}".`,
      type: 'quest_reward',
      rewards: {
        xp: xpEarned,
        gold: goldEarned,
        essenceStones: essenceEarned > 0 ? essenceEarned : undefined,
        statPoints: statPtsEarned > 0 ? statPtsEarned : undefined,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Misión completada: "${targetQuest.title}". Recompensas acreditadas.`, 'quest');
  };

  // Increment Quest Progress
  const incrementQuestProgress = (id: string, step: number) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.completed) return;

    sound.playBeep(580, 0.04);
    const newCount = (quest.currentCount || 0) + step;
    if (quest.targetCount && newCount >= quest.targetCount) {
      completeQuest(id);
    } else {
      const updated = quests.map((q) => (q.id === id ? { ...q, currentCount: newCount } : q));
      setQuests(updated);
      saveStoredQuests(updated);
    }
  };

  // Reset Quest Progress to 0
  const resetQuestProgress = (id: string) => {
    sound.playBeep(400, 0.04);
    const updated = quests.map((q) => (q.id === id ? { ...q, currentCount: 0 } : q));
    setQuests(updated);
    saveStoredQuests(updated);
  };

  // Update Hunter Profile (Avatar, Frame, Name, Title)
  const handleUpdateProfile = (updates: Partial<Player>) => {
    const updated: Player = {
      ...player,
      ...updates,
    };
    setPlayer(updated);
    saveStoredPlayer(updated);
    addLog(`Identificación del Cazador actualizada: ${updated.name}.`, 'level_up');
  };

  // Add Custom Quest
  const addQuest = (questData: Omit<Quest, 'id' | 'completed' | 'createdAt'>) => {
    sound.playBeep(620, 0.06);
    const newQuest: Quest = {
      ...questData,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newQuest, ...quests];
    setQuests(updated);
    saveStoredQuests(updated);
    setIsQuestModalOpen(false);
    addLog(`Nueva misión registrada en el sistema: "${newQuest.title}".`, 'quest');
  };

  // Add Emergency Quest
  const handleAcceptEmergencyQuest = (emergencyQuest: Quest) => {
    const updated = [emergencyQuest, ...quests];
    setQuests(updated);
    saveStoredQuests(updated);
    setIsEmergencyModalOpen(false);
    addLog(`¡INCIDENCIA DE PUERTA ROJA ACTIVADA!: "${emergencyQuest.title}".`, 'dungeon');
  };

  // Delete Quest
  const deleteQuest = (id: string) => {
    sound.playBeep(320, 0.05);
    const updated = quests.filter((q) => q.id !== id);
    setQuests(updated);
    saveStoredQuests(updated);
    if (currentUser) {
      deleteQuestFromSupabase(currentUser.id, id).catch(() => {});
    }
    addLog(`Misión eliminada del protocolo de cazador.`, 'quest');
  };

  // Quick Add 1 Random Daily Quest from diverse catalog
  const handleQuickAddRandomQuest = () => {
    const existingTitles = quests.map((q) => q.title);
    const [template] = getRandomDailyQuests(1, player.level, existingTitles);
    if (template) {
      const newQuest: Quest = {
        ...template,
        id: `q_cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [newQuest, ...quests];
      setQuests(updated);
      saveStoredQuests(updated);
      sound.playQuestAccept();
      addLog(`Misión diaria aleatoria asignada: "${newQuest.title}".`, 'quest');
    }
  };

  // Quick Add Balanced 4-Quest Routine from diverse catalog
  const handleQuickAddBalancedRoutine = () => {
    const existingTitles = quests.map((q) => q.title);
    const templates = getRandomDailyQuests(4, player.level, existingTitles);
    if (templates.length > 0) {
      const newQuests: Quest[] = templates.map((t, idx) => ({
        ...t,
        id: `q_cat_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        completed: false,
        createdAt: new Date().toISOString(),
      }));
      const updated = [...newQuests, ...quests];
      setQuests(updated);
      saveStoredQuests(updated);
      sound.playAwakening();
      addLog(`Rutina diaria balanceada asignada (${newQuests.length} misiones del catálogo variado).`, 'quest');
    }
  };

  // Pactos Prohibidos (Anti-Hábitos) Handlers
  const handleTriggerPactInfraction = (pactId: string) => {
    sound.playPactViolation();
    const targetPact = (player.forbiddenPacts || []).find((p) => p.id === pactId);
    if (!targetPact) return;

    const multiplier = player.gameDifficulty === 'casual' ? 0.5 : player.gameDifficulty === 'monarch' ? 1.5 : 1.0;
    const hpLoss = Math.round(targetPact.hpDamage * multiplier);
    const goldLoss = Math.round(targetPact.goldPenalty * multiplier);

    const currentHp = player.hp ?? 100;
    const nextHp = Math.max(0, currentHp - hpLoss);
    const nextGold = Math.max(0, player.gold - goldLoss);

    const updatedPacts = (player.forbiddenPacts || []).map((p) => {
      if (p.id === pactId) {
        return {
          ...p,
          totalInfractions: (p.totalInfractions || 0) + 1,
          cleanStreakDays: 0,
          lastInfractionAt: new Date().toISOString(),
        };
      }
      return p;
    });

    const updatedPlayer: Player = {
      ...player,
      hp: nextHp,
      gold: nextGold,
      forbiddenPacts: updatedPacts,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    addLog(`[PACTO ROTO] Falta en «${targetPact.title}». Consecuencia: -${hpLoss} HP, -${goldLoss} Oro.`, 'penalty');

    if (nextHp <= 0) {
      sound.playPenaltyWarning();
      sound.speakMotivationalPrompt('¡Salud agotada! El Sistema exige purificación en la Zona de Castigo. ¡Ponte de pie!');
      setSystemModal({
        isOpen: true,
        title: '¡SALUD AGOTADA: ZONA DE CASTIGO INMINENTE!',
        subtitle: `Tus puntos de salud han llegado a 0 tras romper tus pactos prohibidos. Para restaurar tu HP al 100%, el Sistema exige que completes el entrenamiento físico de supervivencia en la Zona de Castigo.`,
        type: 'penalty_warning',
        onClose: () => {
          setSystemModal((prev) => ({ ...prev, isOpen: false }));
          setIsPenaltyModalOpen(true);
        },
      });
    } else {
      const motivationalQuotes = [
        '«Una caída no define tu rango; lo que define a un Monarca es levantarse de inmediato sin dudar.»',
        '«El veneno fue registrado, pero tu voluntad es inquebrantable. Sacúdete el polvo y reconquista tu disciplina.»',
        '«El camino hacia la cima está forjado por caídas superadas. No permitas que un tropiezo se vuelva hábito.»',
        '«Respira hondo, Cazador. Reconoce el error, aprende la lección y continúa con la guardia en alto.»'
      ];
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

      sound.speakMotivationalPrompt('Pacto registrado. Un Monarca tropieza pero se levanta de inmediato. ¡Continúa!');

      setSystemModal({
        isOpen: true,
        title: '⚠️ PACTO QUEBRANTADO: ¡RESURGE, CAZADOR!',
        subtitle: `Has registrado una falta en «${targetPact.title}».\n\nPenalización: -${hpLoss} HP | -${goldLoss} Oro (Racha de días limpios reiniciada).\n\n${randomQuote}`,
        type: 'info',
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleAddCustomPact = (pactData: Omit<ForbiddenPact, 'id' | 'cleanStreakDays' | 'lastInfractionAt' | 'totalInfractions'>) => {
    sound.playBeep(640, 0.06);
    const newPact: ForbiddenPact = {
      ...pactData,
      id: `pact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cleanStreakDays: 0,
      totalInfractions: 0,
      lastInfractionAt: null,
    };

    const updatedPacts = [...(player.forbiddenPacts || []), newPact];
    const updatedPlayer: Player = {
      ...player,
      forbiddenPacts: updatedPacts,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Nuevo Pacto Prohibido sellado: «${newPact.title}».`, 'quest');
  };

  const handleTogglePactActive = (pactId: string) => {
    sound.playBeep(480, 0.04);
    const updatedPacts = (player.forbiddenPacts || []).map((p) =>
      p.id === pactId ? { ...p, active: !p.active } : p
    );

    const updatedPlayer: Player = {
      ...player,
      forbiddenPacts: updatedPacts,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
  };

  // Manual Force Daily Reset
  const handleForceDailyReset = () => {
    sound.playBeep(650, 0.08);
    forceDailyReset(player, quests, (updatedPlayer, updatedQuests) => {
      setPlayer(updatedPlayer);
      setQuests(updatedQuests);
      addLog('Ciclo diario reiniciado. Misiones restauradas para el nuevo día.', 'quest');
      setSystemModal({
        isOpen: true,
        title: 'CICLO DIARIO REINICIADO',
        subtitle: 'El Sistema ha regenerado las misiones diarias y restablecido tu estado de energía para el nuevo ciclo.',
        type: 'info',
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    });
  };

  // Allocate Stat Point
  const allocateStat = (attrKey: 'str' | 'int' | 'vit' | 'agi' | 'wis' | 'cha') => {
    if (player.statPoints <= 0) return;

    sound.playBeep(720, 0.07);
    const currentAttr = player.attributes[attrKey];
    const nextVal = currentAttr.value + 1;

    let nextBonus = currentAttr.bonusText;
    if (attrKey === 'str') nextBonus = `+${(nextVal * 0.2).toFixed(1)}% Potencia física`;
    if (attrKey === 'int') nextBonus = `+${(nextVal * 0.2).toFixed(1)}% Capacidad cognitiva`;
    if (attrKey === 'vit') nextBonus = `+${(nextVal * 0.3).toFixed(1)}% Resistencia y energía`;
    if (attrKey === 'agi') nextBonus = `+${(nextVal * 0.2).toFixed(1)}% Velocidad de ejecución`;
    if (attrKey === 'wis') nextBonus = `+${(nextVal * 0.2).toFixed(1)}% Claridad mental`;
    if (attrKey === 'cha') nextBonus = `+${(nextVal * 0.2).toFixed(1)}% Presencia e influencia`;

    const updatedPlayer: Player = {
      ...player,
      statPoints: player.statPoints - 1,
      attributes: {
        ...player.attributes,
        [attrKey]: {
          ...currentAttr,
          value: nextVal,
          bonusText: nextBonus,
        },
      },
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Punto asignado a [${currentAttr.name}]. Nuevo valor: ${nextVal}.`, 'stat');
  };

  // Equip Item
  const equipItem = (item: Item) => {
    sound.playItemEquip();
    const slotKey = item.slot as keyof Player['equipped'];
    const currentlyEquipped = player.equipped[slotKey];

    // Remove item from inventory
    let nextInventory = player.inventory.filter((i) => i.id !== item.id);
    if (currentlyEquipped) {
      nextInventory.push(currentlyEquipped);
    }

    const updatedPlayer: Player = {
      ...player,
      equipped: {
        ...player.equipped,
        [slotKey]: item,
      },
      inventory: nextInventory,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Has equipado: [${item.name}].`, 'stat');
  };

  // Unequip Slot
  const unequipSlot = (slotKey: keyof Player['equipped']) => {
    sound.playItemEquip();
    const currentlyEquipped = player.equipped[slotKey];
    if (!currentlyEquipped) return;

    const updatedPlayer: Player = {
      ...player,
      equipped: {
        ...player.equipped,
        [slotKey]: null,
      },
      inventory: [...player.inventory, currentlyEquipped],
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Has desequipado: [${currentlyEquipped.name}].`, 'stat');
  };

  // Use Consumable
  const useConsumable = (item: Item) => {
    sound.playQuestComplete();
    const nextInventory = player.inventory.filter((i) => i.id !== item.id);
    let updatedPlayer: Player = {
      ...player,
      inventory: nextInventory,
    };

    if (item.consumableType === 'xp') {
      const xpVal = item.consumableValue || 500;
      updatedPlayer.xp += xpVal;
      setSystemModal({
        isOpen: true,
        title: 'ELIXIR CONSUMIDO',
        subtitle: `Has absorbido el poder de [${item.name}].`,
        type: 'info',
        rewards: { xp: xpVal },
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    } else if (item.consumableType === 'gold') {
      const goldVal = item.consumableValue || 500;
      updatedPlayer.gold += goldVal;
      setSystemModal({
        isOpen: true,
        title: 'RECURSO ABSORBIDO',
        subtitle: `Has obtenido oro instantáneo de [${item.name}].`,
        type: 'info',
        rewards: { gold: goldVal },
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    } else if (item.consumableType === 'stat_point') {
      const pts = item.consumableValue || 1;
      updatedPlayer.statPoints += pts;
      setSystemModal({
        isOpen: true,
        title: 'CRISTAL DE RESONANCIA',
        subtitle: `Tus canales de mana se expanden. Has obtenido +${pts} Puntos de Estadística.`,
        type: 'info',
        rewards: { statPoints: pts },
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    } else if (item.consumableType === 'essence') {
      const ess = item.consumableValue || 25;
      updatedPlayer.essenceStones += ess;
      setSystemModal({
        isOpen: true,
        title: 'BOLSA DE ESENCIAS',
        subtitle: `Has extraído +${ess} Essence Stones puras.`,
        type: 'info',
        rewards: { essenceStones: ess },
        onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
      });
    }

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Has consumido el objeto: [${item.name}].`, 'shop');
  };

  // Sell Item
  const sellItem = (item: Item) => {
    sound.playBeep(450, 0.05);
    const sellPrice = Math.floor(item.priceGold * 0.6);
    const nextInventory = player.inventory.filter((i) => i.id !== item.id);

    const updatedPlayer: Player = {
      ...player,
      gold: player.gold + sellPrice,
      inventory: nextInventory,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Has vendido [${item.name}] por +${sellPrice} Gold.`, 'shop');
  };

  // Buy Shop Item
  const buyShopItem = (item: ShopItem, currency: 'gold' | 'essence') => {
    if (currency === 'gold' && player.gold < item.priceGold) return;
    if (currency === 'essence' && item.priceEssence && player.essenceStones < item.priceEssence) return;

    sound.playQuestComplete();

    const updatedPlayer: Player = {
      ...player,
      gold: currency === 'gold' ? player.gold - item.priceGold : player.gold,
      essenceStones: currency === 'essence' && item.priceEssence ? player.essenceStones - item.priceEssence : player.essenceStones,
      inventory: [...player.inventory, { ...item, id: `item_${Date.now()}` }],
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: 'COMPRA CONFIRMADA',
      subtitle: `Has adquirido [${item.name}] en el Mercado del Sistema.`,
      type: 'loot_drop',
      rewards: {
        itemName: item.name,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Comprado: [${item.name}] en el Mercado.`, 'shop');
  };

  // Gacha Item drop
  const handleMysteryChest = (item: Item) => {
    const updatedPlayer: Player = {
      ...player,
      essenceStones: player.essenceStones - 25,
      inventory: [...player.inventory, item],
    };
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`¡Extracción Exitosa! Has invocado: [${item.name}] (${item.rarity}).`, 'shop');
  };

  // Add Custom Dungeon
  const addDungeon = (dungeonData: Omit<Dungeon, 'id' | 'completed'>) => {
    sound.playBeep(640, 0.08);
    const newDungeon: Dungeon = {
      ...dungeonData,
      id: `dungeon_${Date.now()}`,
      completed: false,
    };
    const updated = [newDungeon, ...dungeons];
    setDungeons(updated);
    saveStoredDungeons(updated);
    addLog(`Portal de mazmorra invocado: "${newDungeon.title}".`, 'dungeon');
  };

  // Complete Dungeon
  const completeDungeon = (dungeon: Dungeon) => {
    const xpReward = dungeon.rewards.xp;
    const goldReward = dungeon.rewards.gold;
    const essenceReward = dungeon.rewards.essenceStones;
    const droppedItem = dungeon.rewards.itemDrop;

    const nextInventory = droppedItem
      ? [...player.inventory, { ...droppedItem, id: `drop_${Date.now()}` }]
      : player.inventory;

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + xpReward,
      gold: player.gold + goldReward,
      essenceStones: player.essenceStones + essenceReward,
      inventory: nextInventory,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡VICTORIA EN LA MAZMORRA!',
      subtitle: `Has purificado la incursión: "${dungeon.title}".`,
      type: 'loot_drop',
      rewards: {
        xp: xpReward,
        gold: goldReward,
        essenceStones: essenceReward,
        itemName: droppedItem ? droppedItem.name : undefined,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`¡Incursión Conquistada! "${dungeon.title}". Recompensas y botín acreditados.`, 'dungeon');
  };

  // Complete Penalty
  const handleCompletePenalty = () => {
    sound.playRaidVictory();
    sound.playHeal();
    setIsPenaltyModalOpen(false);
    const bonusXp = 500;
    const maxHp = player.maxHp ?? 100;
    const updated: Player = {
      ...player,
      hp: maxHp,
      xp: player.xp + bonusXp,
      statPoints: player.statPoints + 1,
    };
    setPlayer(updated);
    saveStoredPlayer(updated);
    setSystemModal({
      isOpen: true,
      title: 'SUPERVIVENCIA EN PENALIZACIÓN',
      subtitle: 'Has superado el castigo del Sistema. Tus músculos y temple han sido reforzados y tus Puntos de Salud (HP) han sido totalmente restaurados.',
      type: 'info',
      rewards: {
        xp: bonusXp,
        statPoints: 1,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });
    addLog('Zona de Penalización superada con éxito. HP restaurado al 100% y +1 Punto de Estadística.', 'penalty');
  };

  // Shadow Army Methods
  const handleUpgradeShadow = (shadowId: string) => {
    const currentShadows = player.shadowArmy || [];
    const targetShadow = currentShadows.find((s) => s.id === shadowId);
    if (!targetShadow) return;

    const goldCost = targetShadow.level * 2500;
    const essenceCost = targetShadow.level * 15;
    if (player.gold < goldCost || player.essenceStones < essenceCost) return;

    sound.playLevelUp();
    const updatedShadows = currentShadows.map((s) => {
      if (s.id === shadowId) {
        return {
          ...s,
          level: s.level + 1,
        };
      }
      return s;
    });

    const updatedPlayer: Player = {
      ...player,
      gold: player.gold - goldCost,
      essenceStones: player.essenceStones - essenceCost,
      shadowArmy: updatedShadows,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`[${targetShadow.name}] ha ascendido al Nivel ${targetShadow.level + 1}.`, 'stat');
  };

  const handleUnlockShadow = (shadowId: string) => {
    const currentShadows = player.shadowArmy || [];
    const updatedShadows = currentShadows.map((s) => {
      if (s.id === shadowId) {
        return { ...s, unlocked: true };
      }
      return s;
    });

    const updatedPlayer: Player = {
      ...player,
      shadowArmy: updatedShadows,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    const targetShadow = currentShadows.find((s) => s.id === shadowId);
    setSystemModal({
      isOpen: true,
      title: '¡SOMBRA EXTRAÍDA CON ÉXITO!',
      subtitle: `Has pronunciado "ARISE". [${targetShadow?.name || 'Guerrero de Sombra'}] ahora se arrodilla ante ti.`,
      type: 'loot_drop',
      rewards: {
        itemName: targetShadow?.name,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`¡Extracción de Sombra! [${targetShadow?.name}] juró lealtad al Monarca.`, 'level_up');
  };

  const handleStartExpedition = (expeditionId: string, shadowId: string) => {
    sound.playBeep(680, 0.08);
    const updatedExpeditions = expeditions.map((exp) => {
      if (exp.id === expeditionId) {
        return {
          ...exp,
          status: 'in_progress' as const,
          assignedShadowId: shadowId,
          startedAt: new Date().toISOString(),
        };
      }
      return exp;
    });

    setExpeditions(updatedExpeditions);
    saveStoredExpeditions(updatedExpeditions);

    const targetExp = expeditions.find((e) => e.id === expeditionId);
    const targetShadow = (player.shadowArmy || []).find((s) => s.id === shadowId);
    addLog(`Expedición iniciada: [${targetShadow?.name}] enviado a "${targetExp?.title}".`, 'dungeon');
  };

  const handleClaimExpedition = (expeditionId: string) => {
    const exp = expeditions.find((e) => e.id === expeditionId);
    if (!exp) return;

    sound.playRaidVictory();
    const updatedExpeditions = expeditions.map((e) => {
      if (e.id === expeditionId) {
        return {
          ...e,
          status: 'idle' as const,
          assignedShadowId: null,
          startedAt: null,
        };
      }
      return e;
    });

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + exp.rewards.xp,
      gold: player.gold + exp.rewards.gold,
      essenceStones: player.essenceStones + exp.rewards.essenceStones,
    };

    setExpeditions(updatedExpeditions);
    saveStoredExpeditions(updatedExpeditions);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡EXPEDICIÓN DE SOMBRA COMPLETADA!',
      subtitle: `Tus soldados han retornado con los recursos saqueados de "${exp.title}".`,
      type: 'loot_drop',
      rewards: {
        xp: exp.rewards.xp,
        gold: exp.rewards.gold,
        essenceStones: exp.rewards.essenceStones,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Expedición completada: "${exp.title}". Botín reclamado.`, 'dungeon');
  };

  // Skill Tree Handlers
  const handleUpgradeSkill = (skillId: string) => {
    const targetSkill = skills.find((s) => s.id === skillId);
    if (!targetSkill) return;

    const cost = targetSkill.costEssence * targetSkill.level;
    if (player.essenceStones < cost || targetSkill.level >= targetSkill.maxLevel) return;

    const updatedSkills = skills.map((s) => {
      if (s.id === skillId) {
        return { ...s, level: s.level + 1 };
      }
      return s;
    });

    const updatedPlayer = {
      ...player,
      essenceStones: player.essenceStones - cost,
    };

    setSkills(updatedSkills);
    saveStoredSkills(updatedSkills);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Habilidad ascendiada: [${targetSkill.name}] Nivel ${targetSkill.level + 1}.`, 'stat');
  };

  const handleUnlockSkill = (skillId: string) => {
    const targetSkill = skills.find((s) => s.id === skillId);
    if (!targetSkill) return;

    if (player.level < targetSkill.unlockLevel || player.essenceStones < targetSkill.costEssence) return;

    const updatedSkills = skills.map((s) => {
      if (s.id === skillId) {
        return { ...s, unlocked: true };
      }
      return s;
    });

    const updatedPlayer = {
      ...player,
      essenceStones: player.essenceStones - targetSkill.costEssence,
    };

    setSkills(updatedSkills);
    saveStoredSkills(updatedSkills);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡HABILIDAD DESPERTADA!',
      subtitle: `Has asimilado la runa mágica [${targetSkill.name}].`,
      type: 'loot_drop',
      rewards: {
        itemName: targetSkill.name,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Nueva habilidad desbloqueada: [${targetSkill.name}].`, 'level_up');
  };

  const handleEquipTitle = (newTitle: string) => {
    const updatedPlayer = {
      ...player,
      equippedTitle: newTitle,
      title: newTitle,
    };
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
    addLog(`Título honorífico equipado: "${newTitle}".`, 'stat');
  };

  // World Boss Handlers
  const handleAttackBoss = (bossId: string, damage: number) => {
    const updatedBosses = bosses.map((b) => {
      if (b.id === bossId) {
        const nextHp = Math.max(0, b.currentHp - damage);
        const defeated = nextHp <= 0;
        return {
          ...b,
          currentHp: nextHp,
          defeated,
          damageLog: [
            { hunter: player.name || 'Monarca de las Sombras', damage, timestamp: 'Justo ahora' },
            ...b.damageLog.slice(0, 9),
          ],
        };
      }
      return b;
    });

    setBosses(updatedBosses);
    saveStoredWorldBosses(updatedBosses);

    const targetBoss = bosses.find((b) => b.id === bossId);
    if (targetBoss && targetBoss.currentHp - damage <= 0 && !targetBoss.defeated) {
      sound.playLevelUp();
      addLog(`¡Calamidad aniquilada! Has derrotado a [${targetBoss.name}].`, 'level_up');
    }
  };

  const handleClaimBossReward = (bossId: string) => {
    const targetBoss = bosses.find((b) => b.id === bossId);
    if (!targetBoss || !targetBoss.defeated) return;

    let updatedInventory = [...player.inventory];
    if (targetBoss.rewards.exclusiveItem) {
      updatedInventory.push(targetBoss.rewards.exclusiveItem);
    }

    let updatedTitles = [...(player.titlesUnlocked || ['Awakened Novice'])];
    if (targetBoss.rewards.titleUnlock && !updatedTitles.includes(targetBoss.rewards.titleUnlock)) {
      updatedTitles.push(targetBoss.rewards.titleUnlock);
    }

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + targetBoss.rewards.xp,
      gold: player.gold + targetBoss.rewards.gold,
      essenceStones: player.essenceStones + targetBoss.rewards.essenceStones,
      inventory: updatedInventory,
      titlesUnlocked: updatedTitles,
    };

    // Reset boss HP for next raid cycle
    const updatedBosses = bosses.map((b) => {
      if (b.id === bossId) {
        return {
          ...b,
          currentHp: b.maxHp,
          defeated: false,
        };
      }
      return b;
    });

    setBosses(updatedBosses);
    saveStoredWorldBosses(updatedBosses);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡BOTÍN DE JEFE RECLAMADO!',
      subtitle: `Has reclamado las recompensas legendarias por la aniquilación de ${targetBoss.name}.`,
      type: 'loot_drop',
      rewards: {
        xp: targetBoss.rewards.xp,
        gold: targetBoss.rewards.gold,
        essenceStones: targetBoss.rewards.essenceStones,
        itemName: targetBoss.rewards.exclusiveItem?.name,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Recompensas de jefe reclamadas: [${targetBoss.name}].`, 'dungeon');
  };

  const handleClaimAchievement = (achievementId: string) => {
    const ach = achievements.find((a) => a.id === achievementId);
    if (!ach || !ach.completed || ach.claimed) return;

    const updatedAchievements = achievements.map((a) => {
      if (a.id === achievementId) {
        return { ...a, claimed: true };
      }
      return a;
    });

    let updatedTitles = [...(player.titlesUnlocked || ['Awakened Novice'])];
    if (ach.rewards.titleReward && !updatedTitles.includes(ach.rewards.titleReward)) {
      updatedTitles.push(ach.rewards.titleReward);
    }

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + ach.rewards.xp,
      gold: player.gold + ach.rewards.gold,
      essenceStones: player.essenceStones + ach.rewards.essenceStones,
      titlesUnlocked: updatedTitles,
    };

    setAchievements(updatedAchievements);
    saveStoredAchievements(updatedAchievements);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡LOGRO DESBLOQUEADO!',
      subtitle: `"${ach.title}": ${ach.description}`,
      type: 'loot_drop',
      rewards: {
        xp: ach.rewards.xp,
        gold: ach.rewards.gold,
        essenceStones: ach.rewards.essenceStones,
        itemName: ach.rewards.titleReward ? `Título: ${ach.rewards.titleReward}` : undefined,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Logro completado: "${ach.title}".`, 'stat');
  };

  // Saga Campaign Handlers
  const handleActivateSaga = (sagaId: string) => {
    sound.playAwakening();
    const updated = sagas.map((s) => ({
      ...s,
      active: s.id === sagaId,
      startedAt: s.id === sagaId ? new Date().toISOString() : s.startedAt,
    }));
    setSagas(updated);
    saveStoredSagas(updated);
    addLog(`Nueva Saga del Sistema activada: ${sagas.find((s) => s.id === sagaId)?.title}`, 'quest');
  };

  const handleClaimSagaMilestone = (sagaId: string, day: number) => {
    sound.playLevelUp();
    const targetSaga = sagas.find((s) => s.id === sagaId);
    if (!targetSaga) return;

    const milestone = targetSaga.milestones.find((m) => m.day === day);
    if (!milestone || milestone.claimed) return;

    const updatedSagas = sagas.map((s) => {
      if (s.id === sagaId) {
        return {
          ...s,
          milestones: s.milestones.map((m) => (m.day === day ? { ...m, claimed: true, completed: true } : m)),
        };
      }
      return s;
    });

    let updatedTitles = [...(player.titlesUnlocked || ['Awakened Novice'])];
    if (milestone.reward.titleReward && !updatedTitles.includes(milestone.reward.titleReward)) {
      updatedTitles.push(milestone.reward.titleReward);
    }

    let updatedInventory = [...player.inventory];
    if (milestone.reward.itemReward) {
      updatedInventory.push(milestone.reward.itemReward);
    }

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + milestone.reward.xp,
      gold: player.gold + milestone.reward.gold,
      essenceStones: player.essenceStones + milestone.reward.essenceStones,
      statPoints: player.statPoints + (milestone.reward.statPoints || 0),
      titlesUnlocked: updatedTitles,
      inventory: updatedInventory,
    };

    setSagas(updatedSagas);
    saveStoredSagas(updatedSagas);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡FASE DE LA SAGA CONQUISTADA!',
      subtitle: `${targetSaga.title} - ${milestone.title}`,
      type: 'loot_drop',
      rewards: {
        xp: milestone.reward.xp,
        gold: milestone.reward.gold,
        essenceStones: milestone.reward.essenceStones,
        statPoints: milestone.reward.statPoints,
        itemName: milestone.reward.titleReward ? `Título: ${milestone.reward.titleReward}` : undefined,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Fase ${day} de ${targetSaga.title} reclamada con éxito.`, 'level_up');
  };

  const handleClaimSagaFinal = (sagaId: string) => {
    sound.playRaidVictory();
    const targetSaga = sagas.find((s) => s.id === sagaId);
    if (!targetSaga || targetSaga.completed) return;

    const updatedSagas = sagas.map((s) => (s.id === sagaId ? { ...s, completed: true } : s));

    let updatedTitles = [...(player.titlesUnlocked || ['Awakened Novice'])];
    if (!updatedTitles.includes(targetSaga.finalReward.exclusiveTitle)) {
      updatedTitles.push(targetSaga.finalReward.exclusiveTitle);
    }

    const updatedInventory = [...player.inventory, targetSaga.finalReward.exclusiveItem];

    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + targetSaga.finalReward.xp,
      gold: player.gold + targetSaga.finalReward.gold,
      essenceStones: player.essenceStones + targetSaga.finalReward.essenceStones,
      titlesUnlocked: updatedTitles,
      inventory: updatedInventory,
    };

    setSagas(updatedSagas);
    saveStoredSagas(updatedSagas);
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡SAGA DEL MONARCA COMPLETADA!',
      subtitle: `Has culminado "${targetSaga.title}". El Sistema te proclama: ${targetSaga.finalReward.exclusiveTitle}.`,
      type: 'loot_drop',
      rewards: {
        xp: targetSaga.finalReward.xp,
        gold: targetSaga.finalReward.gold,
        essenceStones: targetSaga.finalReward.essenceStones,
        itemName: `${targetSaga.finalReward.exclusiveItem.name} (${targetSaga.finalReward.exclusiveItem.rarity})`,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`¡SAGA CULMINADA! Obtenido: ${targetSaga.finalReward.exclusiveTitle}.`, 'level_up');
  };

  // Focus Dungeon Pomodoro Completion
  const handleFocusSessionComplete = (durationMinutes: number, xpReward: number, goldReward: number) => {
    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + xpReward,
      gold: player.gold + goldReward,
      essenceStones: player.essenceStones + Math.floor(durationMinutes / 10),
      mp: Math.min(player.maxMp || 300, (player.mp || 300) + 50),
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡MAZMORRA DE CONCENTRACIÓN SUPERADA!',
      subtitle: `Has sostenido ${durationMinutes} minutos de enfoque ininterrumpido. El maná fluye con claridad.`,
      type: 'loot_drop',
      rewards: {
        xp: xpReward,
        gold: goldReward,
        essenceStones: Math.floor(durationMinutes / 10),
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog(`Mazmorra de Concentración completada (${durationMinutes} min). +${xpReward} XP.`, 'dungeon');
  };

  // Mirror Shadow Duel Reward
  const handleMirrorReward = (rewards: { xp: number; gold: number; essenceStones: number; statPoints: number }) => {
    const updatedPlayer: Player = {
      ...player,
      xp: player.xp + rewards.xp,
      gold: player.gold + rewards.gold,
      essenceStones: player.essenceStones + rewards.essenceStones,
      statPoints: player.statPoints + rewards.statPoints,
    };

    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);

    setSystemModal({
      isOpen: true,
      title: '¡VICTORIA SOBRE LA SOMBRA DEL PASADO!',
      subtitle: 'Tus hábitos de hoy han superado tu rendimiento anterior. El Monarca no retrocede.',
      type: 'loot_drop',
      rewards: {
        xp: rewards.xp,
        gold: rewards.gold,
        essenceStones: rewards.essenceStones,
        statPoints: rewards.statPoints,
      },
      onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
    });

    addLog('Duelo de la Sombra Reflejo conquistado hoy.', 'stat');
  };

  // Save Weekly Audit
  const handleSaveWeeklyAudit = (report: WeeklyAuditReport) => {
    const updatedPlayer: Player = {
      ...player,
      latestAudit: report,
    };
    setPlayer(updatedPlayer);
    saveStoredPlayer(updatedPlayer);
  };

  const handleRestoreBackup = (data: {
    player: Player;
    quests: Quest[];
    dungeons: Dungeon[];
    expeditions: ShadowExpedition[];
    skills: HunterSkill[];
    achievements: HunterAchievement[];
    bosses: WorldBoss[];
    sagas?: HunterSaga[];
    logs: SystemLog[];
  }) => {
    setPlayer(data.player);
    setQuests(data.quests);
    setDungeons(data.dungeons);
    setExpeditions(data.expeditions);
    if (data.skills) setSkills(data.skills);
    if (data.achievements) setAchievements(data.achievements);
    if (data.bosses) setBosses(data.bosses);
    if (data.sagas) setSagas(data.sagas);
    setLogs(data.logs);
  };

  const handleResetSystem = () => {
    localStorage.clear();
    setPlayer(INITIAL_PLAYER);
    setQuests(INITIAL_QUESTS);
    setDungeons(INITIAL_DUNGEONS);
    setExpeditions(INITIAL_SHADOW_EXPEDITIONS);
    setSkills(INITIAL_SKILLS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setBosses(INITIAL_WORLD_BOSSES);
    setLogs([]);
    setAwakened(false);
    saveIsAwakened(false);
  };

  if (!awakened) {
    return (
      <>
        <LandingPage 
          onAwaken={handleAwaken} 
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isSupabaseConfigured={isSupabaseConfigured}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            setAwakened(true);
            saveIsAwakened(true);
            setCurrentPage('dashboard');
            addLog(`Bienvenido, Cazador ${user.email}. Progreso sincronizado con Supabase.`, 'system');
          }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0c10] text-white font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        player={player}
        onNavigate={setCurrentPage}
        current={currentPage}
        onToggleSound={toggleSound}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onStartTour={() => setIsTourModalOpen(true)}
        currentUser={currentUser}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onLogout={async () => {
          sound.playBeep(420, 0.05);
          await signOutHunter();
          setCurrentUser(null);
          setAwakened(false);
          saveIsAwakened(false);
          setCurrentPage('dashboard');
          addLog('Sesión cerrada. Regresando al portal de autenticación.', 'system');
        }}
      />

      {/* Main View Port */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {currentPage === 'dashboard' && (
            <Dashboard
              player={player}
              quests={quests}
              logs={logs}
              onCompleteQuest={completeQuest}
              onIncrementQuestProgress={incrementQuestProgress}
              onResetQuestProgress={resetQuestProgress}
              onDeleteQuest={deleteQuest}
              onAllocateStat={allocateStat}
              onAddRandomQuest={handleQuickAddRandomQuest}
              onAddBalancedRoutine={handleQuickAddBalancedRoutine}
              onOpenQuestModal={() => setIsQuestModalOpen(true)}
              onOpenPenaltyModal={() => setIsPenaltyModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onOpenSagasModal={() => setIsSagasModalOpen(true)}
              onOpenWeeklyAuditModal={() => setIsWeeklyAuditModalOpen(true)}
              onOpenFocusModal={() => setIsFocusModalOpen(true)}
              onOpenMirrorModal={() => setIsMirrorModalOpen(true)}
              onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
              onTriggerPactInfraction={handleTriggerPactInfraction}
              onAddCustomPact={handleAddCustomPact}
              onTogglePactActive={handleTogglePactActive}
              onForceDailyReset={handleForceDailyReset}
            />
          )}

          {currentPage === 'dungeons' && (
            <DungeonList
              player={player}
              dungeons={dungeons}
              onCompleteDungeon={completeDungeon}
              onOpenCreateDungeonModal={() => setIsCreateDungeonOpen(true)}
            />
          )}

          {currentPage === 'inventory' && (
            <Inventory
              player={player}
              onEquipItem={equipItem}
              onUnequipSlot={unequipSlot}
              onUseConsumable={useConsumable}
              onSellItem={sellItem}
            />
          )}

          {currentPage === 'shop' && (
            <Shop
              player={player}
              onBuyItem={buyShopItem}
              onMysteryChest={handleMysteryChest}
            />
          )}

          {currentPage === 'shadows' && (
            <ShadowArmy
              player={player}
              expeditions={expeditions}
              onUpgradeShadow={handleUpgradeShadow}
              onUnlockShadow={handleUnlockShadow}
              onStartExpedition={handleStartExpedition}
              onClaimExpedition={handleClaimExpedition}
            />
          )}

          {currentPage === 'skills' && (
            <SkillTree
              player={player}
              skills={skills}
              onUpgradeSkill={handleUpgradeSkill}
              onUnlockSkill={handleUnlockSkill}
              onEquipTitle={handleEquipTitle}
            />
          )}

          {currentPage === 'bosses' && (
            <WorldBosses
              player={player}
              bosses={bosses}
              achievements={achievements}
              onAttackBoss={handleAttackBoss}
              onClaimBossReward={handleClaimBossReward}
              onClaimAchievement={handleClaimAchievement}
            />
          )}

          {currentPage === 'analytics' && (
            <Analytics
              player={player}
              quests={quests}
              dungeons={dungeons}
              expeditions={expeditions}
              skills={skills}
              achievements={achievements}
              bosses={bosses}
              sagas={sagas}
              logs={logs}
              onRestoreBackup={handleRestoreBackup}
              onResetSystem={handleResetSystem}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        current={currentPage}
        onNavigate={setCurrentPage}
        unallocatedPoints={player.statPoints}
      />

      {/* Mobile Quick Action Widget */}
      <QuickMobileWidget
        player={player}
        quests={quests}
        onCompleteQuest={completeQuest}
        onIncrementQuestProgress={(qId) => incrementQuestProgress(qId, 1)}
        onOpenQuestModal={() => setIsQuestModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onAllocateStat={allocateStat}
      />

      {/* Modals */}
      {isQuestModalOpen && (
        <QuestModal
          player={player}
          onClose={() => setIsQuestModalOpen(false)}
          onAdd={addQuest}
        />
      )}

      {isCreateDungeonOpen && (
        <CreateDungeonModal
          isOpen={isCreateDungeonOpen}
          onClose={() => setIsCreateDungeonOpen(false)}
          onAddDungeon={addDungeon}
        />
      )}

      {isPenaltyModalOpen && (
        <PenaltyModal
          isOpen={isPenaltyModalOpen}
          onClose={() => setIsPenaltyModalOpen(false)}
          onCompletePenalty={handleCompletePenalty}
        />
      )}

      {isProfileModalOpen && (
        <HunterProfileModal
          player={player}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {isEmergencyModalOpen && (
        <EmergencyQuestModal
          player={player}
          onClose={() => setIsEmergencyModalOpen(false)}
          onAccept={handleAcceptEmergencyQuest}
        />
      )}

      {isSagasModalOpen && (
        <HunterSagasModal
          player={player}
          sagas={sagas}
          onClose={() => setIsSagasModalOpen(false)}
          onActivateSaga={handleActivateSaga}
          onClaimMilestone={handleClaimSagaMilestone}
          onClaimFinalReward={handleClaimSagaFinal}
        />
      )}

      {isWeeklyAuditModalOpen && (
        <WeeklyAuditModal
          player={player}
          onClose={() => setIsWeeklyAuditModalOpen(false)}
          onSaveAudit={handleSaveWeeklyAudit}
        />
      )}

      {isFocusModalOpen && (
        <FocusDungeonModal
          player={player}
          onClose={() => setIsFocusModalOpen(false)}
          onSessionComplete={handleFocusSessionComplete}
        />
      )}

      {isMirrorModalOpen && (
        <MirrorShadowModal
          player={player}
          onClose={() => setIsMirrorModalOpen(false)}
          onClaimMirrorReward={handleMirrorReward}
        />
      )}

      {isLicenseModalOpen && (
        <HunterLicenseModal
          player={player}
          onClose={() => setIsLicenseModalOpen(false)}
        />
      )}

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          addLog(`Cazador verificado en Supabase: ${user.email}`, 'system');
          setSystemModal({
            isOpen: true,
            title: '¡VÍNCULO CUÁNTICO CONECTADO!',
            subtitle: `El Sistema ha enlazado tu progreso con la nube de Supabase (${user.email}). Ahora puedes acceder desde cualquier dispositivo.`,
            type: 'info',
            onClose: () => setSystemModal((prev) => ({ ...prev, isOpen: false })),
          });
        }}
      />

      {/* Interactive System Guided Tour for First-time and On-demand Players */}
      <SystemTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onComplete={() => {
          localStorage.setItem('shadow_system_tour_seen', 'true');
          setIsTourModalOpen(false);
          addLog('Protocolo de iniciación del Sistema completado.', 'system');
        }}
      />

      <SystemModal
        isOpen={systemModal.isOpen}
        title={systemModal.title}
        subtitle={systemModal.subtitle}
        type={systemModal.type}
        rewards={systemModal.rewards}
        onClose={systemModal.onClose}
      />
    </div>
  );
};

export default App;
