import React from 'react';

export default function GameHUD({ goals, shotCount, gameState, onBack, onOpenSettings }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant/15 shadow-[0_0_15px_rgba(255,246,223,0.1)] transition-all duration-300 ease-in-out pointer-events-auto bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="material-symbols-outlined text-[24px] text-primary cursor-pointer hover:glow-primary transition-all">
            arrow_back
          </button>
          <h1 className="font-display-hero text-headline-md uppercase tracking-tighter text-primary">BITBURGER FREEKICK</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onOpenSettings} className="flex items-center gap-2 group transition-all duration-300">
            <span className="material-symbols-outlined text-[24px] text-primary group-hover:glow-primary">settings</span>
          </button>
        </div>
      </header>

      {/* Simplified HUD: Kicks Count and Goals Count */}
      <div className="absolute top-20 left-margin-mobile md:left-margin-desktop flex gap-4 pointer-events-auto">
        <div className="glass-panel px-6 py-3 rounded-lg flex flex-col">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Penalties</span>
          <span className="font-stat-value text-stat-value text-primary">
            {Math.min(6, shotCount + 1)} <span className="text-[14px] text-on-surface-variant">/ 6</span>
          </span>
        </div>
        <div className="glass-panel px-6 py-3 rounded-lg flex flex-col">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Goals</span>
          <span className="font-stat-value text-stat-value text-primary-container glow-primary">
            {goals} <span className="text-[14px] text-on-surface-variant">/ 6</span>
          </span>
        </div>
      </div>

      {/* Goal UI Card Overlay */}
      {gameState === 'goal' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm z-50 animate-fade-in">
          <div className="text-center transform scale-120 transition-transform duration-[1500ms] ease-out">
            <h1 className="font-display-hero text-[100px] md:text-[140px] text-primary-container drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] italic">GOAL!</h1>
          </div>
        </div>
      )}

      {/* Save UI Card Overlay */}
      {gameState === 'save' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm z-50 animate-fade-in">
          <div className="text-center transform scale-120 transition-transform duration-[1500ms] ease-out">
            <h1 className="font-display-hero text-[100px] md:text-[140px] text-error glow-primary uppercase tracking-widest">SAVED!</h1>
            <p className="font-label-caps text-on-surface-variant tracking-[0.2em] mt-4">GK BLOCKED THE SHOT</p>
          </div>
        </div>
      )}

      {/* Miss UI Card Overlay */}
      {gameState === 'miss' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm z-50 animate-fade-in">
          <div className="text-center transform scale-120 transition-transform duration-[1500ms] ease-out">
            <h1 className="font-display-hero text-[100px] md:text-[140px] text-on-surface-variant/80 uppercase tracking-widest">MISS!</h1>
            <p className="font-label-caps text-on-surface-variant tracking-[0.2em] mt-4">OUT OF BOUNDS</p>
          </div>
        </div>
      )}
    </div>
  );
}
