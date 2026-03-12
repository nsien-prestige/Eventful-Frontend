const API_BASE = import.meta.env.VITE_API_URL;

export async function deleteEvent(token: string, id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const err = await res.json()
        console.log("Delete error:", res.status, err)
        
        throw new Error("Failed to delete event");
    }

    return res.json();
}
