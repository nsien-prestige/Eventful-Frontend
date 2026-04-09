import "./home.css";
import { navigate } from "../../router";

// ─────────────────────────────────────────────────────────────
// GLITCH TEXT
// ─────────────────────────────────────────────────────────────
function initGlitchText() {
    const els = document.querySelectorAll<HTMLElement>("[data-glitch]");
    els.forEach((el) => {
        const text = el.dataset.glitch || el.textContent || "";
        el.dataset.text = text;
    });
}

// ─────────────────────────────────────────────────────────────
// PARTICLE CONSTELLATION
// ─────────────────────────────────────────────────────────────
function initParticleCanvas() {
    const canvas = document.getElementById("hc-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const PARTICLE_COUNT = 60;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: 0.8 + Math.random() * 1.4,
            alpha: 0.15 + Math.random() * 0.45,
        });
    }

    let mouseX = -9999, mouseY = -9999;
    document.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    const draw = () => {
        ctx.clearRect(0, 0, W, H);

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            // Mouse repel
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.6;
                p.x += (dx / dist) * force;
                p.y += (dy / dist) * force;
            }
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(200, 240, 74, ${(1 - dist / 130) * 0.12})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 240, 74, ${p.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    };
    draw();
}

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
function initReveal() {
    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    (e.target as HTMLElement).classList.add("hc-visible");
                    obs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.08 }
    );
    document.querySelectorAll(".hc-reveal").forEach((el) => obs.observe(el));
}

// ─────────────────────────────────────────────────────────────
// COUNTUP
// ─────────────────────────────────────────────────────────────
function initCountup() {
    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target as HTMLElement;
                const target = parseFloat(el.dataset.target || "0");
                const suffix = el.dataset.suffix || "";
                const prefix = el.dataset.prefix || "";
                const dec = parseInt(el.dataset.dec || "0");
                const dur = 2400;
                const start = performance.now();

                const tick = (now: number) => {
                    const p = Math.min((now - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 4);
                    el.textContent = prefix + (ease * target).toFixed(dec) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                obs.unobserve(el);
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll(".hc-countup").forEach((el) => obs.observe(el));
}

// ─────────────────────────────────────────────────────────────
// PARALLAX HERO LAYERS
// ─────────────────────────────────────────────────────────────
function initParallax() {
    const layers = document.querySelectorAll<HTMLElement>("[data-parallax]");
    window.addEventListener("scroll", () => {
        const sy = window.scrollY;
        layers.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax || "0.3");
            el.style.transform = `translateY(${sy * speed}px)`;
        });
    }, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// HORIZONTAL SCROLL (Events section)
// ─────────────────────────────────────────────────────────────
function initHorizScroll() {
    const track = document.getElementById("hc-events-track");
    if (!track) return;

    // Scroll with mouse wheel on the container
    const wrapper = document.getElementById("hc-events-hscroll");
    if (!wrapper) return;

    wrapper.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault();
        track.scrollLeft += e.deltaY * 1.2;
    }, { passive: false });

    // Drag scroll
    let isDown = false, startX = 0, scrollStart = 0;
    track.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX;
        scrollStart = track.scrollLeft;
        track.classList.add("hc-dragging");
    });
    document.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        track.scrollLeft = scrollStart - (e.pageX - startX);
    });
    document.addEventListener("mouseup", () => {
        isDown = false;
        track.classList.remove("hc-dragging");
    });
}

// ─────────────────────────────────────────────────────────────
// PROGRESS BAR ANIMATION
// ─────────────────────────────────────────────────────────────
function initProgressBars() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const bar = e.target as HTMLElement;
            const w = bar.dataset.width || "0";
            setTimeout(() => { bar.style.width = w + "%"; }, 400);
            obs.unobserve(bar);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll(".hc-bar-fill").forEach((el) => obs.observe(el));
}

// ─────────────────────────────────────────────────────────────
// TILT CARDS (3D perspective on mouse)
// ─────────────────────────────────────────────────────────────
function initTiltCards() {
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(8px)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

// ─────────────────────────────────────────────────────────────
// NUMBER TICKER (live feel)
// ─────────────────────────────────────────────────────────────
function initLiveTicker() {
    const el = document.getElementById("hc-live-count");
    if (!el) return;
    let base = 1247;
    const tick = () => {
        const delta = Math.floor(Math.random() * 3);
        if (delta > 0) {
            base += delta;
            el.textContent = base.toLocaleString();
            el.classList.add("hc-tick-flash");
            setTimeout(() => el.classList.remove("hc-tick-flash"), 600);
        }
        setTimeout(tick, 2000 + Math.random() * 4000);
    };
    setTimeout(tick, 3000);
}

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const EVENTS = [
    {
        id: "moonrise",
        title: "Moonrise Music Collective",
        category: "Music",
        categoryColor: "accent",
        date: "Sat, Apr 12",
        time: "8:00 PM",
        location: "Victoria Island, Lagos",
        price: "₦8,500",
        capacity: 82,
        gradient: "linear-gradient(135deg, #080f22 0%, #12083a 50%, #070e1d 100%)",
        accentHex: "#c8f04a",
        tag: "Selling fast",
    },
    {
        id: "afrotech",
        title: "AfroTech Summit Lagos 2026",
        category: "Technology",
        categoryColor: "teal",
        date: "Fri, Apr 18",
        time: "10:00 AM",
        location: "Landmark Centre, Lagos",
        price: "₦15,000",
        capacity: 61,
        gradient: "linear-gradient(135deg, #050f14 0%, #071c1a 50%, #050d0c 100%)",
        accentHex: "#7eeaea",
        tag: "Featured",
    },
    {
        id: "foodfest",
        title: "Nigerian Food & Culture Festival",
        category: "Food & Drink",
        categoryColor: "warm",
        date: "Sun, Apr 20",
        time: "12:00 PM",
        location: "Eko Convention Centre",
        price: "Free",
        capacity: 44,
        gradient: "linear-gradient(135deg, #180508 0%, #2c0810 50%, #100306 100%)",
        accentHex: "#f5a623",
        tag: "Free entry",
    },
    {
        id: "runway",
        title: "Lagos Fashion Week — Spring Edit",
        category: "Fashion",
        categoryColor: "violet",
        date: "Thu, Apr 24",
        time: "6:00 PM",
        location: "Federal Palace Hotel",
        price: "₦22,000",
        capacity: 90,
        gradient: "linear-gradient(135deg, #0e0818 0%, #1a0832 50%, #0a0612 100%)",
        accentHex: "#9c6fe4",
        tag: "Exclusive",
    },
    {
        id: "startup",
        title: "Pitch Night — Abuja Edition",
        category: "Business",
        categoryColor: "rose",
        date: "Wed, Apr 30",
        time: "5:30 PM",
        location: "Transcorp Hilton, Abuja",
        price: "₦5,000",
        capacity: 55,
        gradient: "linear-gradient(135deg, #14050c 0%, #280815 50%, #0e0408 100%)",
        accentHex: "#f06292",
        tag: "Networking",
    },
    {
        id: "comedy",
        title: "Laugh Out Loud — Late Night Show",
        category: "Comedy",
        categoryColor: "warm",
        date: "Sat, May 3",
        time: "9:00 PM",
        location: "Terra Kulture Arena",
        price: "₦12,000",
        capacity: 33,
        gradient: "linear-gradient(135deg, #120a00 0%, #241400 50%, #0e0700 100%)",
        accentHex: "#f5a623",
        tag: "Few seats left",
    },
];

const FEATURES = [
    {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/><path d="M9 8v8M15 8v8" stroke-linecap="round"/></svg>`,
        color: "accent",
        num: "01",
        title: "Tickets that just work",
        body: "Premium ticket passes, instant QR scanning, every tier handled. From GA to VIP — no drama, no friction.",
        wide: true,
    },
    {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
        color: "teal",
        num: "02",
        title: "Analytics in real time",
        body: "Watch sales, attendance, and revenue update live. No spreadsheets, no delays.",
        wide: false,
    },
    {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21" stroke-linecap="round"/></svg>`,
        color: "violet",
        num: "03",
        title: "Discovery for real people",
        body: "Smart search, category filters, saved events — people find what actually fits their mood.",
        wide: false,
    },
    {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round"/></svg>`,
        color: "warm",
        num: "04",
        title: "Checkout that converts",
        body: "A fast, trustworthy flow that works flawlessly on mobile and desktop alike.",
        wide: false,
    },
    {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3Z"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round"/></svg>`,
        color: "rose",
        num: "05",
        title: "Reminders that show up",
        body: "Automated alerts before events. Customisable reminders. Zero no-shows.",
        wide: false,
    },
];

const TESTIMONIALS = [
    {
        initials: "AB",
        name: "Adaeze Bright",
        role: "Event Producer, Lagos",
        body: "We sold out 400 people in under 48 hours. The analytics dashboard let us watch it happen live — absolutely wild.",
        rating: 5,
    },
    {
        initials: "TK",
        name: "Tunde Kayode",
        role: "Tech Meetup Organiser",
        body: "QR check-in alone saved us 45 minutes of door chaos. The whole thing just worked. No drama, no spreadsheets.",
        rating: 5,
    },
    {
        initials: "SC",
        name: "Sola Coker",
        role: "Regular Attendee, Abuja",
        body: "Found three events I actually wanted to go to in five minutes. The search and filters make real sense here.",
        rating: 5,
    },
    {
        initials: "EM",
        name: "Emeka Madu",
        role: "Festival Director",
        body: "Built my event page in under an hour. It looked like we'd hired a design agency. That's the Eventful effect.",
        rating: 5,
    },
    {
        initials: "FO",
        name: "Funke Olatunde",
        role: "Corporate Events Lead",
        body: "The capacity tracking on event day is everything. I knew exactly how close we were to full at every moment.",
        rating: 5,
    },
];

// ─────────────────────────────────────────────────────────────
// HTML BUILDERS
// ─────────────────────────────────────────────────────────────

function buildEventCard(ev: typeof EVENTS[0], index: number): string {
    const colorVar = {
        accent: "var(--hc-accent)",
        teal: "var(--hc-teal)",
        warm: "var(--hc-warm)",
        violet: "var(--hc-violet)",
        rose: "var(--hc-rose)",
    }[ev.categoryColor] || "var(--hc-accent)";

    return `
    <article class="hc-ecard hc-reveal" style="--card-accent: ${colorVar}; animation-delay: ${index * 0.08}s;" data-tilt data-nav="/explore">
        <div class="hc-ecard-img" style="background: ${ev.gradient};">
            <div class="hc-ecard-noise"></div>
            <div class="hc-ecard-overlay"></div>
            <span class="hc-ecard-tag">${ev.tag}</span>
            <div class="hc-ecard-title-overlay">
                <span class="hc-ecard-cat" style="color: ${colorVar}; border-color: ${colorVar}33; background: ${colorVar}15;">${ev.category}</span>
            </div>
        </div>
        <div class="hc-ecard-body">
            <h3 class="hc-ecard-title">${ev.title}</h3>
            <div class="hc-ecard-info">
                <span class="hc-ecard-info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                    ${ev.date} · ${ev.time}
                </span>
                <span class="hc-ecard-info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${ev.location}
                </span>
            </div>
            <div class="hc-ecard-footer">
                <span class="hc-ecard-price" style="color: ${colorVar};">${ev.price}</span>
                <div class="hc-ecard-cap">
                    <div class="hc-ecard-cap-bar">
                        <div class="hc-ecard-cap-fill hc-bar-fill" data-width="${ev.capacity}" style="background: ${colorVar};"></div>
                    </div>
                    <span class="hc-ecard-cap-label">${ev.capacity}% filled</span>
                </div>
            </div>
        </div>
    </article>`;
}

function buildFeatureCard(f: typeof FEATURES[0], i: number): string {
    const colorMap: Record<string, string> = {
        accent: "var(--hc-accent)",
        teal: "var(--hc-teal)",
        violet: "var(--hc-violet)",
        warm: "var(--hc-warm)",
        rose: "var(--hc-rose)",
    };
    const c = colorMap[f.color] || "var(--hc-accent)";
    return `
    <div class="hc-feat ${f.wide ? "hc-feat--wide" : ""} hc-reveal reveal-delay-${i}" style="--feat-accent: ${c};">
        <div class="hc-feat-num">${f.num}</div>
        <div class="hc-feat-icon">${f.icon}</div>
        <h3 class="hc-feat-title">${f.title}</h3>
        <p class="hc-feat-body">${f.body}</p>
        <div class="hc-feat-line"></div>
    </div>`;
}

function buildTestimonialCard(t: typeof TESTIMONIALS[0]): string {
    const stars = Array(t.rating).fill(`<span class="hc-star">★</span>`).join("");
    return `
    <div class="hc-tcard">
        <div class="hc-tcard-stars">${stars}</div>
        <p class="hc-tcard-body">"${t.body}"</p>
        <div class="hc-tcard-author">
            <div class="hc-tcard-avatar">${t.initials}</div>
            <div>
                <div class="hc-tcard-name">${t.name}</div>
                <div class="hc-tcard-role">${t.role}</div>
            </div>
        </div>
    </div>`;
}

const tickerTexts = [
    "12,500+ events hosted",
    "340,000+ tickets sold",
    "Instant QR check-in",
    "Real-time analytics",
    "50+ cities covered",
    "Secure payments",
    "Mobile-first checkout",
    "Creator dashboard",
    "Live capacity tracking",
    "Audience insights",
    "Zero-commission free tier",
    "24/7 support",
];

function buildTicker(): string {
    const items = [...tickerTexts, ...tickerTexts]
        .map(t => `<span class="hc-ticker-item"><span class="hc-ticker-dot">◆</span>${t}</span>`)
        .join("");
    return `<div class="hc-ticker-track">${items}</div>`;
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER
// ─────────────────────────────────────────────────────────────
export function renderHomePage() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
    <div class="hc-page" id="hc-page">

        <!-- ══ CANVAS CONSTELLATION ══ -->
        <canvas id="hc-canvas" class="hc-canvas" aria-hidden="true"></canvas>

        <!-- ══ AMBIENT ORBS ══ -->
        <div class="hc-ambient" aria-hidden="true">
            <div class="hc-orb hc-orb-1" data-parallax="0.15"></div>
            <div class="hc-orb hc-orb-2" data-parallax="0.22"></div>
            <div class="hc-orb hc-orb-3" data-parallax="0.1"></div>
            <div class="hc-orb hc-orb-4" data-parallax="0.3"></div>
        </div>

        <!-- ══════════════════════════════════════════════
             HERO
        ══════════════════════════════════════════════ -->
        <section class="hc-hero">
            <div class="hc-shell">
                <div class="hc-hero-layout">
                    <div class="hc-hero-left">

                        <div class="hc-hero-eyebrow">
                            <span class="hc-eyebrow-pulse"></span>
                            <span class="hc-eyebrow-text">The modern event platform</span>
                            <span class="hc-eyebrow-sep">·</span>
                            <span class="hc-eyebrow-live">
                                <span id="hc-live-count">1,247</span> live now
                            </span>
                        </div>

                        <h1 class="hc-hero-title">
                            <span class="hc-line hc-line-1">
                                <span class="hc-line-mask">
                                    <span class="hc-line-inner">Find &amp; create</span>
                                </span>
                            </span>
                            <span class="hc-line hc-line-2">
                                <span class="hc-line-mask">
                                    <span class="hc-line-inner hc-line-italic">extraordinary</span>
                                </span>
                            </span>
                            <span class="hc-line hc-line-3">
                                <span class="hc-line-mask">
                                    <span class="hc-line-inner">events.</span>
                                </span>
                            </span>
                        </h1>

                        <p class="hc-hero-sub">
                            Eventful connects attendees with unforgettable experiences
                            and gives creators the tools to build, launch, and sell out every time.
                        </p>

                        <div class="hc-hero-actions">
                            <button class="hc-btn-primary" id="hc-hero-explore" data-magnetic>
                                <span class="hc-btn-inner">
                                    <span>Explore events</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </span>
                                <span class="hc-btn-glow"></span>
                            </button>
                            <button class="hc-btn-ghost" id="hc-hero-create" data-magnetic>
                                <span>Create an event</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                        </div>

                        <div class="hc-hero-pills">
                            <span class="hc-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Secure payments
                            </span>
                            <span class="hc-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M20 6L9 17L4 12"/></svg>
                                QR tickets
                            </span>
                            <span class="hc-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                                Live analytics
                            </span>
                            <span class="hc-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                50k+ attendees
                            </span>
                        </div>
                    </div>

                    <!-- Hero right — stacked floating cards -->
                    <div class="hc-hero-right">
                        <div class="hc-hero-cards">
                            <!-- Main card -->
                            <div class="hc-hero-main-card" data-tilt>
                                <div class="hc-hero-main-card-img">
                                    <div class="hc-hero-card-gradient"></div>
                                    <div class="hc-hero-card-overlay"></div>
                                    <span class="hc-hero-card-badge">
                                        <span class="hc-live-ring"></span>
                                        Selling fast
                                    </span>
                                    <div class="hc-hero-card-text-overlay">Moonrise</div>
                                </div>
                                <div class="hc-hero-card-body">
                                    <span class="hc-hero-card-cat">Music</span>
                                    <h3 class="hc-hero-card-title">Moonrise Music Collective</h3>
                                    <div class="hc-hero-card-meta">
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                            Sat, Apr 12 · 8:00 PM
                                        </span>
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                            Victoria Island, Lagos
                                        </span>
                                    </div>
                                    <div class="hc-hero-card-footer">
                                        <span class="hc-hero-card-price">₦8,500</span>
                                        <button class="hc-hero-card-btn" id="hc-card-btn">Get tickets</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Floating stat chip -->
                            <div class="hc-float-chip hc-float-chip-1">
                                <div class="hc-float-chip-icon">🎟</div>
                                <div>
                                    <div class="hc-float-chip-val">284</div>
                                    <div class="hc-float-chip-key">tickets sold today</div>
                                </div>
                            </div>

                            <!-- Floating mini card -->
                            <div class="hc-float-chip hc-float-chip-2">
                                <div class="hc-float-chip-icon">📍</div>
                                <div>
                                    <div class="hc-float-chip-val">Lagos</div>
                                    <div class="hc-float-chip-key">Top city this week</div>
                                </div>
                            </div>

                            <!-- Attendees avatars chip -->
                            <div class="hc-float-chip hc-float-chip-3">
                                <div class="hc-float-avatars">
                                    <span class="hc-float-av" style="background: linear-gradient(135deg,#c8f04a,#7eeaea)">A</span>
                                    <span class="hc-float-av" style="background: linear-gradient(135deg,#9c6fe4,#f06292)">T</span>
                                    <span class="hc-float-av" style="background: linear-gradient(135deg,#f5a623,#f06292)">S</span>
                                </div>
                                <div>
                                    <div class="hc-float-chip-val">+50k</div>
                                    <div class="hc-float-chip-key">active attendees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="hc-scroll-hint" aria-hidden="true">
                <div class="hc-scroll-hint-line"></div>
                <span>scroll</span>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             TICKER
        ══════════════════════════════════════════════ -->
        <div class="hc-ticker-wrap" aria-hidden="true">
            ${buildTicker()}
        </div>

        <!-- ══════════════════════════════════════════════
             STATS
        ══════════════════════════════════════════════ -->
        <section class="hc-stats">
            <div class="hc-shell">
                <div class="hc-stats-row hc-reveal">
                    <div class="hc-stat">
                        <div class="hc-stat-num">
                            <span class="hc-countup" data-target="12500" data-suffix="+">0</span>
                        </div>
                        <div class="hc-stat-label">Events hosted</div>
                        <div class="hc-stat-sub">across 50+ Nigerian cities</div>
                    </div>
                    <div class="hc-stat-divider"></div>
                    <div class="hc-stat">
                        <div class="hc-stat-num">
                            <span class="hc-countup" data-target="340" data-suffix="k+">0</span>
                        </div>
                        <div class="hc-stat-label">Tickets sold</div>
                        <div class="hc-stat-sub">and counting in real time</div>
                    </div>
                    <div class="hc-stat-divider"></div>
                    <div class="hc-stat">
                        <div class="hc-stat-num">
                            <span class="hc-countup" data-target="4.9" data-suffix="/5" data-dec="1">0</span>
                        </div>
                        <div class="hc-stat-label">Creator rating</div>
                        <div class="hc-stat-sub">from verified organizers</div>
                    </div>
                    <div class="hc-stat-divider"></div>
                    <div class="hc-stat">
                        <div class="hc-stat-num">
                            <span class="hc-countup" data-target="98" data-suffix="%">0</span>
                        </div>
                        <div class="hc-stat-label">Satisfaction rate</div>
                        <div class="hc-stat-sub">post-event survey data</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             EVENTS — HORIZONTAL SCROLL
        ══════════════════════════════════════════════ -->
        <section class="hc-events" id="hc-events-hscroll">
            <div class="hc-shell">
                <div class="hc-section-head hc-reveal">
                    <div class="hc-kicker">What's on</div>
                    <div class="hc-section-head-row">
                        <h2 class="hc-section-title">Live events<em> right now.</em></h2>
                        <button class="hc-btn-ghost-sm" id="hc-explore-all" data-magnetic>
                            Explore all
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                    <p class="hc-section-sub">Drag or scroll to browse · Click any card to see more</p>
                </div>
            </div>

            <!-- Full-width horizontal scroll container -->
            <div class="hc-events-scroll-container">
                <div class="hc-events-track" id="hc-events-track">
                    <div class="hc-events-track-inner">
                        ${EVENTS.map((ev, i) => buildEventCard(ev, i)).join("")}
                        <!-- Explore more card -->
                        <div class="hc-ecard-more hc-reveal" id="hc-more-card" data-magnetic>
                            <div class="hc-ecard-more-inner">
                                <div class="hc-ecard-more-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                                <span>See all events</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hc-events-scroll-fade-left" aria-hidden="true"></div>
                <div class="hc-events-scroll-fade-right" aria-hidden="true"></div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             FEATURES
        ══════════════════════════════════════════════ -->
        <section class="hc-features">
            <div class="hc-shell">
                <div class="hc-section-head hc-reveal">
                    <div class="hc-kicker">Why Eventful</div>
                    <h2 class="hc-section-title">Everything your event<em> deserves.</em></h2>
                    <p class="hc-section-sub">
                        From the moment you create to the moment doors open — every tool built
                        with intention, every detail considered.
                    </p>
                </div>

                <div class="hc-features-grid">
                    ${FEATURES.map((f, i) => buildFeatureCard(f, i + 1)).join("")}
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             HOW IT WORKS
        ══════════════════════════════════════════════ -->
        <section class="hc-how">
            <div class="hc-shell">
                <div class="hc-section-head hc-reveal">
                    <div class="hc-kicker">The process</div>
                    <h2 class="hc-section-title">From idea to<em> sold out.</em></h2>
                    <p class="hc-section-sub">Three steps. That's all it takes.</p>
                </div>

                <div class="hc-how-steps">
                    <div class="hc-how-step hc-reveal reveal-delay-1">
                        <div class="hc-how-step-num">01</div>
                        <div class="hc-how-step-content">
                            <h3 class="hc-how-step-title">Build the page</h3>
                            <p class="hc-how-step-body">
                                Tell your story — visuals, ticket tiers, schedule, all the details
                                attendees actually care about. Takes minutes, looks like hours of work.
                            </p>
                        </div>
                        <div class="hc-how-step-arrow">→</div>
                    </div>
                    <div class="hc-how-step hc-reveal reveal-delay-2">
                        <div class="hc-how-step-num">02</div>
                        <div class="hc-how-step-content">
                            <h3 class="hc-how-step-title">Open the doors</h3>
                            <p class="hc-how-step-body">
                                Publish, share the link, watch registrations pour in.
                                Real-time sales tracking keeps you in control at every moment.
                            </p>
                        </div>
                        <div class="hc-how-step-arrow">→</div>
                    </div>
                    <div class="hc-how-step hc-reveal reveal-delay-3">
                        <div class="hc-how-step-num">03</div>
                        <div class="hc-how-step-content">
                            <h3 class="hc-how-step-title">Run it smoothly</h3>
                            <p class="hc-how-step-body">
                                Single-scan check-in, live capacity monitor, and a complete
                                picture of the night when doors close.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             CREATOR SECTION
        ══════════════════════════════════════════════ -->
        <section class="hc-creator">
            <div class="hc-shell">
                <div class="hc-creator-layout hc-reveal">
                    <!-- Left copy -->
                    <div class="hc-creator-copy">
                        <div class="hc-kicker">For creators</div>
                        <h2 class="hc-creator-title">
                            Your events.<br>
                            <em>Your data.</em><br>
                            Your brand.
                        </h2>
                        <p class="hc-creator-body">
                            The complete toolkit — from polished event pages and seamless ticket
                            sales to real-time dashboards that help you understand your audience
                            like never before.
                        </p>
                        <ul class="hc-creator-list">
                            <li><span class="hc-creator-dot"></span>Full event page editor with images, agenda &amp; ticket tiers</li>
                            <li><span class="hc-creator-dot"></span>Live revenue and attendance tracking</li>
                            <li><span class="hc-creator-dot"></span>Instant QR code check-in on event day</li>
                            <li><span class="hc-creator-dot"></span>Automated notifications and reminders to attendees</li>
                        </ul>
                        <button class="hc-btn-primary" id="hc-creator-cta" data-magnetic>
                            <span class="hc-btn-inner">
                                <span>Start creating</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </span>
                            <span class="hc-btn-glow"></span>
                        </button>
                    </div>

                    <!-- Right — dashboard mockup -->
                    <div class="hc-creator-dash">
                        <div class="hc-dash-header">
                            <span class="hc-dash-title">Creator dashboard</span>
                            <span class="hc-dash-live-badge">
                                <span class="hc-live-ring"></span>
                                Live
                            </span>
                        </div>

                        <div class="hc-dash-metrics">
                            <div class="hc-dash-metric">
                                <div class="hc-dash-metric-val hc-dash-green">₦1.2M</div>
                                <div class="hc-dash-metric-key">Revenue</div>
                                <div class="hc-dash-metric-delta">↑ 24%</div>
                            </div>
                            <div class="hc-dash-metric">
                                <div class="hc-dash-metric-val hc-dash-teal">284</div>
                                <div class="hc-dash-metric-key">Tickets sold</div>
                                <div class="hc-dash-metric-delta">↑ 12%</div>
                            </div>
                            <div class="hc-dash-metric">
                                <div class="hc-dash-metric-val">12</div>
                                <div class="hc-dash-metric-key">Active events</div>
                                <div class="hc-dash-metric-delta">↑ 3</div>
                            </div>
                        </div>

                        <!-- Mini chart -->
                        <div class="hc-dash-chart">
                            <div class="hc-dash-chart-label">Sales this week</div>
                            <div class="hc-dash-bars" id="hc-dash-bars">
                                ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
                                    const heights = [30, 55, 42, 70, 90, 85, 65];
                                    return `<div class="hc-dash-bar-col">
                                        <div class="hc-dash-bar hc-bar-fill" data-width="${heights[i]}" style="height: 0%; --bar-h: ${heights[i]}%;"></div>
                                        <div class="hc-dash-bar-label">${d}</div>
                                    </div>`;
                                }).join("")}
                            </div>
                        </div>

                        <div class="hc-dash-caps">
                            <div class="hc-dash-cap-row">
                                <span class="hc-dash-cap-name">Capacity</span>
                                <span class="hc-dash-cap-pct" style="color: var(--hc-accent);">78%</span>
                            </div>
                            <div class="hc-dash-cap-track">
                                <div class="hc-bar-fill hc-dash-cap-bar" data-width="78"></div>
                            </div>
                            <div class="hc-dash-cap-row" style="margin-top: 12px;">
                                <span class="hc-dash-cap-name">Ticket sales</span>
                                <span class="hc-dash-cap-pct" style="color: var(--hc-teal);">91%</span>
                            </div>
                            <div class="hc-dash-cap-track">
                                <div class="hc-bar-fill hc-dash-cap-bar" data-width="91" style="background: linear-gradient(90deg, var(--hc-teal), var(--hc-violet));"></div>
                            </div>
                        </div>

                        <!-- Recent activity feed -->
                        <div class="hc-dash-feed">
                            <div class="hc-dash-feed-title">Recent activity</div>
                            <div class="hc-dash-feed-item">
                                <span class="hc-dash-feed-dot" style="background: var(--hc-accent);"></span>
                                <span class="hc-dash-feed-text">New ticket purchase — VIP tier</span>
                                <span class="hc-dash-feed-time">2m ago</span>
                            </div>
                            <div class="hc-dash-feed-item">
                                <span class="hc-dash-feed-dot" style="background: var(--hc-teal);"></span>
                                <span class="hc-dash-feed-text">Check-in scan — Gate A</span>
                                <span class="hc-dash-feed-time">5m ago</span>
                            </div>
                            <div class="hc-dash-feed-item">
                                <span class="hc-dash-feed-dot" style="background: var(--hc-violet);"></span>
                                <span class="hc-dash-feed-text">Event shared — 12 new views</span>
                                <span class="hc-dash-feed-time">11m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             TESTIMONIALS — AUTO MARQUEE
        ══════════════════════════════════════════════ -->
        <section class="hc-proof">
            <div class="hc-shell">
                <div class="hc-section-head hc-reveal">
                    <div class="hc-kicker">What people say</div>
                    <h2 class="hc-section-title">Creators and attendees<em> love it.</em></h2>
                </div>
            </div>

            <div class="hc-proof-marquee-wrap">
                <div class="hc-proof-marquee">
                    <div class="hc-proof-track">
                        ${[...TESTIMONIALS, ...TESTIMONIALS].map(t => buildTestimonialCard(t)).join("")}
                    </div>
                </div>
                <div class="hc-proof-fade-l" aria-hidden="true"></div>
                <div class="hc-proof-fade-r" aria-hidden="true"></div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════
             FINAL CTA
        ══════════════════════════════════════════════ -->
        <section class="hc-cta-section">
            <div class="hc-shell">
                <div class="hc-cta-panel hc-reveal">
                    <div class="hc-cta-bg-text" aria-hidden="true">Eventful</div>
                    <div class="hc-cta-glow" aria-hidden="true"></div>

                    <div class="hc-kicker hc-kicker-center">Ready to start?</div>
                    <h2 class="hc-cta-title">
                        Build something<br>
                        <em>worth talking about.</em>
                    </h2>
                    <p class="hc-cta-sub">
                        Whether you're here to discover your next great night out
                        or create it — Eventful is where it begins.
                    </p>
                    <div class="hc-cta-actions">
                        <button class="hc-btn-primary hc-btn-primary--xl" id="hc-final-cta" data-magnetic>
                            <span class="hc-btn-inner">
                                <span>Get started free</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </span>
                            <span class="hc-btn-glow"></span>
                        </button>
                        <button class="hc-btn-ghost hc-btn-ghost--xl" id="hc-final-browse" data-magnetic>
                            Browse events
                        </button>
                    </div>

                    <div class="hc-cta-trust">
                        <span>Free to start</span>
                        <span class="hc-cta-trust-dot">·</span>
                        <span>No credit card required</span>
                        <span class="hc-cta-trust-dot">·</span>
                        <span>Go live in minutes</span>
                    </div>
                </div>
            </div>
        </section>

    </div>
    `;

    // ── Init all systems ──────────────────────────────
    requestAnimationFrame(() => {
        initParticleCanvas();
        initParallax();
        initReveal();
        initCountup();
        initProgressBars();
        initTiltCards();
        initHorizScroll();
        initGlitchText();
        initLiveTicker();
    });

    // ── Button wiring ────────────────────────────────
    document.getElementById("hc-hero-explore")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("hc-hero-create")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("hc-card-btn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("hc-explore-all")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("hc-more-card")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("hc-creator-cta")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("hc-final-cta")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("hc-final-browse")?.addEventListener("click", () => navigate("/explore"));

    document.querySelectorAll<HTMLElement>(".hc-ecard").forEach((card) => {
        card.addEventListener("click", () => navigate("/explore"));
    });

    // ── Dashboard bar chart — special vertical bars ──
    // Override hc-bar-fill behavior for vertical bars
    const dashBars = document.querySelectorAll<HTMLElement>(".hc-dash-bar");
    const barObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const bar = e.target as HTMLElement;
            const h = bar.style.getPropertyValue("--bar-h") || "0%";
            setTimeout(() => { bar.style.height = h; }, 500);
            barObs.unobserve(bar);
        });
    }, { threshold: 0.3 });
    dashBars.forEach((b) => barObs.observe(b));
}