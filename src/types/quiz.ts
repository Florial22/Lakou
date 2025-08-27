export type QuizCategory = 'Histoire' | 'Géographie' | 'Culture';
export type QuizMode = QuizCategory | 'Général';
export type QuizType = 'boolean' | 'single';

export type QuizItem = {
  id: string;
  categorie: QuizCategory;
  type: QuizType;
  question: string;
  options: string[];   // ex. ["Faux","Vrai"] pour boolean
  correct: [number];   // UN SEUL index dans un tableau (ex. [1])
  explication?: string;
  media?: { image?: string; audio?: string };
};

export type QuizData = {
  meta: { version: number; language: 'fr' | 'ht' };
  questions: QuizItem[];
};

export type PlayedQuestion = {
  id: string;
  categorie: QuizCategory;
  type: QuizType;
  question: string;
  options: string[];
  correctIndex: number;
  pickedIndex: number | null;
  explication?: string;
  timeMs?: number;   // ⬅️ NEW: time spent on this question (ms)
};
