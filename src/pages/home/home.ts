import "./home.css";
import { navigate } from "../../router";

export function renderHomePage() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="home-page">
            <!-- HERO SECTION -->
            <section class="hero-section">
                <div class="hero-container">
                    <h1>Everything you need to run events</h1>
                    <p>A complete toolkit for event creators and attendees, built with modern tools that just work.</p>
                    <div class="hero-actions">
                        <button class="btn-primary" id="getStartedBtn">Get started</button>
                        <button class="btn-secondary" id="exploreBtn">Explore events</button>
                    </div>
                </div>
            </section>

            <!-- FEATURES SECTION -->
            <section class="features-section">
                <div class="features-container">
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon teal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                                </svg>
                            </div>
                            <h3>QR Code Tickets</h3>
                            <p>Unique QR codes for seamless, fraud-proof check-in at every event.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <h3>Secure Payments</h3>
                            <p>Integrated with Paystack for safe, instant payment processing.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon purple">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                                </svg>
                            </div>
                            <h3>Analytics & Charts</h3>
                            <p>Interactive charts for revenue, tickets, and attendee insights.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon red">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </div>
                            <h3>Ticket Verification</h3>
                            <p>Scan and verify tickets instantly at the door. No fakes.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon cyan">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                            <h3>Search & Filters</h3>
                            <p>Find events by keyword, category, date range, and price.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon amber">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                            </div>
                            <h3>Bookmark Events</h3>
                            <p>Save events you love and come back to them anytime.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon orange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <h3>Waitlist System</h3>
                            <p>Join the waitlist for sold-out events and get notified instantly when a spot opens up.</p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon yellow">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </div>
                            <h3>Smart Reminders</h3>
                            <p>Set reminders for upcoming events so you never miss a moment.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- EVENTS SECTION -->
            <section class="events-section">
                <div class="events-container">
                    <div class="section-header">
                        <h2>Upcoming events</h2>
                        <button class="btn-text" id="viewAllBtn">View all →</button>
                    </div>
                    <div class="events-grid">
                        <div class="event-card">
                            <div class="event-image">
                                <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop" alt="Music event" />
                                <span class="event-category">Music</span>
                            </div>
                            <div class="event-content">
                                <h3>Lagos Jazz Festival 2026</h3>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>Mar 22, 2026</span>
                                </div>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>Terra Kulture, Victoria Island</span>
                                </div>
                                <div class="event-footer">
                                    <span class="event-price">NGN 5,000</span>
                                    <span class="event-spots">234/500 spots</span>
                                </div>
                            </div>
                        </div>

                        <div class="event-card">
                            <div class="event-image">
                                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop" alt="Tech event" />
                                <span class="event-category">Technology</span>
                            </div>
                            <div class="event-content">
                                <h3>Tech Founders Meetup</h3>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>Mar 18, 2026</span>
                                </div>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>CcHub, Yaba, Lagos</span>
                                </div>
                                <div class="event-footer">
                                    <span class="event-price">Free</span>
                                    <span class="event-spots">89/150 spots</span>
                                </div>
                            </div>
                        </div>

                        <div class="event-card">
                            <div class="event-image">
                                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop" alt="Food event" />
                                <span class="event-category">Food & Drink</span>
                            </div>
                            <div class="event-content">
                                <h3>Nigerian Food Festival</h3>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>Mar 25, 2026</span>
                                </div>
                                <div class="event-detail">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>Eko Convention Centre</span>
                                </div>
                                <div class="event-footer">
                                    <span class="event-price">NGN 3,500</span>
                                    <span class="event-spots">412/600 spots</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- HOW IT WORKS -->
            <section class="how-section">
                <div class="how-container">
                    <h2>How it works</h2>
                    <div class="how-grid">
                        <div class="how-card">
                            <div class="how-number">1</div>
                            <h3>Create your event</h3>
                            <p>Set up your event page with all the details in minutes. Add images, pricing, and schedule.</p>
                        </div>
                        <div class="how-card">
                            <div class="how-number">2</div>
                            <h3>Sell tickets</h3>
                            <p>Share your event and start selling. Track sales in real-time from your dashboard.</p>
                        </div>
                        <div class="how-card">
                            <div class="how-number">3</div>
                            <h3>Host your event</h3>
                            <p>Check in attendees with QR codes and manage everything seamlessly.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA SECTION -->
            <section class="cta-section">
                <div class="cta-container">
                    <h2>Ready to get started?</h2>
                    <p>Create your first event in minutes.</p>
                    <button class="btn-primary" id="ctaBtn">Create an event</button>
                </div>
            </section>

            <!-- FOOTER -->
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <h4>Product</h4>
                            <a href="/explore">Browse Events</a>
                            <a href="/create">Create Event</a>
                            <a href="#">Pricing</a>
                        </div>
                        <div class="footer-col">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div class="footer-col">
                            <h4>Resources</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Contact</a>
                            <a href="#">Community</a>
                        </div>
                        <div class="footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Security</a>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>© ${new Date().getFullYear()} Eventful. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    `;

    // Setup event listeners
    document.getElementById("getStartedBtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("exploreBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("ctaBtn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("viewAllBtn")?.addEventListener("click", () => navigate("/explore"));
}