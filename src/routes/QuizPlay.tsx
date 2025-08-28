import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadQuizData, pickTen } from '../lib/loadQuiz';
import type { PlayedQuestion, QuizItem, QuizMode } from '../types/quiz';
import { lastQuizSource, lastQuizWasFallback } from '../lib/loadQuiz';


type NavState = { mode?: QuizMode };

const QUESTION_MS = 12000;
const WARN_MS = QUESTION_MS * 0.5;
const DANGER_MS = QUESTION_MS * 0.25;

type Phase = 'idle' | 'answered' | 'timeout';

export default function QuizPlay() {
  const { state } = useLocation() as { state?: NavState };
  const mode = state?.mode ?? 'Général';
  const nav = useNavigate();

  const [pool, setPool] = useState<QuizItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // round state
  const [index, setIndex] = useState(0);
  const [, setPlayed] = useState<PlayedQuestion[]>([]);
  const playedRef = useRef<PlayedQuestion[]>([]);

  // per-question state
  const [phase, setPhase] = useState<Phase>('idle');
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  // per-question timer
  const [remaining, setRemaining] = useState(QUESTION_MS);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // guards
  const finishedRef = useRef(false);
  const clickingRef = useRef(false);

  // SFX bases (cloned on play)
  const correctBaseRef = useRef<HTMLAudioElement | null>(null);
  const wrongBaseRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const c = new Audio('/assets/sfx/correct.mp3');
    c.preload = 'auto';
    correctBaseRef.current = c;

    const w = new Audio('/assets/sfx/wrong.mp3');
    w.preload = 'auto';
    wrongBaseRef.current = w;

    return () => {
      correctBaseRef.current = null;
      wrongBaseRef.current = null;
    };
  }, []);

  // load questions
  useEffect(() => {
    loadQuizData('fr')
      .then((data) => {
        const round = pickTen(data.questions, mode);
        if (round.length === 0) {
          setError('Aucune question disponible.');
          return;
        }
        setPool(round);
        setIndex(0);
        setPlayed([]);
        playedRef.current = [];
        resetQuestionState();
        finishedRef.current = false;
      })
      .catch(() => setError('Impossible de charger le quiz.'));
  }, [mode]);

  // (re)start timer each question
  useEffect(() => {
    if (!pool) return;
    startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, index]);

  const poolLen = pool?.length ?? 0;
  const current = useMemo(() => (pool ? pool[index] : null), [pool, index]);
  const correctIndex = current?.correct?.[0] ?? 0;

  const progressPct = useMemo(
    () => Math.max(0, Math.min(100, (remaining / QUESTION_MS) * 100)),
    [remaining]
  );

  function startTimer() {
    deadlineRef.current = Date.now() + QUESTION_MS;
    setRemaining(QUESTION_MS);

    stopTimer();
    timerRef.current = window.setInterval(() => {
      const rem = Math.max(0, deadlineRef.current! - Date.now());
      setRemaining(rem);
      if (rem <= 0) {
        stopTimer();
        if (phase === 'idle') {
          // timeout -> show correct in yellow and play WRONG sfx
          playSfx('wrong');
          setPhase('timeout');
          setPickedIndex(null);
          // Do NOT push to played: counts as "non répondu"
        }
      }
    }, 100);
  }

  function stopTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetQuestionState() {
    setPhase('idle');
    setPickedIndex(null);
    setRemaining(QUESTION_MS);
    deadlineRef.current = Date.now() + QUESTION_MS;
    clickingRef.current = false;
  }

  function playSfx(kind: 'correct' | 'wrong') {
    try {
      const base = kind === 'correct' ? correctBaseRef.current : wrongBaseRef.current;
      const node: HTMLAudioElement = base ? (base.cloneNode(true) as HTMLAudioElement) : new Audio(kind === 'correct' ? '/assets/sfx/correct.mp3' : '/assets/sfx/wrong.mp3');
      node.currentTime = 0;
      void node.play().catch(() => {});
    } catch {}
  }

  function onPick(optIndex: number) {
    if (!current || phase !== 'idle' || clickingRef.current) return;
    clickingRef.current = true;

    const isCorrect = optIndex === correctIndex;
    setPickedIndex(optIndex);
    setPhase('answered');
    stopTimer();

    playSfx(isCorrect ? 'correct' : 'wrong');

    const timeMs = Math.max(0, Math.min(QUESTION_MS, QUESTION_MS - remaining));

    const entry: PlayedQuestion = {
    id: current.id,
    categorie: current.categorie,
    type: current.type,
    question: current.question,
    options: current.options,
    correctIndex,
    pickedIndex: optIndex,
    explication: current.explication,
    timeMs, // ⬅️ NEW
    };

    const nextPlayed = [...playedRef.current, entry];
    playedRef.current = nextPlayed;
    setPlayed(nextPlayed);

    window.setTimeout(() => {
      clickingRef.current = false;
    }, 150);
  }

  function onNext() {
    if (!pool) return;
    if (index < poolLen - 1) {
      setIndex((i) => i + 1);
      resetQuestionState();
      startTimer();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopTimer();
    nav('/quiz/resultats', { state: { played: playedRef.current } });
  }

  function leaveQuiz() {
    stopTimer();
    finishedRef.current = true;
    nav('/quiz');
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Quiz — Erreur</h1>
          <p className="muted">{error}</p>
        </header>
      </div>
    );
  }

  if (!pool || !current) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Quiz</h1>
          <p className="muted">Chargement…</p>
        </header>
      </div>
    );
  }

  // Option button state classes
  const optionClass = (idx: number) => {
    const base = 'btn btn--outline text-left justify-start transition';
    if (phase === 'answered') {
      const isCorrect = idx === correctIndex;
      const isPicked = idx === pickedIndex;
      if (isCorrect) return `${base} border-[#22C55E] ring-2 ring-[#22C55E]`;
      if (isPicked && !isCorrect) return `${base} border-[#EF4444] ring-2 ring-[#EF4444]`;
      return `${base} opacity-70 pointer-events-none`;
    }
    if (phase === 'timeout') {
      if (idx === correctIndex) return `${base} border-[var(--highlight)] ring-2 ring-[var(--highlight)]`;
      return `${base} opacity-70 pointer-events-none`;
    }
    return base; // idle
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            Question <span className="font-semibold">{index + 1}</span> / {poolLen}
          </div>

          <div
            className={`text-sm ${
              remaining <= DANGER_MS ? 'text-red-400' : remaining <= WARN_MS ? 'text-yellow-400' : 'muted'
            }`}
          >
            {(remaining / 1000).toFixed(1)} s
          </div>

          <button
            onClick={leaveQuiz}
            className="text-red-400 hover:text-red-300 font-semibold text-lg leading-none"
            title="Quitter le quiz"
            aria-label="Quitter le quiz"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 h-1 w-full bg-[#2A2A2E] rounded">
          <div
            className="h-1 rounded"
            style={{
              width: `${progressPct}%`,
              background:
                remaining <= DANGER_MS ? '#ef4444' : remaining <= WARN_MS ? '#f59e0b' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Source badges */}
    <div className="mt-3 flex items-center justify-between">
      <span className="text-[11px] px-2 py-1 rounded-full border border-[#2A2A2E]">
        Données : {lastQuizSource === 'remote' ? 'En ligne' : 'Locale'}
      </span>
      {lastQuizWasFallback && (
        <span className="text-[11px] text-yellow-400">
          Mode hors-ligne : questions locales
        </span>
      )}
    </div>


      {/* Question card */}
      <section className="card p-6 space-y-4">
        <div className="text-xs uppercase tracking-wide muted">{current.categorie}</div>
        <h2 className="text-xl font-semibold">{current.question}</h2>

        <div className="grid gap-3">
          {current.options.map((opt, idx) => {
            const isCorrect = idx === correctIndex;
            const isPickedWrong =
              phase === 'answered' && pickedIndex !== null && pickedIndex !== correctIndex && idx === pickedIndex;

            return (
              <div key={idx} className="space-y-2">
                <button
                  className={optionClass(idx)}
                  onClick={() => onPick(idx)}
                  disabled={phase !== 'idle'}
                >
                  {opt}
                </button>

                {/* FEEDBACK blocks */}
                {phase === 'answered' && isCorrect && (
                  <div className="text-sm">
                    <div className="text-[#22C55E] font-semibold">Bonne réponse !</div>
                    {current.explication && <div className="mt-2 muted">{current.explication}</div>}
                  </div>
                )}

                {phase === 'answered' && isPickedWrong && (
                    <div className="text-sm">
                        <div className="text-[#EF4444] font-semibold">Mauvaise réponse.</div>
                        {/* ❌ no explanation here */}
                    </div>
)}

                {phase === 'timeout' && isCorrect && (
                  <div className="text-sm">
                    <div className="text-[var(--highlight)] font-semibold">
                      Temps écoulé — voici la bonne réponse.
                    </div>
                    {current.explication && <div className="mt-2 muted">{current.explication}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next */}
        <div className="pt-2">
          <button
            onClick={onNext}
            disabled={phase === 'idle'}
            className="btn btn--primary disabled:opacity-50"
          >
            {index < poolLen - 1 ? 'Question suivante' : 'Voir les résultats'}
          </button>
        </div>
      </section>
    </div>
  );
}
