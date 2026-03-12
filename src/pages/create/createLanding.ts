import { navigate } from "../../router";
import "./createLanding.css";

export function renderCreateLanding() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="create-landing-wrapper">

            <section class="landing-hero">
                <h1>
                    Turn Ideas Into
                    <span class="gradient-text">Unforgettable Experiences</span>
                </h1>

                <p>
                    Host concerts, conferences, meetups, or private events.
                    We give you the tools. You create the magic.
                </p>

                <button class="hero-cta" id="go-to-form">
                    Start Creating →
                </button>
            </section>

            <section class="why-host">
                <div class="why-card">
                    <h3>⚡ Instant Setup</h3>
                    <p>Create and launch events in minutes, not hours.</p>
                </div>

                <div class="why-card">
                    <h3>📊 Real-Time Insights</h3>
                    <p>Track attendance and engagement effortlessly.</p>
                </div>

                <div class="why-card">
                    <h3>💳 Seamless Payments</h3>
                    <p>Secure and smooth ticket transactions.</p>
                </div>
            </section>

            <section class="stats" id="stats">
                <div class="stat">
                    <h2 data-target="10000">0</h2>
                    <p>Events Hosted</p>
                </div>

                <div class="stat">
                    <h2 data-target="250000">0</h2>
                    <p>Tickets Sold</p>
                </div>

                <div class="stat">
                    <h2 data-target="99">0</h2>
                    <p>Platform Satisfaction (%)</p>
                </div>
            </section>

        </div>
    `;

    document.getElementById("go-to-form")!
        .addEventListener("click", () => {
            navigate("/create/new");
        });

    const statsSection = document.getElementById("stats");

    if (statsSection) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll("[data-target]");

    counters.forEach(counter => {
        const el = counter as HTMLElement;
        const target = Number(el.getAttribute("data-target"));
        const duration = 1500;
        const start = performance.now();

        const update = (timestamp: number) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const current = Math.floor(progress * target);

            el.innerText = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    });
}