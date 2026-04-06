import { navigate } from "../../router";
import "./createLanding.css";

export function renderCreateLanding() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="create-landing">
            <div class="landing-noise"></div>
            <div class="landing-glow landing-glow-one"></div>
            <div class="landing-glow landing-glow-two"></div>

            <section class="creator-hero">
                <div class="creator-hero-copy">
                    <div class="creator-kicker">
                        <span class="kicker-dot"></span>
                        <span>Eventful for creators</span>
                    </div>

                    <h1 class="creator-title">
                        Build the kind of event page
                        <span>people want to buy from</span>
                    </h1>

                    <p class="creator-subtitle">
                        Launch polished event experiences with premium pages, fast checkout,
                        and the tools you need to manage turnout without the usual stress.
                    </p>

                    <div class="creator-actions">
                        <button class="primary-action" id="createEventBtn">
                            <span>Start creating</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>

                        <button class="secondary-action" id="exploreBtn">
                            <span>Explore events</span>
                        </button>
                    </div>

                    <div class="creator-pills">
                        <span>Beautiful event pages</span>
                        <span>Fast checkout flow</span>
                        <span>Real-time performance</span>
                    </div>

                    <div class="creator-stats">
                        <div class="creator-stat">
                            <div class="stat-number" data-target="12500">0</div>
                            <div class="stat-label">Events launched</div>
                        </div>
                        <div class="creator-stat">
                            <div class="stat-number" data-target="340000">0</div>
                            <div class="stat-label">Tickets sold</div>
                        </div>
                        <div class="creator-stat">
                            <div class="stat-number">4.9<span class="stat-small">/5</span></div>
                            <div class="stat-label">Creator rating</div>
                        </div>
                    </div>
                </div>

                <div class="creator-hero-visual">
                    <div class="visual-frame">
                        <div class="frame-topbar">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <div class="visual-poster">
                            <div class="poster-badge">Selling fast</div>
                            <div class="poster-copy">
                                <p class="poster-label">Live event page</p>
                                <h2>Moonlight Rooftop Series</h2>
                                <p>An elevated music night with limited seats, premium access, and seamless QR check-in.</p>
                            </div>
                        </div>

                        <div class="visual-lower">
                            <div class="visual-summary">
                                <div class="summary-row">
                                    <span>Revenue</span>
                                    <strong>NGN 8.4M</strong>
                                </div>
                                <div class="summary-row">
                                    <span>Tickets sold</span>
                                    <strong>1,284</strong>
                                </div>
                                <div class="summary-row">
                                    <span>Capacity</span>
                                    <strong>92%</strong>
                                </div>
                            </div>

                            <div class="visual-checklist">
                                <p>Launch checklist</p>
                                <div class="check-item complete">Branding locked in</div>
                                <div class="check-item complete">Tickets configured</div>
                                <div class="check-item">Campaign goes live at 6 PM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="creator-proof">
                <div class="proof-intro">
                    <span class="section-chip">Why creators choose Eventful</span>
                    <h2>Everything feels cleaner when the tools do less fighting back.</h2>
                    <p>Design-forward pages, practical controls, and a flow that helps you move from idea to launch without losing momentum.</p>
                </div>

                <div class="proof-grid">
                    <article class="feature-card card-1">
                        <div class="feature-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3>Fast setup that still feels premium</h3>
                        <p>Create an event page in minutes without ending up with something generic or rushed.</p>
                    </article>

                    <article class="feature-card card-2">
                        <div class="feature-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <h3>Live insights that stay easy to read</h3>
                        <p>Watch registrations, turnout, and revenue evolve in real time with a calmer dashboard experience.</p>
                    </article>

                    <article class="feature-card card-3">
                        <div class="feature-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3>Checkout that gets out of the way</h3>
                        <p>Give attendees a fast purchase flow that feels trustworthy on both mobile and desktop.</p>
                    </article>

                    <article class="feature-card card-4">
                        <div class="feature-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3>Better tools for event-day control</h3>
                        <p>From promotion to verification, keep the experience organized before the doors even open.</p>
                    </article>
                </div>
            </section>

            <section class="creator-flow">
                <div class="flow-panel">
                    <div class="flow-heading">
                        <span class="section-chip dark">Creator flow</span>
                        <h2>A launch journey that feels polished from start to finish.</h2>
                        <p>Instead of juggling scattered tools, shape the page, open sales, and run the day from one coordinated workflow.</p>
                    </div>

                    <div class="flow-track">
                        <article class="flow-step">
                            <div class="flow-step-top">
                                <span class="flow-step-number">01</span>
                                <span class="flow-step-tag">Design</span>
                            </div>
                            <h3>Shape the page</h3>
                            <p>Tell the story of the event with visuals, ticket tiers, schedule, and the details buyers actually care about.</p>
                        </article>

                        <article class="flow-step">
                            <div class="flow-step-top">
                                <span class="flow-step-number">02</span>
                                <span class="flow-step-tag">Launch</span>
                            </div>
                            <h3>Open registrations</h3>
                            <p>Publish confidently, collect payments quickly, and keep a close eye on traction without friction.</p>
                        </article>

                        <article class="flow-step">
                            <div class="flow-step-top">
                                <span class="flow-step-number">03</span>
                                <span class="flow-step-tag">Deliver</span>
                            </div>
                            <h3>Run the event smoothly</h3>
                            <p>Check guests in faster, confirm tickets instantly, and keep operations feeling composed on the day.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="creator-cta">
                <div class="creator-cta-panel">
                    <span class="section-chip light">Ready to launch</span>
                    <h2>Create something worth talking about.</h2>
                    <p>Bring your next event online with a page that looks polished, converts better, and stays manageable all the way through.</p>
                    <button class="primary-action light" id="createEventBtnBottom">
                        <span>Get started now</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    `;

    document.getElementById("createEventBtn")?.addEventListener("click", () => {
        navigate("/create/new");
    });

    document.getElementById("createEventBtnBottom")?.addEventListener("click", () => {
        navigate("/create/new");
    });

    document.getElementById("exploreBtn")?.addEventListener("click", () => {
        navigate("/explore");
    });

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.4 });

    const heroStats = document.querySelector(".creator-stats");
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    const cards = document.querySelectorAll(".feature-card");
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.2 });

    cards.forEach(card => cardObserver.observe(card));
}

function animateStats() {
    const statNumbers = document.querySelectorAll(".stat-number[data-target]");

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-target") || "0");
        const duration = 1800;
        const start = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);

            stat.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                stat.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(animate);
    });
}
