import "./home.css";
import { navigate } from "../../router";

function renderShareIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 14.5v4a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

function renderArrowIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

export function renderHomePage() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="home-page">
            <div class="home-noise"></div>
            <div class="home-orb orb-one"></div>
            <div class="home-orb orb-two"></div>
            <div class="home-orb orb-three"></div>
            <div class="home-grid"></div>

            <section class="home-hero" id="home-top">
                <div class="hero-shell">
                    <div class="hero-copy reveal">
                        <div class="eyebrow-chip">
                            <span class="eyebrow-dot"></span>
                            <span>Eventful for modern gatherings</span>
                        </div>

                        <p class="hero-lead-label">Discover. Host. Fill the room.</p>

                        <h1>
                            Event pages with
                            <span>presence, pace, and a reason to buy now.</span>
                        </h1>

                        <p class="hero-description">
                            Eventful gives creators a bolder way to launch and gives attendees a smoother way to discover what deserves their evening.
                        </p>

                        <div class="hero-actions">
                            <button class="hero-primary" id="getStartedBtn">
                                <span>Create an event</span>
                                ${renderArrowIcon()}
                            </button>
                            <button class="hero-secondary" id="exploreBtn">
                                <span>Explore events</span>
                            </button>
                        </div>

                        <div class="hero-inline-proof">
                            <span>Curated discovery</span>
                            <span>Faster checkout</span>
                            <span>Verified entry</span>
                        </div>
                    </div>

                    <div class="hero-stage reveal delay-2">
                        <article class="hero-poster-card poster-main">
                            <div class="poster-image poster-one"></div>
                            <div class="poster-content">
                                <span class="poster-tag">Editor’s selection</span>
                                <h2>After Dark on the Marina</h2>
                                <p>A sharper event page, cleaner social proof, and the kind of atmosphere people screenshot before they even arrive.</p>
                                <div class="poster-meta">
                                    <span>Friday · 8 PM</span>
                                    <span>Victoria Island</span>
                                </div>
                            </div>
                        </article>

                        <article class="hero-poster-card poster-side attendance-card">
                            <span class="mini-chip">Momentum</span>
                            <strong>92%</strong>
                            <p>Capacity already claimed for tonight’s featured experience.</p>
                        </article>

                        <article class="hero-poster-card poster-side volume-card">
                            <span class="mini-chip">Live usage</span>
                            <strong>340k+</strong>
                            <p>Tickets already explored, saved, and booked through Eventful’s flow.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="home-marquee-strip reveal delay-3" aria-label="Eventful capabilities">
                <div class="marquee-track">
                    <span>Premium event pages</span>
                    <span>Live ticket drops</span>
                    <span>Fast discovery flow</span>
                    <span>Creator analytics</span>
                    <span>QR-based entry</span>
                    <span>Reminder-friendly booking</span>
                    <span>Premium event pages</span>
                    <span>Live ticket drops</span>
                    <span>Fast discovery flow</span>
                    <span>Creator analytics</span>
                    <span>QR-based entry</span>
                    <span>Reminder-friendly booking</span>
                </div>
            </section>

            <section class="home-manifesto" id="home-features">
                <div class="section-shell">
                    <div class="section-heading reveal">
                        <span class="section-chip">What makes it different</span>
                        <h2>Not another beige ticket page. Not another cluttered event directory.</h2>
                    </div>

                    <div class="manifesto-grid">
                        <article class="manifesto-card reveal">
                            <span class="manifesto-kicker">For attendees</span>
                            <h3>Discovery should feel like curation, not admin.</h3>
                            <p>Surface events with stronger visual identity, clearer timing, and fewer dead-end clicks between curiosity and checkout.</p>
                        </article>

                        <article class="manifesto-card feature-tall reveal delay-2">
                            <span class="manifesto-kicker">For creators</span>
                            <h3>Launch pages that feel intentional before the crowd even shows up.</h3>
                            <p>Better storytelling, better perception, and a calmer operations flow after tickets go live.</p>
                            <ul class="manifesto-points">
                                <li>Distinct ticket tiers and live availability</li>
                                <li>Structured agenda and polished media blocks</li>
                                <li>Cleaner actions for saving, sharing, and reminders</li>
                            </ul>
                        </article>

                        <article class="manifesto-card accent reveal delay-3">
                            <span class="manifesto-kicker">What people remember</span>
                            <h3>The page looked good enough to trust instantly.</h3>
                            <p>That first impression matters. Eventful turns event discovery into something more magnetic and event creation into something more premium.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="home-showcase" id="home-discover">
                <div class="section-shell showcase-shell">
                    <div class="showcase-heading reveal">
                        <span class="section-chip">Featured events</span>
                        <h2>The kind of events people stop scrolling for.</h2>
                        <button class="section-link" id="viewAllBtn">View all events</button>
                    </div>

                    <div class="curated-grid">
                        <article class="curated-event reveal">
                            <div class="curated-media media-one">
                                <button class="share-event-btn" type="button" aria-label="Share Lagos Jazz Festival 2026" data-share-url="/events/lagos-jazz-festival-2026">
                                    ${renderShareIcon()}
                                </button>
                                <span class="curated-category">Music</span>
                            </div>
                            <div class="curated-copy">
                                <h3>Lagos Jazz Festival 2026</h3>
                                <p>Live brass, warmer lighting, and a booking flow that feels as smooth as the lineup.</p>
                                <div class="curated-meta">
                                    <span>March 22, 2026</span>
                                    <span>Terra Kulture</span>
                                </div>
                                <div class="curated-footer">
                                    <strong>NGN 5,000</strong>
                                    <span>234 of 500 spots</span>
                                </div>
                            </div>
                        </article>

                        <article class="curated-event reveal delay-2">
                            <div class="curated-media media-two">
                                <button class="share-event-btn" type="button" aria-label="Share Tech Founders Meetup" data-share-url="/events/tech-founders-meetup">
                                    ${renderShareIcon()}
                                </button>
                                <span class="curated-category">Technology</span>
                            </div>
                            <div class="curated-copy">
                                <h3>Tech Founders Meetup</h3>
                                <p>For builders, operators, and product minds who want something more considered than another noisy meetup listing.</p>
                                <div class="curated-meta">
                                    <span>March 18, 2026</span>
                                    <span>CcHub, Yaba</span>
                                </div>
                                <div class="curated-footer">
                                    <strong>Free</strong>
                                    <span>89 of 150 spots</span>
                                </div>
                            </div>
                        </article>

                        <article class="curated-event reveal delay-3">
                            <div class="curated-media media-three">
                                <button class="share-event-btn" type="button" aria-label="Share Nigerian Food Festival" data-share-url="/events/nigerian-food-festival">
                                    ${renderShareIcon()}
                                </button>
                                <span class="curated-category">Food & drink</span>
                            </div>
                            <div class="curated-copy">
                                <h3>Nigerian Food Festival</h3>
                                <p>Rich textures, memorable flavors, and a sharper way to bring cultural events online.</p>
                                <div class="curated-meta">
                                    <span>March 25, 2026</span>
                                    <span>Eko Convention Centre</span>
                                </div>
                                <div class="curated-footer">
                                    <strong>NGN 3,500</strong>
                                    <span>412 of 600 spots</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section class="home-structure" id="home-how">
                <div class="section-shell structure-shell">
                    <div class="structure-copy reveal">
                        <span class="section-chip">How it works</span>
                        <h2>A cleaner sequence from launch to full room.</h2>
                    </div>

                    <div class="structure-track">
                        <article class="track-card reveal">
                            <span class="track-number">01</span>
                            <h3>Shape the page</h3>
                            <p>Upload visuals, set the tone, define the experience, and make the event feel real before anyone arrives.</p>
                        </article>

                        <article class="track-card reveal delay-2">
                            <span class="track-number">02</span>
                            <h3>Open ticket sales</h3>
                            <p>Launch with clearer ticket options, faster actions, and less clutter between interest and commitment.</p>
                        </article>

                        <article class="track-card reveal delay-3">
                            <span class="track-number">03</span>
                            <h3>Run it beautifully</h3>
                            <p>Use reminders, sharing, discovery, and event-day verification to keep momentum high and friction low.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="home-cta" id="home-start">
                <div class="section-shell">
                    <div class="cta-panel reveal">
                        <span class="section-chip inverse">Start here</span>
                        <h2>Bring your next event online with more mood, more clarity, and more pull.</h2>
                        <p>Eventful is for creators who want their event page to feel considered and for attendees who want something better than noise.</p>
                        <div class="cta-actions">
                            <button class="hero-primary light" id="ctaBtn">
                                <span>Create an event</span>
                                ${renderArrowIcon()}
                            </button>
                            <button class="hero-secondary light" id="ctaExploreBtn">
                                <span>View events</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    document.getElementById("getStartedBtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("exploreBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("ctaBtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("ctaExploreBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("viewAllBtn")?.addEventListener("click", () => navigate("/explore"));

    document.querySelectorAll<HTMLButtonElement>(".share-event-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const sharePath = button.dataset.shareUrl;
            if (!sharePath) return;

            const shareUrl = new URL(sharePath, window.location.origin).toString();

            try {
                if (navigator.share) {
                    await navigator.share({
                        title: "Eventful event",
                        url: shareUrl,
                    });
                } else {
                    await navigator.clipboard.writeText(shareUrl);
                    const originalLabel = button.innerHTML;
                    button.textContent = "Copied";
                    window.setTimeout(() => {
                        button.innerHTML = originalLabel;
                    }, 1400);
                }
            } catch {
                // Ignore cancelled shares and clipboard failures silently.
            }
        });
    });
}
