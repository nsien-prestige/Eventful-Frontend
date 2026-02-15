const API_BASE = import.meta.env.VITE_API_URL;

export async function getEventAnalytics(token: string, eventId: string) {
    const res = await fetch(`${API_BASE}/analytics/event/${eventId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch analytics");
    }

    return res.json();
}
