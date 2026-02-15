import "./event-details.css";
import { getEvent } from "../../api/events.api";
import { showMessage } from "../../components/notify/notify";

export async function renderEventDetails(publicId: string) {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="event-details-loading">
            Loading event...
        </div>
    `;

    try {
        const event = await getEvent(publicId);

        app.innerHTML = `
        <div class="event-details-wrapper">

            <section class="event-hero"
                style="background-image: url('${event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}')">

                <div class="event-hero-overlay">
                    <span class="event-category">${event.category || "Event"}</span>
                    <h1>${event.title}</h1>

                    <p class="event-meta">
                        ${new Date(event.date).toLocaleString()}
                    </p>

                    <p class="event-meta">
                        ${event.city || ""} ${event.venueName ? "• " + event.venueName : ""}
                    </p>
                </div>
            </section>

            <section class="event-content">

                <div class="event-main">

                    <h2>About This Event</h2>
                    <p>${event.description}</p>

                    ${event.agenda ? `
                        <h3>Agenda</h3>
                        <p>${event.agenda}</p>
                    ` : ""}

                    ${event.requirements ? `
                        <h3>Requirements</h3>
                        <p>${event.requirements}</p>
                    ` : ""}

                    ${event.refundPolicy ? `
                        <h3>Refund Policy</h3>
                        <p>${event.refundPolicy}</p>
                    ` : ""}

                </div>

                <div class="event-sidebar">

                    <div class="ticket-card">

                        <div class="ticket-price">
                            ${event.price > 0 ? `₦${event.price}` : "Free"}
                        </div>

                        <div class="ticket-date">
                            ${new Date(event.date).toLocaleString()}
                        </div>

                        ${event.capacity ? `
                            <div class="ticket-remaining">
                                ${event.ticketsLeft} / ${event.capacity} tickets left
                            </div>
                        ` : ""}

                        <div class="views">
                            👀 ${event.viewCount} views
                        </div>

                        <button class="buy-btn">
                            ${event.price > 0 ? "Buy Ticket" : "Register Free"}
                        </button>
                    </div>

                    <div class="share-card">
                        <button id="share-btn">Share Event</button>
                    </div>

                </div>

            </section>

        </div>
        `;

        document.getElementById("share-btn")!
            .addEventListener("click", () => {
                navigator.clipboard.writeText(window.location.href);
                showMessage("Link copied to clipboard 🔗", "success");
            });

    } catch {
        showMessage("Failed to load event", "error");
    }
}
