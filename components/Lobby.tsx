
import React from 'react';
import { RoomTheme, User } from '../types';
import { Heart, Briefcase, Users, PlusCircle } from 'lucide-react';

interface LobbyProps {
  t: any;
  user: User | null;
  onCreateRoom: (theme: RoomTheme) => void;
}

const Lobby: React.FC<LobbyProps> = ({ t, user, onCreateRoom }) => {
  const themes = [
    { 
      id: RoomTheme.ROMANTIC, 
      label: t.romantic, 
      icon: Heart, 
      color: 'bg-pink-500', 
      desc: 'Soft lighting, music player, intimate chat.' 
    },
    { 
      id: RoomTheme.BUSINESS, 
      label: t.business, 
      icon: Briefcase, 
      color: 'bg-blue-500', 
      desc: 'Screen sharing, whiteboard, minimal UI.' 
    },
    { 
      id: RoomTheme.FRIENDLY, 
      label: t.friendly, 
      icon: Users, 
      color: 'bg-yellow-500', 
      desc: 'Games, YouTube sync, casual vibes.' 
    }
  ];

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-slate-400">Choose a theme to start your new room.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 p-2 pr-4 rounded-full">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                {user?.name[0].toUpperCase()}
            </div>
            <span className="font-medium text-slate-200">{user?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <div 
              key={theme.id}
              className="group relative overflow-hidden rounded-[40px] glass p-1 cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => onCreateRoom(theme.id)}
            >
              <div className="p-8 space-y-6">
                <div className={`w-14 h-14 ${theme.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{theme.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{theme.desc}</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-slate-200 font-bold group-hover:text-white transition-colors">
                  <PlusCircle className="w-5 h-5" />
                  Create Now
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 ${theme.color} opacity-30`}></div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-12 rounded-[50px] border border-white/5 space-y-6 text-center">
        <h2 className="text-3xl font-bold">Looking for someone new?</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Join a random public room or create a public space where anyone can request to join.
          Meet interesting people from around the world.
        </p>
        <button className="px-10 py-4 bg-purple-600 rounded-2xl font-bold hover:bg-purple-500 transition-all">
          Find Random Match
        </button>
      </div>
    </div>
  );
};

export default Lobby;
