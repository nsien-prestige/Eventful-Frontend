import { getEvent } from "../../api/events.api";
import { navigate } from "../../router";
import { showMessage } from "../../components/notify/notify";
import { initPayment } from "../../api/payment.api";
import "./event-details.css";

// ── localStorage keys ──────────────────────────────
const SAVED_KEY = "eventful:saved-events";
const REMINDERS_KEY = "eventful:reminders";
const NOTIF_KEY = "eventful:notifications";

// ── Helpers ────────────────────────────────────────
function getSavedIds(): string[] {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
}

function toggleSaved(publicId: string): boolean {
    const ids = new Set(getSavedIds());
    const wasSaved = ids.has(publicId);
    wasSaved ? ids.delete(publicId) : ids.add(publicId);
    localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
    return !wasSaved;
}

function isSaved(publicId: string): boolean {
    return getSavedIds().includes(publicId);
}

function getReminders(): Record<string, string[]> {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "{}"); } catch { return {}; }
}

function setReminder(publicId: string, timing: string): void {
    const reminders = getReminders();
    if (!reminders[publicId]) reminders[publicId] = [];
    if (!reminders[publicId].includes(timing)) reminders[publicId].push(timing);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

function removeReminder(publicId: string, timing: string): void {
    const reminders = getReminders();
    if (!reminders[publicId]) return;
    reminders[publicId] = reminders[publicId].filter((t: string) => t !== timing);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

function hasReminder(publicId: string, timing: string): boolean {
    const reminders = getReminders();
    return (reminders[publicId] || []).includes(timing);
}

function getNotifPrefs(): Record<string, Record<string, boolean>> {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}"); } catch { return {}; }
}

function setNotifPref(publicId: string, key: string, val: boolean): void {
    const prefs = getNotifPrefs();
    if (!prefs[publicId]) prefs[publicId] = {};
    prefs[publicId][key] = val;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

function getNotifPref(publicId: string, key: string): boolean {
    const prefs = getNotifPrefs();
    return prefs[publicId]?.[key] ?? false;
}

// ── Toast system ───────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string, type: "success" | "info" | "error" = "success"): void {
    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17L4 12"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    };

    const existing = document.querySelector(".ed-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `ed-toast ${type}`;
    toast.innerHTML = `
        <span class="ed-toast-icon">${icons[type]}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// ── Date/time formatting ───────────────────────────
function formatDate(d: string): string {
    return new Date(d).toLocaleDateString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function formatTime(d: string): string {
    return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(d: string): string {
    return new Date(d).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric"
    });
}

// ── Build category gradient (consistent with explore) ──
function buildFallbackStyle(event: any): string {
    if (event.imageUrl) return `background-image: url('${event.imageUrl}')`;
    const source = (event.title || "event").toLowerCase();
    let t = 0;
    for (let i = 0; i < source.length; i++) t += source.charCodeAt(i);
    const palettes = [
        "linear-gradient(135deg, #0f1e3a 0%, #1a1040 50%, #0d2233 100%)",
        "linear-gradient(135deg, #0d1b2a 0%, #1b4332 50%, #2d6a4f 100%)",
        "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #11998e 100%)",
        "linear-gradient(135deg, #2c0a1e 0%, #6b1a3a 50%, #c0392b 100%)",
        "linear-gradient(135deg, #0a2a1e 0%, #1a4d3a 50%, #27ae60 100%)",
    ];
    return `background: ${palettes[t % palettes.length]}`;
}

// ── Main render ────────────────────────────────────
export async function renderEventDetails(publicId: string) {
    const app = document.getElementById("app")!;

    // Loading state
    app.innerHTML = `
        <div class="ed-page">
            <div class="ed-ambient">
                <div class="ed-orb ed-orb-1"></div>
                <div class="ed-orb ed-orb-2"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;min-height:80vh;color:#4a5568;font-family:'Sora',sans-serif;font-size:0.9rem;gap:12px;">
                <div style="width:20px;height:20px;border-radius:50%;border:2px solid rgba(126,234,234,0.2);border-top-color:#7eeaea;animation:spin 0.8s linear infinite;"></div>
                Loading event…
            </div>
            <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
        </div>
    `;

    try {
        const event = await getEvent(publicId);
        renderPage(app, event, publicId);
    } catch {
        showMessage("Failed to load event", "error");
        navigate("/explore");
    }
}

function renderPage(app: HTMLElement, event: any, publicId: string): void {
    const saved = isSaved(publicId);
    const hasImage = Boolean(event.imageUrl);
    const isOnline = Boolean(event.isOnline) || String(event.locationType || "").toLowerCase() === "online" || Boolean(event.meetingLink);

    // ── Price resolution ───────────────────────────────────────────────────
    // Some events store a flat `price` field; others (created via the form)
    // store pricing inside `tickets[]`. We resolve whichever is present.
    const ticketsArr: any[] = Array.isArray(event.tickets) && event.tickets.length > 0
        ? event.tickets : [];

    // Derive a representative price: flat field → lowest paid ticket tier → 0
    let resolvedPrice = 0;
    const flatPrice = Number(event.price ?? "");
    if (Number.isFinite(flatPrice) && flatPrice > 0) {
        resolvedPrice = flatPrice;
    } else if (ticketsArr.length > 0) {
        // Find the lowest non-zero ticket price; if all are 0, stays 0 (free)
        const paid = ticketsArr
            .map((t: any) => Number(t.price ?? 0))
            .filter((p) => Number.isFinite(p) && p > 0);
        if (paid.length > 0) resolvedPrice = Math.min(...paid);
    }

    const price = resolvedPrice;
    const isFree = price === 0 && ticketsArr.every((t: any) => {
        const p = Number(t.price ?? 0);
        return !Number.isFinite(p) || p === 0 || Boolean(t.isFree);
    });

    // ── Capacity resolution ────────────────────────────────────────────────
    // Flat `capacity` → sum ticket quantities → 0 (unknown)
    let resolvedCapacity = Number(event.capacity || event.totalTickets || 0);
    if (resolvedCapacity === 0 && ticketsArr.length > 0) {
        resolvedCapacity = ticketsArr.reduce((sum: number, t: any) => {
            const qty = Number(t.quantity ?? 0);
            return sum + (Number.isFinite(qty) ? qty : 0);
        }, 0);
    }

    const capacity = resolvedCapacity;
    const sold = Number(event.ticketsSold || event.bookingsCount || 0);
    const capRatio = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
    const isAlmostFull = capRatio >= 80;

    // Ticket tiers from backend or fallback single tier
    const tiers: Array<{ name: string; price: number; available: number }> = 
        ticketsArr.length > 0
            ? ticketsArr.map((t: any) => ({
                name: t.name || "General",
                price: Number.isFinite(Number(t.price)) ? Number(t.price) : 0,
                available: Math.max(0, Number(t.quantity || 0) - Number(t.sold || 0)),
            }))
            : [{ name: isFree ? "Free entry" : "General Admission", price, available: Math.max(0, capacity - sold) }];

    // Agenda items
    const agenda: any[] = event.agenda || [];

    // Notification preferences
    const notifUpdates = getNotifPref(publicId, "updates");
    const notifReminders = getNotifPref(publicId, "reminders");

    app.innerHTML = `
        <div class="ed-page">
            <!-- Ambient -->
            <div class="ed-ambient">
                <div class="ed-orb ed-orb-1"></div>
                <div class="ed-orb ed-orb-2"></div>
            </div>

            <!-- ═══ HERO ═══ -->
            <section class="ed-hero" id="edHero">
                <div class="ed-hero-img" id="edHeroImg"
                    style="${buildFallbackStyle(event)}; background-size:cover; background-position:center;">
                    ${!hasImage ? `<div class="ed-hero-placeholder"></div>` : ""}
                </div>
                <div class="ed-hero-grad"></div>

                <!-- Top-right icon buttons -->
                <div class="ed-hero-actions">
                    <button class="ed-icon-btn ${saved ? "active" : ""}" id="edSaveBtn" title="Save event">
                        <svg viewBox="0 0 24 24" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8">
                            <path d="M5 3h14a1 1 0 0 1 1 1v16l-8-4.5L4 20V4a1 1 0 0 1 1-1Z" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="ed-icon-btn" id="edShareHeroBtn" title="Share event">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                    </button>
                </div>

                <!-- Bottom content -->
                <div class="ed-hero-content">
                    <div class="ed-hero-top">
                        <span class="ed-cat-badge">${event.category || "Event"}</span>
                        ${isAlmostFull ? `<span class="ed-status-live"><span></span>Almost full</span>` : ""}
                        ${isFree ? `<span class="ed-cat-badge" style="border-color:rgba(126,234,234,0.3);background:rgba(126,234,234,0.12);">Free</span>` : ""}
                    </div>

                    <h1 class="ed-event-title">${event.title}</h1>

                    <div class="ed-hero-chips">
                        <span class="ed-hero-chip">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${formatDate(event.date)}
                        </span>
                        <span class="ed-hero-chip">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            ${formatTime(event.date)}${event.endDate ? ` — ${formatTime(event.endDate)}` : ""}
                        </span>
                        <span class="ed-hero-chip" id="edHeroLocation" style="${!isOnline && (event.venueAddress || event.location) ? "cursor:pointer;" : ""}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${isOnline ? "Online event" : (event.venueAddress || event.location || "Venue TBD")}
                        </span>
                        ${event.organizer ? `
                        <span class="ed-hero-chip">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            By ${event.organizer}
                        </span>` : ""}
                    </div>
                </div>
            </section>

            <!-- ═══ BODY ═══ -->
            <div class="ed-body">

                <!-- LEFT COLUMN -->
                <div class="ed-left">

                    <!-- About -->
                    ${event.description || event.summary ? `
                    <div class="ed-panel">
                        <h2 class="ed-panel-title">About this event</h2>
                        <p class="ed-about-text">${event.description || event.summary}</p>
                    </div>` : ""}

                    <!-- Details grid -->
                    <div class="ed-panel">
                        <h2 class="ed-panel-title">Event details</h2>
                        <div class="ed-details-grid">
                            <div class="ed-detail-item">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                </div>
                                <div>
                                    <span class="ed-detail-label">Date</span>
                                    <span class="ed-detail-value">${formatShortDate(event.date)}</span>
                                </div>
                            </div>
                            <div class="ed-detail-item">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                </div>
                                <div>
                                    <span class="ed-detail-label">Time</span>
                                    <span class="ed-detail-value">${formatTime(event.date)}${event.endDate ? ` – ${formatTime(event.endDate)}` : ""}</span>
                                </div>
                            </div>
                            <div class="ed-detail-item">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <div>
                                    <span class="ed-detail-label">${isOnline ? "Format" : "Location"}</span>
                                    <span class="ed-detail-value">
                                        ${isOnline
                                            ? `Online event${event.meetingLink ? `<br><a href="${event.meetingLink}" target="_blank" rel="noopener">Join link →</a>` : ""}`
                                            : (() => {
                                                const address = event.venueAddress || event.location || "";
                                                const lat = event.latitude;
                                                const lng = event.longitude;
                                                const mapsQuery = lat && lng
                                                    ? `https://www.google.com/maps?q=${lat},${lng}`
                                                    : address
                                                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                                                        : null;
                                                return address
                                                    ? `${address}${mapsQuery ? `<br><a href="${mapsQuery}" target="_blank" rel="noopener" class="ed-directions-link">📍 Get directions →</a>` : ""}`
                                                    : "Venue TBD";
                                              })()}
                                    </span>
                                </div>
                            </div>
                            <div class="ed-detail-item">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/></svg>
                                </div>
                                <div>
                                    <span class="ed-detail-label">Price</span>
                                    <span class="ed-detail-value">${isFree ? "Free" : `₦${price.toLocaleString()}`}</span>
                                </div>
                            </div>
                            ${event.eventType ? `
                            <div class="ed-detail-item">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                                </div>
                                <div>
                                    <span class="ed-detail-label">Type</span>
                                    <span class="ed-detail-value">${event.eventType}</span>
                                </div>
                            </div>` : ""}
                            ${capacity > 0 ? `
                            <div class="ed-detail-item" style="grid-column:1/-1;">
                                <div class="ed-detail-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <div style="flex:1;">
                                    <span class="ed-detail-label">Capacity</span>
                                    <div class="ed-capacity-section">
                                        <div class="ed-cap-header">
                                            <span class="ed-cap-label">${sold} of ${capacity} spots filled</span>
                                            <span class="ed-cap-count">${capRatio}%</span>
                                        </div>
                                        <div class="ed-cap-bar">
                                            <div class="ed-cap-fill ${isAlmostFull ? "hot" : ""}" style="width:${capRatio}%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>` : ""}
                        </div>
                    </div>

                    <!-- Agenda -->
                    ${agenda.length > 0 ? `
                    <div class="ed-panel">
                        <h2 class="ed-panel-title">Schedule</h2>
                        <div class="ed-agenda-list">
                            ${agenda.map((slot: any) => `
                            <div class="ed-agenda-slot">
                                <div class="ed-agenda-time">${slot.startTime || ""}${slot.endTime ? ` – ${slot.endTime}` : ""}</div>
                                <div class="ed-agenda-info">
                                    <h4>${slot.title}</h4>
                                    ${slot.description ? `<p>${slot.description}</p>` : ""}
                                    ${slot.host ? `<span class="ed-agenda-host">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                        ${slot.host}
                                    </span>` : ""}
                                </div>
                            </div>`).join("")}
                        </div>
                    </div>` : ""}

                    <!-- Organizer -->
                    ${event.organizer ? `
                    <div class="ed-panel">
                        <h2 class="ed-panel-title">Organizer</h2>
                        <div class="ed-organizer">
                            <div class="ed-org-avatar">${event.organizer.charAt(0).toUpperCase()}</div>
                            <div>
                                <p class="ed-org-name">${event.organizer}</p>
                                <p class="ed-org-label">Event organizer</p>
                            </div>
                        </div>
                    </div>` : ""}

                </div>

                <!-- RIGHT SIDEBAR -->
                <div class="ed-sidebar">

                    <!-- Main action card -->
                    <div class="ed-action-card">
                        <!-- Price -->
                        <div class="ed-price-row">
                            ${isFree
                                ? `<span class="ed-price-free">Free</span>`
                                : `<span class="ed-price-main">₦${price.toLocaleString()}</span><span class="ed-price-sub">/ ticket</span>`}
                        </div>

                        <!-- Ticket tiers -->
                        ${tiers.length > 1 ? `
                        <div class="ed-ticket-tiers" id="edTierList">
                            ${tiers.map((tier, i) => `
                            <div class="ed-tier ${i === 0 ? "selected" : ""}" data-tier="${i}" data-price="${tier.price}">
                                <div class="ed-tier-left">
                                    <span class="ed-tier-name">${tier.name}</span>
                                    <span class="ed-tier-avail">${tier.available > 0 ? `${tier.available} available` : "Sold out"}</span>
                                </div>
                                <span class="ed-tier-price">${tier.price === 0 ? "Free" : `₦${tier.price.toLocaleString()}`}</span>
                            </div>`).join("")}
                        </div>` : ""}

                        <!-- Quantity selector -->
                        <div class="ed-qty-row">
                            <span class="ed-qty-label">Quantity</span>
                            <div class="ed-qty-ctrl">
                                <button class="ed-qty-btn" id="edQtyMinus" ${1 <= 1 ? "disabled" : ""}>−</button>
                                <span class="ed-qty-val" id="edQtyVal">1</span>
                                <button class="ed-qty-btn" id="edQtyPlus">+</button>
                            </div>
                        </div>

                        <!-- Buy CTA -->
                        <button class="ed-buy-btn ${isFree ? "free-event" : ""}" id="edBuyBtn">
                            ${isFree ? "Register for free" : "Secure tickets"}
                        </button>

                        <!-- Mini actions: reminder, notify, share -->
                        <div class="ed-action-row">
                            <button class="ed-action-mini" id="edReminderBtn" title="Set reminder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                Remind me
                            </button>
                            <button class="ed-action-mini" id="edNotifyBtn" title="Notifications">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3Z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                Notify me
                            </button>
                            <button class="ed-action-mini" id="edShareBtn" title="Share">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Share
                            </button>
                        </div>
                    </div>

                    <!-- Share panel -->
                    <div class="ed-share-panel" id="edSharePanel">
                        <p class="ed-share-title">Share this event</p>
                        <div class="ed-share-link-row">
                            <input class="ed-share-link-input" id="edShareLinkInput" value="${window.location.href}" readonly />
                            <button class="ed-share-copy-btn" id="edCopyLinkBtn">Copy</button>
                        </div>
                        <div class="ed-share-socials">
                            <button class="ed-social-btn" id="edShareTwitter">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                X / Twitter
                            </button>
                            <button class="ed-social-btn" id="edShareWhatsApp">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                                WhatsApp
                            </button>
                            <button class="ed-social-btn" id="edShareFacebook">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </button>
                            <button class="ed-social-btn" id="edShareLinkedIn">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                LinkedIn
                            </button>
                            <button class="ed-social-btn" id="edShareTelegram">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                Telegram
                            </button>
                            <button class="ed-social-btn" id="edShareInstagram">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                                Instagram
                            </button>
                        </div>
                    </div>

                    <!-- Notifications panel -->
                    <div class="ed-notify-panel" id="edNotifyPanel">
                        <p class="ed-notify-title">Notifications</p>
                        <div class="ed-notify-options">
                            <div class="ed-notify-opt">
                                <span class="ed-notify-opt-label">Event updates &amp; changes</span>
                                <label class="ed-toggle">
                                    <input type="checkbox" id="edNotifUpdates" ${notifUpdates ? "checked" : ""} />
                                    <span class="ed-toggle-slider"></span>
                                </label>
                            </div>
                            <div class="ed-notify-opt">
                                <span class="ed-notify-opt-label">Reminder before event</span>
                                <label class="ed-toggle">
                                    <input type="checkbox" id="edNotifReminders" ${notifReminders ? "checked" : ""} />
                                    <span class="ed-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Reminder card -->
                    <div class="ed-reminder-card" id="edReminderCard" style="display:none;">
                        <div class="ed-reminder-header">
                            <div class="ed-reminder-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            </div>
                            <div>
                                <p class="ed-reminder-title">Set a reminder</p>
                                <p class="ed-reminder-sub">We'll remind you before the event starts</p>
                            </div>
                        </div>
                        <div class="ed-reminder-opts">
                            ${["1 hour before", "1 day before", "3 days before", "1 week before"].map(t => `
                            <button class="ed-reminder-chip ${hasReminder(publicId, t) ? "set" : ""}" data-timing="${t}">
                                ${hasReminder(publicId, t) ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M20 6L9 17L4 12"/></svg>` : ""}
                                ${t}
                                ${hasReminder(publicId, t) ? `<span class="ed-reminder-clear" data-timing="${t}" title="Remove reminder">×</span>` : ""}
                            </button>
                            `).join("")}
                        </div>
                    </div>

                </div>
            </div>

            <!-- Ticket modal -->
            <div class="ed-ticket-overlay" id="edTicketOverlay">
                <div class="ed-ticket-modal">
                    <div class="ed-modal-top">
                        <div>
                            <h2 class="ed-modal-title">${isFree ? "Register" : "Confirm booking"}</h2>
                            <p class="ed-modal-sub">Review your order before confirming</p>
                        </div>
                        <button class="ed-modal-close" id="edModalClose">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="ed-modal-summary">
                        <p class="ed-modal-event-name">${event.title}</p>
                        <p class="ed-modal-meta" id="edModalMeta">${formatShortDate(event.date)} · ${formatTime(event.date)}</p>
                    </div>
                    <div class="ed-modal-total">
                        <span class="ed-modal-total-label" id="edModalQtyLabel">1 ticket</span>
                        <span class="ed-modal-total-val" id="edModalTotal">${isFree ? "Free" : `₦${price.toLocaleString()}`}</span>
                    </div>
                    <button class="ed-modal-confirm-btn" id="edModalConfirm">
                        ${isFree ? "Confirm registration" : "Proceed to payment"}
                    </button>
                    <p class="ed-modal-note">You'll receive a confirmation email with your ticket</p>
                </div>
            </div>

        </div>
    `;

    // Animate hero image in
    setTimeout(() => document.getElementById("edHero")?.classList.add("loaded"), 100);

    // Wire up all interactions
    setupInteractions(event, publicId, tiers, isFree, price, isOnline);
}

function setupInteractions(
    event: any,
    publicId: string,
    tiers: Array<{ name: string; price: number; available: number }>,
    isFree: boolean,
    basePrice: number,
    isOnline: boolean
): void {

    let qty = 1;
    let selectedTierIdx = 0;

    const getSelectedPrice = () => tiers[selectedTierIdx]?.price ?? basePrice;
    const getTotal = () => getSelectedPrice() * qty;

    // ── Hero location chip → Get Directions ───
    const heroLocation = document.getElementById("edHeroLocation");
    if (heroLocation && !isOnline) {
        const address = event.venueAddress || event.location || "";
        if (address) {
            heroLocation.addEventListener("click", () => {
                const lat = event.latitude;
                const lng = event.longitude;
                const url = lat && lng
                    ? `https://www.google.com/maps?q=${lat},${lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                window.open(url, "_blank", "noopener");
            });
        }
    }

    // ── Quantity controls ──────────────────────
    const qtyVal = document.getElementById("edQtyVal")!;
    const qtyMinus = document.getElementById("edQtyMinus") as HTMLButtonElement;
    const qtyPlus = document.getElementById("edQtyPlus") as HTMLButtonElement;

    function updateQty(): void {
        qtyVal.textContent = String(qty);
        qtyMinus.disabled = qty <= 1;
        updateModal();
    }

    qtyMinus.addEventListener("click", () => { if (qty > 1) { qty--; updateQty(); } });
    qtyPlus.addEventListener("click", () => {
        const maxQty = Math.min(10, tiers[selectedTierIdx]?.available || 10);
        if (qty < maxQty) { qty++; updateQty(); }
    });

    // ── Tier selection ─────────────────────────
    document.querySelectorAll<HTMLElement>(".ed-tier").forEach(tier => {
        tier.addEventListener("click", () => {
            document.querySelectorAll(".ed-tier").forEach(t => t.classList.remove("selected"));
            tier.classList.add("selected");
            selectedTierIdx = parseInt(tier.dataset.tier || "0");
            updateModal();
        });
    });

    // ── Save / bookmark ────────────────────────
    const saveBtn = document.getElementById("edSaveBtn")!;
    saveBtn.addEventListener("click", () => {
        const nowSaved = toggleSaved(publicId);
        const icon = saveBtn.querySelector("svg")!;
        icon.setAttribute("fill", nowSaved ? "currentColor" : "none");
        saveBtn.classList.toggle("active", nowSaved);
        showToast(nowSaved ? "Event saved to your bookmarks" : "Removed from bookmarks", nowSaved ? "success" : "info");
    });

    // ── Share ──────────────────────────────────
    const sharePanel = document.getElementById("edSharePanel")!;
    let sharePanelOpen = false;

    function toggleSharePanel(): void {
        sharePanelOpen = !sharePanelOpen;
        sharePanel.classList.toggle("show", sharePanelOpen);
        const notifyPanel = document.getElementById("edNotifyPanel")!;
        notifyPanel.classList.remove("show");
        document.getElementById("edReminderCard")!.style.display = "none";
        document.querySelectorAll(".ed-action-mini").forEach(b => b.classList.remove("active"));
        if (sharePanelOpen) document.getElementById("edShareBtn")?.classList.add("active");
    }

    document.getElementById("edShareBtn")?.addEventListener("click", toggleSharePanel);
    document.getElementById("edShareHeroBtn")?.addEventListener("click", () => {
        if (navigator.share) {
            navigator.share({ title: event.title, url: window.location.href }).catch(() => {});
        } else {
            toggleSharePanel();
        }
    });

    document.getElementById("edCopyLinkBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById("edCopyLinkBtn")!;
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 2000);
            showToast("Link copied to clipboard", "success");
        });
    });

    const text = encodeURIComponent(`${event.title} — ${window.location.href}`);
    const url = encodeURIComponent(window.location.href);
    const titleEnc = encodeURIComponent(event.title);

    document.getElementById("edShareTwitter")?.addEventListener("click", () => {
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener");
    });
    document.getElementById("edShareWhatsApp")?.addEventListener("click", () => {
        window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    });
    document.getElementById("edShareFacebook")?.addEventListener("click", () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener");
    });
    document.getElementById("edShareLinkedIn")?.addEventListener("click", () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener");
    });
    document.getElementById("edShareTelegram")?.addEventListener("click", () => {
        window.open(`https://t.me/share/url?url=${url}&text=${titleEnc}`, "_blank", "noopener");
    });
    document.getElementById("edShareInstagram")?.addEventListener("click", () => {
        // Instagram has no direct web share URL — copy link and guide user
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast("Link copied — paste it in your Instagram story or bio!", "success");
        });
    });

    // ── Notifications ──────────────────────────
    const notifyPanel = document.getElementById("edNotifyPanel")!;
    let notifyPanelOpen = false;

    document.getElementById("edNotifyBtn")?.addEventListener("click", () => {
        notifyPanelOpen = !notifyPanelOpen;
        notifyPanel.classList.toggle("show", notifyPanelOpen);
        sharePanel.classList.remove("show");
        sharePanelOpen = false;
        document.getElementById("edReminderCard")!.style.display = "none";
        document.querySelectorAll(".ed-action-mini").forEach(b => b.classList.remove("active"));
        if (notifyPanelOpen) document.getElementById("edNotifyBtn")?.classList.add("active");
    });

    document.getElementById("edNotifUpdates")?.addEventListener("change", (e) => {
        const val = (e.target as HTMLInputElement).checked;
        setNotifPref(publicId, "updates", val);
        showToast(val ? "You'll be notified about event updates" : "Update notifications off", val ? "success" : "info");
        // TODO: call backend notification API when connected
    });

    document.getElementById("edNotifReminders")?.addEventListener("change", (e) => {
        const val = (e.target as HTMLInputElement).checked;
        setNotifPref(publicId, "reminders", val);
        showToast(val ? "Reminder notifications enabled" : "Reminder notifications off", val ? "success" : "info");
        // TODO: call backend notification API when connected
    });

    // ── Reminders ─────────────────────────────
    const reminderCard = document.getElementById("edReminderCard")!;
    let reminderOpen = false;

    document.getElementById("edReminderBtn")?.addEventListener("click", () => {
        reminderOpen = !reminderOpen;
        reminderCard.style.display = reminderOpen ? "block" : "none";
        sharePanel.classList.remove("show");
        notifyPanel.classList.remove("show");
        sharePanelOpen = false;
        notifyPanelOpen = false;
        document.querySelectorAll(".ed-action-mini").forEach(b => b.classList.remove("active"));
        if (reminderOpen) document.getElementById("edReminderBtn")?.classList.add("active");
    });

    document.querySelectorAll<HTMLElement>(".ed-reminder-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            const timing = chip.dataset.timing!;

            // Clicked the clear × button
            if (target.classList.contains("ed-reminder-clear")) {
                e.stopPropagation();
                removeReminder(publicId, timing);
                chip.classList.remove("set");
                // Re-render chip without checkmark/clear
                chip.innerHTML = timing;
                showToast(`Reminder removed: ${timing}`, "info");
                return;
            }

            const alreadySet = chip.classList.contains("set");
            if (!alreadySet) {
                setReminder(publicId, timing);
                chip.classList.add("set");
                chip.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M20 6L9 17L4 12"/></svg> ${timing} <span class="ed-reminder-clear" data-timing="${timing}" title="Remove reminder">×</span>`;
                showToast(`Reminder set: ${timing}`, "info");
                // TODO: call backend reminder API when connected
            }
        });
    });

    // ── Ticket modal ───────────────────────────
    const overlay = document.getElementById("edTicketOverlay")!;
    const modalQtyLabel = document.getElementById("edModalQtyLabel")!;
    const modalTotal = document.getElementById("edModalTotal")!;

    function updateModal(): void {
        const total = getTotal();
        const tierName = tiers[selectedTierIdx]?.name || "ticket";
        modalQtyLabel.textContent = `${qty} × ${tierName}`;
        modalTotal.textContent = total === 0 ? "Free" : `₦${total.toLocaleString()}`;
    }

    document.getElementById("edBuyBtn")?.addEventListener("click", () => {
        updateModal();
        overlay.classList.add("show");
    });

    document.getElementById("edModalClose")?.addEventListener("click", () => {
        overlay.classList.remove("show");
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("show");
    });

    document.getElementById("edModalConfirm")?.addEventListener("click", async () => {
        if (isFree) {
            // Free events — no payment needed, just confirm
            overlay.classList.remove("show");
            showToast("Registration confirmed! Check your email for details.", "success");
            return;
        }

        // Paid event — call backend to init Paystack
        const confirmBtn = document.getElementById("edModalConfirm") as HTMLButtonElement;
        const originalText = confirmBtn.innerHTML;

        // Loading state on button
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
            <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="width:14px;height:14px;border-radius:50%;border:2px solid rgba(6,8,15,0.2);border-top-color:#06080f;animation:spin 0.7s linear infinite;display:inline-block;"></span>
                Connecting to payment…
            </span>
        `;

        try {
            const { authorizationUrl } = await initPayment(event.id || publicId);

            // Paystack will redirect back to /payment/callback?reference=...
            // We need to tell Paystack our callback URL — this is set in your
            // Paystack dashboard under Settings → API Keys & Webhooks → Callback URL.
            // Set it to: https://yourdomain.com/payment/callback
            // (or http://localhost:5173/payment/callback for local testing)

            // Redirect to Paystack hosted payment page
            window.location.href = authorizationUrl;

        } catch (err: any) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
            overlay.classList.remove("show");

            const msg = err?.message || "Failed to initialize payment";

            if (msg.toLowerCase().includes("already paid")) {
                showToast("You've already purchased a ticket for this event.", "info");
            } else if (msg.toLowerCase().includes("not found")) {
                showToast("Event not found. Please try again.", "error");
            } else {
                showToast(msg, "error");
            }
        }
    });

    // ── Close panels on outside click ─────────
    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const inSidebar = target.closest(".ed-sidebar");
        if (!inSidebar) {
            sharePanel.classList.remove("show");
            notifyPanel.classList.remove("show");
            reminderCard.style.display = "none";
            sharePanelOpen = false;
            notifyPanelOpen = false;
            reminderOpen = false;
            document.querySelectorAll(".ed-action-mini").forEach(b => b.classList.remove("active"));
        }
    });
}