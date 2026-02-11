
import React from 'react';
import { Language } from '../types';
import { LogIn, UserCircle, Globe, Heart, Briefcase, Users } from 'lucide-react';

interface LandingPageProps {
  t: any;
  onLogin: (isGuest: boolean) => void;
  currentLang: Language;
  setLang: (lang: Language) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ t, onLogin, currentLang, setLang }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <header className="absolute top-8 w-full max-w-6xl px-8 flex justify-between items-center z-10">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Duo Rooms
        </div>
        <div className="flex gap-2">
          {Object.values(Language).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                currentLang === l ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl text-center z-10 space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            {t.tagline}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            The ultimate online space for intimate dates, professional meetings, or hanging out with friends. 
            Everything happens in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 glass rounded-3xl space-y-3">
                <Heart className="w-8 h-8 text-pink-500" />
                <h3 className="text-xl font-bold">{t.romantic}</h3>
                <p className="text-sm text-slate-400">Cozy lighting and ambient music for perfect dates.</p>
            </div>
            <div className="p-6 glass rounded-3xl space-y-3">
                <Briefcase className="w-8 h-8 text-blue-500" />
                <h3 className="text-xl font-bold">{t.business}</h3>
                <p className="text-sm text-slate-400">Clean, professional environment for productivity.</p>
            </div>
            <div className="p-6 glass rounded-3xl space-y-3">
                <Users className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-bold">{t.friendly}</h3>
                <p className="text-sm text-slate-400">Fun games and shared media for casual hangouts.</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button
            onClick={() => onLogin(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
          >
            <UserCircle className="w-6 h-6" />
            {t.loginAsGuest}
          </button>
          <button
            onClick={() => onLogin(false)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <LogIn className="w-6 h-6" />
            {t.loginWithGoogle}
          </button>
        </div>
      </main>

      <footer className="absolute bottom-8 text-slate-500 text-sm">
        © 2024 Duo Rooms. All rights reserved. Built with excellence.
      </footer>
    </div>
  );
};

export default LandingPage;
