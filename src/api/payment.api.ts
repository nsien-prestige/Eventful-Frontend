const BASE = "http://localhost:4000";

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token") || "";
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ── Init payment ──────────────────────────────────────────────
// POST /payment/init
// Returns { authorizationUrl: string, reference: string }
export async function initPayment(
    eventId: string
): Promise<{ authorizationUrl: string; reference: string }> {
    const res = await fetch(`${BASE}/payment/init`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ eventId }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to initialize payment");
    }

    return res.json();
}

// ── Verify payment ────────────────────────────────────────────
// GET /payment/verify/:reference
// Returns { paymentStatus: string, gatewayStatus: string }
export async function verifyPayment(
    reference: string
): Promise<{ paymentStatus: string; gatewayStatus: string }> {
    const res = await fetch(`${BASE}/payment/verify/${reference}`, {
        headers: authHeaders(),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to verify payment");
    }

    return res.json();
}