export type ReadingMode = 'word' | 'line';
export type DisplayOrientation = 'horizontal' | 'vertical';

export interface ReaderSettings {
  mode: ReadingMode;
  orientation: DisplayOrientation;
  fontSize: number;
  lineHeight: number;
  margin: number;
  showTranslation: boolean;
}

export interface ReadingPosition {
  wordIndex: number;
  percentage: number;
  chapterId?: string;
}

export interface TranslationState {
  selectedWord: string;
  text: string;
  isRevealed: boolean;
  isSaved: boolean;
  selectedIndex: number;
  x: number;
  y: number;
}

export interface ReaderState {
  settings: ReaderSettings;
  position: ReadingPosition;
  content: BookContent | null;
  currentChapter: Chapter | null;
  chapters: Chapter[];
  savedWords: Set<string>;
  isLoading: boolean;
  error: Error | null;
}

export interface BookContent {
  text: string;
  htmlContent?: string;
  words: string[];
  metadata?: {
    title?: string;
    author?: string;
    language?: string;
    chapters?: Chapter[];
  };
  currentChapter?: string;
  currentWord?: string;
}

export interface Chapter {
  id: string;
  title: string;
  index: number;
  href?: string;
  level?: number;
  parent?: string;
  subitems?: Chapter[];
  prev: string | null;
  next: string | null;
}