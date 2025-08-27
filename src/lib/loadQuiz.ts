import type { QuizData, QuizItem, QuizMode, QuizCategory } from '../types/quiz';

export async function loadQuizData(lang: 'fr' | 'ht' = 'fr'): Promise<QuizData> {
  const url = `/assets/quiz/questions.${lang}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('quiz_not_found');
  const data = await res.json();
  if (!data?.questions?.length) throw new Error('quiz_empty');
  return data as QuizData;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sélectionne 10 questions selon le mode (catégorie ou Général)
export function pickTen(questions: QuizItem[], mode: QuizMode): QuizItem[] {
  if (mode === 'Général') {
    // Tirage proportionnel
    const byCat: Record<QuizCategory, QuizItem[]> = {
      'Histoire': [],
      'Géographie': [],
      'Culture': []
    };
    for (const q of questions) byCat[q.categorie].push(q);

    const total = questions.length || 1;
    const target: Record<QuizCategory, number> = {
      'Histoire': Math.round((byCat['Histoire'].length / total) * 10),
      'Géographie': Math.round((byCat['Géographie'].length / total) * 10),
      'Culture': 10 // le reste
    };
    // Ajuste pour total = 10
    const sum = target['Histoire'] + target['Géographie'] + target['Culture'];
    target['Culture'] += (10 - sum);

    const out: QuizItem[] = [];
    for (const cat of ['Histoire','Géographie','Culture'] as QuizCategory[]) {
      const pool = shuffle(byCat[cat]);
      out.push(...pool.slice(0, Math.max(0, target[cat])));
    }
    // Si pas assez (peu probable), complète
    if (out.length < 10) {
      const extra = shuffle(questions.filter(q => !out.includes(q))).slice(0, 10 - out.length);
      out.push(...extra);
    }
    return shuffle(out).slice(0, 10);
  }
  // Mode catégorie simple
  const pool = questions.filter(q => q.categorie === mode);
  return shuffle(pool).slice(0, 10);
}
