import { Link, useLocation } from 'react-router-dom';

export default function VerseSelect() {
  const { state } = useLocation() as { state?: { lang?: 'ht'|'fr' } };
  const lang = state?.lang ?? 'fr';

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Sélectionner un couplet</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1,2,3,4,5].map(v => (
          <Link
            key={v}
            to="/lecteur"
            state={{ lang, verse: v }}
            className="rounded-lg border border-[#2A2A2E] p-4 hover:bg-[#141417] text-center"
          >
            Couplet {v}
          </Link>
        ))}

        <Link
          to="/lecteur"
          state={{ lang, verse: 'all' }}
          className="rounded-lg bg-[#141417] border border-[#2A2A2E] p-4 text-center"
        >
          Tout jouer
        </Link>
      </div>
      <Link to="/" className="text-sm text-[#A1A1AA] hover:underline">Retour</Link>
    </section>
  );
}
