// src/types/quiz.ts

// ---- Categories, modes, types ----
export type QuizCategory = 'Histoire' | 'Géographie' | 'Culture';
export type QuizMode = QuizCategory | 'Général';
export type QuizType = 'boolean' | 'single';

// ---- Question shape ----
export type QuizItem = {
  id: string;
  categorie: QuizCategory;
  type: QuizType;
  question: string;
  options: string[];      // ex. ["Faux","Vrai"] pour boolean
  correct: [number];      // UN SEUL index dans un tableau (ex. [1])
  explication?: string;
  media?: { image?: string; audio?: string };
};

// ---- Dataset meta & root shape ----
export type QuizMeta = {
  version?: number | string;
  updated?: string;       // ISO date (optionnel)
  language?: 'fr' | 'ht'; // optionnel
};

export type QuizData = {
  meta?: QuizMeta;        // meta est optionnel pour compatibilité
  questions: QuizItem[];
};

// ---- What we store for a played question ----
export type PlayedQuestion = {
  id: string;
  categorie: QuizCategory;
  type: QuizType;
  question: string;
  options: string[];
  correctIndex: number;
  pickedIndex: number | null;
  explication?: string;
  timeMs?: number;        // temps passé sur la question (ms)
};
