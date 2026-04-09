import "./dashboard.css";
import { navigate } from "../../router";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ─────────────────────────────────────────────────────────────
// API LAYER
// ─────────────────────────────────────────────────────────────
const BASE = "http://localhost:4000";

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token") || "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function fetchCreatorOverview() {
    const res = await fetch(`${BASE}/analytics/creator/overview`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch overview");
    return res.json();
}

async function fetchEventAnalytics(eventId: string) {
    const res = await fetch(`${BASE}/analytics/event/${eventId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch event analytics");
    return res.json();
}

async function fetchMyEvents() {
    const res = await fetch(`${BASE}/events/my-events`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
}

async function deleteEvent(eventId: string) {
    const res = await fetch(`${BASE}/events/${eventId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete event");
    return res.json();
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Overview {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendees: number;
}

interface EventAnalytics {
    eventId: string;
    ticketsSold: number;
    successfulPayments: number;
    failedPayments: number;
    revenue: number;
    attendees: number;
    scannedCount: number;
}

interface MyEvent {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
    ticketPrice: number;
    totalTickets: number;
    status: string;
    imageUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let _events: MyEvent[] = [];
let _overview: Overview | null = null;
let _barChart: Chart | null = null;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function fmt(n: number): string {
    if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return "₦" + (n / 1_000).toFixed(1) + "k";
    return "₦" + n.toLocaleString();
}

function fmtNum(n: number): string {
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toLocaleString();
}

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return dateStr;
    }
}

function statusBadge(status: string): string {
    const map: Record<string, string> = {
        published: "db-badge db-badge--green",
        draft: "db-badge db-badge--dim",
        cancelled: "db-badge db-badge--red",
        ended: "db-badge db-badge--amber",
    };
    return `<span class="${map[status?.toLowerCase()] || "db-badge db-badge--dim"}">${status || "Draft"}</span>`;
}

function categoryIcon(cat: string): string {
    const map: Record<string, string> = {
        Music: "🎵", Technology: "💻", "Food & Drink": "🍽",
        Fashion: "👗", Business: "💼", Comedy: "😂",
        Sports: "⚽", Art: "🎨", Education: "📚",
    };
    return map[cat] || "🎪";
}

// ─────────────────────────────────────────────────────────────
// COUNTUP ANIMATION
// ─────────────────────────────────────────────────────────────
function animateValue(el: HTMLElement, target: number, prefix = "", suffix = "", decimals = 0) {
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = ease * target;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADING
// ─────────────────────────────────────────────────────────────
function skeletonCard(): string {
    return `<div class="db-skel-card"><div class="db-skel-line db-skel-line--short"></div><div class="db-skel-line db-skel-line--tall"></div><div class="db-skel-line db-skel-line--mid"></div></div>`;
}

// ─────────────────────────────────────────────────────────────
// RENDER OVERVIEW CARDS
// ─────────────────────────────────────────────────────────────
function renderOverview(data: Overview) {
    const cards = [
        {
            id: "db-stat-revenue",
            label: "Total Revenue",
            value: data.totalRevenue,
            display: fmt(data.totalRevenue),
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round"/></svg>`,
            color: "accent",
            sub: "from successful payments",
        },
        {
            id: "db-stat-tickets",
            label: "Tickets Sold",
            value: data.totalTicketsSold,
            display: fmtNum(data.totalTicketsSold),
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>`,
            color: "teal",
            sub: "across all your events",
        },
        {
            id: "db-stat-attendees",
            label: "Total Attendees",
            value: data.totalAttendees,
            display: fmtNum(data.totalAttendees),
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            color: "violet",
            sub: "registered attendees",
        },
        {
            id: "db-stat-events",
            label: "Active Events",
            value: data.totalEvents,
            display: String(data.totalEvents),
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>`,
            color: "warm",
            sub: "events created so far",
        },
    ];

    const grid = document.getElementById("db-overview-grid")!;
    grid.innerHTML = cards.map(c => `
        <div class="db-stat-card db-stat-card--${c.color}">
            <div class="db-stat-card-top">
                <div class="db-stat-icon db-stat-icon--${c.color}">${c.icon}</div>
                <span class="db-stat-label">${c.label}</span>
            </div>
            <div class="db-stat-val" id="${c.id}">0</div>
            <div class="db-stat-sub">${c.sub}</div>
        </div>
    `).join("");

    // Animate each stat
    cards.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el) return;
        const isRevenue = c.color === "accent";
        if (isRevenue) {
            // Revenue — just set directly (fmt handles it)
            animateValue(el, data.totalRevenue, "₦", "", 0);
            // Override with formatted version after anim
            setTimeout(() => { el.textContent = fmt(data.totalRevenue); }, 1700);
        } else {
            animateValue(el, c.value, "", "", 0);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// RENDER EVENTS TABLE
// ─────────────────────────────────────────────────────────────
function renderEventsTable(events: MyEvent[]) {
    const container = document.getElementById("db-events-body")!;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="db-empty">
                <div class="db-empty-icon">🎪</div>
                <h3 class="db-empty-title">No events yet</h3>
                <p class="db-empty-sub">Create your first event and it'll appear here.</p>
                <button class="db-btn-primary" id="db-empty-create">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create event
                </button>
            </div>`;
        document.getElementById("db-empty-create")?.addEventListener("click", () => navigate("/create"));
        return;
    }

    container.innerHTML = events.map(ev => `
        <div class="db-event-row" data-id="${ev.id}">
            <div class="db-event-row-main">
                <div class="db-event-row-icon">${categoryIcon(ev.category)}</div>
                <div class="db-event-row-info">
                    <div class="db-event-row-title">${ev.title}</div>
                    <div class="db-event-row-meta">
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${formatDate(ev.date)}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${ev.location}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>
                            ${ev.ticketPrice > 0 ? fmt(ev.ticketPrice) : "Free"}
                        </span>
                    </div>
                </div>
                <div class="db-event-row-right">
                    ${statusBadge(ev.status)}
                    <div class="db-event-row-actions">
                        <button class="db-row-btn db-row-btn--analytics" data-id="${ev.id}" title="View analytics">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                        </button>
                        <button class="db-row-btn db-row-btn--edit" data-id="${ev.id}" title="Edit event">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="db-row-btn db-row-btn--delete" data-id="${ev.id}" title="Delete event">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Expandable analytics panel -->
            <div class="db-event-analytics-panel" id="db-panel-${ev.id}">
                <div class="db-panel-loading">
                    <div class="db-spinner"></div>
                    <span>Loading analytics…</span>
                </div>
            </div>
        </div>
    `).join("");

    // Wire analytics buttons
    container.querySelectorAll<HTMLButtonElement>(".db-row-btn--analytics").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.id!;
            toggleAnalyticsPanel(id);
        });
    });

    // Wire edit buttons
    container.querySelectorAll<HTMLButtonElement>(".db-row-btn--edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigate(`/edit-event/${btn.dataset.id}`);
        });
    });

    // Wire delete buttons
    container.querySelectorAll<HTMLButtonElement>(".db-row-btn--delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            confirmDelete(btn.dataset.id!);
        });
    });
}

// ─────────────────────────────────────────────────────────────
// TOGGLE ANALYTICS PANEL
// ─────────────────────────────────────────────────────────────
async function toggleAnalyticsPanel(eventId: string) {
    const panel = document.getElementById(`db-panel-${eventId}`);
    if (!panel) return;

    const isOpen = panel.classList.contains("db-panel--open");

    // Close all panels first
    document.querySelectorAll(".db-event-analytics-panel").forEach(p => {
        p.classList.remove("db-panel--open");
    });
    document.querySelectorAll(".db-row-btn--analytics").forEach(b => {
        b.classList.remove("db-row-btn--active");
    });

    if (isOpen) return; // was already open — just close

    // Mark active
    panel.classList.add("db-panel--open");
    document.querySelector<HTMLButtonElement>(`.db-row-btn--analytics[data-id="${eventId}"]`)
        ?.classList.add("db-row-btn--active");

    // Already loaded?
    if (panel.dataset.loaded === "true") return;

    // Fetch
    try {
        const data: EventAnalytics = await fetchEventAnalytics(eventId);
        panel.dataset.loaded = "true";
        renderAnalyticsPanel(panel, data);
    } catch {
        panel.innerHTML = `<div class="db-panel-error">Failed to load analytics for this event.</div>`;
    }
}

// ─────────────────────────────────────────────────────────────
// RENDER ANALYTICS PANEL
// ─────────────────────────────────────────────────────────────
function renderAnalyticsPanel(panel: HTMLElement, data: EventAnalytics) {
    const checkInRate = data.attendees > 0
        ? Math.round((data.scannedCount / data.attendees) * 100)
        : 0;

    const successRate = (data.successfulPayments + data.failedPayments) > 0
        ? Math.round((data.successfulPayments / (data.successfulPayments + data.failedPayments)) * 100)
        : 0;

    const canvasId = `db-donut-${data.eventId}`;

    panel.innerHTML = `
        <div class="db-panel-inner">
            <div class="db-panel-stats">
                <div class="db-panel-stat">
                    <div class="db-panel-stat-val db-color-accent">${fmt(data.revenue)}</div>
                    <div class="db-panel-stat-key">Revenue</div>
                </div>
                <div class="db-panel-stat">
                    <div class="db-panel-stat-val db-color-teal">${data.ticketsSold}</div>
                    <div class="db-panel-stat-key">Tickets sold</div>
                </div>
                <div class="db-panel-stat">
                    <div class="db-panel-stat-val db-color-violet">${data.attendees}</div>
                    <div class="db-panel-stat-key">Attendees</div>
                </div>
                <div class="db-panel-stat">
                    <div class="db-panel-stat-val db-color-warm">${data.scannedCount}</div>
                    <div class="db-panel-stat-key">Checked in</div>
                </div>
            </div>

            <div class="db-panel-charts">
                <!-- Donut: payment success/fail -->
                <div class="db-panel-chart-card">
                    <div class="db-panel-chart-label">Payment breakdown</div>
                    <div class="db-donut-wrap">
                        <canvas id="${canvasId}" width="160" height="160"></canvas>
                        <div class="db-donut-center">
                            <div class="db-donut-pct">${successRate}%</div>
                            <div class="db-donut-sub">success</div>
                        </div>
                    </div>
                    <div class="db-donut-legend">
                        <span class="db-legend-item db-legend-item--green">
                            <span class="db-legend-dot"></span>
                            Successful (${data.successfulPayments})
                        </span>
                        <span class="db-legend-item db-legend-item--red">
                            <span class="db-legend-dot"></span>
                            Failed (${data.failedPayments})
                        </span>
                    </div>
                </div>

                <!-- Check-in rate bar -->
                <div class="db-panel-chart-card">
                    <div class="db-panel-chart-label">Check-in rate</div>
                    <div class="db-checkin-wrap">
                        <div class="db-checkin-circle">
                            <svg viewBox="0 0 100 100" class="db-checkin-svg">
                                <circle cx="50" cy="50" r="40" class="db-checkin-track"/>
                                <circle cx="50" cy="50" r="40" class="db-checkin-fill"
                                    style="stroke-dasharray: ${checkInRate * 2.513} 251.3;"/>
                            </svg>
                            <div class="db-checkin-text">
                                <span class="db-checkin-num">${checkInRate}%</span>
                                <span class="db-checkin-sub">checked in</span>
                            </div>
                        </div>
                        <div class="db-checkin-detail">
                            <div class="db-checkin-row">
                                <span class="db-checkin-row-label">Scanned</span>
                                <span class="db-checkin-row-val db-color-accent">${data.scannedCount}</span>
                            </div>
                            <div class="db-checkin-row">
                                <span class="db-checkin-row-label">Total attendees</span>
                                <span class="db-checkin-row-val">${data.attendees}</span>
                            </div>
                            <div class="db-checkin-row">
                                <span class="db-checkin-row-label">Not checked in</span>
                                <span class="db-checkin-row-val db-color-rose">${data.attendees - data.scannedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Draw donut chart
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext("2d");
    if (ctx) {
        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Successful", "Failed"],
                datasets: [{
                    data: [data.successfulPayments || 0, data.failedPayments || 0],
                    backgroundColor: ["rgba(200,240,74,0.85)", "rgba(240,98,146,0.7)"],
                    borderColor: ["rgba(200,240,74,0.2)", "rgba(240,98,146,0.2)"],
                    borderWidth: 1,
                    hoverOffset: 4,
                }],
            },
            options: {
                cutout: "72%",
                plugins: { legend: { display: false }, tooltip: {
                    backgroundColor: "#101620",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    titleColor: "#eef2fa",
                    bodyColor: "#7a90aa",
                    padding: 10,
                }},
                animation: { duration: 800, easing: "easeOutQuart" },
            },
        });
    }
}

// ─────────────────────────────────────────────────────────────
// REVENUE BAR CHART (overview)
// ─────────────────────────────────────────────────────────────
async function renderRevenueChart(events: MyEvent[]) {
    if (events.length === 0) return;

    // Fetch analytics for each event (parallel)
    const results = await Promise.allSettled(
        events.slice(0, 8).map(ev => fetchEventAnalytics(ev.id))
    );

    const labels: string[] = [];
    const revenues: number[] = [];
    const tickets: number[] = [];

    results.forEach((r, i) => {
        if (r.status === "fulfilled") {
            const name = events[i].title.length > 16
                ? events[i].title.slice(0, 14) + "…"
                : events[i].title;
            labels.push(name);
            revenues.push(r.value.revenue);
            tickets.push(r.value.ticketsSold);
        }
    });

    const ctx = (document.getElementById("db-bar-chart") as HTMLCanvasElement)?.getContext("2d");
    if (!ctx) return;

    if (_barChart) _barChart.destroy();

    _barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Revenue (₦)",
                    data: revenues,
                    backgroundColor: "rgba(200,240,74,0.75)",
                    borderColor: "rgba(200,240,74,0.3)",
                    borderWidth: 1,
                    borderRadius: 6,
                    yAxisID: "y",
                },
                {
                    label: "Tickets sold",
                    data: tickets,
                    backgroundColor: "rgba(126,234,234,0.55)",
                    borderColor: "rgba(126,234,234,0.3)",
                    borderWidth: 1,
                    borderRadius: 6,
                    yAxisID: "y1",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    labels: {
                        color: "#7a90aa",
                        font: { family: "'Sora', sans-serif", size: 11 },
                        boxWidth: 12,
                        boxHeight: 12,
                        borderRadius: 3,
                    },
                },
                tooltip: {
                    backgroundColor: "#101620",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    titleColor: "#eef2fa",
                    bodyColor: "#7a90aa",
                    padding: 12,
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.datasetIndex === 0) return ` Revenue: ${fmt(ctx.raw as number)}`;
                            return ` Tickets: ${ctx.raw}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: { color: "rgba(255,255,255,0.04)" },
                    ticks: { color: "#7a90aa", font: { family: "'Sora', sans-serif", size: 10 } },
                },
                y: {
                    position: "left",
                    grid: { color: "rgba(255,255,255,0.04)" },
                    ticks: {
                        color: "#7a90aa",
                        font: { family: "'Sora', sans-serif", size: 10 },
                        callback: (v) => fmt(v as number),
                    },
                },
                y1: {
                    position: "right",
                    grid: { drawOnChartArea: false },
                    ticks: { color: "#7a90aa", font: { family: "'Sora', sans-serif", size: 10 } },
                },
            },
            animation: { duration: 900, easing: "easeOutQuart" },
        },
    });
}

// ─────────────────────────────────────────────────────────────
// DELETE CONFIRM
// ─────────────────────────────────────────────────────────────
function confirmDelete(eventId: string) {
    const ev = _events.find(e => e.id === eventId);
    const modal = document.getElementById("db-confirm-modal")!;
    const title = document.getElementById("db-confirm-title")!;
    title.textContent = `Delete "${ev?.title || "this event"}"?`;
    modal.classList.add("db-modal--open");

    const confirmBtn = document.getElementById("db-confirm-ok")!;
    const cancelBtn = document.getElementById("db-confirm-cancel")!;

    const cleanup = () => {
        modal.classList.remove("db-modal--open");
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        rewireModalButtons();
    };

    document.getElementById("db-confirm-ok")!.addEventListener("click", async () => {
        try {
            await deleteEvent(eventId);
            _events = _events.filter(e => e.id !== eventId);
            renderEventsTable(_events);
            cleanup();
            showToast("Event deleted successfully", "success");
        } catch {
            showToast("Failed to delete event", "error");
            cleanup();
        }
    });

    document.getElementById("db-confirm-cancel")!.addEventListener("click", cleanup);
}

function rewireModalButtons() {
    // Re-attach after clone (noop here — handled inside confirmDelete)
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function showToast(msg: string, type: "success" | "error" = "success") {
    const t = document.createElement("div");
    t.className = `db-toast db-toast--${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("db-toast--show"));
    setTimeout(() => {
        t.classList.remove("db-toast--show");
        setTimeout(() => t.remove(), 400);
    }, 3000);
}

// ─────────────────────────────────────────────────────────────
// SEARCH / FILTER
// ─────────────────────────────────────────────────────────────
function initFilters() {
    const searchInput = document.getElementById("db-search") as HTMLInputElement;
    const statusFilter = document.getElementById("db-filter-status") as HTMLSelectElement;

    const filter = () => {
        const q = searchInput.value.toLowerCase();
        const status = statusFilter.value;

        const filtered = _events.filter(ev => {
            const matchQ = !q || ev.title.toLowerCase().includes(q) || ev.category.toLowerCase().includes(q);
            const matchStatus = !status || ev.status?.toLowerCase() === status;
            return matchQ && matchStatus;
        });

        renderEventsTable(filtered);
    };

    searchInput?.addEventListener("input", filter);
    statusFilter?.addEventListener("change", filter);
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER
// ─────────────────────────────────────────────────────────────
export async function renderDashboard() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
    <div class="db-page">

        <!-- ── SIDEBAR ── -->
        <aside class="db-sidebar">
            <div class="db-sidebar-logo">
                <span class="db-logo-mark">E</span>
                <span class="db-logo-text">Eventful</span>
            </div>

            <nav class="db-nav">
                <a class="db-nav-item db-nav-item--active" href="#overview">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    Overview
                </a>
                <a class="db-nav-item" href="#events">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                    My Events
                </a>
                <a class="db-nav-item" href="#analytics">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                    Analytics
                </a>
            </nav>

            <div class="db-sidebar-footer">
                <button class="db-sidebar-explore" id="db-go-explore">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
                    Browse events
                </button>
                <button class="db-sidebar-create" id="db-go-create">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create event
                </button>
            </div>
        </aside>

        <!-- ── MAIN ── -->
        <main class="db-main">

            <!-- Header -->
            <header class="db-header">
                <div class="db-header-left">
                    <h1 class="db-header-title">Creator Dashboard</h1>
                    <span class="db-header-sub">Welcome back — here's your overview</span>
                </div>
                <div class="db-header-right">
                    <button class="db-btn-primary" id="db-create-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New event
                    </button>
                </div>
            </header>

            <div class="db-content">

                <!-- ── SECTION: OVERVIEW ── -->
                <section class="db-section" id="overview">
                    <div class="db-section-label">Overview</div>
                    <div class="db-overview-grid" id="db-overview-grid">
                        ${[1,2,3,4].map(() => skeletonCard()).join("")}
                    </div>
                </section>

                <!-- ── SECTION: REVENUE CHART ── -->
                <section class="db-section" id="analytics">
                    <div class="db-section-label">Revenue & Tickets per event</div>
                    <div class="db-chart-card">
                        <div class="db-chart-wrap">
                            <canvas id="db-bar-chart"></canvas>
                        </div>
                    </div>
                </section>

                <!-- ── SECTION: MY EVENTS ── -->
                <section class="db-section" id="events">
                    <div class="db-section-header">
                        <div class="db-section-label">My Events</div>
                        <div class="db-events-controls">
                            <div class="db-search-wrap">
                                <svg class="db-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
                                <input type="text" id="db-search" class="db-search" placeholder="Search events…" />
                            </div>
                            <select id="db-filter-status" class="db-select">
                                <option value="">All status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="ended">Ended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div class="db-events-list" id="db-events-body">
                        <!-- Skeleton rows -->
                        ${[1,2,3].map(() => `
                            <div class="db-event-row db-event-row--skel">
                                <div class="db-skel-line db-skel-line--icon"></div>
                                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                                    <div class="db-skel-line db-skel-line--title"></div>
                                    <div class="db-skel-line db-skel-line--meta"></div>
                                </div>
                            </div>`).join("")}
                    </div>
                </section>

            </div>
        </main>

        <!-- ── DELETE CONFIRM MODAL ── -->
        <div class="db-modal-backdrop" id="db-confirm-modal">
            <div class="db-modal">
                <div class="db-modal-icon">🗑</div>
                <h3 class="db-modal-title" id="db-confirm-title">Delete this event?</h3>
                <p class="db-modal-body">This action cannot be undone. All ticket data and analytics for this event will be permanently removed.</p>
                <div class="db-modal-actions">
                    <button class="db-btn-ghost" id="db-confirm-cancel">Cancel</button>
                    <button class="db-btn-danger" id="db-confirm-ok">Yes, delete</button>
                </div>
            </div>
        </div>

    </div>
    `;

    // ── Wire navigation ──
    document.getElementById("db-create-btn")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("db-go-create")?.addEventListener("click", () => navigate("/create"));
    document.getElementById("db-go-explore")?.addEventListener("click", () => navigate("/explore"));

    // ── Sidebar active on scroll ──
    const sections = ["overview", "analytics", "events"];
    const navItems = document.querySelectorAll<HTMLElement>(".db-nav-item");

    const scrollObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                navItems.forEach(n => n.classList.remove("db-nav-item--active"));
                document.querySelector<HTMLElement>(`.db-nav-item[href="#${id}"]`)
                    ?.classList.add("db-nav-item--active");
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) scrollObs.observe(el);
    });

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const id = item.getAttribute("href")?.slice(1);
            if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        });
    });

    // ── Fetch data ──
    try {
        const [overview, events] = await Promise.all([
            fetchCreatorOverview(),
            fetchMyEvents(),
        ]);

        _overview = overview;
        _events = events;

        renderOverview(overview);
        renderEventsTable(events);
        initFilters();
        renderRevenueChart(events);

    } catch (err) {
        console.error("Dashboard load error:", err);
        // Show error state in overview
        const grid = document.getElementById("db-overview-grid")!;
        grid.innerHTML = `<div class="db-error-state">
            <p>Failed to load dashboard data. Make sure you're logged in and the server is running.</p>
            <button class="db-btn-primary" onclick="location.reload()">Retry</button>
        </div>`;
    }
}