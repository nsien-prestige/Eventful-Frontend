import { getAllEvents } from "../../api/events.api";
import { showMessage } from "../../components/notify/notify";
import { navigate } from "../../router";
import "./explore.css";

const BOOKMARKS_KEY = "eventful:saved-events";
const PAGE_SIZE = 9;

type FiltersState = {
    search: string;
    category: string;
    price: "all" | "free" | "paid";
    mode: "all" | "online" | "physical";
    date: "all" | "today" | "week" | "month";
    sort: "soonest" | "latest" | "price-low" | "price-high" | "title";
    savedOnly: boolean;
    page: number;
};

const state: FiltersState = {
    search: "",
    category: "All",
    price: "all",
    mode: "all",
    date: "all",
    sort: "soonest",
    savedOnly: false,
    page: 1,
};

let allEvents: any[] = [];

// ── Price helpers ──────────────────────────────────────────────────────────
// Safely coerces any value to a non-negative number.
function parsePriceValue(value: any): number {
    if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : 0;
    if (typeof value === "string") {
        const cleaned = value.replace(/[^\d.]/g, "").trim();
        if (!cleaned) return 0;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }
    return 0;
}

// Get the effective price for an event — checks flat price field first,
// then falls back to the lowest ticket tier price.
export function getEventPrice(event: any): number {
    // 1. Try the flat price field
    const flatPrice = parsePriceValue(event.price);
    if (flatPrice > 0) return flatPrice;

    // 2. Try tickets array — find the lowest priced paid ticket
    const tickets = Array.isArray(event.tickets) ? event.tickets : [];
    if (tickets.length === 0) return 0;

    let lowestPaid = Infinity;
    let hasFreeTicket = false;

    for (const ticket of tickets) {
        const ticketPrice = parsePriceValue(ticket.price);
        if (ticket.isFree || ticketPrice === 0) {
            hasFreeTicket = true;
        } else if (ticketPrice < lowestPaid) {
            lowestPaid = ticketPrice;
        }
    }

    // If there are only free tickets (or no paid ones at all) → free
    if (lowestPaid === Infinity) return 0;
    return lowestPaid;
}

// ── Capacity helpers ───────────────────────────────────────────────────────
function getTotalCapacity(event: any): number {
    // 1. Flat capacity field
    const flatCap = Number(event.capacity || event.totalTickets || 0);
    if (flatCap > 0) return flatCap;

    // 2. Sum ticket quantities from the tickets array
    const tickets = Array.isArray(event.tickets) ? event.tickets : [];
    if (tickets.length === 0) return 0;

    return tickets.reduce((sum: number, t: any) => {
        const qty = Number(t.quantity || t.available || 0);
        return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
}

function getTotalSold(event: any): number {
    // 1. Flat sold field
    const flatSold = Number(event.ticketsSold || event.bookingsCount || 0);
    if (flatSold > 0) return flatSold;

    // 2. Sum sold from ticket tiers
    const tickets = Array.isArray(event.tickets) ? event.tickets : [];
    return tickets.reduce((sum: number, t: any) => {
        const s = Number(t.sold || t.ticketsSold || 0);
        return sum + (Number.isFinite(s) ? s : 0);
    }, 0);
}

function getTicketProgress(event: any) {
    const sold = getTotalSold(event);
    const capacity = getTotalCapacity(event);
    if (!capacity || capacity < 1) return { sold, capacity: 0, ratio: 0 };
    return { sold, capacity, ratio: Math.min(100, Math.round((sold / capacity) * 100)) };
}

// ── Display helpers ────────────────────────────────────────────────────────
function formatDateLabel(dateValue: string) {
    const date = new Date(dateValue);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeLabel(dateValue: string) {
    const date = new Date(dateValue);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getCategoryLabel(event: any) { return event.category || event.type || "Event"; }
function getLocationLabel(event: any) { return event.venueAddress || event.location || event.locationName || "Location TBD"; }
function getCreatorLabel(event: any) { return event.organizer || event.creatorName || event.createdBy || "Eventful Creator"; }
function getInitialLabel(event: any) { return (event.title || event.category || "E").charAt(0).toUpperCase(); }

function getFallbackGradient(event: any) {
    const source = (event.title || event.category || "event").toLowerCase();
    let total = 0;
    for (let i = 0; i < source.length; i++) total += source.charCodeAt(i);
    const palettes = [
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        "linear-gradient(135deg, #0d1b2a 0%, #1b4332 50%, #2d6a4f 100%)",
        "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #11998e 100%)",
        "linear-gradient(135deg, #2c0a1e 0%, #6b1a3a 50%, #c0392b 100%)",
        "linear-gradient(135deg, #0a2a1e 0%, #1a4d3a 50%, #27ae60 100%)",
    ];
    return palettes[total % palettes.length];
}

function isOnlineEvent(event: any) {
    const locationType = String(event.locationType || "").toLowerCase();
    return Boolean(event.isOnline) || locationType === "online" || Boolean(event.meetingLink);
}

// ── Bookmarks ──────────────────────────────────────────────────────────────
function getSavedIds() {
    try {
        const raw = localStorage.getItem(BOOKMARKS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function isSaved(publicId: string) { return getSavedIds().includes(publicId); }

function toggleSaved(publicId: string) {
    const current = new Set(getSavedIds());
    if (current.has(publicId)) { current.delete(publicId); showMessage("Removed from saved", "success"); }
    else { current.add(publicId); showMessage("Event saved", "success"); }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...current]));
}

// ── Status badge ───────────────────────────────────────────────────────────
function getEventStatus(event: any) {
    const progress = getTicketProgress(event);
    const now = new Date();
    const eventDate = new Date(event.date);
    const diff = eventDate.getTime() - now.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (progress.capacity > 0 && progress.sold >= progress.capacity) return "Sold out";
    if (progress.capacity > 0 && progress.ratio >= 80) return "Almost full";
    if (diff >= 0 && diff < dayMs) return "Today";
    if (getEventPrice(event) === 0) return "Free";
    if (diff >= 0 && diff < dayMs * 7) return "This week";
    return "";
}

// ── Date filter ────────────────────────────────────────────────────────────
function matchesDateFilter(event: any, dateFilter: FiltersState["date"]) {
    if (dateFilter === "all") return true;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const eventDate = new Date(event.date).getTime();
    const diff = eventDate - todayStart;
    const dayMs = 24 * 60 * 60 * 1000;
    if (dateFilter === "today") return diff >= 0 && diff < dayMs;
    if (dateFilter === "week") return diff >= 0 && diff < dayMs * 7;
    if (dateFilter === "month") return diff >= 0 && diff < dayMs * 31;
    return true;
}

// ── Filter + sort ──────────────────────────────────────────────────────────
function filterAndSortEvents(events: any[]) {
    const term = state.search.trim().toLowerCase();
    const savedIds = getSavedIds();
    const filtered = events.filter((event) => {
        const matchesSearch = !term || [event.title, event.description, event.category, event.organizer, event.venueAddress, event.location, event.locationName].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));
        const matchesCategory = state.category === "All" || getCategoryLabel(event) === state.category;
        const numericPrice = getEventPrice(event);
        const matchesPrice = state.price === "all" || (state.price === "free" ? numericPrice === 0 : numericPrice > 0);
        const matchesMode = state.mode === "all" || (state.mode === "online" ? isOnlineEvent(event) : !isOnlineEvent(event));
        const matchesSaved = !state.savedOnly || savedIds.includes(event.publicId);
        const matchesDate = matchesDateFilter(event, state.date);
        return matchesSearch && matchesCategory && matchesPrice && matchesMode && matchesSaved && matchesDate;
    });
    filtered.sort((a, b) => {
        switch (state.sort) {
            case "latest": return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "price-low": return getEventPrice(a) - getEventPrice(b);
            case "price-high": return getEventPrice(b) - getEventPrice(a);
            case "title": return String(a.title || "").localeCompare(String(b.title || ""));
            default: return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });
    return filtered;
}

function getSuggestions(events: any[]) {
    const term = state.search.trim().toLowerCase();
    if (!term) return [];
    const suggestions = new Set<string>();
    events.forEach((event) => {
        [event.title, event.category, event.organizer, event.location, event.venueAddress].filter(Boolean).forEach((value) => {
            if (String(value).toLowerCase().includes(term) && suggestions.size < 5) suggestions.add(String(value));
        });
    });
    return [...suggestions].slice(0, 5);
}

// ── Main render ────────────────────────────────────────────────────────────
export async function renderExplore() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="explore-page">
            <!-- Ambient background -->
            <div class="ex-ambient" aria-hidden="true">
                <div class="ex-orb ex-orb-1"></div>
                <div class="ex-orb ex-orb-2"></div>
                <div class="ex-orb ex-orb-3"></div>
                <div class="ex-grid"></div>
            </div>

            <div class="ex-shell">

                <!-- HEADER -->
                <header class="ex-header">
                    <div class="ex-eyebrow">
                        <span class="ex-eyebrow-dot"></span>
                        <span>Live events</span>
                    </div>
                    <h1 class="ex-title">Find your<em>next experience</em></h1>
                    <span class="ex-count-pill" id="resultsCountPill">— events</span>
                </header>

                <!-- SEARCH BAR -->
                <div class="ex-search-bar" id="exSearchBar">
                    <div class="ex-search-inner">
                        <svg class="ex-search-ico" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/>
                            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                        <input
                            id="searchInput"
                            class="ex-search-input"
                            placeholder="Search events, artists, venues…"
                            autocomplete="off"
                        />
                    </div>

                    <div class="ex-search-divider"></div>

                    <div class="ex-search-controls">
                        <div class="ex-dropdown ex-sort-dd" id="ddSort">
                            <button class="ex-dd-trigger ex-sort-trigger" type="button" data-dd="ddSort">
                                <span class="ex-dd-value" id="ddSortVal">Soonest</span>
                                <svg class="ex-dd-caret" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <div class="ex-dd-panel ex-sort-panel" id="ddSortPanel">
                                <button class="ex-dd-item active" type="button" data-filter="sort" data-value="soonest">Soonest</button>
                                <button class="ex-dd-item" type="button" data-filter="sort" data-value="latest">Latest</button>
                                <button class="ex-dd-item" type="button" data-filter="sort" data-value="price-low">Price: low to high</button>
                                <button class="ex-dd-item" type="button" data-filter="sort" data-value="price-high">Price: high to low</button>
                                <button class="ex-dd-item" type="button" data-filter="sort" data-value="title">A–Z</button>
                            </div>
                        </div>
                        <button class="ex-saved-btn ${state.savedOnly ? "active" : ""}" id="savedOnlyBtn" type="button">
                            <svg viewBox="0 0 20 20" fill="${state.savedOnly ? "currentColor" : "none"}">
                                <path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3.5L4 17V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                            </svg>
                            Saved
                        </button>
                    </div>

                    <!-- Suggestions: inside the search bar so it stays aligned -->
                    <div class="ex-suggestions" id="searchSuggestions"></div>
                </div>

                <!-- FILTER STRIP -->
                <div class="ex-filters">
                    <!-- Category chips: horizontally scrollable, fade-masked -->
                    <div class="ex-cat-track-wrap">
                        <div class="ex-cat-track" id="categoryChips"></div>
                    </div>

                    <!-- Custom dropdowns -->
                    <div class="ex-filter-dropdowns">

                        <div class="ex-dropdown" id="ddPrice">
                            <button class="ex-dd-trigger" type="button" data-dd="ddPrice">
                                <span class="ex-dd-label">Price</span>
                                <span class="ex-dd-value" id="ddPriceVal">All</span>
                                <svg class="ex-dd-caret" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <div class="ex-dd-panel" id="ddPricePanel">
                                <button class="ex-dd-item active" type="button" data-filter="price" data-value="all">All prices</button>
                                <button class="ex-dd-item" type="button" data-filter="price" data-value="free">Free</button>
                                <button class="ex-dd-item" type="button" data-filter="price" data-value="paid">Paid</button>
                            </div>
                        </div>

                        <div class="ex-dropdown" id="ddMode">
                            <button class="ex-dd-trigger" type="button" data-dd="ddMode">
                                <span class="ex-dd-label">Format</span>
                                <span class="ex-dd-value" id="ddModeVal">All</span>
                                <svg class="ex-dd-caret" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <div class="ex-dd-panel" id="ddModePanel">
                                <button class="ex-dd-item active" type="button" data-filter="mode" data-value="all">All formats</button>
                                <button class="ex-dd-item" type="button" data-filter="mode" data-value="physical">In person</button>
                                <button class="ex-dd-item" type="button" data-filter="mode" data-value="online">Online</button>
                            </div>
                        </div>

                        <div class="ex-dropdown" id="ddDate">
                            <button class="ex-dd-trigger" type="button" data-dd="ddDate">
                                <span class="ex-dd-label">When</span>
                                <span class="ex-dd-value" id="ddDateVal">Any time</span>
                                <svg class="ex-dd-caret" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <div class="ex-dd-panel" id="ddDatePanel">
                                <button class="ex-dd-item active" type="button" data-filter="date" data-value="all">Any time</button>
                                <button class="ex-dd-item" type="button" data-filter="date" data-value="today">Today</button>
                                <button class="ex-dd-item" type="button" data-filter="date" data-value="week">This week</button>
                                <button class="ex-dd-item" type="button" data-filter="date" data-value="month">This month</button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- EVENTS GRID -->
                <div id="eventsContainer" class="ex-grid-container">
                    <div class="ex-loading">
                        <div class="ex-loading-ring"></div>
                        <span>Loading events…</span>
                    </div>
                </div>

                <!-- PAGINATION -->
                <div class="ex-pagination" id="paginationRow"></div>

            </div>
        </div>
    `;

    try {
        allEvents = await getAllEvents();
        state.page = 1;
        renderExploreUi();
        setupExploreInteractions();
    } catch {
        showMessage("Failed to load events", "error");
    }
}

function renderExploreUi() {
    syncControlState();
    renderCategoryChips(allEvents);
    renderSuggestions(allEvents);
    renderEvents(allEvents);
}

function syncControlState() {
    const saved = document.getElementById("savedOnlyBtn");
    if (saved) {
        saved.classList.toggle("active", state.savedOnly);
        const icon = saved.querySelector("svg");
        if (icon) icon.setAttribute("fill", state.savedOnly ? "currentColor" : "none");
    }

    const sortLabels:  Record<string, string> = { soonest: "Soonest", latest: "Latest", "price-low": "Price ↑", "price-high": "Price ↓", title: "A–Z" };
    const priceLabels: Record<string, string> = { all: "All", free: "Free", paid: "Paid" };
    const modeLabels:  Record<string, string> = { all: "All", physical: "In person", online: "Online" };
    const dateLabels:  Record<string, string> = { all: "Any time", today: "Today", week: "This week", month: "This month" };

    const setText = (id: string, text: string) => { const e = document.getElementById(id); if (e) e.textContent = text; };
    setText("ddSortVal",  sortLabels[state.sort]   || "Soonest");
    setText("ddPriceVal", priceLabels[state.price] || "All");
    setText("ddModeVal",  modeLabels[state.mode]   || "All");
    setText("ddDateVal",  dateLabels[state.date]   || "Any time");

    document.querySelectorAll<HTMLElement>("[data-filter='sort']").forEach(e  => e.classList.toggle("active", e.dataset.value === state.sort));
    document.querySelectorAll<HTMLElement>("[data-filter='price']").forEach(e => e.classList.toggle("active", e.dataset.value === state.price));
    document.querySelectorAll<HTMLElement>("[data-filter='mode']").forEach(e  => e.classList.toggle("active", e.dataset.value === state.mode));
    document.querySelectorAll<HTMLElement>("[data-filter='date']").forEach(e  => e.classList.toggle("active", e.dataset.value === state.date));

    document.getElementById("ddSort")?.classList.toggle("is-active",  state.sort  !== "soonest");
    document.getElementById("ddPrice")?.classList.toggle("is-active", state.price !== "all");
    document.getElementById("ddMode")?.classList.toggle("is-active",  state.mode  !== "all");
    document.getElementById("ddDate")?.classList.toggle("is-active",  state.date  !== "all");
}

function renderCategoryChips(events: any[]) {
    const root = document.getElementById("categoryChips");
    if (!root) return;
    const categories = Array.from(new Set(events.map(getCategoryLabel))).sort((a, b) => a.localeCompare(b));
    root.innerHTML = ["All", ...categories].map((cat) => `
        <button class="ex-chip ${state.category === cat ? "active" : ""}" type="button" data-category="${cat}">
            ${cat}
        </button>
    `).join("");
    root.querySelectorAll<HTMLElement>("[data-category]").forEach((btn) => {
        btn.addEventListener("click", () => { state.category = btn.dataset.category || "All"; state.page = 1; renderExploreUi(); });
    });
}

function renderSuggestions(events: any[]) {
    const root = document.getElementById("searchSuggestions");
    if (!root) return;
    const suggestions = getSuggestions(events);
    if (!suggestions.length) { root.innerHTML = ""; root.classList.remove("show"); return; }
    root.innerHTML = suggestions.map((item) => `<button class="ex-suggestion" type="button" data-suggestion="${item}">${item}</button>`).join("");
    root.classList.add("show");
    root.querySelectorAll<HTMLElement>("[data-suggestion]").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.search = btn.dataset.suggestion || "";
            state.page = 1;
            const input = document.getElementById("searchInput") as HTMLInputElement | null;
            if (input) input.value = state.search;
            renderExploreUi();
        });
    });
}

function renderEvents(events: any[]) {
    const container = document.getElementById("eventsContainer")!;
    const countPill = document.getElementById("resultsCountPill");
    const filtered = filterAndSortEvents(events);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (countPill) countPill.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"}`;

    if (!pageItems.length) {
        container.innerHTML = `
            <div class="ex-empty">
                <div class="ex-empty-icon">
                    <svg viewBox="0 0 48 48" fill="none">
                        <circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="2"/>
                        <path d="M32 32l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M17 22h10M22 17v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3>No events found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="ex-clear-btn" id="clearFiltersBtn" type="button">Clear all filters</button>
            </div>
        `;
        document.getElementById("paginationRow")!.innerHTML = "";
        document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
            state.search = ""; state.category = "All"; state.price = "all"; state.mode = "all";
            state.date = "all"; state.savedOnly = false; state.sort = "soonest"; state.page = 1;
            const input = document.getElementById("searchInput") as HTMLInputElement | null;
            if (input) input.value = "";
            renderExploreUi();
        });
        return;
    }

    container.innerHTML = `<div class="ex-events-grid">${pageItems.map((event, i) => renderEventCard(event, i)).join("")}</div>`;

    container.querySelectorAll<HTMLElement>(".ex-card").forEach((card) => {
        card.addEventListener("click", () => { const id = card.dataset.id; if (id) navigate(`/event/${id}`); });
    });
    container.querySelectorAll<HTMLElement>("[data-save-id]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.saveId;
            if (!id) return;
            toggleSaved(id);
            renderExploreUi();
        });
    });

    renderPagination(totalPages);
}

function renderEventCard(event: any, index: number): string {
    const progress = getTicketProgress(event);
    const creator = getCreatorLabel(event);
    const initials = creator.split(" ").map((p: string) => p.charAt(0)).join("").slice(0, 2).toUpperCase() || "EV";
    const hasImage = Boolean(event.imageUrl);
    const status = getEventStatus(event);
    const saved = isSaved(event.publicId);
    const numericPrice = getEventPrice(event);
    const priceLabel = numericPrice === 0 ? "Free" : `₦${numericPrice.toLocaleString()}`;
    const isOnline = isOnlineEvent(event);

    const statusClass = status === "Sold out" ? "sold" : status === "Almost full" ? "hot" : status === "Today" ? "today" : status === "Free" ? "free" : "";

    return `
        <article class="ex-card" data-id="${event.publicId}" style="--delay: ${index * 60}ms">
            <div class="ex-card-image ${hasImage ? "has-img" : ""}" 
                ${hasImage ? `style="background-image: url('${event.imageUrl}')"` : `style="background: ${getFallbackGradient(event)}"`}>
                
                ${!hasImage ? `<span class="ex-card-initial">${getInitialLabel(event)}</span>` : ""}
                
                <div class="ex-card-image-overlay"></div>
                
                <div class="ex-card-top-row">
                    <span class="ex-card-cat">${getCategoryLabel(event)}</span>
                    <button class="ex-bookmark ${saved ? "active" : ""}" type="button" data-save-id="${event.publicId}" aria-label="Save">
                        <svg viewBox="0 0 20 20" fill="${saved ? "currentColor" : "none"}">
                            <path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3.5L4 17V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div class="ex-card-bottom-image">
                    <div class="ex-card-price-badge">${priceLabel}</div>
                    ${status ? `<span class="ex-status-badge ${statusClass}">${status}</span>` : ""}
                </div>
            </div>

            <div class="ex-card-body">
                <h3 class="ex-card-title">${event.title}</h3>
                
                <div class="ex-card-meta">
                    <span class="ex-meta-item">
                        <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 1v3M11 1v3M2 6h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                        ${formatDateLabel(event.date)} · ${formatTimeLabel(event.date)}
                    </span>
                    <span class="ex-meta-item">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M8 14S3 9.5 3 6.5a5 5 0 0 1 10 0C13 9.5 8 14 8 14Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.4"/></svg>
                        ${isOnline ? "Online event" : getLocationLabel(event)}
                    </span>
                </div>

                <div class="ex-card-footer">
                    <div class="ex-creator">
                        <span class="ex-creator-av">${initials}</span>
                        <span class="ex-creator-name">${creator}</span>
                    </div>
                    ${progress.capacity > 0 ? `
                        <div class="ex-capacity">
                            <div class="ex-cap-bar"><span style="width:${progress.ratio}%"></span></div>
                            <span class="ex-cap-text">${progress.capacity - progress.sold > 0 ? `${(progress.capacity - progress.sold).toLocaleString()} left` : "Sold out"}</span>
                        </div>
                    ` : ""}
                </div>
            </div>
        </article>
    `;
}

function renderPagination(totalPages: number) {
    const root = document.getElementById("paginationRow");
    if (!root || totalPages <= 1) { if (root) root.innerHTML = ""; return; }
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    root.innerHTML = `
        <button class="ex-page-btn" type="button" data-page-nav="prev" ${state.page === 1 ? "disabled" : ""}>← Prev</button>
        ${pages.map((p) => `<button class="ex-page-btn ${state.page === p ? "active" : ""}" type="button" data-page="${p}">${p}</button>`).join("")}
        <button class="ex-page-btn" type="button" data-page-nav="next" ${state.page === totalPages ? "disabled" : ""}>Next →</button>
    `;
    root.querySelectorAll<HTMLElement>("[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => { state.page = Number(btn.dataset.page || 1); renderExploreUi(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    });
    root.querySelector<HTMLElement>("[data-page-nav='prev']")?.addEventListener("click", () => { state.page = Math.max(1, state.page - 1); renderExploreUi(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    root.querySelector<HTMLElement>("[data-page-nav='next']")?.addEventListener("click", () => { state.page = Math.min(totalPages, state.page + 1); renderExploreUi(); window.scrollTo({ top: 0, behavior: "smooth" }); });
}

// ── Global dropdown delegation — registered once ───────────────────────────
let _globalDropdownsReady = false;

function closeAllDropdowns() {
    document.querySelectorAll(".ex-dropdown.open").forEach(d => d.classList.remove("open"));
}

function initDropdownDelegation() {
    if (_globalDropdownsReady) return;
    _globalDropdownsReady = true;

    document.addEventListener("click", (e) => {
        if (!(e.target as HTMLElement).closest(".ex-dropdown")) {
            closeAllDropdowns();
        }
    });

    document.addEventListener("click", (e) => {
        const trigger = (e.target as HTMLElement).closest<HTMLElement>(".ex-dd-trigger");
        if (!trigger) return;
        e.stopPropagation();
        const ddId   = trigger.dataset.dd!;
        const dd     = document.getElementById(ddId);
        const isOpen = dd?.classList.contains("open");
        closeAllDropdowns();
        if (!isOpen) dd?.classList.add("open");
    });

    document.addEventListener("click", (e) => {
        const item = (e.target as HTMLElement).closest<HTMLElement>(".ex-dd-item");
        if (!item) return;
        e.stopPropagation();
        const filter = item.dataset.filter as "sort" | "price" | "mode" | "date";
        const value  = item.dataset.value!;
        if (filter === "sort")  state.sort  = value as FiltersState["sort"];
        if (filter === "price") state.price = value as FiltersState["price"];
        if (filter === "mode")  state.mode  = value as FiltersState["mode"];
        if (filter === "date")  state.date  = value as FiltersState["date"];
        state.page = 1;
        closeAllDropdowns();
        renderExploreUi();
    });
}

function setupExploreInteractions() {
    const input        = document.getElementById("searchInput") as HTMLInputElement | null;
    const savedOnlyBtn = document.getElementById("savedOnlyBtn");

    input?.addEventListener("input", () => { state.search = input.value; state.page = 1; renderExploreUi(); });
    input?.addEventListener("blur",  () => { setTimeout(() => { document.getElementById("searchSuggestions")?.classList.remove("show"); }, 120); });
    input?.addEventListener("focus", () => { if (getSuggestions(allEvents).length) document.getElementById("searchSuggestions")?.classList.add("show"); });
    savedOnlyBtn?.addEventListener("click", () => { state.savedOnly = !state.savedOnly; state.page = 1; renderExploreUi(); });

    initDropdownDelegation();
}