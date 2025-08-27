import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizMode } from '../types/quiz';

const CATS: QuizMode[] = ['Histoire','Géographie','Culture','Général'];

export default function QuizHome() {
  const [mode, setMode] = useState<QuizMode>('Général');
  const nav = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Quiz — Haïti</h1>
        <p className="muted">10 questions, 65 secondes.</p>
      </header>

      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center">Choisir la catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setMode(c)}
              className={`btn btn--outline ${mode===c ? 'ring-2 ring-[var(--accent)]' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="pt-4 text-center">
          <button
            className="btn btn--primary"
            onClick={() => nav('/quiz/jouer', { state: { mode } })}
          >
            Commencer
          </button>
        </div>
      </section>
    </div>
  );
}
