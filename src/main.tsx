import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';

import App from './App';
import Landing from './routes/landing';
import VerseSelect from './routes/VerseSelect';
import Player from './routes/player';
import Profile from './routes/Profile';

// QUIZ
import QuizHome from './routes/QuizHome';
import QuizPlay from './routes/QuizPlay';
import QuizResults from './routes/QuizResults';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Landing />} />
          <Route path="versets" element={<VerseSelect />} />
          <Route path="lecteur" element={<Player />} />
          {/* QUIZ */}
          <Route path="quiz" element={<QuizHome />} />
          <Route path="quiz/jouer" element={<QuizPlay />} />
          <Route path="quiz/resultats" element={<QuizResults />} />
          <Route path="profil" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
