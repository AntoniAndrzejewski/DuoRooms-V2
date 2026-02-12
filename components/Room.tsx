
import React, { useState, useEffect, useRef } from 'react';
import { RoomState, User, ActivityType, Message, RoomTheme } from '../types';
import { Share2, Send, Paperclip, Gamepad2, Users, Settings, LogOut, MessageSquare, Crown, ShieldAlert, X, Check, Search, MonitorPlay, Scissors, Radio, Volume2, Play, Pause, Waves, Music } from 'lucide-react';
import ChessGame from './games/ChessGame';
import RPSGame from './games/RPSGame';

const RADIO_STATIONS = [
  { id: 'lofi', name: 'Lofi Hip-Hop', url: 'https://stream.laut.fm/lofi', color: 'bg-purple-500', icon: '🎧' },
  { id: 'chillhop', name: 'Chillhop / Jazz', url: 'https://streams.fluxfm.de/Chillhop/mp3-128/', color: 'bg-amber-500', icon: '☕' },
  { id: 'ambient', name: 'Deep Focus / Ambient', url: 'https://stream.laut.fm/study', color: 'bg-indigo-500', icon: '📚' }
];

interface ChatSectionProps {
  t: any;
  room: RoomState;
  user: User;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatSection: React.FC<ChatSectionProps> = ({ 
  t, room, user, chatInput, setChatInput, handleSendMessage, chatEndRef, chatContainerRef 
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-black/5 bg-white/10 flex items-center justify-between">
        <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Chat
        </h3>
        <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-bold opacity-50">Room ID: {room.id}</span>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
      >
        {room.messages.map((msg, idx) => {
          const isMine = msg.senderId === user.id;
          const showAvatar = idx === 0 || room.messages[idx - 1].senderId !== msg.senderId;
          
          return (
            <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4`}>
                <div className={`w-8 h-8 flex-shrink-0 text-xl flex items-center justify-center rounded-xl bg-white shadow-sm border border-black/5 ${!showAvatar ? 'opacity-0' : ''}`}>
                    {msg.senderAvatar}
                </div>
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    {showAvatar && (
                        <span className="text-[10px] font-black opacity-30 uppercase mb-1 px-1">
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <div className={`px-5 py-3 rounded-[24px] shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                        isMine 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-black/5'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-white/40 border-t border-black/5">
        <div className="flex items-end gap-3 bg-white border border-black/5 rounded-[30px] p-2 pl-4 shadow-sm focus-within:ring-4 focus-within:ring-black/5 transition-all">
            <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                <Paperclip className="w-5 h-5" />
            </button>
            <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder={t.chatPlaceholder}
                rows={1}
                className="flex-1 bg-transparent py-3 outline-none text-sm resize-none max-h-32"
                style={{ height: 'auto' }}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                }}
            />
            <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-30"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

interface RadioSectionProps {
  t: any;
  currentStation: typeof RADIO_STATIONS[0];
  setCurrentStation: (s: typeof RADIO_STATIONS[0]) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  isLoading: boolean;
}

const RadioSection: React.FC<RadioSectionProps> = ({ 
    t, currentStation, setCurrentStation, isPlaying, setIsPlaying, volume, setVolume, isLoading 
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-black/5 bg-white/10 flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4" /> {t.radio}
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                {/* Visualizer & Info */}
                <div className="flex flex-col items-center gap-6 py-4">
                    <div className={`relative w-32 h-32 rounded-full ${currentStation.color} flex items-center justify-center shadow-xl transition-all duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                        <div className="text-5xl">{currentStation.icon}</div>
                        {isPlaying && <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>}
                    </div>
                    
                    <div className="text-center">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{isPlaying ? t.playing : t.paused}</p>
                        <h4 className="text-lg font-black text-slate-800 leading-tight">{currentStation.name}</h4>
                    </div>

                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={isLoading}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${isPlaying ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div> : (isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />)}
                    </button>
                </div>

                {/* Volume */}
                <div className="space-y-3 bg-white/40 p-4 rounded-2xl border border-white/40 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> {t.volume}</div>
                        <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.01" value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                    />
                </div>

                {/* Station List */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest ml-1">{t.stations}</p>
                    <div className="space-y-2">
                        {RADIO_STATIONS.map((station) => (
                            <button
                                key={station.id}
                                onClick={() => setCurrentStation(station)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${currentStation.id === station.id ? 'bg-white border-black/5 shadow-md' : 'bg-black/5 border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">{station.icon}</div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-xs truncate">{station.name}</p>
                                </div>
                                {currentStation.id === station.id && isPlaying && <Waves className="w-4 h-4 text-indigo-500 animate-pulse" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RoomProps {
  t: any;
  room: RoomState;
  user: User;
  setRoom: React.Dispatch<React.SetStateAction<RoomState | null>>;
  onLeave: () => void;
}

const Room: React.FC<RoomProps> = ({ t, room, user, setRoom, onLeave }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'chat' | 'participants' | 'radio'>('main');
  const [chatInput, setChatInput] = useState('');
  const [showInviteToast, setShowInviteToast] = useState(false);
  
  // Persistent Radio State
  const [currentStation, setCurrentStation] = useState(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isHost = user.id === room.ownerId;

  const themeClasses = {
    [RoomTheme.ROMANTIC]: 'romantic-theme bg-pink-50',
    [RoomTheme.BUSINESS]: 'business-theme bg-slate-50',
    [RoomTheme.FRIENDLY]: 'friendly-theme bg-yellow-50',
  };

  // Radio Audio Controller
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
        setIsLoading(true);
        audioRef.current.play()
            .then(() => setIsLoading(false))
            .catch(err => {
                console.error("Playback error:", err);
                setIsPlaying(false);
                setIsLoading(false);
            });
    } else {
        audioRef.current.pause();
    }
  }, [isPlaying, currentStation.url]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage: Message = {
      id: Math.random().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: chatInput,
      timestamp: Date.now(),
      type: 'text'
    };
    setRoom(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
    setChatInput('');
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('smooth'), 50);
    return () => clearTimeout(timer);
  }, [room.messages.length, activeTab]);

  const copyInvite = () => {
    const link = `${window.location.origin}/#room=${room.id}`;
    navigator.clipboard.writeText(link);
    setShowInviteToast(true);
    setTimeout(() => setShowInviteToast(false), 3000);
  };

  const setActivity = (activity: ActivityType) => {
    if (!isHost) return;
    setRoom(prev => prev ? { ...prev, currentActivity: activity } : null);
  };

  const kickUser = (id: string) => {
    setRoom(prev => prev ? { ...prev, participants: prev.participants.filter(p => p.id !== id) } : null);
  };

  const approveUser = (id: string) => {
    const requestingUser = room.waitingRoom.find(u => u.id === id);
    if (!requestingUser) return;
    setRoom(prev => prev ? {
      ...prev,
      waitingRoom: prev.waitingRoom.filter(u => u.id !== id),
      participants: [...prev.participants, requestingUser]
    } : null);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${themeClasses[room.theme]}`}>
      {/* Persistent Audio Tag */}
      <audio ref={audioRef} src={currentStation.url} preload="none" />

      {showInviteToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] animate-bounce">
          Link copied!
        </div>
      )}

      <header className="h-20 border-b border-black/10 flex items-center justify-between px-6 bg-white/20 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest font-bold opacity-40">Room</span>
            <span className="text-xl font-black tracking-tighter">{room.id}</span>
          </div>
          <button 
            onClick={copyInvite}
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 px-5 py-2 rounded-2xl text-xs font-bold transition-all"
          >
            <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">{t.inviteFriend}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white/30 px-3 py-1.5 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">
                    {user.avatar}
                </div>
                <span className="text-sm font-black text-slate-800">{user.name}</span>
            </div>
            <button onClick={onLeave} className="w-12 h-12 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-2xl flex items-center justify-center transition-all">
                <LogOut className="w-6 h-6" />
            </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-20 border-r border-black/5 flex flex-col items-center py-8 gap-8 bg-black/5 z-10">
          <button onClick={() => setActiveTab('main')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'main' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><Gamepad2 className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('chat')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${activeTab === 'chat' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><MessageSquare className="w-7 h-7" />{room.messages.length > 0 && activeTab !== 'chat' && <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100"></div>}</button>
          <button onClick={() => setActiveTab('radio')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${activeTab === 'radio' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><Radio className="w-7 h-7" />{isPlaying && <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}</button>
          <button onClick={() => setActiveTab('participants')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${activeTab === 'participants' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><Users className="w-7 h-7" />{room.waitingRoom.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-100"></div>}</button>
          <div className="mt-auto"><button className="w-12 h-12 rounded-2xl text-slate-500 hover:text-slate-900 flex items-center justify-center"><Settings className="w-7 h-7" /></button></div>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Section (Chat / Radio / Participants) */}
          <aside className={`flex-col bg-white/30 backdrop-blur-sm border-r border-black/5 transition-all duration-300 w-full lg:w-96 ${activeTab !== 'main' ? 'flex' : 'hidden lg:flex'}`}>
            {activeTab === 'chat' || (activeTab === 'main' && window.innerWidth >= 1024) ? (
                <ChatSection t={t} room={room} user={user} chatInput={chatInput} setChatInput={setChatInput} handleSendMessage={handleSendMessage} chatEndRef={chatEndRef} chatContainerRef={chatContainerRef} />
            ) : activeTab === 'radio' ? (
                <RadioSection t={t} currentStation={currentStation} setCurrentStation={setCurrentStation} isPlaying={isPlaying} setIsPlaying={setIsPlaying} volume={volume} setVolume={setVolume} isLoading={isLoading} />
            ) : activeTab === 'participants' ? (
                <div className="p-8"><h3 className="text-xl font-black mb-6">{t.participants}</h3><div className="space-y-3">{room.participants.map(p => (<div key={p.id} className="bg-white/40 p-4 rounded-2xl flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-2xl">{p.avatar}</span><span className="font-bold">{p.name}</span></div>{p.isOwner && <Crown className="w-4 h-4 text-yellow-500" />}</div>))}</div></div>
            ) : null}
          </aside>

          {/* Main Activity Area */}
          <main className={`flex-1 flex flex-col min-0 bg-transparent relative overflow-y-auto ${activeTab !== 'main' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                {room.currentActivity === ActivityType.LOBBY ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="text-center mb-12 space-y-2">
                          <h2 className="text-3xl md:text-4xl font-black opacity-80">{t.activities}</h2>
                          <p className="text-sm font-medium opacity-50">Collaborate or compete in real-time</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                          {[
                            { id: ActivityType.CHESS, label: t.chess, icon: '♟️', color: 'bg-amber-500' }, 
                            { id: ActivityType.ROCK_PAPER_SCISSORS, label: t.rps, icon: '✊', color: 'bg-indigo-500' },
                            { id: ActivityType.TIC_TAC_TOE, label: t.tictactoe, icon: '❌', color: 'bg-blue-500' }, 
                            { id: ActivityType.YOUTUBE, label: t.youtube, icon: '📺', color: 'bg-red-500' }
                          ].map((act) => (
                              <button key={act.id} onClick={() => setActivity(act.id as ActivityType)} className={`group relative p-8 rounded-[40px] ${act.color} text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center h-48`}>
                                  <span className="text-5xl mb-3 group-hover:rotate-12 transition-transform">{act.icon}</span>
                                  <span className="text-sm font-black uppercase tracking-widest leading-tight">{act.label}</span>
                                  {!isHost && <div className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center cursor-not-allowed text-xs font-bold">Host Only</div>}
                              </button>
                          ))}
                      </div>
                  </div>
                ) : room.currentActivity === ActivityType.CHESS ? (
                  <ChessGame t={t} onClose={() => setActivity(ActivityType.LOBBY)} isOwner={isHost} theme={room.theme} player1={user} player2={room.participants.find(p => p.id !== user.id)} />
                ) : room.currentActivity === ActivityType.ROCK_PAPER_SCISSORS ? (
                  <RPSGame t={t} onClose={() => setActivity(ActivityType.LOBBY)} theme={room.theme} player1={user} player2={room.participants.find(p => p.id !== user.id)} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                      <MonitorPlay className="w-20 h-20 mb-4" />
                      <p className="text-2xl font-bold">Coming Soon</p>
                      <button onClick={() => setActivity(ActivityType.LOBBY)} className="mt-4 underline">Back to Lobby</button>
                  </div>
                )}
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Room;
