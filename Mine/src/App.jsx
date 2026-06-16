import React, { useEffect, useState, useRef } from "react";
import {
  Briefcase,
  Terminal,
  Layers,
  Award,
  Mail,
  ExternalLink,
  X,
  ChevronRight,
  Sparkles,
  MapPin
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// ─── Custom SVG Icons ────────────────────────────────────────
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

// ─── Utility: Word-mask hero title reveal ─────────────────────
// Splits by WORD (not char) so native font kerning is fully preserved.
// Each word slides up from behind an overflow:hidden clip mask.
function HeroTitle({ text }) {
  const words = text.split(" ");
  return (
    <span className="inline-flex flex-wrap gap-x-[0.25em]">
      {words.map((word, i) => (
        <span key={i} className="reveal-mask" style={{ lineHeight: "1.1" }}>
          <span className="hero-word inline-block">{word}</span>
        </span>
      ))}
    </span>
  );
}

// ─── Utility: Animated counter ───────────────────────────────
function Counter({ end, suffix = "", label }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        let start = 0;
        const step = Math.ceil(end / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(timer); }
          else setVal(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center">
      <div className="counter-num font-display text-4xl md:text-5xl font-black text-white">
        {val}{suffix}
      </div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  delay: `${Math.random() * 20}s`,
  duration: `${12 + Math.random() * 14}s`,
  opacity: Math.random() * 0.4 + 0.1,
}));

gsap.registerPlugin(ScrollTrigger);

// ─── Main Component ───────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("analyst");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");
  const [scrollPct, setScrollPct] = useState(0);

  const heroRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);

  // ─── Scroll progress ─────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Custom Cursor ────────────────────────────────────────
  useEffect(() => {
    const dot = cursorDot.current;
    const ring = cursorRing.current;
    if (!dot || !ring) return;
    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.05, ease: "none" });
    };
    const lerp = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
      requestAnimationFrame(lerp);
    };
    window.addEventListener("mousemove", onMove);
    lerp();
    const addHover = () => ring.classList.add("hovered");
    const removeHover = () => ring.classList.remove("hovered");
    document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ─── Magnetic button effect ───────────────────────────────
  useEffect(() => {
    const btns = document.querySelectorAll(".magnetic-btn");
    const handlers = [];
    btns.forEach((btn) => {
      const onEnter = (e) => {
        const rect = btn.getBoundingClientRect();
        const onMove = (ev) => {
          const dx = (ev.clientX - rect.left - rect.width / 2) * 0.3;
          const dy = (ev.clientY - rect.top - rect.height / 2) * 0.3;
          gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
        };
        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
          window.removeEventListener("mousemove", onMove);
        };
        window.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave, { once: true });
        handlers.push({ btn, onMove, onLeave });
      };
      btn.addEventListener("mouseenter", onEnter);
    });
  }, []);

  // ─── GSAP Animations ──────────────────────────────────────
  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 2,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    // ── Hero: word-by-word title reveal ────────────────────
    gsap.fromTo(".hero-word",
      { y: "115%", opacity: 0 },
      {
        y: "0%", opacity: 1,
        duration: 1.0, ease: "power4.out",
        stagger: 0.12,
        delay: 0.2,
      }
    );

    // ── Hero: tagline + subtitle + CTA ────────────────────
    const heroTl = gsap.timeline({ delay: 0.5 });
    heroTl.fromTo(".hero-tagline",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" }
    );
    heroTl.fromTo(".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 },
      "-=0.5"
    );
    heroTl.fromTo(".hero-cta",
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", stagger: 0.15 },
      "-=0.5"
    );
    // Photo: fade + slight scale up (no clip-path flash)
    heroTl.fromTo(".hero-photo-container",
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
      "-=1.0"
    );
    heroTl.fromTo(".hero-stats",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    // ── Parallax: 5 layers ─────────────────────────────────
    const parallaxLayers = [
      { sel: ".parallax-bg",   yPct: -8 },
      { sel: ".parallax-grid", yPct: -18 },
      { sel: ".parallax-mid",  yPct: -32 },
      { sel: ".parallax-fore", yPct: -50 },
      { sel: ".parallax-text", yPct: -65 },
    ];
    parallaxLayers.forEach(({ sel, yPct }) => {
      gsap.to(sel, {
        yPercent: yPct,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // ── Section headings: word mask reveal ────────────────
    document.querySelectorAll(".section-title-reveal").forEach((el) => {
      const words = el.textContent.trim().split(" ");
      el.innerHTML = words
        .map(
          (w) =>
            `<span class="reveal-mask" style="margin-right:0.25em"><span class="reveal-inner">${w}</span></span>`
        )
        .join("");
      gsap.fromTo(
        el.querySelectorAll(".reveal-inner"),
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.0,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // ── Pillar cards: stagger up ───────────────────────────
    gsap.fromTo(".pillar-card",
      { y: 80, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1.0, ease: "power3.out", stagger: 0.15,
        scrollTrigger: { trigger: ".pillars-section", start: "top 78%", toggleActions: "play none none reverse" },
      }
    );

    // ── Timeline: alternating X slide ─────────────────────
    document.querySelectorAll(".timeline-item").forEach((item, i) => {
      gsap.fromTo(item,
        { x: i % 2 === 0 ? -80 : 80, opacity: 0, scale: 0.96 },
        {
          x: 0, opacity: 1, scale: 1,
          duration: 0.9, ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // ── Event cards: blur + scale reveal ──────────────────
    gsap.fromTo(".event-card",
      { scale: 0.88, opacity: 0, filter: "blur(8px)" },
      {
        scale: 1, opacity: 1, filter: "blur(0px)",
        duration: 0.9, ease: "power3.out", stagger: 0.2,
        scrollTrigger: { trigger: ".events-grid", start: "top 80%", toggleActions: "play none none reverse" },
      }
    );

    // ── Credential cards ──────────────────────────────────
    gsap.fromTo(".cred-card",
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: ".creds-section", start: "top 80%", toggleActions: "play none none reverse" },
      }
    );

    // ── Spotlight cards ───────────────────────────────────
    gsap.fromTo(".spotlight-card",
      { scale: 0.9, opacity: 0, y: 60 },
      {
        scale: 1, opacity: 1, y: 0,
        duration: 1.1, ease: "power3.out", stagger: 0.2,
        scrollTrigger: { trigger: ".spotlight-section", start: "top 78%", toggleActions: "play none none reverse" },
      }
    );

    // ── Image scale on scroll ─────────────────────────────
    document.querySelectorAll(".scroll-image-scale").forEach((img) => {
      gsap.fromTo(img,
        { scale: 1.18 },
        {
          scale: 1, ease: "none",
          scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });

    // ── Section fade-through (movie-like continuity) ──────
    document.querySelectorAll(".scroll-section-fade").forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0.15, y: 40 },
        {
          opacity: 1, y: 0,
          scrollTrigger: { trigger: section, start: "top 90%", end: "top 45%", scrub: 0.6 },
        }
      );
    });

    // ── Section color grading (orb shift) ─────────────────
    const orbBlue  = document.querySelector(".orb-blue");
    const orbViolet = document.querySelector(".orb-violet");
    const orbRed   = document.querySelector(".orb-red");

    if (orbBlue && orbViolet) {
      ScrollTrigger.create({
        trigger: ".pillars-section",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          gsap.to(orbBlue,   { opacity: 0.06, x: "15vw",  duration: 1.5 });
          gsap.to(orbViolet, { opacity: 0.14, y: "-5vh",   duration: 1.5 });
        },
        onLeave: () => {
          gsap.to(orbBlue,   { opacity: 0.1,  x: "0vw",   duration: 1.5 });
          gsap.to(orbViolet, { opacity: 0.09, y: "0vh",    duration: 1.5 });
        },
        onEnterBack: () => {
          gsap.to(orbViolet, { opacity: 0.14, duration: 1 });
        },
        onLeaveBack: () => {
          gsap.to(orbViolet, { opacity: 0.09, duration: 1 });
        },
      });

      ScrollTrigger.create({
        trigger: ".timeline-section",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          gsap.to(orbRed,    { opacity: 0.08, x: "10vw",  duration: 1.5 });
          gsap.to(orbViolet, { opacity: 0.06, y: "10vh",  duration: 1.5 });
        },
        onLeave: () => {
          gsap.to(orbRed,    { opacity: 0.04, x: "0vw",   duration: 1.5 });
        },
      });
    }

    // ── Connect section fade-in ────────────────────────────
    gsap.fromTo("#connect",
      { opacity: 0 },
      {
        opacity: 1, duration: 1.2,
        scrollTrigger: { trigger: "#connect", start: "top 85%", toggleActions: "play none none none" },
      }
    );

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ─── Contact form ─────────────────────────────────────────
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all fields.");
      return;
    }
    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("sent");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1200);
  };

  // ─── Static Data ─────────────────────────────────────────
  const pillars = {
    analyst: {
      title: "The Analyst",
      subtitle: "Data Science, Machine Learning & Algorithms",
      icon: <Terminal className="w-8 h-8 text-brand-blue" />,
      tagline: "Uncovering insights and building intelligent models.",
      points: [
        "Proficient in Python, SQL, Pandas, NumPy, and data visualization tools like Power BI and Excel.",
        "Data Analyst Intern at Bluestock™🔺, querying database schemas and compiling analytical dashboards.",
        "Kaggle Community Member (Regular Badge), active in dataset analysis and predictive notebook competitions.",
        "Exploring generative AI, prompt context engineering, and Gemini/Gemma 4 deployment workflows.",
      ],
      skills: ["Python", "SQL", "Pandas", "NumPy", "Machine Learning", "Power BI", "Data Analysis"],
    },
    orchestrator: {
      title: "The Orchestrator",
      subtitle: "Project Management & Leadership",
      icon: <Briefcase className="w-8 h-8 text-brand-blue" />,
      tagline: "Directing complex operations and collaborative projects.",
      points: [
        "Project Manager at AI+Compassion Global Forum, directing international technical and coordination teams.",
        "Campus Project Management IG Lead at MuLearnSTI, mentoring peers on project management frameworks.",
        "NRPF Campus Coordinator for National Service Scheme, managing orientation and camp events for 300+ volunteers.",
        "Experienced in agile workflow organization, cross-functional sprints, and community event coordination.",
      ],
      skills: ["Project Management", "Team Leadership", "Agile Sprints", "Event Coordination", "Risk Management"],
    },
    strategist: {
      title: "The Strategist",
      subtitle: "CMO Mindset & Business Growth",
      icon: <Layers className="w-8 h-8 text-brand-blue" />,
      tagline: "Connecting engineering capabilities with business strategy.",
      points: [
        "Chief Marketing Officer (CMO) at Curionative, driving community reach and product launch positioning.",
        "Completed a Business Development Internship at Ilmora AI Solutions, specializing in outreach and lead generation.",
        "Active member of The Purple Movement, building scaling spaces for tech-led innovations.",
        "Pitches technical assets (e.g. UniConnect Kerala student admission platform) to industry executives and investors.",
      ],
      skills: ["Business Development", "Product Strategy", "Lead Generation", "Marketing Operations", "Strategic Thinking"],
    },
  };

  const experience = [
    { role: "Data Analyst Intern", company: "Bluestock™🔺", period: "May 2026 - Present", type: "Remote | Internship", description: "Analyzing remote financial data pipelines, auditing database schemas with SQL, and building business intelligence reports using Python, Pandas, and Excel. Quantified deliverables and dashboards to support project decisions." },
    { role: "Campus Project Management IG Lead", company: "MuLearnSTI", period: "Mar 2026 - Present", type: "College Chapter | Leadership", description: "Mentoring peer groups on agile framework execution, tracking deliverables, and coordinating student technical sprints. Spearheaded community coding workshops and structured group workflows." },
    { role: "Chief Marketing Officer (CMO)", company: "Curionative", period: "Jan 2026 - Present", type: "Strategic Growth | Executive", description: "Steering regional outreach and market positioning for developer platforms and technical assets. Led promotional strategies for events like Build with AI Gemma 4, driving community engagement and cohort creation." },
    { role: "Business Development Intern", company: "Ilmora AI Solutions", period: "Jan 2026 - Feb 2026", type: "Remote | Internship", description: "Acquired hands-on experience in lead generation, client outreach, and professional networking. Developed pitches and coordination templates to improve the visibility of AI-driven business products." },
    { role: "Project Manager (Ex-India Coordinator)", company: "AI+Compassion Global Forum", period: "Oct 2025 - Present", type: "Global Community | Volunteer", description: "Directing international technical and coordination teams. Promoted from Regional Coordinator - India (Sep 2025 - Nov 2025) to oversee global project execution, cross-border sprints, and virtual community relays." },
    { role: "NRPF NSS Campus Coordinator", company: "National Service Scheme", period: "Oct 2025 - Present", type: "Social Service | Leadership", description: "Coordinating campus volunteer operations. Served as an NRPF NSS Campus Coordinator during Thudakam'26, managing orientation and community service workshops for over 300+ students." },
    { role: "Core Movement Member", company: "The Purple Movement", period: "Jun 2025 - Present", type: "Ecosystem Enabler | Member", description: "Actively contributing to ecosystem building, UI/UX workshops, and collaborative innovation spaces. Pitching student tech prototypes to regional startup founders and industry stakeholders." },
    { role: "Mulearn Campus Execom Member", company: "MuLearnSTI", period: "Aug 2024 - Present", type: "College Chapter | Executive", description: "Founding member of the college chapter. Organizes hackathons, technical seminars, and coordinate with GTech to bring corporate mentoring closer to students." },
  ];

  const events = [
    { id: "vortex",    title: "Vortex Tech Fest",       role: "Program Coordinator",      category: "organized", subtitle: "2-Day Flagship Tech Event by Dzypher",        description: "Led the organizational committee from ideation to final execution. Vortex brought together over 500+ participants across code sprints, web design hackathons, and technology debates. Coordinated logistics, sponsor outreach, and speaker line-ups.", stats: "500+ Attendees • 2 Days • 6 Core Sprints", image: "/vortex_showcase.png",     gradientClass: "from-blue-950 to-indigo-950" },
    { id: "gemma4",    title: "Build with AI: Gemma 4",  role: "Organiser & Delegate",     category: "organized", subtitle: "Google for Developers & MuLearn",             description: "Co-organized and represented Curionative as a delegate at the Gemma 4 launch event at Technopark Trivandrum. Post-event, we spearheaded the creation of a recurring monthly developer cohort to sustain local AI research and learning ecosystems.", stats: "Technopark Trivandrum • Monthly Cohort Formed", image: "/gemma4_showcase.png", gradientClass: "from-violet-950 to-blue-950" },
    { id: "olympus",   title: "Olympus (GTech)",         role: "Core Volunteer & Delegate", category: "attended", subtitle: "Olympus: The HR Icon Event",                  description: "Volunteered and attended the HR Olympus event at ICFOSS, Greenfield Stadium. Explored how product companies hire, life cycles of HR, and employer branding. Interacted with HR experts to reverse-engineer recruitment workflows for BTech graduates.", stats: "GTech Initiative • HR & Hiring Workflows", image: "/olympus_showcase.png",    gradientClass: "from-indigo-950 to-violet-950" },
    { id: "indiafoss", title: "India FOSS 2025",         role: "Stall Volunteer & Delegate", category: "attended", subtitle: "Open Source National Conference",             description: "Represented the MuLearn Foundation at India FOSS 2025. Networked with open-source leaders like Chad Whitacre (Sentry's Head of Open Source) and Kailash Nadh (CTO of Zerodha) to study the gift economy of collaborative software tools.", stats: "FOSS United • Bangalore Stall Lead", image: "/indiafoss_showcase.png", gradientClass: "from-slate-950 to-blue-950" },
  ];

  const certificates = [
    { title: "Official Purple Movement Certificate", issuer: "Purple Movement Core Team", desc: "Awarded for active leadership, community building, and creative contributions to regional innovation projects." },
    { title: "GitHub Workflow Mastery", issuer: "Unstop", desc: "Certified in advanced git operations, continuous integration workflows, pull request audits, and branch strategies." },
    { title: "Kaggle Community Member Regular", issuer: "Kaggle", desc: "Earned for regular community contributions, dataset analysis, and competitive notebooks." },
    { title: "Internship Common Aptitude Test (ICAT)", issuer: "National Assessment Standards", desc: "Scored high percentiles in analytical logic, mathematical problem solving, and strategic triage." },
  ];

  const tickerItems = [
    "Data Analyst @ Bluestock™🔺", "CMO @ Curionative", "PM @ AI+Compassion",
    "7+ Major Events", "300+ NSS Volunteers", "MuLearn IG Lead",
    "Kaggle Community Member", "India FOSS Delegate", "Build with AI: Gemma 4",
  ];

  return (
    <div ref={scrollContainerRef} className="relative min-h-screen overflow-hidden bg-brand-dark text-gray-200 selection:bg-brand-blue selection:text-white">

      {/* ── Custom Cursor ─────────────────────────────── */}
      <div ref={cursorDot}  className="cursor-dot" />
      <div ref={cursorRing} className="cursor-ring" />

      {/* ── Scroll Progress Bar ───────────────────────── */}
      <div className="scroll-progress-bar" style={{ width: `${scrollPct}%` }} />

      {/* ── Floating Particles ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              bottom: "-4px",
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* ── Animated Orb Background ───────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="orb-blue orb-animate   absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-brand-blue/10  blur-[160px]" />
        <div className="orb-violet orb-animate-reverse absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-brand-violet/9 blur-[180px]" />
        <div className="orb-red   orb-animate   absolute top-[45%] left-[40%]  w-[30%] h-[30%] rounded-full bg-brand-red/4    blur-[130px]" style={{ animationDuration: "20s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark/80" />
      </div>

      {/* ── Floating Header ───────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 border-x-0 py-3.5 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-violet to-brand-blue flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            JM
          </div>
          <span className="font-display font-bold tracking-tight text-white hidden sm:inline-block">
            Jibu Mathew
          </span>
        </div>
        <nav className="flex items-center space-x-5 text-sm font-medium">
          {["#about", "#pillars", "#experience", "#events"].map((href) => (
            <a key={href} href={href} className="hover:text-brand-blue transition-colors capitalize hidden md:block" data-hover>
              {href.replace("#", "")}
            </a>
          ))}
          <a href="#connect" className="px-4 py-1.5 rounded-full bg-brand-blue/15 text-brand-blue border border-brand-blue/40 hover:bg-brand-blue/30 transition-all magnetic-btn" data-hover>
            Connect
          </a>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section ref={heroRef} id="about" className="relative min-h-screen flex flex-col justify-center items-center px-6 md:px-12 pt-20 overflow-hidden z-10">

        {/* 5-layer parallax */}
        <div className="parallax-bg  absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none" />
        <div className="parallax-grid absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.025)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
        <div className="parallax-mid absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[8%]  w-64 h-64 rounded-full bg-brand-violet/5 blur-[100px]" />
          <div className="absolute bottom-[15%] right-[8%] w-72 h-72 rounded-full bg-brand-blue/5  blur-[120px]" />
        </div>
        <div className="parallax-fore absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[20%] w-40 h-40 rounded-full bg-brand-red/4 blur-[80px]" />
        </div>
        <div className="parallax-text absolute inset-0 pointer-events-none" />

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 text-left">

          {/* Left column */}
          <div className="lg:col-span-7 space-y-5">

            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-blue text-xs font-semibold uppercase tracking-wider hero-tagline">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Tech-Business Generalist & Leader</span>
            </div>

            {/* ── Hero Name ─────────────────────────────────
                Uses HeroTitle (word-mask). Each word retains
                native font kerning — no inline-block per char. */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.0]">
              <HeroTitle text="JIBU MATHEW" />
            </h1>

            {/* Role — soft gradient, not harsh red */}
            <p className="hero-subtitle text-sm md:text-base font-semibold leading-relaxed tracking-wide text-gray-300">
              B.Tech Data Science Student &nbsp;·&nbsp; Data Analytics & AI &nbsp;·&nbsp; Project Manager @ MuLearn &nbsp;·&nbsp; Data Analyst Intern
            </p>

            {/* Bio — concise */}
            <p className="hero-subtitle text-sm text-gray-500 leading-relaxed max-w-lg">
              Second-year student at STIST Trivandrum with a passion for AI, data analytics, and strategic problem-solving — approaching tech with a CEO mindset.
            </p>

            {/* Animated Counters — divider separates from text */}
            <div className="hero-stats flex gap-8 pt-4 border-t border-brand-border/40">
              <Counter end={7}   suffix="+" label="Events" />
              <Counter end={3}   suffix=""  label="Active Roles" />
              <Counter end={300} suffix="+" label="Volunteers" />
            </div>

            {/* CTAs — stretch on mobile, auto on sm+ */}
            <div className="flex flex-col sm:flex-row gap-3 hero-cta">
              <a href="#pillars" className="magnetic-btn text-center px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-violet to-brand-blue text-white font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-105 transition-all" data-hover>
                Explore My Pillars
              </a>
              <a href="#connect" className="magnetic-btn text-center px-8 py-3.5 rounded-full glass-panel text-white hover:bg-brand-violet/20 transition-all font-bold text-sm border border-brand-border" data-hover>
                Let's Connect
              </a>
            </div>
          </div>

          {/* Right column: Photo — initial opacity:0, GSAP fades in */}
          <div className="lg:col-span-5 flex justify-center hero-photo-container" style={{ opacity: 0 }}>
            <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden glass-panel border-brand-violet/30 shadow-[0_0_60px_rgba(59,130,246,0.15)] group transition-all duration-500 hover:border-brand-blue/50">
              {/* Neon rotating ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-blue via-brand-violet to-brand-blue rounded-3xl blur-sm opacity-20 group-hover:opacity-45 transition duration-1000 ring-spin" />
              <div className="relative w-full h-full bg-brand-card">
                <img
                  src="/jibu_2.jpg"
                  alt="Jibu Mathew"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-106 filter contrast-105 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-transparent to-transparent opacity-55 group-hover:opacity-35 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-bold font-display uppercase tracking-widest text-brand-blue block">Live Profile</span>
                    <span className="text-xs text-gray-400 font-mono">STIST Trivandrum</span>
                  </div>
                  <Sparkles className="w-5 h-5 text-brand-blue animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none opacity-50">
          <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-brand-blue to-transparent" />
        </div>
      </section>

      {/* ── Stats Ticker ──────────────────────────────── */}
      <div className="relative z-10 py-4 border-y border-brand-border/50 overflow-hidden bg-brand-card/20 backdrop-blur-sm">
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          THREE PILLARS
      ══════════════════════════════════════════════════ */}
      <section id="pillars" className="scroll-section-fade pillars-section py-24 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="section-label mb-4 inline-flex"><Sparkles className="w-3 h-3" /> Expertise</span>
          <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white mb-4 mt-3">
            The Three Pillars
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            A balanced hybrid showcase presenting the synergy between analytics, operations, and growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {Object.entries(pillars).map(([key, pillar]) => (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pillar-card tilt-card p-8 rounded-2xl cursor-pointer border text-left transition-all ${
                activeTab === key
                  ? "bg-brand-card/90 border-brand-blue shadow-[0_0_40px_rgba(59,130,246,0.12)] scale-102"
                  : "bg-brand-card/30 border-brand-border hover:border-brand-violet/50 hover:bg-brand-card/55"
              }`}
              data-hover
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl transition-colors ${activeTab === key ? "bg-brand-blue/20" : "bg-brand-border/40"}`}>
                  {pillar.icon}
                </div>
                {activeTab === key && <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />}
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-brand-blue font-bold uppercase tracking-wider mb-3">{pillar.subtitle}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{pillar.tagline}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-8 md:p-12 text-left border-brand-border shadow-2xl flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-border pb-6 mb-8 gap-4">
              <div>
                <h4 className="font-display text-3xl font-black text-white">{pillars[activeTab].title}</h4>
                <p className="text-brand-blue font-semibold text-sm">{pillars[activeTab].subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {pillars[activeTab].skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-red text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <ul className="space-y-4">
              {pillars[activeTab].points.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-gray-300">
                  <ChevronRight className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <span className="leading-relaxed text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden border border-brand-border shrink-0 relative group">
            <img
              src={activeTab === "analyst" ? "/jibu_1.jpg" : activeTab === "orchestrator" ? "/jibu_2.jpg" : "/jibu_4.jpg"}
              alt={pillars[activeTab].title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EXPERIENCE TIMELINE
      ══════════════════════════════════════════════════ */}
      <section id="experience" className="scroll-section-fade timeline-section py-24 px-6 md:px-12 bg-brand-card/20 border-y border-brand-border z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">Journey</span>
            <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white mb-4 mt-3">
              My Growth Journey
            </h2>
            <p className="text-gray-400 text-sm">
              Tracing my path across data analytics, project management, and start-up strategy.
            </p>
          </div>

          <div className="relative ml-4 md:ml-36 space-y-12">
            {/* Glowing timeline line */}
            <div className="absolute left-0 top-0 bottom-0 timeline-line" />

            {experience.map((item, index) => (
              <div key={index} className="relative pl-8 md:pl-12 timeline-item">
                {/* Glowing bullet */}
                <div className="absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-brand-blue shadow-[0_0_14px_rgba(59,130,246,0.9)] z-10 ring-2 ring-brand-dark" />

                {/* Date */}
                <div className="md:absolute md:left-[-185px] md:top-1 md:w-[155px] md:text-right text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 md:mb-0 leading-tight">
                  {item.period}
                </div>

                <div className="glass-panel p-6 rounded-2xl border-brand-border text-left glass-panel-hover">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="font-display text-xl font-bold text-white">{item.role}</h3>
                    <span className="text-xs px-2.5 py-1 rounded bg-brand-violet/10 border border-brand-violet/20 text-brand-red font-semibold self-start shrink-0">
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">{item.company}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EVENTS
      ══════════════════════════════════════════════════ */}
      <section id="events" className="scroll-section-fade py-24 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="section-label mb-4 inline-flex">Live Engagements</span>
          <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white mb-4 mt-3">
            Events & Engagements
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Click on any event card to view descriptions, outcomes, and pop-up details.
          </p>
        </div>

        <div className="events-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className={`event-card rounded-2xl border border-brand-border bg-gradient-to-br ${evt.gradientClass} p-8 text-left cursor-pointer group`}
              data-hover
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-blue">
                  {evt.category === "organized" ? "Organized" : "Attended"}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/10">
                  {evt.role}
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-white group-hover:text-brand-red transition-colors mb-2">
                {evt.title}
              </h3>
              <p className="text-gray-300 text-sm mb-6 font-medium">{evt.subtitle}</p>
              <div className="flex items-center text-xs text-gray-400 font-bold group-hover:text-white transition-colors">
                <span>View Event Details</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Event Modal ───────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 relative shadow-[0_0_60px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-border/40 text-gray-400 hover:text-white transition-colors" data-hover>
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-blue mb-1 inline-block">
              {selectedEvent.category === "organized" ? "Event Organized" : "Event Attended"}
            </span>
            <h3 className="font-display text-3xl font-black text-white mb-1">{selectedEvent.title}</h3>
            <p className="text-brand-red text-sm font-semibold mb-5">{selectedEvent.subtitle}</p>
            <div className="border-t border-b border-brand-border py-5 my-5 text-gray-300 text-sm leading-relaxed">
              <p>{selectedEvent.description}</p>
            </div>
            {selectedEvent.image && (
              <div className="w-full h-52 rounded-xl overflow-hidden border border-brand-border mb-5 relative group">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-brand-dark/90 to-transparent flex justify-between items-center">
                  <span className="text-xs text-white font-semibold font-mono">{selectedEvent.stats}</span>
                  <span className="text-xs text-brand-blue font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Verified Event
                  </span>
                </div>
              </div>
            )}
            <button onClick={() => setSelectedEvent(null)} className="w-full py-3 rounded-full bg-gradient-to-r from-brand-violet to-brand-blue text-white hover:opacity-90 font-bold text-sm transition-opacity" data-hover>
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CREDENTIALS
      ══════════════════════════════════════════════════ */}
      <section className="creds-section scroll-section-fade py-24 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <span className="section-label mb-4 inline-flex">Verified</span>
          <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white mb-4 mt-3">
            Credentials & Badges
          </h2>
          <p className="text-gray-400 text-sm">
            Validated milestones verifying my dedication to continuous learning and community impact.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, index) => (
            <div key={index} className="cred-card glass-panel p-6 rounded-2xl border-brand-border text-left flex flex-col justify-between glass-panel-hover" data-hover>
              <div>
                <Award className="w-7 h-7 text-brand-blue mb-4" />
                <h3 className="font-display text-lg font-bold text-white mb-2">{cert.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{cert.desc}</p>
              </div>
              <span className="text-xs text-brand-red font-semibold uppercase tracking-wider">{cert.issuer}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED PROJECTS
      ══════════════════════════════════════════════════ */}
      <section className="spotlight-section scroll-section-fade py-24 px-6 md:px-12 bg-gradient-to-b from-brand-dark to-brand-card/15 border-t border-brand-border z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">Projects</span>
            <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white mb-4 mt-3">
              Featured Projects
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Spotlight on engineering assets designed to solve real-world problems.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* UniConnect */}
            <div className="spotlight-card glass-panel rounded-3xl p-8 border-brand-violet/20 relative overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-brand-blue/40 transition-all duration-500" data-hover>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-red text-xs font-semibold mb-6">
                  <Terminal className="w-3.5 h-3.5" /><span>Technical Spotlight</span>
                </div>
                <h3 className="font-display text-3xl font-black text-white mb-2 group-hover:text-brand-blue transition-colors">UniConnect Kerala</h3>
                <p className="text-brand-red font-bold text-sm uppercase tracking-wider mb-5">The Future of Student Admissions 🎓</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                  A next-gen Student Admission Management System designed to revolutionize how students apply to engineering colleges in Kerala. Built with Java, HTML, CSS, and Adminer 5.4.1, it centralizes college data, enables real-time application tracking, and empowers administrators with AI-assisted decisions.
                </p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-center gap-2 text-xs text-gray-400"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" /><span>Centralized college dataset mapping & real-time tracking</span></div>
                  <div className="flex items-center gap-2 text-xs text-gray-400"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" /><span>AI-assisted administrative admission workflow</span></div>
                </div>
              </div>
              <div>
                <div className="w-full h-48 overflow-hidden rounded-2xl mb-5 border border-brand-border/60 relative">
                  <img src="/uniconnect_showcase.png" alt="UniConnect Kerala" className="scroll-image-scale w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Java", "HTML", "CSS", "Adminer 5.4.1", "AI Decisions", "EdTech"].map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded bg-brand-dark/80 border border-brand-border text-gray-400 font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* CoastConnect */}
            <div className="spotlight-card glass-panel rounded-3xl p-8 border-brand-violet/20 relative overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-brand-blue/40 transition-all duration-500" data-hover>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-red text-xs font-semibold mb-6">
                  <Terminal className="w-3.5 h-3.5" /><span>Hackathon Spotlight</span>
                </div>
                <h3 className="font-display text-3xl font-black text-white mb-2 group-hover:text-brand-blue transition-colors">CoastConnect Kerala</h3>
                <p className="text-brand-red font-bold text-sm uppercase tracking-wider mb-5">Unified Coastal Travel & Port Access 🌊</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                  Developed for the IEDC District Cluster Level Hackathon 2026. A unified digital platform designed to simplify coastal travel by integrating ferry services, port access, local attractions, tourist experiences, and smart trip planning into one seamless, responsive ecosystem.
                </p>
                <div className="space-y-3 mb-7">
                  <div className="flex items-center gap-2 text-xs text-gray-400"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" /><span>Unified ticketing and ferry service mapping</span></div>
                  <div className="flex items-center gap-2 text-xs text-gray-400"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" /><span>Smart trip planner for coastal tourism and transport</span></div>
                </div>
              </div>
              <div>
                <div className="w-full h-48 overflow-hidden rounded-2xl mb-5 border border-brand-border/60 relative">
                  <img src="/coastconnect_showcase.png" alt="CoastConnect Kerala" className="scroll-image-scale w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "HTML5", "CSS3", "Python", "API Integration", "Travel Tech"].map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded bg-brand-dark/80 border border-brand-border text-gray-400 font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONNECT / FOOTER
      ══════════════════════════════════════════════════ */}
      <section id="connect" className="py-24 px-6 md:px-12 bg-brand-dark text-center border-t border-brand-border z-10 relative">
        <div className="max-w-4xl mx-auto">
          <span className="section-label mb-6 inline-flex">Let's Talk</span>
          <h2 className="section-title-reveal font-display text-4xl md:text-6xl font-black text-white text-center mb-4 mt-3">
            Let's Collaborate
          </h2>
          <p className="text-gray-400 mb-12 max-w-md mx-auto text-sm">
            Seeking exciting opportunities in AI/ML, Data Science internships, or leadership operations. Let's make an impact together!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch text-left max-w-4xl mx-auto mb-12">
            <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-brand-border group">
                <img src="/jibu_5.jpg" alt="Contact Jibu" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-106" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">Let's make it happen</p>
                  <p className="text-sm text-gray-300">Trivandrum, Kerala</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-400 bg-brand-card/40 border border-brand-border p-5 rounded-2xl">
                <p className="font-semibold text-brand-blue text-xs uppercase tracking-wider">Collaboration Spheres:</p>
                <ul className="space-y-2 text-xs">
                  {["Data Science & Analytics Internships", "Developer Community Operations", "Product Launch Strategy & Marketing"].map((s) => (
                    <li key={s} className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" /><span>{s}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-7 flex">
              <form onSubmit={handleContactSubmit} className="glass-panel p-6 md:p-8 rounded-3xl border-brand-border text-left space-y-4 shadow-xl w-full flex flex-col justify-between">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-brand-blue mb-2">Name</label>
                  <input type="text" id="name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-blue transition-colors"
                    placeholder="Your Name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-brand-blue mb-2">Email Address</label>
                  <input type="email" id="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-blue transition-colors"
                    placeholder="your.email@example.com" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-brand-blue mb-2">Message</label>
                  <textarea id="message" rows="3" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-blue transition-colors resize-none"
                    placeholder="Hello Jibu, let's connect for..." required />
                </div>
                <button type="submit" disabled={formStatus !== "idle"}
                  className="magnetic-btn w-full py-3.5 mt-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-blue text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2" data-hover>
                  {formStatus === "idle" && <span>Send Message</span>}
                  {formStatus === "sending" && <span>Sending...</span>}
                  {formStatus === "sent" && <span>Message Sent! ✓</span>}
                </button>
              </form>
            </div>
          </div>

          <div className="flex justify-center items-center gap-5 mb-12">
            {[
              { href: "https://github.com/sickn33", icon: <GithubIcon className="w-5 h-5" />, label: "GitHub" },
              { href: "https://www.linkedin.com/in/jibu-mathew-018a8222b/", icon: <LinkedinIcon className="w-5 h-5" />, label: "LinkedIn" },
              { href: "mailto:jibumathew4444@gmail.com", icon: <Mail className="w-5 h-5" />, label: "Email" },
            ].map(({ href, icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="magnetic-btn p-4 rounded-full bg-brand-card border border-brand-border hover:border-brand-blue text-gray-400 hover:text-white transition-all hover:-translate-y-1" data-hover>
                {icon}
              </a>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-bold mb-6">
            <MapPin className="w-4 h-4 text-brand-blue" />
            <span>Trivandrum, Kerala, India • Hybrid / Remote</span>
          </div>

          <p className="text-gray-700 text-xs font-mono">
            © {new Date().getFullYear()} Jibu Mathew. All rights reserved.
          </p>
        </div>
      </section>

    </div>
  );
}
