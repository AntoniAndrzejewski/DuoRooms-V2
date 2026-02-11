import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Brain, User, Trophy, AlertTriangle, Cpu, ChevronDown } from 'lucide-react';
import { RoomTheme, User as UserType } from '../../types';
import { Chess, Move, Square } from 'chess.js';

interface ChessGameProps {
  t: any;
  onClose: () => void;
  isOwner: boolean;
  theme: RoomTheme;
  player1?: UserType;
  player2?: UserType;
}

const ChessGame: React.FC<ChessGameProps> = ({ t, onClose, isOwner, theme, player1, player2 }) => {
  const game = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(game.board());
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [matedKingPos, setMatedKingPos] = useState<string | null>(null);

  const pieceMap: Record<string, string> = {
    'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
    'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
  };

  const playSound = useCallback((type: 'select' | 'move' | 'capture' | 'check' | 'mate') => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'select') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'move') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'capture') {
      osc.type = 'square'; osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'check') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(330, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'mate') {
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.1, now + i * 0.1); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
        o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.6);
      });
    }
  }, []);

  const triggerVibration = useCallback((type: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) navigator.vibrate(type === 'light' ? 20 : 50);
  }, []);

  const updateBoard = useCallback(() => {
    setBoard(game.board());
    if (game.isCheckmate()) {
        const turn = game.turn(); // The one who is checkmated is whose turn it is
        setGameOver('Checkmate! ' + (turn === 'w' ? 'Black' : 'White') + ' wins.');
        playSound('mate');

        // Find king position to animate shatter
        const currentBoard = game.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = currentBoard[r][c];
            if (p && p.type === 'k' && p.color === turn) {
              setMatedKingPos(`${['a','b','c','d','e','f','g','h'][c]}${8-r}`);
              break;
            }
          }
        }
    } else if (game.isDraw()) {
        setGameOver('Draw!');
    } else if (game.isCheck()) {
        playSound('check');
    }
  }, [game, playSound]);

  const makeBotMove = useCallback(() => {
    if (gameOver) return;
    const moves = game.moves();
    if (moves.length === 0) return;

    setIsBotThinking(true);
    const delay = 1000 + Math.random() * 1000;

    setTimeout(() => {
        setIsBotThinking(false);
        let selectedMove;
        if (botDifficulty === 'easy') {
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
        } else {
            const prioritizedMoves = moves.filter(m => m.includes('x') || m.includes('+') || m.includes('#'));
            selectedMove = prioritizedMoves.length > 0 && Math.random() > 0.3 
                ? prioritizedMoves[Math.floor(Math.random() * prioritizedMoves.length)]
                : moves[Math.floor(Math.random() * moves.length)];
        }
        
        const moveResult = game.move(selectedMove);
        if (moveResult) {
            setLastMove({ from: moveResult.from, to: moveResult.to });
            updateBoard();
            if (moveResult.captured) playSound('capture'); else playSound('move');
        }
    }, delay);
  }, [game, gameOver, botDifficulty, updateBoard, playSound]);

  useEffect(() => {
    if (isBotEnabled && game.turn() === 'b' && !gameOver && !isBotThinking) {
        makeBotMove();
    }
  }, [game.turn(), isBotEnabled, gameOver, makeBotMove, isBotThinking]);

  const handleSquareClick = (square: string) => {
    if (gameOver || pendingPromotion || (isBotEnabled && game.turn() === 'b')) return;

    if (selected) {
      const move = legalMoves.find(m => m.to === square);
      if (move && move.promotion) {
        setPendingPromotion({ from: selected, to: square });
        return;
      }
      try {
        const moveResult = game.move({ from: selected as Square, to: square as Square });
        if (moveResult) {
          setLastMove({ from: selected, to: square });
          setSelected(null);
          setLegalMoves([]);
          updateBoard();
          if (moveResult.captured) playSound('capture'); else playSound('move');
          triggerVibration('medium');
          return;
        }
      } catch (e) {}
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelected(square);
      setLegalMoves(game.moves({ square: square as Square, verbose: true }));
      playSound('select');
      triggerVibration('light');
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  };

  const resetGame = () => {
    game.reset(); setLastMove(null); setSelected(null); setLegalMoves([]); setGameOver(null); setPendingPromotion(null); setMatedKingPos(null);
    updateBoard();
  };

  const boardColors = {
    [RoomTheme.ROMANTIC]: { dark: 'bg-[#b58863]', light: 'bg-[#f0d9b5]', highlight: 'bg-rose-400/50', lastMove: 'bg-yellow-200/40' },
    [RoomTheme.BUSINESS]: { dark: 'bg-slate-500', light: 'bg-slate-300', highlight: 'bg-indigo-500/50', lastMove: 'bg-indigo-200/40' },
    [RoomTheme.FRIENDLY]: { dark: 'bg-[#769656]', light: 'bg-[#eeeed2]', highlight: 'bg-emerald-400/50', lastMove: 'bg-yellow-200/50' },
  };

  const currentColors = boardColors[theme] || boardColors[RoomTheme.FRIENDLY];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl rounded-[48px] p-6 md:p-10 shadow-2xl border border-white/40">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${theme === RoomTheme.ROMANTIC ? 'bg-pink-500' : theme === RoomTheme.FRIENDLY ? 'bg-emerald-500' : 'bg-slate-800'}`}>
              <Brain className="w-8 h-8" />
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black tracking-tight">DUO CHESS</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsBotEnabled(!isBotEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isBotEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                >
                  <Cpu className="w-3 h-3" /> {isBotEnabled ? t.difficulty + ': ' + t[botDifficulty] : t.playWithBot}
                </button>
                {isBotEnabled && (
                    <button onClick={() => setShowDifficultyMenu(!showDifficultyMenu)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDifficultyMenu ? 'rotate-180' : ''}`} />
                    </button>
                )}
              </div>
              {showDifficultyMenu && isBotEnabled && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 z-[60] min-w-[140px] animate-in slide-in-from-top-2 duration-200">
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                        <button key={diff} onClick={() => { setBotDifficulty(diff); setShowDifficultyMenu(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${botDifficulty === diff ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}>
                            {t[diff]}
                        </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetGame} className="p-4 hover:bg-black/5 rounded-2xl transition-all active:scale-90" title="Reset Game"><RotateCcw className="w-6 h-6" /></button>
            <button onClick={onClose} className="p-4 hover:bg-red-500/10 text-red-500 rounded-2xl transition-all active:scale-90"><AlertTriangle className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="relative p-4 md:p-8 bg-black/10 rounded-[32px] shadow-inner">
          <div className="flex ml-8 mb-2">
            {files.map(f => <div key={f} className="flex-1 text-center text-[10px] font-black opacity-30 uppercase">{f}</div>)}
          </div>
          <div className="flex">
            <div className="flex flex-col mr-2 justify-around">
              {ranks.map(r => <div key={r} className="text-[10px] font-black opacity-30 h-full flex items-center">{r}</div>)}
            </div>
            <div className="relative flex-1 aspect-square grid grid-cols-8 grid-rows-8 border-4 border-black/10 rounded-xl overflow-hidden shadow-2xl bg-white">
              {board.map((row, rIdx) => row.map((piece, cIdx) => {
                  const square = `${files[cIdx]}${ranks[rIdx]}`;
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const isSelected = selected === square;
                  const isLast = lastMove?.from === square || lastMove?.to === square;
                  const legalMove = legalMoves.find(m => m.to === square);
                  const isShattered = matedKingPos === square;
                  const isKingInCheck = game.isCheck() && piece?.type === 'k' && piece?.color === game.turn();

                  return (
                    <div key={square} onClick={() => handleSquareClick(square)} className={`relative flex items-center justify-center cursor-pointer transition-colors duration-200 ${isDark ? currentColors.dark : currentColors.light} ${isSelected ? currentColors.highlight : ''} ${isLast ? currentColors.lastMove : ''} ${isKingInCheck ? 'bg-red-500/40 animate-pulse' : ''}`}>
                      {legalMove && <div className={`absolute w-4 h-4 rounded-full ${legalMove.captured ? 'border-4 border-black/10 w-full h-full' : 'bg-black/10'}`}></div>}
                      {piece && !isShattered && (
                        <span className={`text-4xl md:text-6xl select-none transition-all duration-300 z-10 ${piece.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]' : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'} ${isSelected ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}>
                          {pieceMap[`${piece.color}${piece.type}`]}
                        </span>
                      )}
                      {isShattered && (
                        <div className="relative w-full h-full flex items-center justify-center z-50">
                          <span className={`text-4xl md:text-6xl animate-shatter ${piece?.color === 'w' ? 'text-white' : 'text-slate-900'}`}>
                            {pieceMap[`${piece?.color}${piece?.type}`]}
                          </span>
                          {/* Breaking Particles */}
                          {[...Array(12)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`particle w-2 h-2 rounded-full ${piece?.color === 'w' ? 'bg-white' : 'bg-slate-900'}`} 
                              // Use React.CSSProperties cast to support custom CSS variables (dash-case properties).
                              style={{ 
                                '--tw-translate-x': `${(Math.random() - 0.5) * 150}px`, 
                                '--tw-translate-y': `${(Math.random() - 0.5) * 150}px`,
                                '--tw-rotate': `${Math.random() * 720}deg`,
                                left: '50%',
                                top: '50%'
                              } as React.CSSProperties}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }))}
                
                {isBotThinking && (
                    <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[2px] z-40 flex items-center justify-center">
                        <div className="bg-white/90 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse">
                            <Cpu className="w-5 h-5 text-indigo-600 animate-spin" />
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-900">Bot is thinking...</span>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className={`flex-1 p-5 rounded-[32px] flex items-center gap-4 border transition-all ${game.turn() === 'w' && !gameOver ? 'bg-white border-white shadow-xl scale-105 z-10' : 'bg-white/40 border-white/40 shadow-sm opacity-60'}`}>
            <div className="w-14 h-14 bg-gradient-to-tr from-slate-100 to-white rounded-2xl flex items-center justify-center text-3xl shadow-md border border-slate-200">{player1?.avatar || '👤'}</div>
            <div className="overflow-hidden"><p className="text-[10px] font-black opacity-40 uppercase tracking-widest truncate">{player1?.name || 'White'}</p><p className="font-black text-slate-800 text-lg">White</p></div>
            {game.turn() === 'w' && !gameOver && <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>}
          </div>

          <div className={`flex-1 p-5 rounded-[32px] flex items-center gap-4 border transition-all ${game.turn() === 'b' && !gameOver ? 'bg-slate-900 border-slate-800 shadow-xl scale-105 z-10 text-white' : 'bg-white/40 border-white/40 shadow-sm opacity-60'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${isBotEnabled ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>{isBotEnabled ? '🤖' : (player2?.avatar || '👤')}</div>
            <div className="overflow-hidden"><p className={`text-[10px] font-black opacity-40 uppercase tracking-widest truncate ${game.turn() === 'b' && !gameOver ? 'text-white/60' : ''}`}>{isBotEnabled ? 'Deep Duo AI' : (player2?.name || 'Black')}</p><p className={`font-black text-lg ${game.turn() === 'b' && !gameOver ? 'text-white' : 'text-slate-800'}`}>Black</p></div>
            {game.turn() === 'b' && !gameOver && <div className="ml-auto w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>}
          </div>
        </div>

        {gameOver && (
          <div className="mt-6 p-6 bg-slate-900 text-white rounded-[32px] flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl ring-4 ring-white/20">
            <div className="flex items-center gap-4"><Trophy className="w-8 h-8 text-yellow-400" /><div><p className="text-xs font-black opacity-50 uppercase tracking-widest">Game Over</p><p className="text-xl font-black">{gameOver}</p></div></div>
            <button onClick={resetGame} className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase transition-all hover:scale-105 active:scale-95">New Game</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;