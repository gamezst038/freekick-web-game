import { useState } from 'react';
import GameContainer from './components/GameContainer';
import LobbyScreen from './components/LobbyScreen';
import GameHUD from './components/GameHUD';
import GameCanvas from './components/GameCanvas';

function App() {
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'goal', 'save', 'miss', 'results'
  const [shotCount, setShotCount] = useState(0);
  const [goals, setGoals] = useState(0);
  const [history, setHistory] = useState([]); // Array of 'goal', 'save', 'miss'

  const startGame = () => {
    setShotCount(0);
    setGoals(0);
    setHistory([]);
    setGameState('playing');
  };

  const handleShotComplete = (result) => {
    const nextShotCount = shotCount + 1;
    setShotCount(nextShotCount);
    setHistory(prev => [...prev, result]);

    if (result === 'goal') {
      setGoals(prev => prev + 1);
      setGameState('goal');
    } else if (result === 'save') {
      setGameState('save');
    } else {
      setGameState('miss');
    }

    // Delay before transitioning to next shot or results screen
    setTimeout(() => {
      if (nextShotCount >= 6) {
        setGameState('results');
      } else {
        setGameState('playing');
      }
    }, 2000);
  };

  return (
    <GameContainer>
      {gameState === 'lobby' && (
        <LobbyScreen onEnterArena={startGame} />
      )}
      
      {(gameState === 'playing' || gameState === 'goal' || gameState === 'save' || gameState === 'miss') && (
        <div className="absolute inset-0 w-full h-full">
          <GameCanvas onShotComplete={handleShotComplete} />
          <GameHUD 
            goals={goals} 
            shotCount={shotCount} 
            gameState={gameState} 
            onBack={() => setGameState('lobby')} 
          />
        </div>
      )}

      {gameState === 'results' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-6">
          <div className="glass-panel max-w-sm w-full p-8 rounded-2xl border border-primary/20 flex flex-col items-center shadow-[0_0_60px_rgba(255,215,0,0.12)]">
            
            {/* Header */}
            <span className="font-label-caps text-primary/60 text-[10px] tracking-[0.3em] uppercase mb-1">
              MATCH REPORT
            </span>
            <h2 className="font-display-hero text-[32px] font-black text-primary drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-tight uppercase text-center mb-6 leading-none">
              BITBURGER FREEKICK
            </h2>

            {/* Scoreboard Widget */}
            <div className="w-full bg-gradient-to-b from-[#2a2415] to-[#1a160d] border border-primary/10 rounded-xl p-5 mb-6 flex flex-col items-center">
              <span className="font-label-caps text-primary-container text-[11px] tracking-widest uppercase opacity-75 mb-3">
                FINAL RESULT
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-[64px] font-black text-primary-container glow-primary leading-none">
                  {goals}
                </span>
                <span className="text-[28px] text-primary/45 font-bold">/</span>
                <span className="text-[32px] text-primary/60 font-bold">6</span>
              </div>
              <span className="font-label-caps text-on-surface-variant text-[10px] tracking-widest mt-2">
                GOALS CONVERTED
              </span>
            </div>

            {/* Performance Stats Bento */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface-container-high/40 border border-outline-variant/10 rounded-lg p-3 flex flex-col items-center">
                <span className="text-[9px] text-on-surface-variant/75 font-label-caps tracking-widest uppercase">
                  ACCURACY
                </span>
                <span className="text-headline-md text-primary mt-1 font-extrabold">
                  {Math.round((goals / 6) * 100)}%
                </span>
              </div>
              <div className="bg-surface-container-high/40 border border-outline-variant/10 rounded-lg p-3 flex flex-col items-center">
                <span className="text-[9px] text-on-surface-variant/75 font-label-caps tracking-widest uppercase">
                  MISS / SAVED
                </span>
                <span className="text-headline-md text-primary mt-1 font-extrabold">
                  {6 - goals}
                </span>
              </div>
            </div>

            {/* Shot History Grid */}
            <div className="w-full mb-8">
              <p className="font-label-caps text-on-surface-variant/80 text-[10px] tracking-widest mb-3 text-left uppercase">
                SHOT CHRONICLE
              </p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const res = history[idx];
                  return (
                    <div 
                      key={idx}
                      className={`h-12 rounded-lg border flex items-center justify-center transition-all ${
                        res === 'goal' 
                          ? 'bg-primary-container/10 border-primary-container/30 text-primary-container shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                          : res === 'save'
                          ? 'bg-error/5 border-error/20 text-error/60'
                          : res === 'miss'
                          ? 'bg-white/5 border-white/10 text-white/30'
                          : 'bg-surface-container-high/30 border-outline-variant/10 text-on-surface-variant/20'
                      }`}
                    >
                      {res === 'goal' && (
                        <span className="material-symbols-outlined text-[20px] animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>sports_soccer</span>
                      )}
                      {res === 'save' && (
                        <span className="material-symbols-outlined text-[20px]">pan_tool</span>
                      )}
                      {res === 'miss' && (
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      )}
                      {!res && '-'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-2">
              <button 
                onClick={startGame}
                className="w-full py-4 bg-primary-container text-on-primary font-label-caps text-label-caps tracking-widest rounded-full hover:glow-primary hover:scale-[1.01] active:scale-95 transition-all duration-300"
              >
                REPLAY ARENA
              </button>
              <button 
                onClick={() => setGameState('lobby')}
                className="w-full py-4 border border-outline-variant/30 text-primary/80 font-label-caps text-label-caps tracking-widest rounded-full hover:bg-surface-container-high/40 hover:text-primary active:scale-95 transition-all duration-300"
              >
                RETURN TO LOBBY
              </button>
            </div>

          </div>
        </div>
      )}
    </GameContainer>
  );
}

export default App;
