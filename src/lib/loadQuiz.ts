import type { QuizMeta } from '../types/quiz'
export let lastQuizSource: 'remote' | 'local' = 'local';
export let lastQuizWasFallback = false;


export let lastQuizMeta: QuizMeta | null = null;


import type { QuizData, QuizItem, QuizMode, QuizCategory } from '../types/quiz';

  export async function loadQuizData(lang: 'fr' | 'ht' = 'fr'): Promise<QuizData> {
  console.log('[Lakou] VITE_QUIZ_REMOTE =', import.meta.env.VITE_QUIZ_REMOTE);
  const remoteBase = (import.meta.env.VITE_QUIZ_REMOTE ?? '').trim();
  const localUrl = `${import.meta.env.BASE_URL}assets/quiz/questions.${lang}.json`;

  // Helper with timeout
  async function fetchWithTimeout(url: string, ms = 6000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } finally {
      clearTimeout(id);
    }
  }

  // 1) Try remote first (with cache-buster in dev)
  if (remoteBase) {
    let remoteUrl = `${remoteBase}questions.${lang}.json`;
    if (import.meta.env.DEV) remoteUrl += `?v=${Date.now()}`; // bypass CDN cache in dev
    try {
      const data = (await fetchWithTimeout(remoteUrl)) as QuizData;
      if (data?.questions?.length) {
        lastQuizSource = 'remote';
        lastQuizWasFallback = false;
        console.info('[quiz] remote loaded:', remoteUrl, `(${data.questions.length} q)`);
        return data;
      }
      console.warn('[quiz] remote returned no questions, falling back:', remoteUrl);
    } catch (e) {
      console.warn('[quiz] remote failed, falling back:', e);
    }
  }

  // 2) Fallback to bundled local file
  const data = (await fetchWithTimeout(localUrl)) as QuizData;
  if (!(data?.questions?.length)) throw new Error('quiz_empty');
  lastQuizSource = 'local';
  lastQuizWasFallback = !!remoteBase; // true if we *tried* remote and fell back
  console.info('[quiz] local loaded:', localUrl, `(${data.questions.length} q)`);
  return data;
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
