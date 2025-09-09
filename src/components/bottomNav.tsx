import { NavLink } from 'react-router-dom';
import { Home, HelpCircle, User } from 'lucide-react';

const itemCls =
  'flex flex-col items-center justify-center flex-1 py-2 text-xs';
const baseIcon = 'w-5 h-5 mb-1';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[#2A2A2E] h-20 bg-black/90 backdrop-blur z-40">
      <div className="max-w-md mx-auto flex">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${itemCls} ${isActive ? 'text-green-500' : 'text-zinc-400'}`
          }
        >
          <Home className={baseIcon} />
          <span>Accueil</span>
        </NavLink>

        <NavLink
          to="/quiz" // si ta page d’entrée du quiz est /quiz/jouer, mets "/quiz/jouer"
          className={({ isActive }) =>
            `${itemCls} ${isActive ? 'text-green-500' : 'text-zinc-400'}`
          }
        >
          <HelpCircle className={baseIcon} />
          <span>Quiz</span>
        </NavLink>

        <NavLink
          to="/profil" // on crée un écran simple plus bas
          className={({ isActive }) =>
            `${itemCls} ${isActive ? 'text-green-500' : 'text-zinc-400'}`
          }
        >
          <User className={baseIcon} />
          <span>Profil</span>
        </NavLink>
      </div>
    </nav>
  );
}
