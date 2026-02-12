
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Radio, Music, Waves, X, AlertCircle } from 'lucide-react';
import { RoomTheme } from '../../types';

interface RadioPlayerProps {
  t: any;
  onClose: () => void;
  theme: RoomTheme;
}

const STATIONS = [
  {
    id: 'lofi',
    name: 'Lofi Hip-Hop',
    url: 'https://stream.laut.fm/lofi',
    color: 'bg-purple-500',
    icon: '🎧'
  },
  {
    id: 'chillhop',
    name: 'Chillhop / Jazz',
    url: 'http://streams.fluxfm.de/Chillhop/mp3-128/',
    color: 'bg-amber-500',
    icon: '☕'
  },
  {
    id: 'ambient',
    name: 'Deep Focus / Ambient',
    url: 'https://stream.laut.fm/study',
    color: 'bg-indigo-500',
    icon: '📚'
  }
];

const RadioPlayer: React.FC<RadioPlayerProps> = ({ t, onClose, theme }) => {
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(err => {
        console.error("Audio playback error:", err);
        setIsLoading(false);
      });
    }
  };

  const changeStation = (station: typeof STATIONS[0]) => {
    setCurrentStation(station);
    setIsPlaying(false);
    setIsLoading(false);
    // Audio source will change via audioRef src binding
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-3xl rounded-[50px] p-10 shadow-2xl border border-white/50 relative overflow-hidden">
        {/* Background Aura */}
        <div className={`absolute -top-32 -left-32 w-64 h-64 ${currentStation.color} opacity-10 blur-[100px] transition-all duration-700`}></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentStation.color} text-white shadow-lg shadow-black/10`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">{t.radio}</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Live Streaming</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-2xl transition-all">
            <X className="w-6 h-6 opacity-30" />
          </button>
        </div>

        {/* Player Core */}
        <div className="flex flex-col items-center gap-8 py-4">
          <div className="relative group">
            <div className={`w-48 h-48 rounded-full ${currentStation.color} flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
              <div className="text-7xl group-hover:scale-110 transition-transform duration-500">{currentStation.icon}</div>
              
              {/* Spinning Overlay if playing */}
              {isPlaying && (
                <div className="absolute inset-0 border-[6px] border-white/20 border-t-white rounded-full animate-spin"></div>
              )}
            </div>
            
            {/* Visualizer bars */}
            {isPlaying && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 bg-white rounded-full animate-pulse`} 
                    style={{ 
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.4 + Math.random() * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">{isPlaying ? t.playing : t.paused}</p>
            <h4 className="text-3xl font-black text-slate-800">{currentStation.name}</h4>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transform transition-all active:scale-90 ${isPlaying ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} ${isLoading ? 'opacity-50' : ''}`}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current translate-x-1" />
              )}
            </button>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest px-2">
              <div className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> {t.volume}</div>
              <div>{Math.round(volume * 100)}%</div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* Station Selection */}
        <div className="mt-12 space-y-4">
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] ml-2">{t.stations}</p>
          <div className="grid grid-cols-1 gap-3">
            {STATIONS.map((station) => (
              <button
                key={station.id}
                onClick={() => changeStation(station)}
                className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${currentStation.id === station.id ? 'bg-white border-black/5 shadow-lg' : 'bg-black/5 border-transparent opacity-60 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white shadow-sm`}>
                  {station.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-slate-800">{station.name}</p>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">24/7 Live stream</p>
                </div>
                {currentStation.id === station.id && isPlaying && (
                  <Waves className="w-5 h-5 text-indigo-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        <audio 
          ref={audioRef} 
          src={currentStation.url} 
          onEnded={() => setIsPlaying(false)}
        />

        <div className="mt-6 flex items-start gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <p className="text-[9px] text-amber-700 leading-relaxed font-medium">
            Some browsers may block autoplay. Click play to start the stream. External streams may experience delay.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;
