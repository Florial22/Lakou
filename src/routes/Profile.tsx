// src/routes/Profile.tsx
import { useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share2 } from 'lucide-react';

export default function Profile() {
  const [msg, setMsg] = useState<string | null>(null);

  // URL à partager (fonctionne en web, Pages, app)
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://lakou.app';
    const base = import.meta.env.BASE_URL ?? '/';
    return new URL(base, window.location.origin).toString();
  }, []);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Lien copié ✨');
    } catch {
      setMsg('Copie impossible. Lien : ' + text);
    }
    setTimeout(() => setMsg(null), 1800);
  }

  async function shareApp() {
    const payload = {
      title: 'Lakou',
      text: "Découvre Lakou — l’hymne, des quiz d’Histoire, de Géographie et de Culture haïtienne.",
      url: shareUrl,
      dialogTitle: 'Partager Lakou',
    };

    try {
      // 1) App mobile (Capacitor)
      if (Capacitor.isNativePlatform()) {
        const { Share } = await import('@capacitor/share');
        await Share.share(payload);
        return;
      }
      // 2) Web Share API
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      // 3) Fallback: copier le lien
      await copyToClipboard(shareUrl);
    } catch {
      await copyToClipboard(shareUrl);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-semibold mb-4">Profil</h1>

      {/* PARTAGER L’APP */}
      <section className="rounded-2xl bg-[#171717] border border-[#2A2A2E] p-5 mb-5">
        <h2 className="text-sm text-zinc-400 mb-3">Partager l’app</h2>
        <button
          onClick={shareApp}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 transition py-2.5 font-medium"
        >
          <Share2 className="w-4 h-4" />
          Partager Lakou
        </button>

        <p className="mt-3 text-xs text-zinc-400">
          Le meilleur moyen de nous soutenir, c’est d’en parler à vos proches.
        </p>

        {msg && (
          <div className="mt-3 text-center text-[12px] text-emerald-400">
            {msg}
          </div>
        )}
      </section>

      {/* À PROPOS */}
      <section className="rounded-2xl bg-[#171717] border border-[#2A2A2E] p-5 mb-5">
        <h2 className="text-sm text-zinc-400 mb-2">À propos</h2>
        <p className="text-sm leading-relaxed">
          <strong>Lakou</strong> est une app pour se (re)connecter à la culture
          haïtienne&nbsp;: écouter l’hymne, découvrir ses paroles, et apprendre
          avec des quiz d’<em>Histoire</em>, de <em>Géographie</em> et de{' '}
          <em>Culture</em>. Notre objectif&nbsp;: transmettre{' '}
          <em>istwa, kilti, fyete</em>.
        </p>
      </section>

      {/* CONFIDENTIALITÉ */}
      <section className="rounded-2xl bg-[#171717] border border-[#2A2A2E] p-5">
        <h2 className="text-sm text-zinc-400 mb-2">Confidentialité</h2>
        <ul className="text-sm space-y-2 text-zinc-300">
          <li>• Nous ne collectons <strong>aucune donnée personnelle</strong>.</li>
          <li>• Il n’y a pas de compte à créer .</li>
          <li>• Les questions peuvent être chargées depuis une source en ligne sécurisée (HTTPS) ou localement si vous êtes hors-ligne.</li>
          <li>• Aucune donnée n’est vendue ni partagée à des tiers.</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-3">
          partager l’app — c’est la
          meilleure façon de nous aider 🙏
        </p>
      </section>
    </div>
  );
}
