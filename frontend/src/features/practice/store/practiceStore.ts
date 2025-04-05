// src/features-real/practice/store/practiceStore.ts
import { create } from 'zustand';
import { PracticeWord, GameConfig, PracticeResult } from '../services/practiceService';

interface PracticeSession {
  timestamp: Date;
  gameType: string;
  wordCount: number;
  correctCount: number;
  totalTime: number;
}

interface PracticeState {
  // Game configuration
  config: GameConfig;
  // Active game state
  isGameActive: boolean;
  currentWords: PracticeWord[];
  currentWordIndex: number;
  startTime: number | null;
  results: PracticeResult[];
  // Session history
  lastSession: PracticeSession | null;
  sessionHistory: PracticeSession[];
  
  // Actions
  setConfig: (config: Partial<GameConfig>) => void;
  startGame: (words: PracticeWord[]) => void;
  endGame: () => void;
  nextWord: () => void;
  saveResult: (result: PracticeResult) => void;
  updateLastSession: (session: PracticeSession) => void;
  addSessionToHistory: (session: PracticeSession) => void;
  resetGame: () => void;
}

const DEFAULT_CONFIG: GameConfig = {
  wordCount: 10,
  difficulty: 'medium',
  gameType: 'spelling',
  timeLimit: 0, // 0 means no time limit
};

export const usePracticeStore = create<PracticeState>((set, get) => ({
  // Initial state
  config: DEFAULT_CONFIG,
  isGameActive: false,
  currentWords: [],
  currentWordIndex: 0,
  startTime: null,
  results: [],
  lastSession: null,
  sessionHistory: [],
  
  // Actions
  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),
  
  startGame: (words) => set({
    isGameActive: true,
    currentWords: words,
    currentWordIndex: 0,
    startTime: Date.now(),
    results: []
  }),
  
  endGame: () => {
    const { results, config, startTime } = get();
    
    // Calculate overall session metrics
    const totalTime = startTime ? Date.now() - startTime : 0;
    const correctCount = results.filter(r => r.correct).length;
    
    const session: PracticeSession = {
      timestamp: new Date(),
      gameType: config.gameType,
      wordCount: results.length,
      correctCount,
      totalTime
    };
    
    // Add to session history
    get().addSessionToHistory(session);
    
    // Update last session
    set({
      isGameActive: false,
      lastSession: session
    });
  },
  
  nextWord: () => set((state) => {
    if (state.currentWordIndex >= state.currentWords.length - 1) {
      // End of game
      get().endGame();
      return state;
    }
    
    return {
      currentWordIndex: state.currentWordIndex + 1
    };
  }),
  
  saveResult: (result) => set((state) => ({
    results: [...state.results, result]
  })),
  
  updateLastSession: (session) => set({
    lastSession: session
  }),
  
  addSessionToHistory: (session) => set((state) => ({
    sessionHistory: [session, ...state.sessionHistory].slice(0, 20) // Keep only latest 20 sessions
  })),
  
  resetGame: () => set({
    isGameActive: false,
    currentWords: [],
    currentWordIndex: 0,
    startTime: null,
    results: []
  })
}));