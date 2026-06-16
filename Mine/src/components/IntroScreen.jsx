import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ─── Cinematic Loading Intro Sequence ────────────────────────
// Black screen → typewriter lines → iris wipe reveal
export default function IntroScreen({ onComplete, skipIntro = false }) {
  const containerRef = useRef(null);
  const [phase, setPhase]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots]       = useState('');

  useEffect(() => {
    if (skipIntro) { onComplete?.(); return; }

    // Animated ellipsis
    const dotsTimer = setInterval(() =>
      setDots(d => d.length >= 3 ? '' : d + '.'), 400
    );

    const t1 = setTimeout(() => setPhase(1), 600);    // INITIALIZING
    const t2 = setTimeout(() => setPhase(2), 2000);   // LOADING EXPERIENCE
    const t3 = setTimeout(() => setPhase(3), 3200);   // WELCOME
    const t4 = setTimeout(() => {
      clearInterval(dotsTimer);
      // Iris wipe: clip-path contracts to reveal site beneath
      gsap.to(containerRef.current, {
        clipPath: 'circle(0% at 50% 50%)',
        duration: 1.1,
        ease: 'power4.in',
        onComplete,
      });
    }, 4600);

    // Fake progress fill
    let prog = 0;
    const progTimer = setInterval(() => {
      prog += Math.random() * 4 + 0.5;
      if (prog >= 100) { prog = 100; clearInterval(progTimer); }
      setProgress(Math.round(prog));
    }, 35);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      clearTimeout(t3); clearTimeout(t4);
      clearInterval(dotsTimer); clearInterval(progTimer);
    };
  }, [skipIntro, onComplete]);

  if (skipIntro) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-[#020202] flex flex-col items-center justify-center overflow-hidden"
      style={{ clipPath: 'circle(150% at 50% 50%)' }}
    >
      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* Subtle light leak top-right */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8), transparent)' }}
      />

      {/* Content */}
      <div className="text-center space-y-8 px-8 relative z-10">
        {/* Logo mark — fades in first */}
        <div className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-20 h-20 mx-auto rounded-full border border-white/10 flex items-center justify-center mb-6 relative"
            style={{ boxShadow: '0 0 40px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.05)' }}>
            <span className="font-display font-black text-2xl text-white tracking-tight">JM</span>
            {/* Orbit ring */}
            <div className="absolute inset-0 rounded-full border border-brand-blue/20 animate-spin"
              style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Status text */}
        <div className="h-10 flex items-center justify-center">
          <p
            className={`font-mono text-xs tracking-[0.35em] transition-all duration-500 ${
              phase === 3
                ? 'text-white text-base tracking-[0.2em] font-semibold'
                : 'text-brand-blue'
            } ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {phase === 1 && `INITIALIZING${dots}`}
            {phase === 2 && `LOADING EXPERIENCE${dots}`}
            {phase >= 3 && 'WELCOME TO JIBU\'S WORLD'}
          </p>
        </div>

        {/* Progress bar (shown phases 1–2) */}
        <div className={`w-72 mx-auto transition-all duration-500 ${phase >= 1 && phase < 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-[1px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 8px rgba(59,130,246,0.8)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700 text-[10px] font-mono">SYS BOOT</span>
            <span className="text-gray-600 text-[10px] font-mono">{progress}%</span>
          </div>
        </div>

        {/* Welcome display (phase 3) */}
        {phase >= 3 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="font-display font-black text-5xl text-white tracking-[-0.02em]">JIBU MATHEW</p>
            <p className="font-mono text-[10px] text-gray-600 tracking-[0.5em] uppercase">
              The AI Engineer's Digital Universe
            </p>
          </div>
        )}
      </div>

      {/* Bottom credit line */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-[10px] text-gray-800 tracking-[0.4em]">
          EST. 2024 · TRIVANDRUM, INDIA · v2.0.26
        </p>
      </div>

      {/* Corner decorations */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6 opacity-30`}>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-blue" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-brand-blue" />
        </div>
      ))}
    </div>
  );
}
