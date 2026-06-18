import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Briefcase, Terminal, Layers, Award,
  Mail, X, ChevronRight, Sparkles, MapPin, ArrowRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ── Custom SVG Icons ─────────────────────────────────────
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ── Particle Canvas ──────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6
        ? `rgba(122,152,255,`
        : Math.random() > 0.5
          ? `rgba(92,230,163,`
          : `rgba(199,125,255,`,
    }));

    let mouseX = -1000, mouseY = -1000;
    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.8;
          p.vx += (dx / dist) * force * 0.05;
          p.vy += (dy / dist) * force * 0.05;
        }
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx *= 1.5 / speed; p.vy *= 1.5 / speed; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(122,152,255,${(1 - d / 100) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return <canvas ref={canvasRef} className="hero-canvas" style={{ width:"100%", height:"100%" }} />;
}

// ── JARVIS HUD — fixed full-page holographic background ──
const JARVIS_SECTION_COLORS = {
  about:      [122, 152, 255],
  pillars:    [122, 152, 255],
  experience: [122, 152, 255],
  events:     [122, 152, 255],
  projects:   [122, 152, 255],
  connect:    [122, 152, 255],
};

function JarvisHUD() {
  const canvasRef = useRef(null);
  const colorRef  = useRef([122, 152, 255]);
  const targetRef = useRef([122, 152, 255]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const hexPoints = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    };

    const drawHex = (cx, cy, r, alpha) => {
      const pts = hexPoints(cx, cy, r);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      const [R, G, B] = colorRef.current;
      ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    };

    const drawArc = (cx, cy, r, startA, endA, alpha, width = 1) => {
      const [R, G, B] = colorRef.current;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startA, endA);
      ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const drawLine = (x1, y1, x2, y2, alpha) => {
      const [R, G, B] = colorRef.current;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const drawText = (text, x, y, alpha, size = 9) => {
      const [R, G, B] = colorRef.current;
      ctx.font = `700 ${size}px "Inter", monospace`;
      ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
      ctx.fillText(text, x, y);
    };

    const draw = () => {
      t += 0.008;
      const c = colorRef.current;
      const tgt = targetRef.current;
      colorRef.current = c.map((v, i) => v + (tgt[i] - v) * 0.025);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      const CX = W * 0.5, CY = H * 0.5;

      // Hex grid
      const hexR = 38, hexH = hexR * Math.sqrt(3);
      for (let row = -2; row < H / hexH + 2; row++) {
        for (let col = -2; col < W / (hexR * 1.5) + 2; col++) {
          const cx = col * hexR * 3 + (row % 2 ? hexR * 1.5 : 0);
          const cy = row * hexH * 0.5;
          const distFromCenter = Math.sqrt((cx - CX) ** 2 + (cy - CY) ** 2);
          const alpha = Math.max(0, 0.22 - distFromCenter / (W * 1.2)) *
            (1 + 0.4 * Math.sin(t * 0.7 + col * 0.3 + row * 0.4));
          if (alpha > 0.002) drawHex(cx, cy, hexR - 2, alpha);
        }
      }

      // Orbital rings
      const rings = [
        { r: 260, speed: 0.18, dashLen: 0.55, alpha: 0.55 },
        { r: 340, speed: -0.12, dashLen: 0.35, alpha: 0.42 },
        { r: 430, speed: 0.08,  dashLen: 0.7,  alpha: 0.30 },
        { r: 140, speed: -0.28, dashLen: 0.8,  alpha: 0.60 },
        { r: 80,  speed: 0.45,  dashLen: 0.5,  alpha: 0.70 },
      ];
      rings.forEach(({ r, speed, dashLen, alpha }) => {
        const start = t * speed;
        const end   = start + Math.PI * 2 * dashLen;
        drawArc(CX, CY, r, start, end, alpha, 1.2);
        for (let i = 0; i < 8; i++) {
          const a = start + (Math.PI * 2 / 8) * i;
          const x1 = CX + Math.cos(a) * (r - 6);
          const y1 = CY + Math.sin(a) * (r - 6);
          const x2 = CX + Math.cos(a) * (r + 6);
          const y2 = CY + Math.sin(a) * (r + 6);
          drawLine(x1, y1, x2, y2, alpha * 1.5);
        }
      });

      // Corner brackets
      const brackets = [
        [60, 60, 1, 1], [W - 60, 60, -1, 1],
        [60, H - 60, 1, -1], [W - 60, H - 60, -1, -1],
      ];
      brackets.forEach(([x, y, sx, sy]) => {
        const sz = 28;
        const [R, G, B] = colorRef.current;
        ctx.strokeStyle = `rgba(${R},${G},${B},0.55)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + sy * sz); ctx.lineTo(x, y); ctx.lineTo(x + sx * sz, y);
        ctx.stroke();
      });

      // Scan line
      const scanY = CY + Math.sin(t * 0.5) * H * 0.42;
      const [R, G, B] = colorRef.current;
      const scanGrad = ctx.createLinearGradient(0, 0, W, 0);
      scanGrad.addColorStop(0,   `rgba(${R},${G},${B},0)`);
      scanGrad.addColorStop(0.2, `rgba(${R},${G},${B},0.16)`);
      scanGrad.addColorStop(0.5, `rgba(${R},${G},${B},0.32)`);
      scanGrad.addColorStop(0.8, `rgba(${R},${G},${B},0.16)`);
      scanGrad.addColorStop(1,   `rgba(${R},${G},${B},0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 0.5, W, 1);

      // Bottom-left data panel
      const dataLines = [
        ["SYS.STATUS",  "ONLINE"],
        ["NEURAL.LINK", `${(98 + Math.sin(t * 3) * 1.5).toFixed(1)}%`],
        ["THREAT.LVL",  "NONE"],
        ["UPTIME",      `${Math.floor((t / 0.008) / 60)}m ${Math.floor((t / 0.008) % 60)}s`],
      ];
      dataLines.forEach(([label, val], i) => {
        const x = 56, y = H - 170 + i * 22;
        drawText(label, x, y, 0.65, 8);
        ctx.textAlign = "right";
        drawText(val, x + 130, y, 0.88, 8);
        ctx.textAlign = "left";
        drawLine(x, y + 4, x + 130, y + 4, 0.35);
      });

      // Top-right panel
      const topData = [
        ["J.A.R.V.I.S", "v4.1"],
        ["MODE",        "ACTIVE"],
        ["CORE.TEMP",   `${(47 + Math.sin(t * 2) * 2).toFixed(1)}°C`],
      ];
      topData.forEach(([label, val], i) => {
        const x = W - 186, y = 68 + i * 22;
        drawText(label, x, y, 0.65, 8);
        ctx.textAlign = "right";
        drawText(val, x + 130, y, 0.88, 8);
        ctx.textAlign = "left";
        drawLine(x, y + 4, x + 130, y + 4, 0.35);
      });

      // Crosshair
      const chSize = 18;
      drawLine(CX - chSize, CY, CX + chSize, CY, 0.6);
      drawLine(CX, CY - chSize, CX, CY + chSize, 0.6);
      drawArc(CX, CY, 6, 0, Math.PI * 2, 0.65, 0.8);
      drawArc(CX, CY, 12, t, t + Math.PI * 0.5, 0.85, 1);
      drawArc(CX, CY, 12, t + Math.PI, t + Math.PI * 1.5, 0.85, 1);

      // Side arcs
      drawArc(80,  H * 0.5, 120, -Math.PI * 0.4, Math.PI * 0.4, 0.40, 0.8);
      drawArc(W - 80, H * 0.5, 120, Math.PI * 0.6, Math.PI * 1.4, 0.40, 0.8);

      // Orbiting dots with trails
      [[260, 0.18, 4, 0.6], [140, -0.4, 3, 0.7], [80, 0.9, 2.5, 0.8]].forEach(([r, spd, sz, a]) => {
        const ax = CX + Math.cos(t * spd) * r;
        const ay = CY + Math.sin(t * spd) * r;
        ctx.beginPath();
        ctx.arc(ax, ay, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${a})`;
        ctx.fill();
        for (let tr = 1; tr <= 6; tr++) {
          const ta = t * spd - tr * 0.06;
          const tx = CX + Math.cos(ta) * r;
          const ty = CY + Math.sin(ta) * r;
          ctx.beginPath();
          ctx.arc(tx, ty, sz * (1 - tr * 0.14), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},${a * (1 - tr * 0.15)})`;
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="jarvis-canvas" />;
}

// ── Counter ──────────────────────────────────────────────
function Counter({ end, suffix = "", label }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        const duration = 1600;
        const startTime = performance.now();
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          setVal(Math.round(easeOut(t) * end));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="hero-stat">
      <div className="hero-stat-num">{val}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

// ── Magnetic Button ──────────────────────────────────────
function MagneticWrap({ children, strength = 0.35 }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
    el.style.transform = "translate(0,0)";
    setTimeout(() => { if (el) el.style.transition = ""; }, 600);
  }, []);
  return (
    <div ref={ref} className="magnetic-wrap" onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

// ── Split Text Char-by-Char ──────────────────────────────
function SplitText({ text, className, delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ display:"inline-block", animation:`charReveal 0.6s ${delay + i * 0.04}s both cubic-bezier(0.16,1,0.3,1)` }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

// ── Radar SVG Chart ──────────────────────────────────────
function RadarChart({ values, color }) {
  const N = values.length;
  const R = 50;
  const CX = 60, CY = 60;
  const rings = [0.25, 0.5, 0.75, 1.0];
  const angleStep = (Math.PI * 2) / N;
  const getPoint = (i, frac) => [
    CX + R * frac * Math.cos(angleStep * i - Math.PI / 2),
    CY + R * frac * Math.sin(angleStep * i - Math.PI / 2),
  ];
  const fillPoints = values.map((v, i) => getPoint(i, v / 100)).map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 120 120" className="radar-svg">
      {rings.map(r => (
        <polygon key={r} className="radar-ring"
          points={Array.from({ length: N }, (_, i) => getPoint(i, r).join(",")).join(" ")} />
      ))}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = getPoint(i, 1);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke={color} strokeOpacity="0.15" strokeWidth="0.5" />;
      })}
      <polygon className="radar-fill" points={fillPoints} style={{ "--card-color-raw": color }} />
      {values.map((v, i) => {
        const [x, y] = getPoint(i, v / 100);
        return <circle key={i} className="radar-dot" cx={x} cy={y} r="2.5" style={{ "--card-color-raw": color }} />;
      })}
    </svg>
  );
}

// ── Expertise Card ───────────────────────────────────────
function ExpertiseCard({ data, index }) {
  const cardRef = useRef(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add("in-view"), index * 120);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const cardStyle = {
    "--card-color-raw": data.color,
    "--card-color": `${data.color}55`,
    "--card-gradient": data.gradient,
    "--card-gradient-line": data.gradLine,
  };

  return (
    <div className="expertise-card reveal" ref={cardRef}
      style={{ ...cardStyle, transitionDelay: `${index * 0.12}s` }} data-hover>
      <div className="expertise-card-accent" />
      <div className="expertise-card-header">
        <div className="expertise-card-num">0{index + 1}</div>
        <div className="expertise-card-icon">{data.icon}</div>
        <div className="expertise-card-title">{data.title}</div>
        <div className="expertise-card-sub">{data.subtitle}</div>
      </div>
      <div className="expertise-radar">
        <RadarChart values={data.radar} color={data.color} />
      </div>
      <div className="expertise-skills">
        {data.skills.map((sk) => (
          <div key={sk.name} className="skill-row">
            <div className="skill-row-top">
              <span className="skill-name">{sk.name}</span>
              <span className="skill-pct">{sk.pct}%</span>
            </div>
            <div className="skill-bar-track">
              <div className="skill-bar-fill" style={{ width: `${sk.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="expertise-points">
        {data.points.map((pt, i) => (
          <div key={i} className="expertise-point">
            <div className="expertise-point-dot" />
            <span>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GrowthRadarChart ─────────────────────────────────────
function GrowthRadarChart({ stats }) {
  const N = 5;
  const R = 72;
  const CX = 100, CY = 100;
  const axes = ["Tech/Data", "Leadership", "Biz Strategy", "Outreach", "Operations"];
  const angleStep = (Math.PI * 2) / N;

  const getPoint = (i, val) => {
    const angle = angleStep * i - Math.PI / 2;
    const dist = (val / 100) * R;
    return [
      CX + dist * Math.cos(angle),
      CY + dist * Math.sin(angle)
    ];
  };

  const pointsStr = stats.map((v, i) => getPoint(i, v).join(",")).join(" ");

  return (
    <div className="growth-radar-container">
      <svg viewBox="0 0 200 200" className="growth-radar-svg">
        {/* Radar background grids */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
          const gridPoints = Array.from({ length: N }, (_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const dist = R * scale;
            return [CX + dist * Math.cos(angle), CY + dist * Math.sin(angle)].join(",");
          }).join(" ");
          return (
            <polygon
              key={sIdx}
              points={gridPoints}
              fill="none"
              stroke="rgba(122, 152, 255, 0.15)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Axes lines */}
        {Array.from({ length: N }).map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const x2 = CX + R * Math.cos(angle);
          const y2 = CY + R * Math.sin(angle);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x2}
              y2={y2}
              stroke="rgba(122, 152, 255, 0.25)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={pointsStr}
          fill="rgba(122, 152, 255, 0.15)"
          stroke="#7a98ff"
          strokeWidth="1.5"
          className="radar-poly-morph"
          style={{ filter: "drop-shadow(0 0 8px rgba(122, 152, 255, 0.6))" }}
        />

        {/* Data dots */}
        {stats.map((v, i) => {
          const [x, y] = getPoint(i, v);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#7a98ff"
              stroke="#fff"
              strokeWidth="0.8"
              style={{ filter: "drop-shadow(0 0 4px rgba(122, 152, 255, 0.9))" }}
            />
          );
        })}

        {/* Radar Sweep Scanner */}
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - R}
          stroke="rgba(92, 230, 163, 0.55)"
          strokeWidth="1.5"
          className="radar-sweep-line"
        />
        {/* Concentric scanline rings */}
        <circle cx={CX} cy={CY} r={R * 0.4} fill="none" stroke="rgba(122, 152, 255, 0.08)" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r={R * 0.75} fill="none" stroke="rgba(122, 152, 255, 0.08)" strokeWidth="0.5" />
        {/* Sonar sweep target pulse */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(122, 152, 255, 0.12)" strokeWidth="1" strokeDasharray="4 4" className="radar-sonar-pulse" />

        {/* Axis labels */}
        {axes.map((label, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lx = CX + (R + 18) * Math.cos(angle);
          const ly = CY + (R + 10) * Math.sin(angle);
          let textAnchor = "middle";
          if (Math.cos(angle) > 0.1) textAnchor = "start";
          else if (Math.cos(angle) < -0.1) textAnchor = "end";

          return (
            <text
              key={i}
              x={lx}
              y={ly + 3}
              textAnchor={textAnchor}
              fill="rgba(240, 237, 230, 0.65)"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.05em"
              fontFamily="var(--font-display)"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── DecryptedLogLine ─────────────────────────────────────
function DecryptedLogLine({ text, delay = 0, isLong = false }) {
  const [displayText, setDisplayText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*()_+{}[]";

  useEffect(() => {
    let active = true;
    let timeoutId;
    let intervalId;

    timeoutId = setTimeout(() => {
      const targetText = text;
      let iterations = 0;
      const speed = isLong ? 2 : 4;
      
      intervalId = setInterval(() => {
        if (!active) return;
        
        setDisplayText((prev) => {
          return targetText
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iterations) {
                return targetText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        });

        if (iterations >= targetText.length) {
          clearInterval(intervalId);
          setDisplayText(targetText);
        }
        iterations += speed;
      }, 30);
    }, delay);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, delay, isLong]);

  return <span>{displayText}</span>;
}

// ── DecryptedTerminal ────────────────────────────────────
function DecryptedTerminal({ activeItem }) {
  return (
    <div className="decrypted-terminal vessel-glow">
      <div className="vessel-corner vessel-corner-tl"></div>
      <div className="vessel-corner vessel-corner-tr"></div>
      <div className="vessel-corner vessel-corner-bl"></div>
      <div className="vessel-corner vessel-corner-br"></div>
      <div className="terminal-header">
        <span className="terminal-dot red"></span>
        <span className="terminal-dot yellow"></span>
        <span className="terminal-dot green"></span>
        <span className="terminal-title">JOURNEY_DECRYPTION_UNIT.EXE</span>
      </div>
      <div className="terminal-body">
        <div className="terminal-line">
          <span className="term-lbl">SECURE.INDEX //</span> 
          <span className="term-val text-green">SYS_ACTIVE_NODE</span>
        </div>
        <div className="terminal-line">
          <span className="term-lbl">TIMELINE.PERIOD //</span> 
          <span className="term-val"><DecryptedLogLine text={activeItem.period} delay={100} /></span>
        </div>
        <div className="terminal-line">
          <span className="term-lbl">NODE.ROLE //</span> 
          <span className="term-val role-highlight"><DecryptedLogLine text={activeItem.role} delay={200} /></span>
        </div>
        <div className="terminal-line">
          <span className="term-lbl">NODE.COMPANY //</span> 
          <span className="term-val"><DecryptedLogLine text={activeItem.company} delay={300} /></span>
        </div>
        <div className="terminal-line">
          <span className="term-lbl">NODE.TYPE //</span> 
          <span className="term-val text-rose"><DecryptedLogLine text={activeItem.type} delay={400} /></span>
        </div>
        <div className="terminal-line desc-line">
          <p className="term-desc">
            <DecryptedLogLine text={activeItem.description} delay={500} isLong={true} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ── TimeVectorRail ───────────────────────────────────────
function TimeVectorRail({ items, activeIndex, setActiveIndex }) {
  const containerRef = useRef(null);
  const activeX = 40 + (activeIndex / (items.length - 1)) * 920;

  return (
    <div className="time-vector-rail-container" ref={containerRef}>
      <div className="rail-decorations">
        <div className="decor-grid-pattern"></div>
        <div className="decor-grid-scan"></div>
      </div>
      <div className="rail-track-wrapper">
        {/* Futuristic SVG vector network track line */}
        <svg className="rail-vector-svg" viewBox="0 0 1000 80" preserveAspectRatio="none">
          {/* Outer glowing path */}
          <path d="M 40,40 L 960,40" stroke="rgba(122, 152, 255, 0.08)" strokeWidth="8" strokeLinecap="round" />
          {/* Inner vector pathway line */}
          <path d="M 40,40 L 960,40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" strokeLinecap="round" />
          {/* Tech dashed outline path */}
          <path d="M 40,40 L 960,40" stroke="rgba(122, 152, 255, 0.2)" strokeWidth="1" strokeDasharray="5 5" strokeLinecap="round" />
          
          {/* Engineering Scale Sub-ticks */}
          {Array.from({ length: 41 }).map((_, i) => {
            const tx = 40 + (i / 40) * 920;
            const isMilestone = i % 5 === 0;
            const h = isMilestone ? 10 : 5;
            return (
              <line
                key={i}
                x1={tx}
                y1={40 - h / 2}
                x2={tx}
                y2={40 + h / 2}
                stroke={isMilestone ? "rgba(122, 152, 255, 0.4)" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={isMilestone ? 1.2 : 0.8}
              />
            );
          })}
          
          {/* Live glowing laser progress trace line */}
          <path 
            d={`M 40,40 L ${activeX},40`} 
            stroke="url(#rail-gradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            className="rail-progress-path"
          />
          
          {/* Glowing laser progress bead */}
          <g style={{ transform: `translateX(${activeX}px)`, transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <circle cx="0" cy="40" r="10" fill="none" stroke="#7a98ff" strokeWidth="1" strokeDasharray="3 3" className="rail-laser-reticle" />
            <circle cx="0" cy="40" r="5" fill="rgba(122, 152, 255, 0.4)" filter="blur(2px)" />
            <circle cx="0" cy="40" r="2.5" fill="#fff" />
            <line x1="-12" y1="40" x2="12" y2="40" stroke="#7a98ff" strokeWidth="0.8" />
            <line x1="0" y1="28" x2="0" y2="52" stroke="#7a98ff" strokeWidth="0.8" />
          </g>

          {/* Gradients definitions */}
          <defs>
            <linearGradient id="rail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5ce6a3" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#7a98ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c77dff" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        <div className="rail-nodes">
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;
            const xPercent = (idx / (items.length - 1)) * 100;
            return (
              <div 
                key={idx} 
                className={`rail-node-wrap ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveIndex(idx)}
                style={{ left: `${xPercent}%` }}
              >
                <div className="rail-node-inner">
                  {/* Glowing Hexagon Milestone Node */}
                  <div className="rail-hex">
                    <svg viewBox="0 0 100 100" className="rail-hex-svg">
                      <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
                    </svg>
                    <span className="rail-index">{idx + 1}</span>
                  </div>
                  {/* Telemetry node active scanning aura */}
                  {isActive && <div className="rail-active-pulse"></div>}
                  <div className="rail-meta">
                    <div className="rail-period">{item.period}</div>
                    <div className="rail-company">{item.company.replace("™🔺", "").replace("™", "")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────
const pillars = {
  analyst: {
    title: "The Analyst",
    subtitle: "Data Science & ML",
    icon: <Terminal className="w-5 h-5" />,
    color: "#5ce6a3",
    gradient: "linear-gradient(135deg,rgba(92,230,163,0.08),transparent)",
    gradLine: "linear-gradient(90deg,#5ce6a3,#7a98ff)",
    tagline: "Uncovering insights and building intelligent models.",
    img: "/jibu_1.jpg",
    skills: [
      { name: "Python",          pct: 88 },
      { name: "SQL",             pct: 82 },
      { name: "Machine Learning",pct: 74 },
      { name: "Power BI",        pct: 78 },
      { name: "Pandas / NumPy",  pct: 85 },
    ],
    radar: [88, 82, 74, 78, 85],
    points: [
      "Data Analyst Intern @ Bluestock™🔺 — SQL schema audits & BI dashboards.",
      "Kaggle Community Member (Regular Badge) — dataset & notebook competitions.",
      "Exploring Gemini / Gemma 4 workflows & prompt context engineering.",
      "Python data pipelines: Pandas, NumPy, Matplotlib, Scikit-learn.",
    ],
  },
  orchestrator: {
    title: "The Orchestrator",
    subtitle: "Project Management",
    icon: <Briefcase className="w-5 h-5" />,
    color: "#7a98ff",
    gradient: "linear-gradient(135deg,rgba(122,152,255,0.08),transparent)",
    gradLine: "linear-gradient(90deg,#7a98ff,#c77dff)",
    tagline: "Directing complex operations and collaborative projects.",
    img: "/jibu_2.jpg",
    skills: [
      { name: "Team Leadership",    pct: 90 },
      { name: "Agile / Scrum",      pct: 80 },
      { name: "Event Coordination", pct: 92 },
      { name: "Cross-func Sprints", pct: 76 },
      { name: "Stakeholder Mgmt",   pct: 84 },
    ],
    radar: [90, 80, 92, 76, 84],
    points: [
      "PM @ AI+Compassion Global Forum — promoted to global role from India lead.",
      "Campus PM IG Lead @ MuLearnSTI — agile frameworks, sprint coaching.",
      "NSS Campus Coordinator — 300+ volunteers, Thudakam'26 operations.",
      "Cross-functional team direction across tech, marketing, and community.",
    ],
  },
  strategist: {
    title: "The Strategist",
    subtitle: "Business Growth",
    icon: <Layers className="w-5 h-5" />,
    color: "#e8b96a",
    gradient: "linear-gradient(135deg,rgba(232,185,106,0.08),transparent)",
    gradLine: "linear-gradient(90deg,#e8b96a,#f07a8a)",
    tagline: "Connecting engineering capabilities with business strategy.",
    img: "/jibu_4.jpg",
    skills: [
      { name: "Marketing Strategy", pct: 85 },
      { name: "Lead Generation",    pct: 80 },
      { name: "Product Positioning",pct: 78 },
      { name: "Community Building", pct: 88 },
      { name: "Investor Pitching",  pct: 72 },
    ],
    radar: [85, 80, 78, 88, 72],
    points: [
      "CMO @ Curionative — product launch campaigns & Gemma 4 outreach.",
      "BDev Intern @ Ilmora AI Solutions — lead gen & client acquisition.",
      "The Purple Movement — innovation ecosystem & UI/UX workshop lead.",
      "Pitches UniConnect Kerala to industry executives and investors.",
    ],
  },
};

const experience = [
  { role: "Execom Member", company: "MuLearnSTI", period: "Aug 2024", type: "Founding Chapter", description: "Founding member. Organizes hackathons, technical seminars, and corporate mentoring with GTech." },
  { role: "Core Movement Member", company: "The Purple Movement", period: "Jun 2025", type: "Ecosystem", description: "Contributing to ecosystem building, UI/UX workshops, and pitching student tech prototypes to industry stakeholders." },
  { role: "NRPF NSS Campus Coordinator", company: "National Service Scheme", period: "Oct 2025", type: "Social Service", description: "Coordinating campus volunteer operations for 300+ students during Thudakam'26." },
  { role: "Project Manager", company: "AI+Compassion Global Forum", period: "Oct 2025", type: "Global Volunteer", description: "Directing international technical and coordination teams. Promoted from Regional Coordinator – India to global PM." },
  { role: "Business Development Intern", company: "Ilmora AI Solutions", period: "Jan–Feb 2026", type: "Remote | Internship", description: "Acquired hands-on experience in lead generation, client outreach, and professional networking." },
  { role: "Chief Marketing Officer", company: "Curionative", period: "Jan 2026", type: "Executive Role", description: "Steering regional outreach and market positioning. Led Build with AI Gemma 4 promotions, driving community engagement." },
  { role: "Campus PM IG Lead", company: "MuLearnSTI", period: "Mar 2026", type: "College Chapter", description: "Mentoring peer groups on agile framework execution, tracking deliverables, and coordinating student technical sprints." },
  { role: "Data Analyst Intern", company: "Bluestock™🔺", period: "May 2026", type: "Remote | Internship", description: "Analyzing remote financial data pipelines, auditing database schemas with SQL, and building BI reports using Python, Pandas, and Excel." },
];

const events = [
  { id: "vortex", title: "Vortex Tech Fest", role: "Program Coordinator", category: "organized", subtitle: "2-Day Flagship Event by Dzypher", description: "Led the organizational committee from ideation to final execution. Vortex brought together 500+ participants across code sprints, web design hackathons, and technology debates.", stats: "500+ Attendees · 2 Days · 6 Core Sprints", image: "/vortex_showcase.png" },
  { id: "gemma4", title: "Build with AI: Gemma 4", role: "Organiser & Delegate", category: "organized", subtitle: "Google for Developers & MuLearn", description: "Co-organized and represented Curionative as a delegate at the Gemma 4 launch event at Technopark Trivandrum. Spearheaded a recurring monthly developer cohort.", stats: "Technopark Trivandrum · Monthly Cohort Formed", image: "/gemma4_showcase.png" },
  { id: "olympus", title: "Olympus (GTech)", role: "Core Volunteer & Delegate", category: "attended", subtitle: "Olympus: The HR Icon Event", description: "Volunteered at the HR Olympus event at ICFOSS. Explored how product companies hire and interacted with HR experts to reverse-engineer recruitment workflows.", stats: "GTech Initiative · HR & Hiring Workflows", image: "/olympus_showcase.png" },
  { id: "indiafoss", title: "India FOSS 2025", role: "Stall Volunteer & Delegate", category: "attended", subtitle: "Open Source National Conference", description: "Represented the MuLearn Foundation. Networked with Chad Whitacre (Sentry) and Kailash Nadh (CTO of Zerodha) to study the gift economy of collaborative software.", stats: "FOSS United · Bangalore Stall Lead", image: "/indiafoss_showcase.png" },
];

const certificates = [
  { title: "Purple Movement Certificate", issuer: "Purple Movement Core Team", desc: "Awarded for active leadership, community building, and creative contributions to regional innovation projects." },
  { title: "GitHub Workflow Mastery", issuer: "Unstop", desc: "Certified in advanced git operations, CI workflows, pull request audits, and branch strategies." },
  { title: "Kaggle Community Member Regular", issuer: "Kaggle", desc: "Earned for regular community contributions, dataset analysis, and competitive notebooks." },
  { title: "Internship Common Aptitude Test", issuer: "National Assessment Standards", desc: "Scored high percentiles in analytical logic, mathematical problem solving, and strategic triage." },
];

const tickerItems = [
  "Data Analyst @ Bluestock™🔺", "CMO @ Curionative", "PM @ AI+Compassion",
  "7+ Major Events", "300+ NSS Volunteers", "MuLearn IG Lead",
  "Kaggle Community Member", "India FOSS Delegate", "Build with AI: Gemma 4",
];

// ── Inject global @keyframes for SplitText ───────────────
const splitTextStyle = `
@keyframes charReveal {
  from { opacity: 0; transform: translateY(20px) rotateX(-40deg); }
  to   { opacity: 1; transform: translateY(0)    rotateX(0deg); }
}
`;

// ── Cursor color palette per section ────────────────────
const SECTION_COLORS = {
  about:      "#7a98ff",
  pillars:    "#5ce6a3",
  experience: "#e8b96a",
  events:     "#f07a8a",
  projects:   "#c77dff",
  connect:    "#7a98ff",
};

// ── Main App ─────────────────────────────────────────────
export default function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");
  const [scrollPct, setScrollPct] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const [loaderWord, setLoaderWord] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  const [activePillar, setActivePillar] = useState("analyst");
  const [pillarSelected, setPillarSelected] = useState(false);
  const [activeExpIdx, setActiveExpIdx] = useState(0);

  // Cursor refs
  const cursorBlob  = useRef(null);
  const cursorRing  = useRef(null);
  const cursorLabel = useRef(null);
  const trailRefs   = useRef([]);

  const loaderRef      = useRef(null);
  const heroPhotoRef   = useRef(null);

  const words = ["think.", "build.", "lead."];

  // Inject charReveal keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = splitTextStyle;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Loader sequence
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const loaderEl = loaderRef.current;
    if (loaderEl) loaderEl.classList.add("active");

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < words.length) setLoaderWord(idx);
      else {
        clearInterval(interval);
        setTimeout(() => {
          if (loaderEl) {
            gsap.to(loaderEl, {
              opacity: 0, y: -30, duration: 0.8, ease: "power3.in",
              onComplete: () => {
                setLoaderDone(true);
                document.body.style.overflow = "";
              }
            });
          }
        }, 700);
      }
    }, 680);
    return () => clearInterval(interval);
  }, []);

  // Hero reveal after loader
  useEffect(() => {
    if (!loaderDone) return;
    const targets = document.querySelectorAll(".hero-tagline, .hero-name-line, .hero-roles, .hero-ctas, .hero-stats");
    targets.forEach(el => el.classList.add("in"));
  }, [loaderDone]);

  // Scroll progress + nav
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setScrollPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      setNavScrolled(el.scrollTop > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax hero photo on scroll
  useEffect(() => {
    if (!loaderDone) return;
    const onScroll = () => {
      const img = heroPhotoRef.current?.querySelector("img");
      if (!img) return;
      img.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loaderDone]);

  // ── Cursor: velocity blob + comet trail + label ──────────
  useEffect(() => {
    const blob  = cursorBlob.current;
    const ring  = cursorRing.current;
    const label = cursorLabel.current;
    const trails = trailRefs.current;
    if (!blob || !ring) return;

    const TRAIL = 10;
    const history = Array(TRAIL).fill({ x: 0, y: 0 });
    let mouseX = 0, mouseY = 0, prevX = 0, prevY = 0;
    let ringX = 0, ringY = 0, labelX = 0, labelY = 0;
    let animId;

    document.documentElement.style.setProperty("--cursor-color", "#7a98ff");

    const onMove = (e) => {
      prevX = mouseX; prevY = mouseY;
      mouseX = e.clientX; mouseY = e.clientY;
      const vx = mouseX - prevX, vy = mouseY - prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * 180 / Math.PI;
      const stretch = Math.min(speed * 0.06, 0.55);
      gsap.to(blob, { x: mouseX, y: mouseY, rotation: angle, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.4, duration: 0.06, ease: "none" });
      gsap.to(blob, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1,0.4)", delay: 0.06 });
      history.unshift({ x: mouseX, y: mouseY });
      history.length = TRAIL;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      gsap.set(ring, { x: ringX, y: ringY });
      labelX += (mouseX - labelX) * 0.08;
      labelY += (mouseY - labelY) * 0.08;
      gsap.set(label, { x: labelX, y: labelY + 38 });
      trails.forEach((dot, i) => {
        if (!dot) return;
        const pos = history[i] || { x: mouseX, y: mouseY };
        const size = Math.max(1, 7 - i * 0.65);
        gsap.set(dot, { x: pos.x, y: pos.y, width: size, height: size, opacity: Math.max(0, 0.55 - i * 0.055) });
      });
      animId = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    animId = requestAnimationFrame(animate);

    const hoverableMap = new WeakMap();
    const bindHovers = () => {
      document.querySelectorAll("a, button, [data-hover], .event-card, .project-card, .cred-card, .expertise-card").forEach((el) => {
        if (hoverableMap.has(el)) return;
        const labelText = el.dataset.cursorLabel
          || (el.classList.contains("event-card") ? "VIEW →" : null)
          || (el.classList.contains("project-card") ? "VIEW →" : null)
          || (el.classList.contains("expertise-card") ? "EXPLORE" : null)
          || (el.classList.contains("btn-primary") ? "GO →" : null)
          || (el.classList.contains("btn-ghost") ? "CONNECT" : null)
          || (el.classList.contains("form-submit") ? "SEND" : null)
          || (el.classList.contains("social-btn") ? "VISIT" : null)
          || null;
        const enter = () => {
          ring.classList.add("hovered");
          if (labelText && label) { label.textContent = labelText; label.classList.add("visible"); }
        };
        const leave = () => {
          ring.classList.remove("hovered");
          if (label) label.classList.remove("visible");
        };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        hoverableMap.set(el, { enter, leave });
      });
    };
    bindHovers();
    const observer = new MutationObserver(bindHovers);
    observer.observe(document.body, { childList: true, subtree: true });

    const onClick = () => {
      ring.classList.add("clicking");
      gsap.to(blob, { scale: 1.6, duration: 0.12, ease: "power2.out",
        onComplete: () => gsap.to(blob, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.4)" }) });
      setTimeout(() => ring.classList.remove("clicking"), 200);
    };
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onClick);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [loaderDone]);

  // Intersection observer for reveals
  useEffect(() => {
    if (!loaderDone) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loaderDone]);

  // Timeline items observer
  useEffect(() => {
    if (!loaderDone) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) { setTimeout(() => e.target.classList.add("in"), i * 90); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".timeline-item").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loaderDone]);

  // GSAP smooth scroll
  useEffect(() => {
    if (!loaderDone) return;
    const lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    return () => { lenis.destroy(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [loaderDone]);

  // GSAP card animations
  useEffect(() => {
    if (!loaderDone) return;
    gsap.fromTo(".event-card",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".events-grid", start: "top 80%", toggleActions: "play none none reverse" } }
    );
    gsap.fromTo(".cred-card",
      { opacity: 0, y: 30, rotateX: 10 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".creds-grid", start: "top 80%", toggleActions: "play none none reverse" } }
    );
    gsap.fromTo(".project-card",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".projects-grid", start: "top 80%", toggleActions: "play none none reverse" } }
    );
  }, [loaderDone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("sent");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 3500);
    }, 1400);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* ── Custom Cursor ────────────────────────────────── */}
      <div ref={cursorBlob} className="cursor-blob" />
      <div ref={cursorRing} className="cursor-ring" />
      <div ref={cursorLabel} className="cursor-label" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="cursor-trail-dot"
          ref={el => trailRefs.current[i] = el}
          style={{ width: Math.max(1, 7 - i * 0.65), height: Math.max(1, 7 - i * 0.65) }} />
      ))}

      {/* Scroll progress */}
      <div className="scroll-bar" style={{ width: `${scrollPct}%` }} />

      {/* Background orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* JARVIS HUD */}
      <JarvisHUD />

      {/* ── Loader ───────────────────────────────────────── */}
      {!loaderDone && (
        <div ref={loaderRef} className="loader">
          <div className="loader-orb loader-orb-1" />
          <div className="loader-orb loader-orb-2" />
          <div className="loader-count">001</div>
          <div className="loader-word">
            <span>{words[loaderWord]}</span>
          </div>
          <div className="loader-year">©{new Date().getFullYear()}</div>
          <div className="loader-bar" />
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className={`nav${navScrolled ? " scrolled" : ""}`}>
        <a href="#about" className="nav-logo" style={{ textDecoration: "none" }}>
          <div className="nav-logo-badge">JM</div>
          <span>Jibu Mathew</span>
        </a>
        <div className="nav-links">
          {[["#pillars","pillars"],["#experience","experience"],["#events","events"],["#projects","projects"]].map(([h,l]) => (
            <a key={h} href={h} className="nav-link">{l}</a>
          ))}
        </div>
        <MagneticWrap strength={0.4}>
          <a href="#connect" className="nav-cta" data-hover>connect ↗</a>
        </MagneticWrap>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section id="about" className="hero section">
        <div className="hero-bg" />
        <div className="hero-noise" />
        <ParticleCanvas />

        <div className="hero-photo" ref={heroPhotoRef}>
          <img src="/jibu_2.jpg" alt="Jibu Mathew" />
          <div className="hero-photo-badge" style={{ position:"absolute", top:40, right:40, zIndex:20 }}>
            <Sparkles size={12} style={{ display:"inline", marginRight:6, verticalAlign:"middle" }} />
            B.Tech Data Science
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-tagline">
            <div className="tagline-line" />
            Tech-Business Generalist & Leader
          </div>
          <h1 className="hero-name">
            <span className="hero-name-line">
              <span className="hero-name-glitch" data-text="JIBU">JIBU</span>
            </span>
            <span className="hero-name-line">
              <span className="hero-name-glitch" data-text="MATHEW.">MATHEW.</span>
            </span>
          </h1>
          <p className="hero-roles">
            B.Tech Data Science · STIST Trivandrum<br/>
            Data Analyst Intern · CMO · Project Manager
          </p>
          <div className="hero-ctas">
            <MagneticWrap strength={0.45}>
              <a href="#pillars" className="btn-primary" data-hover>
                Explore Work <ArrowRight className="w-4 h-4" />
              </a>
            </MagneticWrap>
            <MagneticWrap strength={0.45}>
              <a href="#connect" className="btn-ghost" data-hover>
                Let's Connect
              </a>
            </MagneticWrap>
          </div>
        </div>

        <div className="hero-stats">
          <Counter end={7}   suffix="+" label="Events" />
          <Counter end={3}   suffix=""  label="Active Roles" />
          <Counter end={300} suffix="+" label="Volunteers" />
        </div>

        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-hint-line" />
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          EXPERTISE — FULL SKILL CARDS
      ══════════════════════════════════════════════════ */}
      <section id="pillars" className="section section-pad">
        <div className="container">
          <div className="reveal" style={{ marginBottom: 64 }}>
            <div className="section-tag font-accent-glow">Expertise</div>
            <h2 className="h-display font-expanded-lg">
              three pillars<br/>
              <em>of mastery</em>
            </h2>
            <p className="body-sm text-large-contrast" style={{ maxWidth: 520, marginTop: 16 }}>
              A multi-disciplinary skillset spanning data intelligence, operational leadership, and market strategy.
            </p>
          </div>
          
          <div className={`pillars-orbit-layout ${pillarSelected ? 'has-selection' : 'no-selection'}`}>
            <div className="pillars-orbit-column">
              <div className="orbit-system-wrapper">
                {/* Central HUD with Avatar */}
                <div className="orbit-center-hud">
                  <div className="hud-pulse-ring ring-1"></div>
                  <div className="hud-pulse-ring ring-2"></div>
                  <div className="hud-scanner-grid"></div>
                  <div className="hud-avatar-wrapper">
                    <img 
                      src="/jibu_outstretched_nobg.png" 
                      alt="Jibu Mathew" 
                      className="hud-avatar-img"
                    />
                    <div className="hud-avatar-scanline"></div>
                  </div>
                </div>

                {/* Revolving Orbit Track */}
                <div 
                  className="orbit-track"
                  style={{ borderColor: `${pillars[activePillar].color}44` }}
                >
                  {Object.entries(pillars).map(([key, p], idx) => {
                    const isActive = activePillar === key;
                    const angleOffset = idx * 120;
                    return (
                      <div
                        key={key}
                        className={`orbit-node-positioner pos-${key}`}
                        style={{
                          "--offset-angle": `${angleOffset}deg`,
                        }}
                      >
                        <div
                          className={`orbit-node node-${key} ${isActive && pillarSelected ? 'active' : ''}`}
                          onClick={() => {
                            setActivePillar(key);
                            setPillarSelected(true);
                          }}
                          style={{
                            "--pillar-color": p.color,
                          }}
                        >
                          <div className="orbit-node-inner">
                            <div className="orbit-node-icon">{p.icon}</div>
                            <span className="orbit-node-title">{p.title.replace("The ", "")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Info Flashcard with Minimal Vessel Outline Glow */}
            <div className="pillars-details-column">
              {pillarSelected && (
                <div 
                  className="pillar-details-card vessel-glow active-card" 
                  style={{ 
                    "--active-color-raw": pillars[activePillar].color,
                    "--active-color-alpha": `${pillars[activePillar].color}1a`,
                    "--active-color-glow": `${pillars[activePillar].color}44`
                  }}
                >
                  {/* Sci-Fi Corner Brackets */}
                  <div className="vessel-corner vessel-corner-tl"></div>
                  <div className="vessel-corner vessel-corner-tr"></div>
                  <div className="vessel-corner vessel-corner-bl"></div>
                  <div className="vessel-corner vessel-corner-br"></div>

                  <div className="card-glare-effect"></div>

                  <div className="pillar-details-header">
                    <div className="pillar-details-icon-box" style={{ borderColor: pillars[activePillar].color, color: pillars[activePillar].color }}>
                      {pillars[activePillar].icon}
                    </div>
                    <div className="pillar-details-title-wrap">
                      <h3 className="pillar-details-title">{pillars[activePillar].title}</h3>
                      <span className="pillar-details-subtitle" style={{ color: pillars[activePillar].color }}>
                        {pillars[activePillar].subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="pillar-details-tagline">{pillars[activePillar].tagline}</p>

                  <div className="pillar-details-radar-skills">
                    <div className="radar-mini-container">
                      <RadarChart values={pillars[activePillar].radar} color={pillars[activePillar].color} />
                    </div>
                    <div className="skills-mini-container">
                      {pillars[activePillar].skills.map((sk) => (
                        <div key={sk.name} className="skill-row">
                          <div className="skill-row-top">
                            <span className="skill-name">{sk.name}</span>
                            <span className="skill-pct" style={{ color: pillars[activePillar].color }}>{sk.pct}%</span>
                          </div>
                          <div className="skill-bar-track">
                            <div 
                              className="skill-bar-fill" 
                              style={{ 
                                width: `${sk.pct}%`, 
                                transform: 'scaleX(1)',
                                background: `linear-gradient(90deg, ${pillars[activePillar].color}, #ffffff)`
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pillar-details-points">
                    {pillars[activePillar].points.map((pt, i) => (
                      <div key={i} className="expertise-point">
                        <div className="expertise-point-dot" style={{ backgroundColor: pillars[activePillar].color }} />
                        <span className="point-text">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EXPERIENCE TIMELINE — SLIDESHOW
      ══════════════════════════════════════════════════ */}
      <section id="experience" className="timeline-section section section-pad">
        <div className="container">
          <div className="timeline-grid">

            {/* ── Left Sticky Column ── */}
            <div className="timeline-sticky reveal">
              <div className="section-tag font-accent-glow">Journey</div>
              <h2 className="h-section tl-heading">
                growth<br/>
                <span style={{ color: "var(--muted)", fontStyle: "italic", fontWeight: 300 }}>timeline</span>
              </h2>
              <p className="body-sm tl-subheading">
                Tracing my path across data analytics, project management, and start-up strategy.
              </p>

              {/* HUD Index Readout */}
              <div className="tl-hud-readout">
                <span className="tl-hud-bracket">[</span>
                <span className="tl-hud-label">NODE_{String(activeExpIdx + 1).padStart(2, '0')}_OF_{String(experience.length).padStart(2, '0')}</span>
                <span className="tl-hud-bracket">]</span>
              </div>

              {/* Milestone dot matrix */}
              <div className="tl-dot-matrix">
                {experience.map((_, idx) => (
                  <button
                    key={idx}
                    className={`tl-dot ${idx === activeExpIdx ? 'active' : idx < activeExpIdx ? 'done' : ''}`}
                    onClick={() => setActiveExpIdx(idx)}
                    title={experience[idx].period}
                  >
                    <span className="tl-dot-num">{String(idx + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>

              {/* Prev / Next navigation */}
              <div className="tl-nav-btns">
                <button
                  className="tl-nav-btn"
                  onClick={() => setActiveExpIdx(i => Math.max(0, i - 1))}
                  disabled={activeExpIdx === 0}
                >
                  <span className="tl-nav-arrow">←</span> Prev
                </button>
                <button
                  className="tl-nav-btn"
                  onClick={() => setActiveExpIdx(i => Math.min(experience.length - 1, i + 1))}
                  disabled={activeExpIdx === experience.length - 1}
                >
                  Next <span className="tl-nav-arrow">→</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="tl-progress-track">
                <div
                  className="tl-progress-fill"
                  style={{ width: `${((activeExpIdx) / (experience.length - 1)) * 100}%` }}
                />
              </div>
              <div className="tl-progress-labels">
                <span>{experience[0].period}</span>
                <span>{experience[experience.length - 1].period}</span>
              </div>
            </div>

            {/* ── Right Slideshow Column ── */}
            <div className="timeline-list">
              <div key={activeExpIdx} className="tl-slide-card vessel-glow">
                {/* Sci-Fi Corner Brackets */}
                <div className="vessel-corner vessel-corner-tl"></div>
                <div className="vessel-corner vessel-corner-tr"></div>
                <div className="vessel-corner vessel-corner-bl"></div>
                <div className="vessel-corner vessel-corner-br"></div>

                {/* Glare shimmer */}
                <div className="card-glare-effect"></div>

                {/* Card header strip */}
                <div className="tl-card-header">
                  <div className="tl-card-index">{String(activeExpIdx + 1).padStart(2, '0')}</div>
                  <div className="tl-card-period">
                    <DecryptedLogLine text={experience[activeExpIdx].period} delay={0} />
                  </div>
                  <div className="tl-card-type">
                    <DecryptedLogLine text={experience[activeExpIdx].type} delay={80} />
                  </div>
                </div>

                {/* Main role + company */}
                <div className="tl-card-main">
                  <div className="tl-card-role">
                    <DecryptedLogLine text={experience[activeExpIdx].role} delay={160} />
                  </div>
                  <div className="tl-card-company">
                    <span className="tl-at">@</span>
                    <DecryptedLogLine text={experience[activeExpIdx].company} delay={260} />
                  </div>
                </div>

                {/* Description */}
                <div className="tl-card-desc">
                  <div className="tl-card-desc-bar" />
                  <p className="tl-card-desc-text">
                    <DecryptedLogLine text={experience[activeExpIdx].description} delay={400} isLong />
                  </p>
                </div>

                {/* Bottom scanner strip */}
                <div className="tl-card-scanner">
                  <div className="tl-scanner-line" />
                  <span className="tl-scanner-label">SCANNING_NODE_{String(activeExpIdx + 1).padStart(2, '0')} // STATUS: ACTIVE</span>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="tl-thumb-strip">
                {experience.map((item, idx) => (
                  <button
                    key={idx}
                    className={`tl-thumb ${idx === activeExpIdx ? 'active' : ''}`}
                    onClick={() => setActiveExpIdx(idx)}
                  >
                    <span className="tl-thumb-period">{item.period}</span>
                    <span className="tl-thumb-company">{item.company.replace('™🔺', '').replace('™', '')}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EVENTS
      ══════════════════════════════════════════════════ */}
      <section id="events" className="section section-pad">
        <div className="container">
          <div className="reveal" style={{ marginBottom: 48 }}>
            <div className="section-tag">Live Engagements</div>
            <h2 className="h-display">
              events &amp;<br/>
              <em>engagements</em>
            </h2>
            <p className="body-sm" style={{ maxWidth: 420, marginTop: 14 }}>
              Click any card to see full details and outcomes.
            </p>
          </div>
        </div>
        <div className="events-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
          {events.map((evt) => (
            <div key={evt.id} className="event-card" onClick={() => setSelectedEvent(evt)} data-hover>
              <div className="event-img">
                <img src={evt.image} alt={evt.title} />
                <div className="event-img-overlay" />
              </div>
              <div className="event-body">
                <div className="event-cat">
                  <span className="event-cat-dot" />
                  {evt.category === "organized" ? "Organized" : "Attended"}
                </div>
                <div className="event-title">{evt.title}</div>
                <div className="event-sub">{evt.subtitle}</div>
                <div className="event-footer">
                  <span className="event-role">{evt.role}</span>
                  <div className="event-arrow">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>
              <X className="w-4 h-4" />
            </button>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent)", marginBottom:8 }}>
              {selectedEvent.category === "organized" ? "Event Organized" : "Event Attended"}
            </div>
            <h3 style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:900, color:"var(--cream)", marginBottom:4 }}>
              {selectedEvent.title}
            </h3>
            <p style={{ fontSize:13, color:"var(--accent-rose)", fontWeight:600, marginBottom:14 }}>{selectedEvent.subtitle}</p>
            <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7, marginBottom:12 }}>{selectedEvent.description}</p>
            {selectedEvent.image && (
              <div className="modal-img"><img src={selectedEvent.image} alt={selectedEvent.title} /></div>
            )}
            <div className="modal-stats">
              <Sparkles className="w-3 h-3 sparkle-icon" />
              {selectedEvent.stats}
            </div>
            <button className="modal-action" onClick={() => setSelectedEvent(null)}>Close Details</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CREDENTIALS
      ══════════════════════════════════════════════════ */}
      <section className="section section-pad" style={{ background:"var(--surface)", borderTop:"1px solid var(--border)" }}>
        <div className="container">
          <div className="reveal" style={{ marginBottom: 48 }}>
            <div className="section-tag">Verified</div>
            <h2 className="h-display">credentials<br/><em>&amp; badges</em></h2>
            <p className="body-sm" style={{ maxWidth: 400, marginTop: 14 }}>
              Validated milestones verifying dedication to continuous learning and community impact.
            </p>
          </div>
          <div className="creds-grid">
            {certificates.map((cert, i) => (
              <div key={i} className="cred-card">
                <div className="cred-icon"><Award className="w-5 h-5" /></div>
                <div className="cred-title">{cert.title}</div>
                <p className="cred-desc">{cert.desc}</p>
                <div className="cred-issuer">{cert.issuer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED PROJECTS
      ══════════════════════════════════════════════════ */}
      <section id="projects" className="section section-pad">
        <div className="container">
          <div className="reveal" style={{ marginBottom: 48 }}>
            <div className="section-tag">Projects</div>
            <h2 className="h-display">featured<br/><em>work</em></h2>
            <p className="body-sm" style={{ maxWidth: 400, marginTop: 14 }}>
              Spotlight on engineering assets designed to solve real-world problems.
            </p>
          </div>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-img"><img src="/uniconnect_showcase.png" alt="UniConnect Kerala" /></div>
              <div className="project-body">
                <div className="project-badge"><Terminal className="w-3 h-3" /> Technical Spotlight</div>
                <div className="project-title">UniConnect Kerala</div>
                <div className="project-sub">The Future of Student Admissions 🎓</div>
                <p className="project-desc">
                  A next-gen Student Admission Management System designed to revolutionize how students apply to engineering colleges in Kerala. Built with Java, HTML, CSS, and Adminer 5.4.1 — centralizes college data and AI-assisted decisions.
                </p>
                <ul className="project-points">
                  <li className="project-point"><ChevronRight className="w-3 h-3" style={{ color:"var(--accent)", flexShrink:0, marginTop:2 }} /> Centralized college dataset mapping &amp; real-time tracking</li>
                  <li className="project-point"><ChevronRight className="w-3 h-3" style={{ color:"var(--accent)", flexShrink:0, marginTop:2 }} /> AI-assisted administrative admission workflow</li>
                </ul>
                <div className="project-tags">
                  {["Java","HTML","CSS","Adminer 5.4.1","AI Decisions","EdTech"].map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="project-card">
              <div className="project-img"><img src="/coastconnect_showcase.png" alt="CoastConnect Kerala" /></div>
              <div className="project-body">
                <div className="project-badge"><Terminal className="w-3 h-3" /> Hackathon Spotlight</div>
                <div className="project-title">CoastConnect Kerala</div>
                <div className="project-sub">Unified Coastal Travel &amp; Port Access 🌊</div>
                <p className="project-desc">
                  Developed for the IEDC District Cluster Level Hackathon 2026. A unified digital platform to simplify coastal travel by integrating ferry services, port access, local attractions, and smart trip planning.
                </p>
                <ul className="project-points">
                  <li className="project-point"><ChevronRight className="w-3 h-3" style={{ color:"var(--accent)", flexShrink:0, marginTop:2 }} /> Unified ticketing and ferry service mapping</li>
                  <li className="project-point"><ChevronRight className="w-3 h-3" style={{ color:"var(--accent)", flexShrink:0, marginTop:2 }} /> Smart trip planner for coastal tourism and transport</li>
                </ul>
                <div className="project-tags">
                  {["React","HTML5","CSS3","Python","API Integration","Travel Tech"].map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONNECT
      ══════════════════════════════════════════════════ */}
      <section id="connect" className="connect-section section section-pad">
        <div className="container">
          <div className="reveal" style={{ marginBottom: 60 }}>
            <div className="section-tag">Let's Talk</div>
            <h2 className="h-display">
              let's<br/>
              <em>collaborate</em>
            </h2>
            <p className="body-sm" style={{ maxWidth: 420, marginTop: 14 }}>
              Seeking exciting opportunities in AI/ML, Data Science internships, or leadership operations. Let's make an impact together.
            </p>
          </div>

          <div className="connect-layout reveal">
            <div className="connect-left">
              <div className="connect-photo">
                <img src="/jibu_5.jpg" alt="Jibu Mathew" />
                <div className="connect-photo-overlay" />
                <div className="connect-photo-label">
                  <div className="lbl-top">Let's make it happen</div>
                  <div className="lbl-bot">Trivandrum, Kerala</div>
                </div>
              </div>
              <div className="collab-box">
                <div className="collab-box-title">Collaboration Spheres</div>
                <ul className="collab-items">
                  {["Data Science & Analytics Internships", "Developer Community Operations", "Product Launch Strategy & Marketing"].map(s => (
                    <li key={s} className="collab-item">
                      <span className="collab-dot" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="mine-name" className="form-label">Name</label>
                <input id="mine-name" type="text" className="form-input" placeholder="Your Name"
                  value={contactForm.name} onChange={e => setContactForm({...contactForm, name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label htmlFor="mine-email" className="form-label">Email Address</label>
                <input id="mine-email" type="email" className="form-input" placeholder="your.email@example.com"
                  value={contactForm.email} onChange={e => setContactForm({...contactForm, email:e.target.value})} required />
              </div>
              <div className="form-group">
                <label htmlFor="mine-message" className="form-label">Message</label>
                <textarea id="mine-message" className="form-input form-textarea" rows="4" placeholder="Hello Jibu, let's connect for..."
                  value={contactForm.message} onChange={e => setContactForm({...contactForm, message:e.target.value})} required />
              </div>
              <MagneticWrap strength={0.2}>
                <button type="submit" className="form-submit" disabled={formStatus !== "idle"} data-hover>
                  {formStatus === "idle"    && "Send Message →"}
                  {formStatus === "sending" && "Sending..."}
                  {formStatus === "sent"    && "✓ Message Sent!"}
                </button>
              </MagneticWrap>
            </form>
          </div>

          <div style={{ textAlign: "center", marginTop: 64 }}>
            <div className="socials">
              {[
                { href:"https://github.com/sickn33", icon:<GithubIcon width={18} height={18} />, label:"GitHub" },
                { href:"https://www.linkedin.com/in/jibu-mathew-018a8222b/", icon:<LinkedinIcon width={18} height={18} />, label:"LinkedIn" },
                { href:"mailto:jibumathew4444@gmail.com", icon:<Mail className="w-4 h-4" />, label:"Email" },
              ].map(({href, icon, label}) => (
                <MagneticWrap key={label} strength={0.5}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="social-btn" aria-label={label} data-hover>
                    {icon}
                  </a>
                </MagneticWrap>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-loc">
            <MapPin className="w-3.5 h-3.5" style={{ color:"var(--accent)" }} />
            Trivandrum, Kerala, India · Hybrid / Remote
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Jibu Mathew. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
