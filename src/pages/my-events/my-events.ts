import { getMyEvents } from "../../api/my-events.api";
import { getToken } from "../../utils/auth";
import { navigate } from "../../router";
import { getEventAnalytics } from "../../api/analytics.api";
import './my-events.css'

export async function renderMyEvents() {
    const app = document.getElementById("app")!;
    const token = getToken();

    if (!token) {
        navigate("/login");
        return;
    }

    app.innerHTML = `
        <div class="my-events-wrapper">
            <h1>My Events</h1>
            <div id="my-events-list">
                <p>Loading your events...</p>
            </div>
        </div>
    `;

    try {
        const events = await getMyEvents(token);
        const list = document.getElementById("my-events-list")!;

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

        if (events.length === 0) {
            list.innerHTML = "<p>You haven't created any events yet.</p>";
            return;
        }

        list.innerHTML = enrichedEvents.map((event: any) => {
            const percentFilled = event.analytics
                ? Math.round((event.analytics.ticketsSold / event.capacity) * 100)
                : 0;

            return `
                <div class="event-card" data-id="${event.id}">
                    
                    <div class="event-preview">
                        <div class="event-image"
                            style="background-image:url('${event.imageUrl || ''}')">
                        </div>

                        <div class="event-info">
                            <div class="event-top">
                                <h3>${event.title}</h3>
                                <span class="status-dot"></span>
                            </div>

                            <p class="event-date">
                                ${new Date(event.date).toDateString()}
                            </p>

                            <p class="event-price">
                                ₦${event.price}
                            </p>

                            ${
                                event.analytics ? `
                                <div class="capacity-bar">
                                    <div class="capacity-fill"
                                        style="width:${percentFilled}%">
                                    </div>
                                </div>
                                <span class="capacity-text">
                                    ${percentFilled}% capacity filled
                                </span>
                                ` : ''
                            }
                        </div>
                    </div>

                    <div class="event-expanded">
                        ${
                            event.analytics ? `
                            <div class="analytics-grid">
                                <div>
                                    <strong>${event.analytics.ticketsSold}</strong>
                                    <span>Tickets Sold</span>
                                </div>
                                <div>
                                    <strong>₦${event.analytics.revenue.toLocaleString()}</strong>
                                    <span>Revenue</span>
                                </div>
                                <div>
                                    <strong>${event.analytics.attendees}</strong>
                                    <span>Attendees</span>
                                </div>
                            </div>
                            ` : `<p>No analytics yet</p>`
                        }

                        <div class="event-actions">
                            <button class="view-btn" data-id="${event.id}">
                                View Full Analytics
                            </button>
                            <button class="delete-btn" data-id="${event.id}">
                                Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".event-preview").forEach(preview => {
            preview.addEventListener("click", () => {
                const card = preview.closest(".event-card");
                card?.classList.toggle("active");
            });
        });


    } catch {
        document.getElementById("my-events-list")!.innerHTML =
            "<p>Failed to load events.</p>";
    }
}
