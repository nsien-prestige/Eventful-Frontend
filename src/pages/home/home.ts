import "./home.css";
import { navigate } from "../../router";

// ── Particle system ────────────────────────────────────
function spawnParticles(container: HTMLElement) {
    const count = 18;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "home-particle";
        const x = Math.random() * 100;
        const dur = 8 + Math.random() * 14;
        const delay = Math.random() * 12;
        const size = 1.5 + Math.random() * 2.5;
        p.style.cssText = `
            left: ${x}vw;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
        `;
        container.appendChild(p);
    }
}

// ── Number countup ─────────────────────────────────────
function animateCountup(el: HTMLElement) {
    const target = parseFloat(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 2000;
    const start = performance.now();

    const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: ease out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = eased * target;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target.toFixed(decimals) + suffix;
    };

    requestAnimationFrame(tick);
}

// ── Scroll reveals ─────────────────────────────────────
function setupReveal() {
    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("visible");
                    obs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    // Countup observer
    const countObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    animateCountup(e.target as HTMLElement);
                    countObs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll(".countup").forEach((el) => countObs.observe(el));

    // Creator bar animation
    const barObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    const bar = e.target.querySelector(".home-creator-bar-fill") as HTMLElement;
                    if (bar) {
                        const width = bar.dataset.width || "0";
                        setTimeout(() => { bar.style.width = width + "%"; }, 300);
                    }
                    barObs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.3 }
    );
    document.querySelectorAll(".home-creator-preview").forEach((el) => barObs.observe(el));
}

// ── Event cards data (mock preview) ───────────────────
const previewEvents = [
    {
        title: "Moonrise Music Collective",
        category: "Music",
        date: "Sat, Apr 12 · 8:00 PM",
        location: "Victoria Island, Lagos",
        price: "₦8,500",
        gradient: "linear-gradient(135deg, #0d1f3a 0%, #1a1040 60%, #0d2233 100%)",
    },
    {
        title: "AfroTech Summit Lagos 2026",
        category: "Technology",
        date: "Fri, Apr 18 · 10:00 AM",
        location: "Landmark Centre, Lagos",
        price: "₦15,000",
        gradient: "linear-gradient(135deg, #0f2a1e 0%, #1a3a2e 60%, #0d1f18 100%)",
    },
    {
        title: "Nigerian Food & Culture Festival",
        category: "Food & Drink",
        date: "Sun, Apr 20 · 12:00 PM",
        location: "Eko Convention Centre",
        price: "Free",
        gradient: "linear-gradient(135deg, #2c0a1e 0%, #4a1020 60%, #1a0810 100%)",
    },
];

// ── Ticker items ───────────────────────────────────────
const tickerItems = [
    { text: "12,500+ events hosted", highlight: true },
    { text: "340,000+ tickets sold", highlight: false },
    { text: "Realtime analytics", highlight: false },
    { text: "Instant QR check-in", highlight: false },
    { text: "Secure payments", highlight: false },
    { text: "50+ cities covered", highlight: true },
    { text: "Mobile-first checkout", highlight: false },
    { text: "Creator dashboard", highlight: false },
    { text: "Live capacity tracking", highlight: false },
    { text: "Audience insights", highlight: true },
];

// Build ticker HTML (duplicated for seamless loop)
function buildTicker(): string {
    const items = [...tickerItems, ...tickerItems]
        .map((item) => `
            <span class="home-ticker-item ${item.highlight ? "highlight" : ""}">
                <span class="ticker-dot"></span>
                ${item.text}
            </span>
        `)
        .join("");
    return `<div class="home-ticker-track">${items}</div>`;
}

// ── Render ─────────────────────────────────────────────
export function renderHomePage() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="home-page">

            <!-- Ambient background -->
            <div class="home-ambient" aria-hidden="true">
                <div class="home-orb home-orb-1"></div>
                <div class="home-orb home-orb-2"></div>
                <div class="home-orb home-orb-3"></div>
            </div>

            <!-- Floating particles -->
            <div class="home-particles" id="homeParticles" aria-hidden="true"></div>

            <!-- ══════════════════════════════════════
                 HERO
                 ══════════════════════════════════════ -->
            <section class="home-hero">
                <div class="home-shell">
                    <div class="home-hero-inner">
                        <div class="home-hero-copy">
                            <div class="home-eyebrow">
                                <span class="home-eyebrow-dot"></span>
                                <span class="home-eyebrow-line"></span>
                                <span>The modern event platform</span>
                            </div>

                            <h1 class="home-hero-title">
                                <span class="word"><span class="word-inner">Find,</span></span>
                                <span class="word"> </span>
                                <span class="word"><span class="word-inner">create</span></span>
                                <span class="word"> </span>
                                <span class="word"><span class="word-inner break">&amp;</span></span>
                                <span class="word"><span class="word-inner accent-word">experience</span></span>
                                <span class="word break"><span class="word-inner">the world's</span></span>
                                <span class="word"><span class="word-inner">best events.</span></span>
                            </h1>

                            <p class="home-hero-sub">
                                Eventful connects attendees with extraordinary experiences and
                                gives creators the tools to build, launch, and sell out every time.
                            </p>

                            <div class="home-hero-actions">
                                <button class="home-cta-primary" id="heroCTABtn">
                                    <span>Explore events</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                                <button class="home-cta-secondary" id="heroCreateBtn">
                                    Create an event
                                </button>
                            </div>

                            <div class="home-trust">
                                <span class="home-trust-pill">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    Secure payments
                                </span>
                                <span class="home-trust-pill">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M20 6L9 17L4 12"/></svg>
                                    Instant QR tickets
                                </span>
                                <span class="home-trust-pill">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                                    Live analytics
                                </span>
                                <span class="home-trust-pill">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                    50k+ attendees
                                </span>
                            </div>
                        </div>

                        <!-- Floating preview card -->
                        <div class="home-hero-visual">
                            <div class="home-hero-badge">
                                <span class="live-dot"></span>
                                Selling fast
                            </div>
                            <div class="home-hero-card">
                                <div class="home-hero-card-img">
                                    <div class="home-hero-card-img-text">Moonrise</div>
                                </div>
                                <div class="home-hero-card-body">
                                    <span class="home-hero-card-cat">Music</span>
                                    <h3 class="home-hero-card-title">Moonrise Music Collective</h3>
                                    <div class="home-hero-card-meta">
                                        <span class="home-hero-card-meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                                            Sat, Apr 12 · 8:00 PM
                                        </span>
                                        <span class="home-hero-card-meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                            Victoria Island, Lagos
                                        </span>
                                    </div>
                                    <div class="home-hero-card-footer">
                                        <span class="home-hero-card-price">₦8,500</span>
                                        <button class="home-hero-card-btn" id="heroCardBtn">Get tickets</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 TICKER
                 ══════════════════════════════════════ -->
            <div class="home-ticker" aria-hidden="true">
                ${buildTicker()}
            </div>

            <!-- ══════════════════════════════════════
                 STATS
                 ══════════════════════════════════════ -->
            <section class="home-stats">
                <div class="home-shell">
                    <div class="home-stats-grid reveal">
                        <div class="home-stat">
                            <div class="home-stat-number">
                                <span class="countup" data-target="12500" data-suffix="+">0</span>
                            </div>
                            <div class="home-stat-label">Events hosted</div>
                        </div>
                        <div class="home-stat">
                            <div class="home-stat-number">
                                <span class="countup" data-target="340" data-suffix="k+">0</span>
                            </div>
                            <div class="home-stat-label">Tickets sold</div>
                        </div>
                        <div class="home-stat">
                            <div class="home-stat-number">
                                <span class="countup" data-target="50" data-suffix="+">0</span>
                            </div>
                            <div class="home-stat-label">Cities covered</div>
                        </div>
                        <div class="home-stat">
                            <div class="home-stat-number">
                                <span class="countup" data-target="4.9" data-suffix="/5" data-decimals="1">0</span>
                            </div>
                            <div class="home-stat-label">Creator rating</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 FEATURES
                 ══════════════════════════════════════ -->
            <section class="home-features">
                <div class="home-shell">
                    <div class="home-section-head reveal">
                        <div class="home-section-kicker">Why Eventful</div>
                        <h2 class="home-section-title">Everything your event<em> deserves.</em></h2>
                        <p class="home-section-sub">
                            From the moment you create to the moment doors open — every tool built
                            with intention, every detail considered.
                        </p>
                    </div>

                    <div class="home-features-grid">
                        <div class="home-feature tall reveal reveal-delay-1">
                            <div class="home-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/><path d="M9 8v8M15 8v8" stroke-linecap="round"/></svg>
                            </div>
                            <h3 class="home-feature-title">Tickets that just work — beautifully</h3>
                            <p class="home-feature-body">
                                Issue premium ticket passes, scan QR codes in under a second,
                                and keep entry lines moving without a single hiccup. Every tier,
                                every format, every device — handled.
                            </p>
                            <div class="home-feature-bg-number">01</div>
                        </div>

                        <div class="home-feature reveal reveal-delay-2">
                            <div class="home-feature-icon teal">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                            </div>
                            <h3 class="home-feature-title">Analytics that answer real questions</h3>
                            <p class="home-feature-body">
                                Watch sales, attendance, and revenue update live. No spreadsheets, no delays.
                            </p>
                        </div>

                        <div class="home-feature reveal reveal-delay-3">
                            <div class="home-feature-icon violet">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21" stroke-linecap="round"/></svg>
                            </div>
                            <h3 class="home-feature-title">Discovery built for real people</h3>
                            <p class="home-feature-body">
                                Category filters, saved events, smart search — people find what actually fits their mood.
                            </p>
                        </div>

                        <div class="home-feature reveal reveal-delay-2">
                            <div class="home-feature-icon warm">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round"/></svg>
                            </div>
                            <h3 class="home-feature-title">Checkout that converts</h3>
                            <p class="home-feature-body">
                                A fast, trustworthy purchase flow that works flawlessly on mobile and desktop alike.
                            </p>
                        </div>

                        <div class="home-feature reveal reveal-delay-3">
                            <div class="home-feature-icon rose">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3Z"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round"/></svg>
                            </div>
                            <h3 class="home-feature-title">Reminders that keep people showing up</h3>
                            <p class="home-feature-body">
                                Automated notifications before events, customisable reminders, zero no-shows.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 LIVE EVENTS PREVIEW
                 ══════════════════════════════════════ -->
            <section class="home-events">
                <div class="home-shell">
                    <div class="home-events-header">
                        <div class="reveal">
                            <div class="home-section-kicker">What's on</div>
                            <h2 class="home-section-title">Live events<em> right now.</em></h2>
                        </div>
                        <button class="home-see-all reveal" id="seeAllBtn">
                            Explore all
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>

                    <div class="home-events-grid">
                        ${previewEvents.map((ev, i) => `
                        <article class="home-event-card reveal reveal-delay-${i + 1}" data-nav="/explore">
                            <div class="home-event-card-img">
                                <div class="home-event-card-img-bg" style="background: ${ev.gradient};"></div>
                                <div class="home-event-card-img-overlay"></div>
                                <span class="home-event-card-cat">${ev.category}</span>
                                <span class="home-event-card-price">${ev.price}</span>
                            </div>
                            <div class="home-event-card-body">
                                <h3 class="home-event-card-title">${ev.title}</h3>
                                <div class="home-event-card-meta">
                                    <span class="home-event-card-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                                        ${ev.date}
                                    </span>
                                    <span class="home-event-card-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        ${ev.location}
                                    </span>
                                </div>
                            </div>
                        </article>`).join("")}
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 HOW IT WORKS
                 ══════════════════════════════════════ -->
            <section class="home-how">
                <div class="home-shell">
                    <div class="home-section-head reveal">
                        <div class="home-section-kicker">The process</div>
                        <h2 class="home-section-title">From idea to<em> sold out.</em></h2>
                        <p class="home-section-sub">Three steps is all it takes to go from a blank page to a packed venue.</p>
                    </div>

                    <div class="home-how-grid reveal reveal-delay-1">
                        <div class="home-how-step">
                            <div class="home-how-num">Step 01</div>
                            <h3 class="home-how-step-title">Build the page</h3>
                            <p class="home-how-step-body">
                                Tell your story with visuals, ticket tiers, schedule, and all the details
                                attendees actually care about. Takes minutes, looks like hours.
                            </p>
                            <div class="home-how-step-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                        <div class="home-how-step">
                            <div class="home-how-num">Step 02</div>
                            <h3 class="home-how-step-title">Open the doors</h3>
                            <p class="home-how-step-body">
                                Publish, share the link, and watch registrations come in.
                                Real-time sales tracking keeps you in control at every moment.
                            </p>
                            <div class="home-how-step-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                        <div class="home-how-step">
                            <div class="home-how-num">Step 03</div>
                            <h3 class="home-how-step-title">Run it smoothly</h3>
                            <p class="home-how-step-body">
                                Check guests in with a single scan, monitor live capacity, and close
                                the night with a complete picture of what happened.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 CREATOR SECTION
                 ══════════════════════════════════════ -->
            <section class="home-creator">
                <div class="home-shell">
                    <div class="home-creator-panel reveal">
                        <div class="home-creator-bg-text">Create</div>

                        <div class="home-creator-copy">
                            <div class="home-section-kicker">For creators</div>
                            <h2 class="home-creator-title">Your events.<em> Your data.</em> Your brand.</h2>
                            <p class="home-creator-body">
                                Eventful hands creators the complete toolkit — from polished event
                                pages and seamless ticket sales to real-time performance dashboards
                                that help you understand your audience like never before.
                            </p>
                            <ul class="home-creator-bullets">
                                <li class="home-creator-bullet">
                                    <span class="home-creator-bullet-dot"></span>
                                    Full event page editor with image, agenda, and ticket tiers
                                </li>
                                <li class="home-creator-bullet">
                                    <span class="home-creator-bullet-dot"></span>
                                    Live revenue and attendance tracking
                                </li>
                                <li class="home-creator-bullet">
                                    <span class="home-creator-bullet-dot"></span>
                                    Instant QR code check-in on event day
                                </li>
                                <li class="home-creator-bullet">
                                    <span class="home-creator-bullet-dot"></span>
                                    Automated notifications and reminders to attendees
                                </li>
                            </ul>
                            <button class="home-cta-primary" id="creatorCTABtn">
                                <span>Start creating</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                        </div>

                        <!-- Mini dashboard preview -->
                        <div class="home-creator-preview">
                            <div class="home-creator-preview-header">
                                <span class="home-creator-preview-title">Creator dashboard</span>
                                <span class="home-creator-preview-badge">
                                    <span class="live-dot" style="width:5px;height:5px;border-radius:50%;background:var(--home-accent);animation:pulse-accent 1.5s infinite;display:inline-block;"></span>
                                    Live
                                </span>
                            </div>

                            <div class="home-creator-stats-row">
                                <div class="home-creator-stat">
                                    <div class="home-creator-stat-val green">₦1.2M</div>
                                    <div class="home-creator-stat-key">Revenue</div>
                                </div>
                                <div class="home-creator-stat">
                                    <div class="home-creator-stat-val teal">284</div>
                                    <div class="home-creator-stat-key">Sold</div>
                                </div>
                                <div class="home-creator-stat">
                                    <div class="home-creator-stat-val">12</div>
                                    <div class="home-creator-stat-key">Events</div>
                                </div>
                            </div>

                            <div style="margin-top:16px;">
                                <div class="home-creator-bar-label">
                                    <span>Capacity</span>
                                    <span style="color:var(--home-accent);font-weight:700;">78%</span>
                                </div>
                                <div class="home-creator-bar">
                                    <div class="home-creator-bar-fill" data-width="78"></div>
                                </div>
                            </div>

                            <div style="margin-top:12px;">
                                <div class="home-creator-bar-label">
                                    <span>Ticket sales</span>
                                    <span style="color:var(--home-teal);font-weight:700;">91%</span>
                                </div>
                                <div class="home-creator-bar">
                                    <div class="home-creator-bar-fill" data-width="91" style="background:linear-gradient(90deg,var(--home-teal),var(--home-violet));"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 TESTIMONIALS
                 ══════════════════════════════════════ -->
            <section class="home-proof">
                <div class="home-shell">
                    <div class="home-section-head reveal">
                        <div class="home-section-kicker">What people say</div>
                        <h2 class="home-section-title">Creators and attendees<em> love it.</em></h2>
                    </div>

                    <div class="home-proof-grid">
                        <div class="home-testimonial reveal reveal-delay-1">
                            <div class="home-testimonial-quote">"</div>
                            <p class="home-testimonial-body">
                                We sold out a 400-person event in under 48 hours. The analytics
                                dashboard let us watch it happen in real time — absolutely incredible.
                            </p>
                            <div class="home-testimonial-author">
                                <div class="home-testimonial-avatar">AB</div>
                                <div>
                                    <div class="home-testimonial-name">Adaeze Bright</div>
                                    <div class="home-testimonial-role">Event Producer, Lagos</div>
                                </div>
                            </div>
                        </div>

                        <div class="home-testimonial reveal reveal-delay-2">
                            <div class="home-testimonial-quote">"</div>
                            <p class="home-testimonial-body">
                                The QR check-in alone saved us 45 minutes of chaos at the door.
                                The whole thing just worked. No drama, no spreadsheets, no stress.
                            </p>
                            <div class="home-testimonial-author">
                                <div class="home-testimonial-avatar">TK</div>
                                <div>
                                    <div class="home-testimonial-name">Tunde Kayode</div>
                                    <div class="home-testimonial-role">Tech Meetup Organiser</div>
                                </div>
                            </div>
                        </div>

                        <div class="home-testimonial reveal reveal-delay-3">
                            <div class="home-testimonial-quote">"</div>
                            <p class="home-testimonial-body">
                                I found three events I genuinely wanted to attend in my first five minutes.
                                The search and filters actually make sense — this is how it should work.
                            </p>
                            <div class="home-testimonial-author">
                                <div class="home-testimonial-avatar">SC</div>
                                <div>
                                    <div class="home-testimonial-name">Sola Coker</div>
                                    <div class="home-testimonial-role">Regular attendee, Abuja</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══════════════════════════════════════
                 FINAL CTA
                 ══════════════════════════════════════ -->
            <section class="home-cta-section">
                <div class="home-shell">
                    <div class="home-cta-panel reveal">
                        <h2 class="home-cta-panel-title">
                            Ready to build something<br><em>worth talking about?</em>
                        </h2>
                        <p class="home-cta-panel-sub">
                            Whether you're here to discover your next great night out or
                            create it — Eventful is the place to start.
                        </p>
                        <div class="home-cta-panel-actions">
                            <button class="home-cta-primary" id="finalCTABtn">
                                <span>Get started free</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                            <button class="home-cta-secondary" id="finalExpBtn">
                                Browse events
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    `;

    // ── Particles ──
    const particleContainer = document.getElementById("homeParticles")!;
    spawnParticles(particleContainer);

    // ── Scroll reveals & countups ──
    requestAnimationFrame(() => setupReveal());

    // ── Button wiring ──
    document.getElementById("heroCTABtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("heroCreateBtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("heroCardBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("seeAllBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("creatorCTABtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("finalCTABtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("finalExpBtn")?.addEventListener("click", () => navigate("/explore"));

    // Event card navigation
    document.querySelectorAll<HTMLElement>(".home-event-card").forEach((card) => {
        card.addEventListener("click", () => navigate("/explore"));
    });

    // Navbar scroll target buttons (home page sections referenced from navbar)
    document.querySelectorAll<HTMLElement>("[data-scroll-target]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.scrollTarget;
            if (!id) return;
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}