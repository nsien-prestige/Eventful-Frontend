import { navigate } from "../../router";
import "./createLanding.css";

export function renderCreateLanding() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="create-landing">
            <!-- Animated Background -->
            <div class="bg-gradient"></div>
            <div class="bg-grid"></div>
            
            <!-- Hero Section -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="badge-dot"></span>
                        <span>Built for creators</span>
                    </div>
                    
                    <h1 class="hero-title">
                        Create events that
                        <span class="gradient-text">people remember</span>
                    </h1>
                    
                    <p class="hero-description">
                        From intimate gatherings to massive conferences. 
                        Launch in minutes, manage with ease, scale without limits.
                    </p>
                    
                    <div class="hero-actions">
                        <button class="cta-primary" id="createEventBtn">
                            <span>Start creating</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        
                        <button class="cta-secondary" id="exploreBtn">
                            <span>Explore events</span>
                        </button>
                    </div>
                    
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-number" data-target="12500">0</div>
                            <div class="stat-label">Events created</div>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <div class="stat-number" data-target="340000">0</div>
                            <div class="stat-label">Tickets sold</div>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <div class="stat-number">4.9<span class="stat-small">/5</span></div>
                            <div class="stat-label">Creator rating</div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Features Section -->
            <section class="features">
                <div class="features-grid">
                    <div class="feature-card card-1">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3>Lightning fast setup</h3>
                        <p>Create and publish professional events in under 5 minutes. No technical skills required.</p>
                    </div>
                    
                    <div class="feature-card card-2">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <h3>Real-time analytics</h3>
                        <p>Track sales, attendance, and engagement with live dashboards and instant notifications.</p>
                    </div>
                    
                    <div class="feature-card card-3">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3>Seamless payments</h3>
                        <p>Secure checkout with instant payouts. Support for multiple payment methods worldwide.</p>
                    </div>
                    
                    <div class="feature-card card-4">
                        <div class="feature-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <h3>Built-in promotion</h3>
                        <p>Reach thousands of potential attendees through our discovery platform and social sharing.</p>
                    </div>
                </div>
            </section>
            
            <!-- CTA Section -->
            <section class="bottom-cta">
                <div class="cta-content">
                    <h2>Ready to create something extraordinary?</h2>
                    <p>Join thousands of creators hosting unforgettable events</p>
                    <button class="cta-primary large" id="createEventBtnBottom">
                        <span>Get started now</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    `;

    // Event Listeners
    document.getElementById("createEventBtn")!.addEventListener("click", () => {
        navigate("/create/new");
    });

    document.getElementById("createEventBtnBottom")!.addEventListener("click", () => {
        navigate("/create/new");
    });

    document.getElementById("exploreBtn")!.addEventListener("click", () => {
        navigate("/explore");
    });

    // Animate stats on scroll
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector(".hero-stats");
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // Animate feature cards on scroll
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
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime: number) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
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