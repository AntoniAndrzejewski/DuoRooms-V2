
import React, { useState, useEffect, useCallback } from 'react';
import { Language, User, RoomTheme, RoomState, ActivityType, Message } from './types';
import { translations } from './i18n';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Lobby from './components/Lobby';
import Room from './components/Room';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.EN);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'onboarding' | 'lobby' | 'room'>('landing');
  const [room, setRoom] = useState<RoomState | null>(null);

  const t = translations[lang] || translations[Language.EN];

  const handleLogin = (isGuest: boolean) => {
    setView('onboarding');
  };

  const handleOnboardingComplete = (name: string, gender: User['gender'], avatar: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender,
      avatar,
    };
    setUser(newUser);
    setView('lobby');
  };

  const createNewRoom = (theme: RoomTheme) => {
    if (!user) return;
    const newRoom: RoomState = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      theme,
      ownerId: user.id,
      participants: [{ ...user, isOwner: true }],
      waitingRoom: [],
      currentActivity: ActivityType.LOBBY,
      messages: [],
    };
    setRoom(newRoom);
    setView('room');
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      {view === 'landing' && (
        <LandingPage 
          t={t} 
          onLogin={handleLogin} 
          currentLang={lang} 
          setLang={setLang} 
        />
      )}
      {view === 'onboarding' && (
        <Onboarding t={t} onComplete={handleOnboardingComplete} />
      )}
      {view === 'lobby' && (
        <Lobby t={t} onCreateRoom={createNewRoom} user={user} />
      )}
      {view === 'room' && room && user && (
        <Room 
          t={t} 
          room={room} 
          user={user} 
          setRoom={setRoom} 
          onLeave={() => setView('lobby')}
        />
      )}
    </div>
  );
};

export default App;
