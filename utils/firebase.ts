import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Player, Quest, Dungeon } from '../types';
import { calculateCombatPower } from './calculator';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on application boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Please check your network or configuration.');
    }
    return false;
  }
}

// Run connection test
testFirestoreConnection().catch(() => {});

// Authentication Helpers
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    return null;
  }
}

export async function logoutHunter(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export function onHunterAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Cloud Synchronization
export async function syncHunterToFirestore(userId: string, player: Player): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const userPath = `users/${userId}`;

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    const cp = calculateCombatPower(player);

    const dataToSave = {
      id: userId,
      name: player.name || auth.currentUser.displayName || 'Sung Jin-Woo',
      email: auth.currentUser.email || '',
      rank: player.rank || 'E',
      level: Number(player.level) || 1,
      xp: Number(player.xp) || 0,
      gold: Number(player.gold) || 0,
      essenceStones: Number(player.essenceStones) || 0,
      statPoints: Number(player.statPoints) || 0,
      mp: Number(player.mp) || 100,
      maxMp: Number(player.maxMp) || 100,
      combatPower: cp,
      streak: Number(player.streakDays) || 0,
      updatedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await updateDoc(userDocRef, dataToSave);
    } else {
      await setDoc(userDocRef, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function syncQuestsToFirestore(userId: string, quests: Quest[]): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  for (const quest of quests) {
    const questPath = `users/${userId}/quests/${quest.id}`;
    try {
      const questDocRef = doc(db, 'users', userId, 'quests', quest.id);
      const existingSnap = await getDoc(questDocRef);

      const questPayload = {
        id: quest.id,
        userId: userId,
        title: quest.title.slice(0, 120),
        category: (quest.category || 'habit').slice(0, 50),
        xpReward: Number(quest.rewards?.xp) || 50,
        goldReward: Number(quest.rewards?.gold) || 20,
        completed: Boolean(quest.completed),
        streak: 0,
        updatedAt: serverTimestamp(),
      };

      if (existingSnap.exists()) {
        await updateDoc(questDocRef, questPayload);
      } else {
        await setDoc(questDocRef, {
          ...questPayload,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, questPath);
    }
  }
}

export async function syncDungeonsToFirestore(userId: string, dungeons: Dungeon[]): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  for (const dungeon of dungeons) {
    const dungeonPath = `users/${userId}/dungeons/${dungeon.id}`;
    try {
      const dDocRef = doc(db, 'users', userId, 'dungeons', dungeon.id);
      const existingSnap = await getDoc(dDocRef);

      const dungeonPayload = {
        id: dungeon.id,
        userId: userId,
        name: dungeon.title.slice(0, 120),
        rank: String(dungeon.rank).slice(0, 16),
        cleared: Boolean(dungeon.completed),
        updatedAt: serverTimestamp(),
      };

      if (existingSnap.exists()) {
        await updateDoc(dDocRef, dungeonPayload);
      } else {
        await setDoc(dDocRef, {
          ...dungeonPayload,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, dungeonPath);
    }
  }
}

export async function loadUserDataFromFirestore(userId: string): Promise<Partial<Player> | null> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return null;
  const userPath = `users/${userId}`;

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      name: data.name,
      rank: data.rank,
      level: data.level,
      xp: data.xp,
      gold: data.gold,
      essenceStones: data.essenceStones,
      statPoints: data.statPoints,
      mp: data.mp,
      maxMp: data.maxMp,
      streakDays: data.streak,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }
}
