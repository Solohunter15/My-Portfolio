import React, { useEffect, useState } from 'react';

const CHAPTERS = [
  { id: 'about',       num: '01', title: 'Who Am I',       color: '#3b82f6' },
  { id: 'pillars',     num: '02', title: 'Three Pillars',  color: '#8b5cf6' },
  { id: 'experience',  num: '03', title: 'Growth Journey', color: '#3b82f6' },
  { id: 'events',      num: '04', title: 'World Stage',    color: '#8b5cf6' },
  { id: 'projects',    num: '05', title: 'Projects',       color: '#ef4444' },
  { id: 'connect',     num: '06', title: "Let's Build",    color: '#8b5cf6' },
];

// ─── Chapter Progress Rail ─────────────────────────────────────
// Fixed left-side story navigation with active section tracking
export default function ChapterRail() {
  const [active, setActive] = useState('about');

  useEffect(() => {
    const observers = CHAPTERS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-5 items-start"
      aria-label="Chapter navigation"
    >
      {CHAPTERS.map(({ id, num, title, color }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group flex items-center gap-3 text-left focus:outline-none"
            aria-label={`Chapter ${num}: ${title}`}
          >
            {/* Indicator dot */}
            <div className="relative flex-shrink-0 w-3 h-3 flex items-center justify-center">
              {/* Ping ring (active only) */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: color, opacity: 0.3 }}
                />
              )}
              {/* Dot */}
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width:     isActive ? 10 : 5,
                  height:    isActive ? 10 : 5,
                  background: isActive ? color : 'rgba(255,255,255,0.18)',
                  boxShadow:  isActive ? `0 0 10px ${color}, 0 0 20px ${color}40` : 'none',
                }}
              />
            </div>

            {/* Chapter label — slides out on active / hover */}
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'max-w-[110px] opacity-100'
                  : 'max-w-0 opacity-0 group-hover:max-w-[110px] group-hover:opacity-50'
              }`}
            >
              <p className="text-[9px] font-mono text-gray-600 leading-none mb-0.5">{num}</p>
              <p
                className="text-[11px] font-semibold leading-tight"
                style={{ color: isActive ? color : 'rgba(255,255,255,0.7)' }}
              >
                {title}
              </p>
            </div>
          </button>
        );
      })}

      {/* Connecting line behind dots */}
      <div
        className="absolute left-[5px] top-4 bottom-4 w-[1px] -z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.12), transparent)' }}
      />
    </div>
  );
}
