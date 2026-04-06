import "./dashboard.css";
import { getMyEvents } from "../../api/my-events.api";
import { getEventAnalytics } from "../../api/analytics.api";
import { navigate } from "../../router";
import { getToken, getCurrentUserProfile } from "../../utils/auth";

function formatCurrency(value: number) {
    return `₦${value.toLocaleString()}`;
}

function formatDate(dateValue: string) {
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function renderActionIcon(kind: "browse" | "tickets" | "create" | "analytics") {
    const icons = {
        browse: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/>
                <path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
        tickets: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M9 8v8M15 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
        create: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
        analytics: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 19V9M12 19V5M19 19v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
    };

    return icons[kind];
}

function renderCalendarIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
    `;
}

function renderTicketIcon() {
    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M9 8v8M15 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
    `;
}

export async function renderDashboard() {
    const app = document.getElementById("app")!;
    const token = getToken();

    if (!token) {
        navigate("/login");
        return;
    }

    const profile = getCurrentUserProfile();
    const firstName = profile?.displayName?.split(" ")[0] || "Creator";

    app.innerHTML = `
        <div class="dashboard-page">
            <div class="dashboard-shell">
                <section class="dashboard-hero">
                    <span class="dashboard-kicker">Creator workspace</span>
                    <h1>${firstName}, here’s your event pulse.</h1>
                    <p>Track launches, monitor sales, and move quickly between the parts of Eventful that matter most.</p>
                </section>

                <section class="dashboard-stats-grid" id="dashboardStatsGrid">
                    <div class="dashboard-stat-card ticket"><span>Live tickets</span><b>0</b></div>
                    <div class="dashboard-stat-card upcoming"><span>Scheduled</span><b>0</b></div>
                    <div class="dashboard-stat-card attended"><span>Attendance</span><b>0</b></div>
                    <div class="dashboard-stat-card created"><span>Published</span><b>0</b></div>
                    <div class="dashboard-stat-card revenue"><span>Earnings</span><b>₦0</b></div>
                </section>

                <section class="dashboard-action-row">
                    <button class="dashboard-action-btn" type="button" id="dashboardBrowseBtn">
                        ${renderActionIcon("browse")}
                        <span>Discover</span>
                    </button>
                    <button class="dashboard-action-btn" type="button" id="dashboardTicketsBtn">
                        ${renderActionIcon("tickets")}
                        <span>Orders</span>
                    </button>
                    <button class="dashboard-action-btn" type="button" id="dashboardCreateBtn">
                        ${renderActionIcon("create")}
                        <span>Launch event</span>
                    </button>
                    <button class="dashboard-action-btn" type="button" id="dashboardAnalyticsBtn">
                        ${renderActionIcon("analytics")}
                        <span>Insights</span>
                    </button>
                </section>

                <section class="dashboard-section">
                    <div class="dashboard-section-head">
                        <h2>Coming up</h2>
                    </div>
                    <div class="dashboard-panel dashboard-upcoming-panel" id="dashboardUpcomingPanel">
                        <div class="dashboard-empty-inline">Loading...</div>
                    </div>
                </section>

                <section class="dashboard-section">
                    <div class="dashboard-section-head">
                        <h2>Recent activity</h2>
                        <button class="dashboard-section-link" type="button" id="dashboardNotificationsViewBtn">Open feed →</button>
                    </div>
                    <div class="dashboard-notification-list" id="dashboardNotificationsList">
                        <div class="dashboard-panel dashboard-notification-item">
                            <div class="dashboard-notification-copy">
                                <strong>Loading...</strong>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    setupDashboardActions();

    try {
        const events = await getMyEvents(token);
        const enrichedEvents = await Promise.all(
            events.map(async (event: any) => {
                try {
                    const analytics = await getEventAnalytics(token, event.id);
                    return { ...event, analytics };
                } catch {
                    return { ...event, analytics: null };
                }
            })
        );

        renderDashboardStats(enrichedEvents);
        renderUpcomingPanel(enrichedEvents);
        renderNotifications(enrichedEvents);
    } catch {
        renderUpcomingPanel([]);
        renderNotifications([]);
    }
}

function renderDashboardStats(events: any[]) {
    const statsGrid = document.getElementById("dashboardStatsGrid");
    if (!statsGrid) return;

    const totalTickets = events.reduce((sum, event) => sum + (event.analytics?.ticketsSold || 0), 0);
    const upcomingEvents = events.filter((event) => new Date(event.date).getTime() >= Date.now()).length;
    const createdEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + (event.analytics?.revenue || 0), 0);

    statsGrid.innerHTML = `
        <div class="dashboard-stat-card ticket">
            <span>Live tickets</span>
            <b>${totalTickets.toLocaleString()}</b>
        </div>
        <div class="dashboard-stat-card upcoming">
            <span>Scheduled</span>
            <b>${upcomingEvents.toLocaleString()}</b>
        </div>
        <div class="dashboard-stat-card attended">
            <span>Attendance</span>
            <b>0</b>
        </div>
        <div class="dashboard-stat-card created">
            <span>Published</span>
            <b>${createdEvents.toLocaleString()}</b>
        </div>
        <div class="dashboard-stat-card revenue">
            <span>Earnings</span>
            <b>${formatCurrency(totalRevenue)}</b>
        </div>
    `;
}

function renderUpcomingPanel(events: any[]) {
    const upcomingPanel = document.getElementById("dashboardUpcomingPanel");
    if (!upcomingPanel) return;

    const upcomingEvents = [...events]
        .filter((event) => new Date(event.date).getTime() >= Date.now())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingEvents.length === 0) {
        upcomingPanel.innerHTML = `
            ${renderCalendarIcon()}
            <div class="dashboard-upcoming-title">Nothing scheduled yet</div>
            <div class="dashboard-upcoming-copy">Your next event will show up here once it has a date locked in.</div>
            <button class="dashboard-upcoming-cta" type="button" id="dashboardBrowseEmptyBtn">Explore events</button>
        `;

        document.getElementById("dashboardBrowseEmptyBtn")?.addEventListener("click", () => navigate("/explore"));
        return;
    }

    const firstUpcoming = upcomingEvents[0];

    upcomingPanel.innerHTML = `
        ${renderCalendarIcon()}
        <div class="dashboard-upcoming-title">${firstUpcoming.title}</div>
        <div class="dashboard-upcoming-copy">${formatDate(firstUpcoming.date)}</div>
        <button class="dashboard-upcoming-cta" type="button" id="dashboardUpcomingOpenBtn">Open event</button>
    `;

    document.getElementById("dashboardUpcomingOpenBtn")?.addEventListener("click", () => {
        navigate(`/event/${firstUpcoming.publicId || firstUpcoming.id}`);
    });
}

function renderNotifications(events: any[]) {
    const notificationsList = document.getElementById("dashboardNotificationsList");
    if (!notificationsList) return;

    if (events.length === 0) {
        notificationsList.innerHTML = `
            <div class="dashboard-panel dashboard-notification-item">
                <div class="dashboard-notification-icon">${renderTicketIcon()}</div>
                <div class="dashboard-notification-copy">
                    <strong>No activity yet</strong>
                    <span>New bookings and event updates will appear here.</span>
                </div>
            </div>
        `;
        return;
    }

    const latest = [...events]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    notificationsList.innerHTML = latest.map((event) => `
        <div class="dashboard-panel dashboard-notification-item">
            <div class="dashboard-notification-icon">${renderTicketIcon()}</div>
            <div class="dashboard-notification-copy">
                <strong>${event.title} is in your creator feed</strong>
                <span>${formatDate(event.date)}</span>
            </div>
        </div>
    `).join("");
}

function setupDashboardActions() {
    document.getElementById("dashboardBrowseBtn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("dashboardTicketsBtn")?.addEventListener("click", () => navigate("/tickets"));
    document.getElementById("dashboardCreateBtn")?.addEventListener("click", () => navigate("/create/new"));
    document.getElementById("dashboardAnalyticsBtn")?.addEventListener("click", () => navigate("/my-events"));
    document.getElementById("dashboardNotificationsViewBtn")?.addEventListener("click", () => navigate("/my-events"));
}
