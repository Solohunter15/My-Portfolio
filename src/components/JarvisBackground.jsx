import React, { useEffect, useRef } from 'react';

export default function JarvisBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // ── Size canvas to viewport ──────────────────────────────
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Particle System for Data Mesh ────────────────────────
    const PARTICLE_COUNT = 90;
    const CONNECTION_DIST = 110;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.35 + 0.15,
    }));

    // ── HUD Systems ──────────────────────────────────────────
    // Center coords for HUD modules
    let angleOuter1 = 0;
    let angleInner1 = 0;
    let angleOuter2 = 0;
    let angleSweep = 0;

    // ── Animation Loop ───────────────────────────────────────
    const draw = () => {
      // Clear with very slight fade to leave short trails
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Grid Overlay
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.035)'; // Cyan grid
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      
      // Draw vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Small coordinate markers
        if (x % (gridSize * 4) === 0 && x > 0 && x < width - 100) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.font = '9px monospace';
          ctx.fillText(`LOC.0x${x.toString(16).toUpperCase()}`, x + 5, 15);
        }
      }

      // Draw horizontal grid lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        if (y % (gridSize * 4) === 0 && y > 0 && y < height - 50) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.font = '9px monospace';
          ctx.fillText(`SYS.y${y}`, 5, y - 5);
        }
      }

      // 2. Draw HUD Widget 1 (Top-Right Area)
      const hud1X = width * 0.85;
      const hud1Y = height * 0.25;
      const hudR1 = Math.min(width, height) * 0.15;

      if (hud1X > 200 && hud1Y > 100) {
        ctx.save();
        ctx.translate(hud1X, hud1Y);

        // Rotating outer dashed ring
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, hudR1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([15, 30, 45, 15]);
        ctx.rotate(angleOuter1);
        ctx.beginPath();
        ctx.arc(0, 0, hudR1 + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Reverse rotating tick marks ring
        ctx.rotate(-angleOuter1 * 1.5);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.lineWidth = 1;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (hudR1 - 15), Math.sin(a) * (hudR1 - 15));
          ctx.lineTo(Math.cos(a) * (hudR1 - 5), Math.sin(a) * (hudR1 - 5));
          ctx.stroke();
        }

        // Radar Sweep sweep line
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.07)';
        ctx.lineWidth = 1;
        ctx.rotate(angleSweep);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(hudR1 - 15, 0);
        ctx.stroke();

        // Center crosshair
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.restore();
      }

      // 3. Draw HUD Widget 2 (Bottom-Left Area)
      const hud2X = width * 0.12;
      const hud2Y = height * 0.78;
      const hudR2 = Math.min(width, height) * 0.1;

      if (hud2X > 50 && hud2Y > 100) {
        ctx.save();
        ctx.translate(hud2X, hud2Y);

        // Rotating outer ring with 4 segments
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.09)';
        ctx.lineWidth = 1;
        ctx.setLineDash([Math.PI * hudR2 * 0.4, Math.PI * hudR2 * 0.1]);
        ctx.rotate(-angleOuter2);
        ctx.beginPath();
        ctx.arc(0, 0, hudR2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner solid ring
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, hudR2 - 8, 0, Math.PI * 2);
        ctx.stroke();

        // Telemetry numbers inside
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.font = '8px monospace';
        ctx.fillText("MATRIX.OK", -24, -4);
        ctx.fillText("SYS.ACTIVE", -26, 6);

        ctx.restore();
      }

      // 4. Update and Draw Data Mesh Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      }

      // Draw particle links
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.14;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // 5. HUD Status Feed Overlay (Top Center)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.font = '9px monospace';
      ctx.fillText(`HOLO_SYS_V2.06 // CPU.LOAD: ${(15 + Math.sin(angleOuter1) * 3).toFixed(1)}% // SEC_CON: SECURE`, width / 2 - 170, 18);

      // Increment rotation speeds
      angleOuter1 += 0.002;
      angleInner1 -= 0.003;
      angleOuter2 += 0.004;
      angleSweep += 0.007;

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}
