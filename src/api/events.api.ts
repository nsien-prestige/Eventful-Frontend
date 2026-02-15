const API_BASE = import.meta.env.VITE_API_URL;

export async function getAllEvents() {
    const res = await fetch(`${API_BASE}/events`);

    if (!res.ok) {
        throw new Error("Failed to fetch events");
    }

    return res.json();
}

export async function getEvent(publicId: string) {
    const res = await fetch(`${API_BASE}/events/${publicId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch event");
    }

    return res.json();
}

