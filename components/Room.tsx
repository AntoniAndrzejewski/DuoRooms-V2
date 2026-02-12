
import React, { useState, useEffect, useRef } from 'react';
import { RoomState, User, ActivityType, Message, RoomTheme } from '../types';
import { Share2, Send, Paperclip, Gamepad2, Users, Settings, LogOut, MessageSquare, Crown, ShieldAlert, X, Check, Search, MonitorPlay, Scissors, Radio } from 'lucide-react';
import ChessGame from './games/ChessGame';
import RPSGame from './games/RPSGame';
import RadioPlayer from './media/RadioPlayer';

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

interface RoomProps {
  t: any;
  room: RoomState;
  user: User;
  setRoom: React.Dispatch<React.SetStateAction<RoomState | null>>;
  onLeave: () => void;
}

const Room: React.FC<RoomProps> = ({ t, room, user, setRoom, onLeave }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'chat' | 'participants'>('main');
  const [chatInput, setChatInput] = useState('');
  const [showInviteToast, setShowInviteToast] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isHost = user.id === room.ownerId;

  const themeClasses = {
    [RoomTheme.ROMANTIC]: 'romantic-theme bg-pink-50',
    [RoomTheme.BUSINESS]: 'business-theme bg-slate-50',
    [RoomTheme.FRIENDLY]: 'friendly-theme bg-yellow-50',
  };

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
          <button onClick={() => setActiveTab('chat')} className={`lg:hidden w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${activeTab === 'chat' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><MessageSquare className="w-7 h-7" />{room.messages.length > 0 && activeTab !== 'chat' && <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100"></div>}</button>
          <button onClick={() => setActiveTab('participants')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${activeTab === 'participants' ? 'bg-white shadow-xl text-slate-900 scale-110' : 'text-slate-500'}`}><Users className="w-7 h-7" />{room.waitingRoom.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-100"></div>}</button>
          <div className="mt-auto"><button className="w-12 h-12 rounded-2xl text-slate-500 hover:text-slate-900 flex items-center justify-center"><Settings className="w-7 h-7" /></button></div>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Sidebar */}
          <aside className={`flex-col bg-white/30 backdrop-blur-sm border-r border-black/5 transition-all duration-300 w-full lg:w-96 ${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
            <ChatSection 
              t={t} 
              room={room} 
              user={user} 
              chatInput={chatInput} 
              setChatInput={setChatInput} 
              handleSendMessage={handleSendMessage} 
              chatEndRef={chatEndRef}
              chatContainerRef={chatContainerRef}
            />
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 flex flex-col min-0 bg-transparent relative overflow-y-auto ${activeTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            {activeTab !== 'participants' ? (
              <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                {room.currentActivity === ActivityType.LOBBY ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="text-center mb-12 space-y-2">
                          <h2 className="text-3xl md:text-4xl font-black opacity-80">{t.activities}</h2>
                          <p className="text-sm font-medium opacity-50">Collaborate or compete in real-time</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                          {[
                            { id: ActivityType.CHESS, label: t.chess, icon: '♟️', color: 'bg-amber-500' }, 
                            { id: ActivityType.ROCK_PAPER_SCISSORS, label: t.rps, icon: '✊', color: 'bg-indigo-500' },
                            { id: ActivityType.RADIO, label: t.radio, icon: '📻', color: 'bg-emerald-500' },
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
                  <ChessGame 
                    t={t} 
                    onClose={() => setActivity(ActivityType.LOBBY)}
                    isOwner={isHost} 
                    theme={room.theme} 
                    player1={user}
                    player2={room.participants.find(p => p.id !== user.id)}
                  />
                ) : room.currentActivity === ActivityType.ROCK_PAPER_SCISSORS ? (
                  <RPSGame 
                    t={t}
                    onClose={() => setActivity(ActivityType.LOBBY)}
                    theme={room.theme}
                    player1={user}
                    player2={room.participants.find(p => p.id !== user.id)}
                  />
                ) : room.currentActivity === ActivityType.RADIO ? (
                  <RadioPlayer 
                    t={t}
                    onClose={() => setActivity(ActivityType.LOBBY)}
                    theme={room.theme}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                      <MonitorPlay className="w-20 h-20 mb-4" />
                      <p className="text-2xl font-bold">Coming Soon</p>
                      <button onClick={() => setActivity(ActivityType.LOBBY)} className="mt-4 underline">Back to Lobby</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 p-8 max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-300">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Users className="w-7 h-7" /> {t.participants}</h3>
                    <div className="space-y-3">
                      {room.participants.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-white/40 p-5 rounded-[30px] border border-black/5 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md relative">
                              {p.avatar}
                              {p.isOwner && <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 drop-shadow-md" />}
                            </div>
                            <div>
                              <p className="font-black text-lg">{p.name}</p>
                              <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{p.isOwner ? 'Host' : 'Member'}</p>
                            </div>
                          </div>
                          {isHost && !p.isOwner && (
                            <button onClick={() => kickUser(p.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"><ShieldAlert className="w-6 h-6" /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {isHost && room.waitingRoom.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black mb-6 text-blue-600 flex items-center gap-3"><ShieldAlert className="w-6 h-6" /> {t.waitingRoom}</h3>
                      <div className="space-y-3">
                        {room.waitingRoom.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-blue-50/50 p-5 rounded-[30px] border border-blue-100 shadow-sm animate-pulse">
                            <div className="flex items-center gap-4"><div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl">{p.avatar}</div><p className="font-bold">{p.name}</p></div>
                            <div className="flex gap-2">
                              <button onClick={() => approveUser(p.id)} className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all"><Check className="w-5 h-5" /></button>
                              <button className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all"><X className="w-5 h-5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Room;
