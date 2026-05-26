import React from 'react';

export default function GameContainer({ children }) {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-background touch-none select-none">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 stadium-vignette z-10"></div>
        <img 
          src="./BG_GAME.jpeg"
          alt="Luxury Stadium at Night"
          className="w-full h-full object-cover animate-subtle-zoom"
        />
      </div>

      {children}
    </div>
  );
}
