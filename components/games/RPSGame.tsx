
import React, { useState, useEffect, useCallback } from 'react';
// Add Scissors to the list of icons imported from lucide-react
import { RotateCcw, AlertTriangle, Cpu, Trophy, Sparkles, Scissors } from 'lucide-react';
import { RoomTheme, User as UserType } from '../../types';

interface RPSGameProps {
  t: any;
  onClose: () => void;
  theme: RoomTheme;
  player1?: UserType;
  player2?: UserType;
}

type Choice = 'rock' | 'paper' | 'scissors' | null;
type Result = 'win' | 'lose' | 'draw' | null;

const RPSGame: React.FC<RPSGameProps> = ({ t, onClose, theme, player1, player2 }) => {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [isBotEnabled, setIsBotEnabled] = useState(true);

  const choices: { id: Choice; emoji: string; label: string }[] = [
    { id: 'rock', emoji: '✊', label: t.rock },
    { id: 'paper', emoji: '✋', label: t.paper },
    { id: 'scissors', emoji: '✌️', label: t.scissors },
  ];

  const triggerVibration = (ms: number = 20) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const playEffect = useCallback((type: 'shake' | 'win' | 'lose' | 'draw') => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'shake') {
      osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      osc.start(now); osc.stop(now + 0.3);
    }
  }, []);

  const calculateResult = (p1: Choice, p2: Choice): Result => {
    if (p1 === p2) return 'draw';
    if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const handleChoice = (choice: Choice) => {
    if (isShaking || result) return;
    
    setPlayerChoice(choice);
    setIsShaking(true);
    triggerVibration(50);

    // Initial shake effect
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
        playEffect('shake');
        triggerVibration(20);
        shakeCount++;
        if (shakeCount >= 3) clearInterval(shakeInterval);
    }, 400);

    setTimeout(() => {
      const opponentMoves: Choice[] = ['rock', 'paper', 'scissors'];
      const botChoice = opponentMoves[Math.floor(Math.random() * 3)];
      
      setOpponentChoice(botChoice);
      setIsShaking(false);
      
      const gameResult = calculateResult(choice, botChoice);
      setResult(gameResult);
      
      if (gameResult === 'win') {
          setScore(s => ({ ...s, p1: s.p1 + 1 }));
          playEffect('win');
      } else if (gameResult === 'lose') {
          setScore(s => ({ ...s, p2: s.p2 + 1 }));
      }
    }, 1500);
  };

  const resetRound = () => {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setIsShaking(false);
  };

  const getThemeColors = () => {
    switch(theme) {
      case RoomTheme.ROMANTIC: return 'from-rose-400 to-pink-500';
      case RoomTheme.BUSINESS: return 'from-slate-700 to-slate-900';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[50px] p-10 shadow-2xl border border-white/50 relative overflow-hidden">
        {/* Decor Orbs */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${getThemeColors()} opacity-10 blur-3xl`}></div>
        
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${getThemeColors()} text-white shadow-lg`}>
                <Scissors className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight uppercase">{t.rps}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-black/5 px-2 py-0.5 rounded-full opacity-60">SCORE {score.p1} : {score.p2}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-all">
            <AlertTriangle className="w-6 h-6" />
          </button>
        </div>

        {/* Game Arena */}
        <div className="flex justify-between items-center h-48 mb-12 relative">
            {/* Player Side */}
            <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-24 h-24 bg-white rounded-[32px] shadow-xl border border-black/5 flex items-center justify-center text-6xl transition-all duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
                    {isShaking ? '✊' : (playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : '❔')}
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{player1?.name}</p>
                    <p className="font-bold text-slate-800">YOU</p>
                </div>
            </div>

            <div className="text-3xl font-black opacity-10 italic">VS</div>

            {/* Opponent Side */}
            <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-24 h-24 bg-white rounded-[32px] shadow-xl border border-black/5 flex items-center justify-center text-6xl transition-all duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
                    {isShaking ? '✊' : (opponentChoice ? choices.find(c => c.id === opponentChoice)?.emoji : '❔')}
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{isBotEnabled ? 'Deep AI' : player2?.name}</p>
                    <p className="font-bold text-slate-800">{isBotEnabled ? 'BOT' : 'OPPONENT'}</p>
                </div>
            </div>
        </div>

        {/* Action Controls */}
        {!result && !isShaking ? (
            <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                {choices.map(choice => (
                    <button 
                        key={choice.id}
                        onClick={() => handleChoice(choice.id)}
                        className="group flex flex-col items-center gap-3 p-6 bg-white border border-black/5 rounded-[32px] hover:border-indigo-200 hover:bg-indigo-50/50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-2 active:scale-95"
                    >
                        <span className="text-4xl group-hover:scale-125 transition-transform">{choice.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{choice.label}</span>
                    </button>
                ))}
            </div>
        ) : result ? (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                <div className={`px-10 py-4 rounded-full text-white font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 ${result === 'win' ? 'bg-emerald-500 ring-8 ring-emerald-500/20' : result === 'lose' ? 'bg-rose-500 ring-8 ring-rose-500/20' : 'bg-slate-400'}`}>
                    {result === 'win' && <Trophy className="w-6 h-6" />}
                    {t[result]}
                    {result === 'win' && <Sparkles className="w-6 h-6" />}
                </div>
                <button 
                    onClick={resetRound}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" /> Play Again
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-4 animate-pulse">
                 <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress origin-left"></div>
                 </div>
                 <p className="text-xs font-black opacity-30 uppercase tracking-[0.3em]">ROCK • PAPER • SCISSORS</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RPSGame;
