
# Lakou — Roadmap & Next Steps

> Projet: Vite + React + TS + Tailwind + Capacitor (Android, iOS plus tard)  
> UI: FR (code interne en anglais) • Données quiz: remote (GitHub Raw) + fallback local • Aucun compte, aucune collecte de données

## 0) Release checklist (Android — Play Console)
- [ ] Mettre à jour l’icône (générée) & nom d’app: **Lakou**
- [ ] `versionCode` +1 et `versionName` (android/app/build.gradle)
- [ ] Générer **AAB**: `./gradlew bundleRelease`
- [ ] Page **Confidentialité** (texte simple: aucune collecte) et lien dans le store
- [ ] Captures d’écran (téléphone)
- [ ] Liste Play: titre, courte description, longue description
- [ ] Tests internes → Prod

## 1) Accueil
- [x] En‑tête: **LAKOU** — *istwa, kilti, fyete*
- [x] Bloc hymne (FR/HT) — inchangé
- [x] **Question du jour** (exclure `boolean`), tirage à chaque lancement
- [ ] Section 3 (à définir): idées — “Défi de la semaine”, “Citation”, “Dernières nouveautés”

## 2) Quiz (v1.1 rapide avant publication)
- [ ] **Rejouer la même catégorie** (bouton sur résultats)
- [ ] **Partager le score** (Capacitor Share / navigator.share, fallback copier lien)
- [ ] **Réglages**: sons ON/OFF, haptiques ON/OFF (Capacitor Haptics)
- [ ] **Leaderboard local** (meilleur score par catégorie, `localStorage`/Capacitor Storage)
- [ ] (Option) Carte **vitesse de réponse** déjà lazy‑load (Recharts) — garder

### Déjà en place
- [x] Révélation immédiate bonne/mauvaise réponse (explication sous la bonne réponse seulement)
- [x] Timer global ~24s (interrompt et affiche les réponses données)
- [x] Pas de multi‑réponse • 10 questions • Pas de bouton “Valider”

## 3) Lecteur hymne
- [x] Barre de progression masquée
- [x] Drapeau animé (gauche→droite)
- [ ] Ajuster fin d’animation pour garder le drapeau visible en bord droit (si nécessaire)
- [ ] (Option) Mode karaoké mot‑à‑mot (JSON plus fin, plus tard)

## 4) Thème & UI
- [x] Palette plus claire (tokens CSS) + cartes `.card`, boutons `.btn`, `.btn-outline`
- [x] Barre de menu bas: **Accueil · Quiz · Profil**
- [ ] Harmoniser toutes les cartes/boutons existants avec les classes utilitaires
- [ ] Icônes plus grandes sur lecteur et quiz (lucide‑react) si besoin

## 5) Données quiz (remote + fallback)
- [x] `.env.local` → `VITE_QUIZ_REMOTE=https://raw.githubusercontent.com/Florial22/Lakou/main/public/remote/`
- [x] Loader “remote d’abord, sinon local” + badge interne (non‑UI)
- [ ] Garder **structure identique** entre remote et local (`questions[]`; `type: "single" | "boolean"`)
- [ ] (Option) Champ `meta.version` / `meta.updated` **sans l’afficher** (utile debug)

## 6) iOS (plus tard)
- [ ] `npx cap add ios`, icônes & splash, run sur simulateur, audio ok après tap
- [ ] Archive via Xcode → TestFlight

## 7) Technique / DX
- [ ] Auto‑deploy web (facultatif): Vercel/Netlify depuis `main`
- [ ] Scripts npm: `dev:lan`, `preview`, `deploy` (si GitHub Pages)
- [ ] CI basique (facultatif): build web + `npx cap sync`

---

## Commandes utiles

### Android (Capacitor)
```bash
npm run build
npx cap sync android
npx cap open android

# debug APK
cd android && ./gradlew assembleDebug

# release AAB (Play)
cd android && ./gradlew bundleRelease
```

### Git (pousser de nouveaux dossiers)
Git ne suit pas les dossiers vides. Pour qu’un nouveau dossier apparaisse sur GitHub, ajoutez un fichier (ex: `.gitkeep`).
```bash
# créer un fichier todo et des .gitkeep si besoin
mkdir -p docs
printf "Voir roadmap dans ce fichier.\n" > docs/README.md

# ajouter un .gitkeep dans chaque dossier vide
find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;

git add -A
git commit -m "docs: add roadmap and ensure new folders tracked"
git push
```

### Vérifier si un fichier est ignoré par .gitignore
```bash
git check-ignore -v docs/todo.md || echo "not ignored"
```
