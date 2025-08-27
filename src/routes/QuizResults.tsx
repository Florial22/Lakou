import { useLocation, useNavigate } from 'react-router-dom';
import type { PlayedQuestion } from '../types/quiz';
import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';

type NavState = { played?: PlayedQuestion[]; timedOut?: boolean };

const TOTAL_INTENDED = 10;

export default function QuizResults() {
  const { state } = useLocation() as { state?: NavState };
  const nav = useNavigate();
  const played = state?.played ?? [];
  const timedOut = !!state?.timedOut;

  const answered = played.length;
  const correct = useMemo(
    () => played.reduce((acc, q) => acc + (q.pickedIndex === q.correctIndex ? 1 : 0), 0),
    [played]
  );
  const wrong = Math.max(0, answered - correct);
  const notAnswered = Math.max(0, TOTAL_INTENDED - answered);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Titre + bandeau stat en 3 cartes */}
      <header className="space-y-5">
        <h1 className="text-3xl font-semibold">Résultats</h1>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Score */}
          <div className="card p-6 flex flex-col justify-between">
            <div className="text-sm muted">Score</div>
            <div className="mt-4 text-4xl font-semibold">{correct}/{TOTAL_INTENDED}</div>
          </div>

          {/* Précision */}
          <div className="card p-6 flex flex-col justify-between">
            <div className="text-sm muted">Précision</div>
            <div className="mt-4 text-4xl font-semibold">{accuracy}%</div>
          </div>

          {/* Détails chiffrés */}
          <div className="card p-6">
            <div className="grid grid-cols-2 items-center gap-y-2 text-[15px]">
              <div className="muted">Bonnes</div><div className="justify-self-end font-medium">{correct}</div>
              <div className="muted">Mauvaises</div><div className="justify-self-end font-medium">{wrong}</div>
              <div className="muted">Non répondues</div><div className="justify-self-end font-medium">{notAnswered}</div>
            </div>
          </div>
        </div>

        {timedOut && (
          <p className="text-yellow-400 text-sm">
            Temps écoulé — vous n’avez pas eu le temps de répondre aux 10 questions.
            Vous avez répondu à {answered} question{answered > 1 ? 's' : ''}.
          </p>
        )}
      </header>

      {/* Vitesse de réponse */}
<section className="card p-6 space-y-3">
  <h2 className="text-lg font-semibold">Vitesse de réponse</h2>
  {played.length ? (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={played.map((q, i) => ({
            name: `Q${i + 1}`,
            ms: q.timeMs ?? 0,
            correct: q.pickedIndex === q.correctIndex,
          }))}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}s`} />
          <Tooltip
            formatter={(v) => [`${Math.round(Number(v) / 1000)} s`, 'Temps']}
            labelFormatter={(label) => `Question ${label.slice(1)}`}
          />
          {/* Ligne de moyenne */}
          {(() => {
            const vals = played.map((q) => q.timeMs ?? 0);
            const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return (
              <ReferenceLine
                y={avg}
                stroke="#A1A1AA"
                strokeDasharray="4 4"
                label={{ value: `moy: ${Math.round(avg / 1000)}s`, position: 'right', fill: '#A1A1AA' }}
              />
            );
          })()}
          <Bar dataKey="ms" isAnimationActive>
            {played.map((q, idx) => (
              <Cell key={idx} fill={q.pickedIndex === q.correctIndex ? '#22C55E' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="muted text-sm">Aucune réponse enregistrée pour afficher la vitesse.</p>
  )}
  <p className="muted text-xs">Couleur des barres : vert = bonne, rouge = mauvaise.</p>
</section>


      {/* Appel à rejouer — en bas */}
      <footer className="pt-2 text-center space-y-3">
        <p className="text-base">Voulez-vous rejouer ?</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => nav('/')} className="btn btn--outline">
            Non, revenir à l’accueil
          </button>
          <button onClick={() => nav('/quiz')} className="btn btn--primary">
            Oui, choisir une catégorie
          </button>
        </div>
      </footer>
    </div>
  );
}
