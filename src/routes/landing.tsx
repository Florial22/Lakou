import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [audioLang, setAudioLang] = useState<'ht' | 'fr' | null>(null);
  const nav = useNavigate();

  return (
    <div className="mx-auto max-wy-2xl space-y-8">
      {/* En-tête de page (pour toute la page d'accueil) */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Accueil</h1>
        <p className="muted">Écoutez l’hymne national d’Haïti en Kreyòl ou en Français.</p>
        {/* <img
            src="/assets/brand/lakou.png"
            alt="Lakou"
            className="h-8 w-auto mx-auto"
        /> */}
      </header>

      {/* Section : langue de l’audio */}
      <section className="card p-6">
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

      {/* Section : Quiz */}
      <section className="card p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Quiz</h2>
        <p className="muted mb-3">Testez vos connaissances sur Haïti.</p>
        <button onClick={() => nav('/quiz')} className="btn btn--primary">Ouvrir le quiz</button>
      </section>
    </div>
  );
}
