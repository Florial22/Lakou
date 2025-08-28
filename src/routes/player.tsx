import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Globe } from 'lucide-react';


type NavState = { lang?: 'ht' | 'fr'; verse?: number | 'all' } | undefined;
type Cue = { id: number; sentence: string; startMs: number; endMs: number };

export default function Player() {
  const { state } = useLocation() as { state?: NavState };
  const nav = useNavigate();

  const initialLang = (state?.lang ?? 'fr') as 'ht' | 'fr';
  const requested = state?.verse;
  const allMode = requested === 'all';

  const [curLang, setCurLang] = useState<'ht' | 'fr'>(initialLang);
  const initialVerse = requested === 'all' ? 1 : (typeof requested === 'number' ? requested : 1);
  const [currentVerse, setCurrentVerse] = useState<number>(initialVerse);

  useEffect(() => {
    if (requested === 'all') setCurrentVerse(1);
    else if (typeof requested === 'number') setCurrentVerse(requested);
    setCurLang(initialLang);
  }, [requested, initialLang]);

  const audioSrc = useMemo(() => `/assets/audio/${curLang}/verse${currentVerse}.mp3`, [curLang, currentVerse]);
  const lyricsSrc = useMemo(() => `/assets/lyrics/${curLang}/verse${currentVerse}.json`, [curLang, currentVerse]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLImageElement>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const pendingSeekRatio = useRef<number | null>(null);

  const [cues, setCues] = useState<Cue[] | null>(null);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  const [dims, setDims] = useState({ trackW: 0, flagW: 0 });
  const measure = () => {
    const trackW = trackRef.current?.clientWidth ?? 0;
    const flagW = flagRef.current?.clientWidth ?? 0;
    setDims({ trackW, flagW });
  };
  const onFlagLoad = () => measure();

  useEffect(() => {
    setReady(false);
    setError(null);
    setTime(0);
    setDuration(0);
  }, [audioSrc]);

  useEffect(() => {
    setCues(null);
    setLyricsError(null);
    fetch(lyricsSrc)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(data => {
        if (!data?.sync_cues) throw new Error('bad json');
        setCues(data.sync_cues as Cue[]);
      })
      .catch(() => setLyricsError('Paroles introuvables. Ajoute le fichier JSON dans /public/assets/lyrics/...'));
  }, [lyricsSrc]);

  useEffect(() => {
    measure();
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window && trackRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(trackRef.current);
    } else {
      window.addEventListener('resize', measure);
    }
    return () => { if (ro) ro.disconnect(); else window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      setDuration(el.duration || 0);
      setReady(true);
      setError(null);

      if (pendingSeekRatio.current != null && el.duration) {
        const t = Math.max(0, Math.min(pendingSeekRatio.current * el.duration, el.duration - 0.05));
        el.currentTime = t;
        pendingSeekRatio.current = null;
      }
      if (autoPlayNext) {
        el.play().then(() => { setPlaying(true); setAutoPlayNext(false); })
          .catch(() => setError("Impossible de lire l’audio."));
      }
    };
    const onTime = () => setTime(el.currentTime || 0);
    const onEnd = () => {
      setPlaying(false);
      if (allMode && currentVerse < 5) {
        setAutoPlayNext(true);
        setCurrentVerse(v => v + 1);
      }
    };
    const onErr = () => {
      if (allMode && currentVerse < 5) {
        setAutoPlayNext(true);
        setCurrentVerse(v => v + 1);
      } else {
        setError('Audio introuvable. Ajoute le fichier MP3 dans /public/assets/audio/...');
      }
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);
    el.addEventListener('error', onErr);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('error', onErr);
    };
  }, [audioSrc, allMode, currentVerse, autoPlayNext]);

  useEffect(() => {
    if (!allMode) return;
    const next = currentVerse + 1;
    if (next > 5) return;
    const preload = new Audio(`/assets/audio/${curLang}/verse${next}.mp3`);
    preload.preload = 'auto';
  }, [allMode, currentVerse, curLang]);

  const togglePlay = async () => {
    const el = audioRef.current; if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { try { await el.play(); setPlaying(true); } catch { setError("Impossible de lire l’audio."); } }
  };

  const toggleLanguage = () => {
    const el = audioRef.current;
    const wasPlaying = playing;
    const ratio = duration > 0 && el ? el.currentTime / duration : 0;
    pendingSeekRatio.current = ratio;
    setAutoPlayNext(wasPlaying);
    setPlaying(false);
    setCurLang(l => (l === 'fr' ? 'ht' : 'fr'));
  };

  const progress = duration > 0 ? Math.min(time / duration, 1) : 0;
  const FUDGE = 2;
  const maxX = Math.max(dims.trackW - dims.flagW - FUDGE, 0);
  const leftPx = Math.round(progress * maxX);

  const timeMs = Math.floor(time * 1000);
  const activeIndex = cues?.findIndex(c => timeMs >= c.startMs && timeMs < c.endMs) ?? -1;

  const seekTo = (ms: number) => {
    const el = audioRef.current; if (!el) return;
    el.currentTime = ms / 1000;
    if (!playing) { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const goToVerse = (v: number) => {
    if (v < 1 || v > 5) return;
    if (allMode) {
      setAutoPlayNext(playing);
      setCurrentVerse(v);
    } else {
      nav('/lecteur', { state: { lang: curLang, verse: v } });
    }
  };

  // -------- precise auto-scroll (padding-safe) ----------
  const panelRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    if (activeIndex < 0) return;
    const panel = panelRef.current;
    const line = lineRefs.current[activeIndex];
    if (!panel || !line) return;

    // Use bounding rects + current scrollTop so padding/borders don’t skew it
    const panelRect = panel.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const delta = (lineRect.top - panelRect.top) - (panel.clientHeight / 2 - line.clientHeight / 2);
    const target = panel.scrollTop + delta;

    const max = panel.scrollHeight - panel.clientHeight;
    const clamped = Math.max(0, Math.min(target, max));
    panel.scrollTo({ top: clamped, behavior: 'smooth' });
  }, [activeIndex]);

  //const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold">
        Lecteur — {curLang === 'ht' ? 'Kreyòl' : 'Français'} • {allMode ? `Tous les couplets (${currentVerse}/5)` : `Couplet ${currentVerse}`}
      </h2>

      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Moving flag only */}
      <div ref={trackRef} className="h-16 rounded-lg border border-[#2A2A2E] relative overflow-hidden">
        <img
          ref={flagRef}
          src="/assets/images/haitian-flag.svg"
          alt=""
          aria-hidden
          draggable={false}
          onLoad={onFlagLoad}
          className="absolute top-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{ left: `${leftPx}px`, height: '40px', width: 'auto' }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 w-full">
  {/* Précédent */}
  <button
    onClick={() => goToVerse(currentVerse - 1)}
    disabled={currentVerse <= 1}
    className="btn btn--outline h-12 w-12 p-0 rounded-full flex items-center justify-center disabled:opacity-50"
    aria-label="Précédent"
    title="Précédent"
  >
  <SkipBack className="h-7 w-7" strokeWidth={2.25} />
  <span className="sr-only">Précédent</span>
</button>


  {/* Lire / Pause */}
  <button
    onClick={togglePlay}
    disabled={!ready || !!error}
    className="btn btn--primary h-12 w-12 p-0 rounded-full flex items-center justify-center disabled:opacity-50"
    aria-label={playing ? 'Pause' : 'Lire'}
    title={playing ? 'Pause' : 'Lire'}
  >
    {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
    <span className="sr-only">{playing ? 'Pause' : 'Lire'}</span>
  </button>

  {/* Suivant */}
  <button
    onClick={() => goToVerse(currentVerse + 1)}
    disabled={currentVerse >= 5}
    className="btn btn--outline h-12 w-12 p-0 rounded-full flex items-center justify-center disabled:opacity-50"
    aria-label="Suivant"
    title="Suivant"
  >
  <SkipForward className="h-7 w-7" strokeWidth={2.25} />
  <span className="sr-only">Suivant</span>
</button>


  {/* Changer de langue */}
  <button
  onClick={toggleLanguage}
  className="btn btn--outline h-12 w-12 p-0 rounded-full flex items-center justify-center"
  aria-label="Changer de langue"
  title="Changer de langue"
>
  <Globe className="h-7 w-7" strokeWidth={2.25} />
  <span className="sr-only">Changer de langue</span>
</button>

</div>


      {/* Lyrics panel (text-only yellow highlight, click-to-seek, auto-scroll) */}
      <div ref={panelRef} className="max-h-64 overflow-y-auto rounded-lg border border-[#2A2A2E] p-3 text-center">
        {lyricsError && <div className="text-sm text-red-400">{lyricsError}</div>}
        {!lyricsError && !cues && <div className="text-sm text-[#A1A1AA]">Chargement des paroles…</div>}
        {cues && cues.length > 0 && (
          <ul className="space-y-2">
            {cues.map((c, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={c.id ?? i} ref={el => { lineRefs.current[i] = el; }} className="leading-relaxed">
                  <span
                    onClick={() => seekTo(c.startMs)}
                    className={
                      'cursor-pointer rounded px-1 transition-colors ' +
                      (isActive ? 'bg-[#FDE047] text-black' : 'text-[#EDEDED]/80 hover:bg-[#141417]')
                    }
                    title="Aller à cette phrase"
                  >
                    {c.sentence}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <div className="rounded-md border border-red-700/50 bg-red-900/20 p-3 text-sm">{error}</div>}

      <Link to="/versets" className="inline-block text-sm text-[#A1A1AA] hover:underline">Revenir</Link>
    </section>
  );
}
