
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowRight, UserCircle2, Sparkles } from 'lucide-react';

interface OnboardingProps {
  t: any;
  onComplete: (name: string, gender: User['gender'], avatar: string) => void;
}

const AVATARS = [
  '🦊', '🦁', '🐱', '🐶', '🦄', '🐼', '🐨', '🐸', '🐙', '🦖', '🤖', '👻'
];

const Onboarding: React.FC<OnboardingProps> = ({ t, onComplete }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<User['gender']>('male');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
      <div className="w-full max-w-lg space-y-8 glass p-8 md:p-12 rounded-[50px] animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl shadow-2xl">
            {avatar}
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white">{t.appName} Profile</h2>
          <p className="text-slate-400 font-medium">Create your unique identity</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{t.selectAvatar}</label>
            <div className="grid grid-cols-6 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-12 h-12 flex items-center justify-center text-2xl rounded-2xl transition-all ${
                    avatar === a ? 'bg-white scale-125 shadow-xl rotate-6' : 'bg-slate-800 hover:bg-slate-700 opacity-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{t.enterName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-500/30 transition-all text-xl font-bold text-white placeholder:opacity-20"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{t.selectGender}</label>
            <div className="grid grid-cols-3 gap-4">
              {(['male', 'female', 'other'] as User['gender'][]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-4 rounded-2xl border-2 transition-all font-black uppercase text-xs tracking-widest ${
                    gender === g
                      ? 'bg-purple-600 border-purple-400 text-white shadow-xl shadow-purple-600/30 translate-y-[-2px]'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {t[g]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => name.trim() && onComplete(name, gender, avatar)}
          disabled={!name.trim()}
          className="w-full py-5 bg-white text-slate-900 rounded-[30px] font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-white/10 active:scale-95"
        >
          {t.createRoom} <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
