import { getAllEvents } from "../../api/events.api";
import { showMessage } from "../../components/notify/notify";
import { navigate } from "../../router";
import './explore.css'

export async function renderExplore() {
    console.log("🚀 renderExplore is running");
    
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="explore-hero">
            <h1>Discover Amazing Events</h1>
            <p>Find experiences you'll never forget.</p>
            <input id="searchInput" placeholder="Search events..." />
        </div>

        <div class="featured-section">
            <h2>🔥 Featured Events</h2>
            <div id="featuredContainer" class="featured-scroll">
                <div class="explore-loading">Loading featured...</div>
            </div>
        </div>

        <div class="explore-container">
            <h2 class="all-events-title">All Events</h2>
            <div id="eventsContainer" class="events-grid"></div>
        </div>
    `;

    try {
        const events = await getAllEvents();
        console.log("🔥 Events from API:", events);

        // 🔥 Sort for featured (example: highest price first)
        const featured = [...events]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);

        renderFeatured(featured);
        renderEvents(events);

        const searchInput = document.getElementById("searchInput") as HTMLInputElement;

        searchInput.addEventListener("input", () => {
            const value = searchInput.value.toLowerCase();
            const filtered = events.filter((e: any) =>
                e.title.toLowerCase().includes(value) ||
                e.description.toLowerCase().includes(value)
            );
            renderEvents(filtered);
        });

    } catch (err) {
        showMessage("Failed to load events", "error");
    }
}

function renderEvents(events: any[]) {
    const container = document.getElementById("eventsContainer")!;

    console.log("🎯 Rebuilding cards:", events.length);

    if (!events.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No events found</h3>
                <p>Try adjusting your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {

        const dateObj = new Date(event.date);

        const date = dateObj.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        const time = dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="event-card" data-id="${event.publicId}">

                <div 
                    class="event-image"
                    style="background-image: url('${event.imageUrl || "https://picsum.photos/600/400"}')"
                >
                    <button class="share-btn" data-id="${event.publicId}">
                        ⤴
                    </button>
                </div>

                <div class="event-body">
                    <h3 class="event-title">
                        ${event.title}
                    </h3>

                    <div class="event-meta">
                        ${date} • ${time}
                    </div>

                    <div class="event-price">
                        ${event.price > 0 ? `₦${event.price}` : 'Free'}
                    </div>

                </div>
            </div>
        `;
    }).join("");

    // 🔥 Whole card clickable (cleaner UX)
    document.querySelectorAll(".event-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            navigate(`/event/${id}`);
        });
    });
}

function renderFeatured(events: any[]) {
    const container = document.getElementById("featuredContainer")!;

    if (!events.length) {
        container.innerHTML = "<p>No featured events</p>";
        return;
    }

    // 🔥 Duplicate for seamless loop
    const looped = [...events, ...events];

    container.innerHTML = looped.map(event => `
        <div class="featured-card"
            style="background-image: url('${event.imageUrl || ""}')">
            
            <div class="featured-overlay">
                <span class="featured-badge">Featured</span>
                <h3>${event.title}</h3>
                <p>${new Date(event.date).toLocaleDateString()}</p>

                <div class="featured-bottom">
                    <span>₦${event.price}</span>
                    <button data-id="${event.publicId}" class="featured-btn">
                        View Event
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    // 🔥 Proper smooth infinite scroll
    let animationFrame: number;
    let speed = 0.6;

    function animate() {
        container.scrollLeft += speed;

        if (container.scrollLeft >= container.scrollWidth / 2) {
            container.scrollLeft = 0;
        }

        animationFrame = requestAnimationFrame(animate);
    }

    animate();

    container.addEventListener("mouseenter", () => {
        cancelAnimationFrame(animationFrame);
    });

    container.addEventListener("mouseleave", () => {
        animate();
    });

    document.querySelectorAll(".featured-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const publicId = (e.target as HTMLElement).getAttribute("data-id");
           navigate(`/event/${publicId}`);
        });
    });
}


