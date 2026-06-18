import React, { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 1200;
const CONNECTION_DIST = 85;
const MOUSE_REPEL_DIST = 130;
const REPEL_STRENGTH  = 2.8;
const FRICTION = 0.985;

// Color palette: blue, violet, white (rare red)
const PALETTE = [
  { r: 59,  g: 130, b: 246, weight: 0.40 }, // blue
  { r: 139, g: 92,  b: 246, weight: 0.35 }, // violet
  { r: 220, g: 220, b: 255, weight: 0.20 }, // soft white
  { r: 239, g: 68,  b: 68,  weight: 0.05 }, // rare red
];

function pickColor() {
  const rand = Math.random();
  let cum = 0;
  for (const c of PALETTE) {
    cum += c.weight;
    if (rand < cum) return c;
  }
  return PALETTE[0];
}

// ─── AI Particle Universe — Canvas-based neural field ─────────
export default function ParticleUniverse() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let scrollY = 0;
    const mouse = { x: -9999, y: -9999, down: false };

    // ── Size canvas to viewport ──────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Mouse / touch tracking ───────────────────────────────
    const onMouseMove  = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = ()  => { mouse.x = -9999; mouse.y = -9999; };
    const onScroll     = ()  => { scrollY = window.scrollY; };
    window.addEventListener('mousemove',  onMouseMove,  { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll',     onScroll,     { passive: true });

    // ── Create particles ─────────────────────────────────────
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const col = pickColor();
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        ax: 0,
        ay: 0,
        size:    Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.45 + 0.08,
        r: col.r, g: col.g, b: col.b,
      };
    });

    // ── RAF loop ─────────────────────────────────────────────
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scroll drift: gentle upward drift proportional to scroll speed
      const scrollDrift = Math.min(scrollY * 0.0001, 0.04);

      // ── Update + draw particles ──────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        const d  = Math.sqrt(d2);

        if (d < MOUSE_REPEL_DIST && d > 0) {
          const force = (1 - d / MOUSE_REPEL_DIST) * REPEL_STRENGTH;
          p.ax = (dx / d) * force;
          p.ay = (dy / d) * force;
        } else {
          p.ax *= 0.85;
          p.ay *= 0.85;
        }

        p.vx = (p.vx + p.ax * 0.06) * FRICTION;
        p.vy = (p.vy + p.ay * 0.06 - scrollDrift) * FRICTION;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -2)             p.x = canvas.width  + 2;
        if (p.x > canvas.width + 2) p.x = -2;
        if (p.y < -2)             p.y = canvas.height + 2;
        if (p.y > canvas.height + 2) p.y = -2;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        ctx.fill();
      }

      // ── Draw connections (sampled subset for performance) ─
      const step = 3; // check every 3rd particle pair
      for (let i = 0; i < particles.length; i += step) {
        const a = particles[i];
        for (let j = i + step; j < Math.min(i + 18 * step, particles.length); j += step) {
          const b  = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll',     onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    />
  );
}
