import { navigate } from "../../router";
import "./createLanding.css";

export function renderCreateLanding() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="cl-page">

            <!-- Ambient -->
            <div class="cl-ambient" aria-hidden="true">
                <div class="cl-orb cl-orb-1"></div>
                <div class="cl-orb cl-orb-2"></div>
            </div>

            <!-- ══ HERO ══ -->
            <section class="cl-hero">
                <div class="cl-shell">

                    <div class="cl-eyebrow">
                        <span class="cl-eyebrow-dot"></span>
                        <span>Eventful for creators</span>
                    </div>

                    <h1 class="cl-title">
                        <span class="cl-title-line cl-line-mask">
                            <span class="cl-line-inner">Your event.</span>
                        </span>
                        <span class="cl-title-line cl-line-mask">
                            <span class="cl-line-inner cl-line-accent">Your page.</span>
                        </span>
                        <span class="cl-title-line cl-line-mask">
                            <span class="cl-line-inner">Your crowd.</span>
                        </span>
                    </h1>

                    <p class="cl-sub">
                        Build a polished event page, open ticket sales, and manage
                        everything from one place — in minutes, not hours.
                    </p>

                    <div class="cl-actions">
                        <button class="cl-btn-primary" id="cl-start-btn">
                            <span>Start creating</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <button class="cl-btn-ghost" id="cl-explore-btn">
                            Browse events
                        </button>
                    </div>

                    <div class="cl-pills">
                        <span class="cl-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>
                            Ticket tiers
                        </span>
                        <span class="cl-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                            Live analytics
                        </span>
                        <span class="cl-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M20 6L9 17L4 12"/></svg>
                            QR check-in
                        </span>
                        <span class="cl-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Secure payments
                        </span>
                    </div>
                </div>

                <!-- Floating preview card -->
                <div class="cl-preview-wrap">
                    <div class="cl-preview-card">
                        <div class="cl-preview-header">
                            <div class="cl-preview-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <span class="cl-preview-badge">
                                <span class="cl-live-dot"></span>
                                Live preview
                            </span>
                        </div>

                        <div class="cl-preview-poster">
                            <div class="cl-poster-bg"></div>
                            <div class="cl-poster-overlay"></div>
                            <span class="cl-poster-tag">Selling fast</span>
                            <div class="cl-poster-copy">
                                <span class="cl-poster-label">Live event page</span>
                                <h3 class="cl-poster-title">Moonlight Rooftop Series</h3>
                                <p class="cl-poster-sub">Limited seats · Premium access · QR check-in</p>
                            </div>
                        </div>

                        <div class="cl-preview-stats">
                            <div class="cl-preview-stat">
                                <span class="cl-preview-stat-val cl-green">₦8.4M</span>
                                <span class="cl-preview-stat-key">Revenue</span>
                            </div>
                            <div class="cl-preview-stat-divider"></div>
                            <div class="cl-preview-stat">
                                <span class="cl-preview-stat-val cl-teal">1,284</span>
                                <span class="cl-preview-stat-key">Tickets</span>
                            </div>
                            <div class="cl-preview-stat-divider"></div>
                            <div class="cl-preview-stat">
                                <span class="cl-preview-stat-val">92%</span>
                                <span class="cl-preview-stat-key">Capacity</span>
                            </div>
                        </div>

                        <div class="cl-preview-bar-section">
                            <div class="cl-preview-bar-label">
                                <span>Capacity fill</span>
                                <span class="cl-green">92%</span>
                            </div>
                            <div class="cl-preview-bar-track">
                                <div class="cl-preview-bar-fill" id="cl-bar-fill"></div>
                            </div>
                        </div>

                        <div class="cl-preview-checklist">
                            <div class="cl-check-item cl-check-done">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17L4 12"/></svg>
                                Branding locked in
                            </div>
                            <div class="cl-check-item cl-check-done">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17L4 12"/></svg>
                                Tickets configured
                            </div>
                            <div class="cl-check-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                Campaign goes live at 6 PM
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══ HOW IT WORKS ══ -->
            <section class="cl-how">
                <div class="cl-shell cl-shell--full">
                    <div class="cl-how-steps">
                        <div class="cl-how-step cl-reveal">
                            <div class="cl-how-num">01</div>
                            <h3 class="cl-how-title">Build the page</h3>
                            <p class="cl-how-body">Add your visuals, ticket tiers, schedule, and all the details attendees actually care about.</p>
                        </div>
                        <div class="cl-how-connector" aria-hidden="true">→</div>
                        <div class="cl-how-step cl-reveal" style="transition-delay: 0.1s;">
                            <div class="cl-how-num">02</div>
                            <h3 class="cl-how-title">Open sales</h3>
                            <p class="cl-how-body">Publish, share the link, and watch registrations come in. Live tracking at every step.</p>
                        </div>
                        <div class="cl-how-connector" aria-hidden="true">→</div>
                        <div class="cl-how-step cl-reveal" style="transition-delay: 0.2s;">
                            <div class="cl-how-num">03</div>
                            <h3 class="cl-how-title">Run it smoothly</h3>
                            <p class="cl-how-body">Single-scan QR check-in, live capacity, and a full picture of the night when it's done.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ══ CTA ══ -->
            <section class="cl-cta">
                <div class="cl-shell">
                    <div class="cl-cta-panel cl-reveal">
                        <div class="cl-cta-glow" aria-hidden="true"></div>
                        <div class="cl-cta-bg-text" aria-hidden="true">Create</div>

                        <div class="cl-kicker">Ready when you are</div>
                        <h2 class="cl-cta-title">
                            Build something<br>
                            <em>worth talking about.</em>
                        </h2>
                        <p class="cl-cta-sub">
                            Free to start. Goes live in minutes.
                            No spreadsheets, no stress.
                        </p>
                        <button class="cl-btn-primary cl-btn-primary--lg" id="cl-cta-btn">
                            <span>Get started free</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    `;

    // ── Button wiring ──
    document.getElementById("cl-start-btn")?.addEventListener("click", () => navigate("/create/new"));
    document.getElementById("cl-cta-btn")?.addEventListener("click", () => navigate("/create/new"));
    document.getElementById("cl-explore-btn")?.addEventListener("click", () => navigate("/explore"));

    // ── Animate bar fill ──
    setTimeout(() => {
        const bar = document.getElementById("cl-bar-fill");
        if (bar) bar.style.width = "92%";
    }, 600);

    // ── Scroll reveal ──
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("cl-visible");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".cl-reveal").forEach(el => obs.observe(el));
}