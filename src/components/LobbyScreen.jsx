import React, { useState } from 'react';

export default function LobbyScreen({ onEnterArena }) {
  const [connecting, setConnecting] = useState(false);

  const handleEnter = () => {
    setConnecting(true);
    setTimeout(() => {
      onEnterArena();
    }, 1500);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant/15 shadow-[0_0_15px_rgba(255,246,223,0.1)] transition-all duration-300 ease-in-out bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="p-2 text-primary hover:glow-primary transition-all duration-300">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-display-hero text-headline-md md:text-headline-md uppercase tracking-tighter text-primary">BITBURGER FREEKICK</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 group transition-all duration-300">
            <span className="material-symbols-outlined text-[24px] text-primary group-hover:glow-primary">settings</span>
          </button>
        </div>
      </header>

      <main className="relative z-20 h-screen flex flex-col items-center justify-center px-margin-mobile">
        <div className="text-center mb-12 animate-fade-in">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.4em] mb-4 block uppercase opacity-80">Season One: The Ascent</span>
          <h2 className="font-display-hero text-[64px] md:text-display-hero text-primary uppercase leading-tight glow-primary">
            GLORY <br/> AWAITS
          </h2>
        </div>

        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          <button 
            onClick={handleEnter}
            disabled={connecting}
            className="group relative w-full h-20 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-none overflow-hidden transition-all duration-500 hover:glow-gold active:scale-95 disabled:opacity-80"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <div className="flex items-center justify-center gap-3">
              {connecting ? (
                <>
                  <span className="tracking-widest uppercase animate-pulse">CONNECTING...</span>
                  <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                </>
              ) : (
                <>
                  <span className="tracking-widest uppercase">ENTER ARENA</span>
                  <span className="material-symbols-outlined text-[24px]">stadium</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 border-t border-white/30 pointer-events-none"></div>
            <div className="absolute inset-0 border-b border-black/20 pointer-events-none"></div>
          </button>


        </div>

        <div className="fixed left-margin-desktop bottom-margin-mobile hidden md:flex flex-col gap-4">
          <div className="flex items-center gap-3 text-on-surface-variant/60 font-label-caps text-[11px]">
            <span className="w-8 h-[1px] bg-outline-variant/40"></span>
            <span>SERVER: EU-WEST-01</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant/60 font-label-caps text-[11px]">
            <span className="w-8 h-[1px] bg-outline-variant/40"></span>
            <span>LATENCY: 14MS</span>
          </div>
        </div>
        <div className="fixed right-margin-desktop bottom-margin-mobile hidden md:flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <span className="font-label-caps text-[11px] text-primary">LIVE TOURNAMENT: THE PLATINUM CUP</span>
            <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#ffd700]"></span>
          </div>
          <p className="font-body-md text-[13px] text-on-surface-variant/40 italic">Final registration closing in 04:12:59</p>
        </div>
      </main>

      <div className="hidden md:flex fixed right-margin-desktop top-1/2 -translate-y-1/2 flex-col gap-8 z-50">
        <div className="group relative cursor-pointer">
          <span className="material-symbols-outlined text-[28px] text-primary hover:glow-primary transition-all">notifications</span>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-container rounded-full ring-2 ring-background"></div>
        </div>
        <span className="material-symbols-outlined text-[28px] text-on-surface-variant hover:text-primary transition-all cursor-pointer">chat_bubble</span>
        <span className="material-symbols-outlined text-[28px] text-on-surface-variant hover:text-primary transition-all cursor-pointer">military_tech</span>
      </div>
    </>
  );
}
