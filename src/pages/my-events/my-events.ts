import { getMyEvents } from "../../api/my-events.api";
import { getEventAnalytics } from "../../api/analytics.api";
import { deleteEvent } from "../../api/deleteEvent.api";
import { getToken } from "../../utils/auth";
import { navigate } from "../../router";
import "./my-events.css";

// ── Types ──────────────────────────────────────────────
interface EventAnalytics {
    ticketsSold: number;
    revenue: number;
    attendees: number;
}

interface EnrichedEvent {
    id: string;
    publicId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    date: string;
    endDate?: string;
    category?: string;
    price?: number;
    capacity?: number;
    ticketsSold?: number;
    venueAddress?: string;
    location?: string;
    locationType?: string;
    isOnline?: boolean;
    organizer?: string;
    status?: string;
    analytics: EventAnalytics | null;
}

// ── Page state ─────────────────────────────────────────
type FilterStatus = "all" | "upcoming" | "past" | "draft";
type SortKey = "date-desc" | "date-asc" | "title" | "revenue" | "tickets";

const state: {
    filter: FilterStatus;
    sort: SortKey;
    search: string;
    view: "grid" | "list";
    expandedId: string | null;
    deleteTarget: { id: string; title: string } | null;
} = {
    filter: "all",
    sort: "date-desc",
    search: "",
    view: "grid",
    expandedId: null,
    deleteTarget: null,
};

let allEvents: EnrichedEvent[] = [];

// ── Helpers ────────────────────────────────────────────
function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d: string): string {
    return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(n: number): string {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}k`;
    return `₦${n.toLocaleString()}`;
}

function getEventStatus(ev: EnrichedEvent): "upcoming" | "past" | "draft" {
    if (ev.status === "draft") return "draft";
    return new Date(ev.date).getTime() >= Date.now() ? "upcoming" : "past";
}

function getCapRatio(ev: EnrichedEvent): number {
    const cap = Number(ev.capacity || 0);
    const sold = Number(ev.analytics?.ticketsSold ?? ev.ticketsSold ?? 0);
    if (!cap) return 0;
    return Math.min(100, Math.round((sold / cap) * 100));
}

function getLocation(ev: EnrichedEvent): string {
    const online = Boolean(ev.isOnline) || String(ev.locationType || "").toLowerCase() === "online";
    if (online) return "Online event";
    return ev.venueAddress || ev.location || "Venue TBD";
}

function buildFallbackStyle(ev: EnrichedEvent): string {
    if (ev.imageUrl) return `background-image:url('${ev.imageUrl}')`;
    let t = 0;
    for (let i = 0; i < ev.title.length; i++) t += ev.title.charCodeAt(i);
    const g = [
        "linear-gradient(135deg,#0f1e3a,#1a1040,#0d2233)",
        "linear-gradient(135deg,#0d1b2a,#1b4332,#2d6a4f)",
        "linear-gradient(135deg,#1a0a2e,#2d1b69,#11998e)",
        "linear-gradient(135deg,#2c0a1e,#6b1a3a,#c0392b)",
        "linear-gradient(135deg,#0a2a1e,#1a4d3a,#27ae60)",
    ];
    return `background:${g[t % g.length]}`;
}

// ── Toast ──────────────────────────────────────────────
let _toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string, type: "success" | "info" | "error" = "success") {
    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17L4 12"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    };
    document.querySelector(".mev-toast")?.remove();
    const el = document.createElement("div");
    el.className = `mev-toast ${type}`;
    el.innerHTML = `<span class="mev-toast-icon">${icons[type]}</span><span>${msg}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 350);
    }, 3000);
}

// ── Filter & sort ──────────────────────────────────────
function filterAndSort(events: EnrichedEvent[]): EnrichedEvent[] {
    const term = state.search.trim().toLowerCase();
    let result = events.filter(ev => {
        const statusMatch = state.filter === "all" || getEventStatus(ev) === state.filter;
        const searchMatch = !term
            || ev.title.toLowerCase().includes(term)
            || (ev.category || "").toLowerCase().includes(term)
            || getLocation(ev).toLowerCase().includes(term);
        return statusMatch && searchMatch;
    });

    result.sort((a, b) => {
        switch (state.sort) {
            case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "title": return a.title.localeCompare(b.title);
            case "revenue": return (b.analytics?.revenue ?? 0) - (a.analytics?.revenue ?? 0);
            case "tickets": return (b.analytics?.ticketsSold ?? 0) - (a.analytics?.ticketsSold ?? 0);
            default: return 0;
        }
    });
    return result;
}

function countByStatus(events: EnrichedEvent[]): Record<FilterStatus, number> {
    return {
        all: events.length,
        upcoming: events.filter(e => getEventStatus(e) === "upcoming").length,
        past: events.filter(e => getEventStatus(e) === "past").length,
        draft: events.filter(e => getEventStatus(e) === "draft").length,
    };
}

// ── Render single card ─────────────────────────────────
function renderCard(ev: EnrichedEvent): string {
    const status = getEventStatus(ev);
    const cap = Number(ev.capacity || 0);
    const sold = Number(ev.analytics?.ticketsSold ?? ev.ticketsSold ?? 0);
    const capRatio = getCapRatio(ev);
    const revenue = ev.analytics?.revenue ?? 0;
    const price = Number(ev.price ?? 0);
    const isFree = price === 0;
    const isExpanded = state.expandedId === ev.id;

    const statusLabels = { upcoming: "Upcoming", past: "Past", draft: "Draft" };
    const capFillClass = capRatio >= 90 ? "hot" : capRatio >= 70 ? "warm" : "";

    return `
    <div class="mev-card" data-id="${ev.id}" data-public-id="${ev.publicId}">
        <div class="mev-card-inner">
            <!-- Image -->
            <div class="mev-card-img" style="${buildFallbackStyle(ev)}; background-size:cover; background-position:center;">
                <div class="mev-card-img-overlay"></div>
                ${!ev.imageUrl ? `<div class="mev-card-img-placeholder">${ev.title.charAt(0)}</div>` : ""}
                <div class="mev-card-img-top">
                    <span class="mev-status-badge ${status}">
                        <span class="dot"></span>
                        ${statusLabels[status]}
                    </span>
                    <button class="mev-menu-btn" data-menu-id="${ev.id}" title="More options">
                        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>
                </div>
                <div class="mev-card-img-bottom">
                    <span class="mev-img-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>
                        ${isFree ? "Free" : `₦${price.toLocaleString()}`}
                    </span>
                    ${sold > 0 ? `<span class="mev-img-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        ${sold} sold
                    </span>` : ""}
                </div>
            </div>

            <!-- Body -->
            <div class="mev-card-body">
                <h3 class="mev-card-title">${ev.title}</h3>
                <div class="mev-card-meta">
                    <span class="mev-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${formatDate(ev.date)} · ${formatTime(ev.date)}
                    </span>
                    <span class="mev-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${getLocation(ev)}
                    </span>
                    ${ev.category ? `<span class="mev-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/></svg>
                        ${ev.category}
                    </span>` : ""}
                </div>

                ${cap > 0 ? `
                <div class="mev-cap-row">
                    <span class="mev-cap-label">${sold} / ${cap} spots</span>
                    <span class="mev-cap-pct">${capRatio}%</span>
                </div>
                <div class="mev-cap-bar">
                    <div class="mev-cap-fill ${capFillClass}" style="width:${capRatio}%"></div>
                </div>` : ""}

                <div class="mev-card-footer">
                    <button class="mev-foot-btn view" data-action="view" data-public-id="${ev.publicId}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View
                    </button>
                    <button class="mev-foot-btn edit" data-action="edit" data-id="${ev.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </button>
                    <button class="mev-foot-btn stats ${isExpanded ? "active" : ""}" data-action="stats" data-id="${ev.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                        Stats
                    </button>
                    <button class="mev-foot-btn del" data-action="delete" data-id="${ev.id}" data-title="${ev.title.replace(/"/g, "&quot;")}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        Delete
                    </button>
                </div>
            </div>

            <!-- Analytics panel -->
            <div class="mev-analytics ${isExpanded ? "open" : ""}" id="analytics-${ev.id}">
                <p class="mev-analytics-eyebrow">Performance overview</p>
                <div class="mev-analytics-grid">
                    <div class="mev-analytic tickets">
                        <div class="mev-analytic-val">${ev.analytics?.ticketsSold ?? sold}</div>
                        <div class="mev-analytic-key">Tickets sold</div>
                    </div>
                    <div class="mev-analytic revenue">
                        <div class="mev-analytic-val">${formatCurrency(revenue)}</div>
                        <div class="mev-analytic-key">Revenue</div>
                    </div>
                    <div class="mev-analytic">
                        <div class="mev-analytic-val">${ev.analytics?.attendees ?? 0}</div>
                        <div class="mev-analytic-key">Attendees</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Context menu (outside .mev-card-inner so it can overflow) -->
        <div class="mev-context-menu" id="ctx-${ev.id}">
            <button class="mev-ctx-item" data-action="view" data-public-id="${ev.publicId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View event page
            </button>
            <button class="mev-ctx-item" data-action="edit" data-id="${ev.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit event
            </button>
            <button class="mev-ctx-item" data-action="duplicate" data-id="${ev.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Duplicate
            </button>
            <button class="mev-ctx-item" data-action="share" data-public-id="${ev.publicId}" data-title="${ev.title.replace(/"/g, "&quot;")}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share link
            </button>
            <button class="mev-ctx-item" data-action="stats" data-id="${ev.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                Analytics
            </button>
            <div class="mev-ctx-divider"></div>
            <button class="mev-ctx-item danger" data-action="delete" data-id="${ev.id}" data-title="${ev.title.replace(/"/g, "&quot;")}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                Delete event
            </button>
        </div>
    </div>`;
}

// ── Render grid ────────────────────────────────────────
function renderGrid(container: HTMLElement) {
    const filtered = filterAndSort(allEvents);

    if (!filtered.length) {
        const isFiltered = state.filter !== "all" || state.search;
        container.innerHTML = `
            <div class="mev-grid">
                <div class="mev-empty">
                    <div class="mev-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                        </svg>
                    </div>
                    <h3>${isFiltered ? "No events match your filters" : "No events yet"}</h3>
                    <p>${isFiltered
                        ? "Try clearing your search or switching to a different filter."
                        : "You haven't created any events yet. Start building your first experience."}</p>
                    ${isFiltered
                        ? `<button class="mev-empty-cta" id="mevClearFilters">Clear filters</button>`
                        : `<button class="mev-empty-cta" id="mevCreateFirst">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 5v14M5 12h14"/></svg>
                                Create your first event
                            </button>`}
                </div>
            </div>`;

        document.getElementById("mevClearFilters")?.addEventListener("click", () => {
            state.filter = "all";
            state.search = "";
            const searchEl = document.getElementById("mevSearch") as HTMLInputElement;
            if (searchEl) searchEl.value = "";
            syncPills();
            renderGrid(container);
        });

        document.getElementById("mevCreateFirst")?.addEventListener("click", () => navigate("/create/new"));
        return;
    }

    container.innerHTML = `
        <div class="mev-grid ${state.view === "list" ? "list-view" : ""}">
            ${filtered.map(renderCard).join("")}
        </div>`;

    bindCardEvents(container);
}

// ── Sync pills ─────────────────────────────────────────
function syncPills() {
    const counts = countByStatus(allEvents);
    (["all", "upcoming", "past", "draft"] as FilterStatus[]).forEach(f => {
        const pill = document.querySelector<HTMLElement>(`.mev-pill[data-filter="${f}"]`);
        if (!pill) return;
        pill.classList.toggle("active", state.filter === f);
        const count = pill.querySelector(".mev-pill-count");
        if (count) count.textContent = String(counts[f]);
    });
}

// ── Update stats bar ───────────────────────────────────
function updateStats() {
    const total = allEvents.length;
    const totalTickets = allEvents.reduce((s, e) => s + (e.analytics?.ticketsSold ?? 0), 0);
    const totalRevenue = allEvents.reduce((s, e) => s + (e.analytics?.revenue ?? 0), 0);
    const totalAttendees = allEvents.reduce((s, e) => s + (e.analytics?.attendees ?? 0), 0);

    const set = (id: string, val: string) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set("mevStatEvents", String(total));
    set("mevStatTickets", String(totalTickets));
    set("mevStatRevenue", formatCurrency(totalRevenue));
    set("mevStatAttendees", String(totalAttendees));
}

// ── Delete confirm ─────────────────────────────────────
function showDeleteConfirm(title: string, onConfirm: () => void) {
    const overlay = document.getElementById("mevDeleteOverlay")!;
    const titleEl = document.getElementById("mevDeleteTitle")!;
    titleEl.textContent = `Delete "${title}"?`;
    overlay.classList.add("show");

    const confirm = document.getElementById("mevDeleteConfirmBtn")!;
    const cancel = document.getElementById("mevDeleteCancelBtn")!;

    const cleanup = () => { overlay.classList.remove("show"); };

    const handleConfirm = () => { cleanup(); onConfirm(); confirm.removeEventListener("click", handleConfirm); cancel.removeEventListener("click", cleanup); };
    const handleCancel = () => { cleanup(); confirm.removeEventListener("click", handleConfirm); cancel.removeEventListener("click", cleanup); };

    confirm.addEventListener("click", handleConfirm);
    cancel.addEventListener("click", handleCancel);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) handleCancel(); }, { once: true });
}

// ── Bind all card interactions ─────────────────────────
function bindCardEvents(container: HTMLElement) {
    const token = getToken()!;

    // Close all open context menus
    const closeAllMenus = () => {
        document.querySelectorAll(".mev-context-menu.open").forEach(m => m.classList.remove("open"));
        document.querySelectorAll(".mev-menu-btn.open").forEach(b => b.classList.remove("open"));
    };

    // Global click to close menus
    document.addEventListener("click", closeAllMenus, { once: false });

    container.addEventListener("click", async (e) => {
        const target = e.target as HTMLElement;

        // ── 3-dot menu toggle ──
        const menuBtn = target.closest<HTMLElement>(".mev-menu-btn");
        if (menuBtn) {
            e.stopPropagation();
            const menuId = menuBtn.dataset.menuId!;
            const menu = document.getElementById(`ctx-${menuId}`);
            if (!menu) return;
            const wasOpen = menu.classList.contains("open");
            closeAllMenus();
            if (!wasOpen) {
                menu.classList.add("open");
                menuBtn.classList.add("open");
            }
            return;
        }

        // Close menus when clicking action inside them
        const ctxItem = target.closest<HTMLElement>(".mev-ctx-item");
        if (ctxItem) {
            e.stopPropagation();
            closeAllMenus();
        }

        const actionEl = ctxItem || target.closest<HTMLElement>("[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action!;

        if (action === "view") {
            navigate(`/event/${actionEl.dataset.publicId}`);
        }

        if (action === "edit") {
            // TODO: navigate(`/create/new?edit=${actionEl.dataset.id}`);
            showToast("Edit flow coming soon — needs create-page prefill", "info");
        }

        if (action === "duplicate") {
            showToast("Duplicate feature coming soon", "info");
            // TODO: call duplicate API
        }

        if (action === "share") {
            const url = `${window.location.origin}/event/${actionEl.dataset.publicId}`;
            if (navigator.share) {
                navigator.share({ title: actionEl.dataset.title, url }).catch(() => {});
            } else {
                navigator.clipboard.writeText(url).then(() => showToast("Event link copied!", "success"));
            }
        }

        if (action === "stats") {
            const id = actionEl.dataset.id!;
            const panel = document.getElementById(`analytics-${id}`);
            if (!panel) return;
            const isOpen = panel.classList.contains("open");

            // Close others
            document.querySelectorAll(".mev-analytics.open").forEach(p => p.classList.remove("open"));
            document.querySelectorAll(".mev-foot-btn.stats.active").forEach(b => b.classList.remove("active"));

            if (!isOpen) {
                panel.classList.add("open");
                state.expandedId = id;
                // Activate the stats button in this card
                const card = panel.closest(".mev-card");
                card?.querySelector(".mev-foot-btn.stats")?.classList.add("active");
            } else {
                state.expandedId = null;
            }
        }

        if (action === "delete") {
            const id = actionEl.dataset.id!;
            const title = actionEl.dataset.title || "this event";
            closeAllMenus();

            showDeleteConfirm(title, async () => {
                try {
                    await deleteEvent(token, id);
                    allEvents = allEvents.filter(ev => ev.id !== id);

                    // Animate card out
                    const card = document.querySelector<HTMLElement>(`.mev-card[data-id="${id}"]`);
                    if (card) {
                        card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.95)";
                        await new Promise(r => setTimeout(r, 300));
                    }

                    showToast(`"${title}" deleted`, "success");
                    updateStats();
                    syncPills();
                    renderGrid(container);
                } catch {
                    showToast("Couldn't delete event — try again", "error");
                }
            });
        }
    });
}

// ── Main render ────────────────────────────────────────
export async function renderMyEvents() {
    const app = document.getElementById("app")!;
    const token = getToken();
    if (!token) { navigate("/login"); return; }

    const sortLabels: Record<SortKey, string> = {
        "date-desc": "Newest first",
        "date-asc": "Oldest first",
        "title": "A – Z",
        "revenue": "Most revenue",
        "tickets": "Most sold",
    };

    // Initial shell
    app.innerHTML = `
        <div class="mev-page">
            <div class="mev-ambient">
                <div class="mev-orb mev-orb-1"></div>
                <div class="mev-orb mev-orb-2"></div>
                <div class="mev-orb mev-orb-3"></div>
            </div>

            <div class="mev-shell">

                <!-- Header -->
                <div class="mev-header">
                    <div>
                        <div class="mev-eyebrow">
                            <span class="mev-eyebrow-dot"></span>
                            Creator workspace
                        </div>
                        <h1 class="mev-page-title">My <em>events</em></h1>
                    </div>
                    <button class="mev-create-btn" id="mevCreateBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
                        Create event
                    </button>
                </div>

                <!-- Stats -->
                <div class="mev-stats">
                    <div class="mev-stat">
                        <div class="mev-stat-icon violet">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        </div>
                        <div class="mev-stat-val" id="mevStatEvents">—</div>
                        <div class="mev-stat-label">Total events</div>
                    </div>
                    <div class="mev-stat">
                        <div class="mev-stat-icon teal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>
                        </div>
                        <div class="mev-stat-val" id="mevStatTickets">—</div>
                        <div class="mev-stat-label">Tickets sold</div>
                    </div>
                    <div class="mev-stat">
                        <div class="mev-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div class="mev-stat-val" id="mevStatRevenue">—</div>
                        <div class="mev-stat-label">Total revenue</div>
                    </div>
                    <div class="mev-stat">
                        <div class="mev-stat-icon warm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <div class="mev-stat-val" id="mevStatAttendees">—</div>
                        <div class="mev-stat-label">Attendees</div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="mev-controls">
                    <div class="mev-search-wrap">
                        <svg class="mev-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
                        <input class="mev-search" id="mevSearch" placeholder="Search your events…" autocomplete="off" />
                    </div>

                    <div class="mev-filter-pills">
                        ${(["all", "upcoming", "past", "draft"] as FilterStatus[]).map(f => `
                        <button class="mev-pill ${state.filter === f ? "active" : ""}" data-filter="${f}">
                            ${f.charAt(0).toUpperCase() + f.slice(1)}
                            <span class="mev-pill-count">0</span>
                        </button>`).join("")}
                    </div>

                    <div class="mev-sort-wrap">
                        <button class="mev-sort-btn" id="mevSortTrigger">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                            <span id="mevSortLabel">${sortLabels[state.sort]}</span>
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4l4 4 4-4"/></svg>
                        </button>
                        <div class="mev-sort-panel" id="mevSortPanel">
                            ${(Object.entries(sortLabels) as [SortKey, string][]).map(([k, v]) => `
                            <button class="mev-sort-item ${state.sort === k ? "active" : ""}" data-sort="${k}">${v}</button>`).join("")}
                        </div>
                    </div>

                    <div class="mev-view-toggle">
                        <button class="mev-view-btn ${state.view === "grid" ? "active" : ""}" id="mevViewGrid" title="Grid view">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        </button>
                        <button class="mev-view-btn ${state.view === "list" ? "active" : ""}" id="mevViewList" title="List view">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Loading skeletons -->
                <div id="mevGridContainer">
                    <div class="mev-grid">
                        ${Array(6).fill(0).map(() => `
                        <div class="mev-skeleton">
                            <div class="mev-skel-img"></div>
                            <div class="mev-skel-body">
                                <div class="mev-skel-line"></div>
                                <div class="mev-skel-line short"></div>
                                <div class="mev-skel-line xshort"></div>
                            </div>
                        </div>`).join("")}
                    </div>
                </div>

            </div>

            <!-- Delete confirm modal -->
            <div class="mev-delete-overlay" id="mevDeleteOverlay">
                <div class="mev-delete-modal">
                    <div class="mev-delete-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </div>
                    <h3 id="mevDeleteTitle">Delete this event?</h3>
                    <p>This action is permanent. All bookings, tickets, and analytics data for this event will be removed.</p>
                    <div class="mev-delete-actions">
                        <button class="mev-delete-cancel" id="mevDeleteCancelBtn">Cancel</button>
                        <button class="mev-delete-confirm" id="mevDeleteConfirmBtn">Delete event</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const gridContainer = document.getElementById("mevGridContainer")!;

    // ── Wire controls ──────────────────────────────────
    document.getElementById("mevCreateBtn")?.addEventListener("click", () => navigate("/create/new"));

    // Search
    const searchEl = document.getElementById("mevSearch") as HTMLInputElement;
    let searchTimer: ReturnType<typeof setTimeout>;
    searchEl?.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.search = searchEl.value;
            renderGrid(gridContainer);
        }, 220);
    });

    // Filter pills
    document.querySelectorAll<HTMLElement>(".mev-pill[data-filter]").forEach(pill => {
        pill.addEventListener("click", () => {
            state.filter = pill.dataset.filter as FilterStatus;
            syncPills();
            renderGrid(gridContainer);
        });
    });

    // Sort
    const sortTrigger = document.getElementById("mevSortTrigger");
    const sortPanel = document.getElementById("mevSortPanel");

    sortTrigger?.addEventListener("click", (e) => { e.stopPropagation(); sortPanel?.classList.toggle("open"); });
    document.addEventListener("click", () => sortPanel?.classList.remove("open"));

    document.querySelectorAll<HTMLElement>(".mev-sort-item[data-sort]").forEach(item => {
        item.addEventListener("click", () => {
            state.sort = item.dataset.sort as SortKey;
            document.getElementById("mevSortLabel")!.textContent = sortLabels[state.sort];
            document.querySelectorAll(".mev-sort-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            sortPanel?.classList.remove("open");
            renderGrid(gridContainer);
        });
    });

    // View toggle
    document.getElementById("mevViewGrid")?.addEventListener("click", () => {
        state.view = "grid";
        document.getElementById("mevViewGrid")?.classList.add("active");
        document.getElementById("mevViewList")?.classList.remove("active");
        renderGrid(gridContainer);
    });

    document.getElementById("mevViewList")?.addEventListener("click", () => {
        state.view = "list";
        document.getElementById("mevViewList")?.classList.add("active");
        document.getElementById("mevViewGrid")?.classList.remove("active");
        renderGrid(gridContainer);
    });

    // ── Fetch data ─────────────────────────────────────
    try {
        const rawEvents = await getMyEvents(token);

        // Enrich with analytics in parallel (failures are non-fatal)
        const enriched: EnrichedEvent[] = await Promise.all(
            (rawEvents || []).map(async (ev: any) => {
                let analytics: EventAnalytics | null = null;
                try { analytics = await getEventAnalytics(token, ev.id); } catch { /* analytics optional */ }
                return { ...ev, analytics };
            })
        );

        allEvents = enriched;
        updateStats();
        syncPills();
        renderGrid(gridContainer);

    } catch {
        gridContainer.innerHTML = `
            <div class="mev-grid">
                <div class="mev-empty">
                    <div class="mev-empty-icon" style="background:rgba(240,98,146,0.1);border-color:rgba(240,98,146,0.2);color:var(--accent-rose);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    </div>
                    <h3>Couldn't load your events</h3>
                    <p>Something went wrong. Check your connection and try again.</p>
                    <button class="mev-empty-cta" onclick="window.location.reload()">Retry</button>
                </div>
            </div>`;
    }
}