const API_BASE = import.meta.env.VITE_API_URL;

export async function getMyEvents(token: string) {
    const res = await fetch(`${API_BASE}/events/my-events`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    if (!res.ok) {
        throw new Error("Failed to fetch events");
    }

    return res.json();
}
