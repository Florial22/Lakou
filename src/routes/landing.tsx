// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState} from 'react';
import { loadQuizData } from '../lib/loadQuiz';
import type { QuizItem } from '../types/quiz';

export default function Landing() {
  const [audioLang, setAudioLang] = useState<'ht' | 'fr' | null>(null);
  const nav = useNavigate();

  const IGNORED_ANSWERS = [
  'tous',
  'toutes les réponses',
  'toutes',
  'all of the above',
];

const isIgnoredAnswer = (s?: string | null) =>
  !!s && IGNORED_ANSWERS.some(w => new RegExp(`^\\s*${w}\\s*$`, 'i').test(s));

const getCorrectAnswer = (q: any): string | null => {
  // Try common shapes: options + correctIndex, or direct answer fields
  if (Array.isArray(q.options) && typeof q.correctIndex === 'number') {
    return q.options[q.correctIndex];
  }
  if (q.answer) return String(q.answer);
  if (q.bonneReponse) return String(q.bonneReponse);
  return null;
};

const [randomQ, setRandomQ] = useState<QuizItem | null>(null);

useEffect(() => {
  let mounted = true;
  loadQuizData('fr')
    .then(data => {
      // exclude boolean + exclude ignored-answer questions
      const pool = data.questions
        .filter((q: any) => q.type !== 'boolean')
        .filter((q: any) => !isIgnoredAnswer(getCorrectAnswer(q)));

      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (mounted) setRandomQ(pick);
    })
    .catch(() => {
      // silent fail: no home card
    });

  return () => {
    mounted = false;
  };
}, []);

  return (
    <div className="mx-auto max-wy-2xl space-y-8">
      {/* En-tête */}
    <header className="max-w-md  px-4 pt-4 pb-2">
      <h1 className="text-xl font-extrabold tracking-wide">LAKOU</h1>
    <p className="text-[12px] text-zinc-400">istwa, kilti, fyete</p>
    </header>

      {/* Section : langue de l’audio */}
      <section className="card p-6">
        <p className="text-xl font-normal text-center mb-4">Écoutez l'hymne national d'haïti en Kreyòl ou en Français</p>
        <h2 className="text-xl font-semibold text-center mb-4">Langue de l’audio</h2>

        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            onClick={() => setAudioLang('ht')}
            className={`btn btn--outline ${audioLang==='ht' ? 'ring-2 ring-[var(--accent)]' : ''}`}
          >
            Kreyòl Ayisyen
          </button>
          <button
            onClick={() => setAudioLang('fr')}
            className={`btn btn--outline ${audioLang==='fr' ? 'ring-2 ring-[var(--accent)]' : ''}`}
          >
            Français
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <button
            disabled={!audioLang}
            onClick={() => nav('/versets', { state: { lang: audioLang } })}
            className="btn btn--primary disabled:opacity-50"
          >
            Continuer
          </button>
        </div>
      </section>

        {/* Section : Question du jour */}
        <section className="card p-6">
          <div className="p-5">
            <h2 className="text-sm text-zinc-400 text-center mb-3">Question du jour</h2>

            {randomQ ? (
              <div>
                <p className="text-center font-semibold mb-3">{randomQ.question}</p>
                <p className="text-center text-green-500 font-bold text-lg">
                  {randomQ.options[randomQ.correct[0]]}
                </p>
              </div>
            ) : (
              <p className="text-center text-zinc-500 text-sm">Chargement…</p>
            )}
          </div>
        </section>

        {/* Section 3 : à venir */}
        {/* <section className="card p-6">
          <div className="p-5">
            <h2 className="text-sm text-zinc-400 text-center mb-1">À venir</h2>
            <p className="text-center text-zinc-500 text-sm">Nouvelle section bientôt disponible.</p>
          </div>
        </section> */}


          

      {/* Section : Quiz */}
      {/* <section className="card p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Quiz</h2>
        <p className="muted mb-3">Testez vos connaissances sur Haïti.</p>
        <button onClick={() => nav('/quiz')} className="btn btn--primary">Ouvrir le quiz</button>
      </section> */}
    </div>
  );
}
