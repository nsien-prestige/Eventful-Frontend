import { getEvent } from "../../api/events.api";
import { navigate } from "../../router";
import { showMessage } from "../../components/notify/notify";
import "./event-details.css";

export async function renderEventDetails(publicId: string) {
    const app = document.getElementById("app")!;

    app.innerHTML = `<div class="event-loading">Loading...</div>`;

    try {
        const event = await getEvent(publicId);

        const dateObj = new Date(event.date);

        const formattedDate = dateObj.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const formattedTime = dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        app.innerHTML = `
        <div class="event-details-page">

            <div class="ambient-bg"></div>

            <div class="event-hero"
                style="background-image: url('${event.imageUrl || "https://picsum.photos/1600/900"}')">

                <div class="hero-gradient"></div>

                <div class="hero-content">
                    <div class="category-pill">${event.category}</div>
                    <h1 class="event-title">${event.title}</h1>

                    <div class="hero-chips">
                        <div class="chip">📅 ${formattedDate}</div>
                        <div class="chip">⏰ ${formattedTime}</div>
                        <div class="chip">📍 ${event.location}</div>
                        <div class="chip">${event.isOnline ? "🌐 Online" : "🏟 Physical"}</div>
                    </div>
                </div>
            </div>

            <div class="event-body">

                <div class="left-column">

                    <div class="glass-panel">
                        <h2>About The Experience</h2>
                        <p>${event.description}</p>
                    </div>

                    <div class="glass-panel stats-panel">
                        <div class="stat-box">
                            <span class="stat-number">${event.capacity}</span>
                            <span class="stat-label">Total Capacity</span>
                        </div>

                        <div class="stat-box">
                            <span class="stat-number">
                                ${event.price > 0 ? `₦${event.price}` : "FREE"}
                            </span>
                            <span class="stat-label">Ticket Price</span>
                        </div>
                    </div>

                </div>

                <div class="right-column">

                    <div class="action-panel">

                        <div class="action-price">
                            ${event.price > 0 ? `₦${event.price}` : "Free Entry"}
                        </div>

                        <button id="buyBtn" class="action-btn primary">
                            🎟 Secure Ticket
                        </button>

                        <button id="reminderBtn" class="action-btn secondary">
                            ⏳ Set Reminder
                        </button>

                        <button id="shareBtn" class="action-btn outline">
                            🔗 Share Event
                        </button>

                    </div>

                </div>

            </div>
        </div>
        `;

        setupActions(event);

    } catch (error) {
        showMessage("Failed to load event", "error");
        navigate("/explore");
    }
}

function setupActions(event: any) {
    document.getElementById("buyBtn")!.addEventListener("click", () => {
        showMessage("Booking system loading next 🔥", "success");
    });

    document.getElementById("reminderBtn")!.addEventListener("click", () => {
        showMessage("Reminder system coming soon ⏳", "success");
    });

    document.getElementById("shareBtn")!.addEventListener("click", async () => {
        const shareData = {
            title: event.title,
            text: event.description,
            url: window.location.href
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(window.location.href);
            showMessage("Link copied!", "success");
        }
    });
}