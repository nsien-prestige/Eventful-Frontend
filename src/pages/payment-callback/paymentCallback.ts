import "./paymentCallback.css";
import { verifyPayment } from "../../api/payment.api";
import { navigate } from "../../router";

export async function renderPaymentCallback() {
    const app = document.getElementById("app")!;

    // ── Read ?reference= from URL ──────────────────────────────
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    // ── Loading state ──────────────────────────────────────────
    app.innerHTML = `
        <div class="pcb-page">
            <div class="pcb-orb pcb-orb-1"></div>
            <div class="pcb-orb pcb-orb-2"></div>
            <div class="pcb-card" id="pcb-card">
                <div class="pcb-spinner"></div>
                <p class="pcb-loading-text">Verifying your payment…</p>
            </div>
        </div>
    `;

    // ── No reference ───────────────────────────────────────────
    if (!reference) {
        renderResult(
            "error",
            "No payment reference found.",
            "Something went wrong with the redirect from Paystack."
        );
        return;
    }

    // ── Small delay so webhook has time to process ─────────────
    await new Promise(res => setTimeout(res, 1800));

    try {
        const result = await verifyPayment(reference);

        const gatewayOk = result.gatewayStatus === "success";
        const dbOk      = result.paymentStatus  === "SUCCESS";

        if (gatewayOk && dbOk) {
            renderResult(
                "success",
                "Payment confirmed!",
                "Your ticket has been secured. You'll receive a confirmation shortly."
            );
        } else if (gatewayOk && !dbOk) {
            // Webhook hasn't fired yet — very rare race condition
            renderResult(
                "pending",
                "Payment received — processing…",
                "Your payment went through but is still being confirmed. Check back in a moment."
            );
        } else {
            renderResult(
                "error",
                "Payment not completed.",
                "Your payment did not go through. No charge was made."
            );
        }

    } catch (err: any) {
        renderResult(
            "error",
            "Verification failed.",
            err?.message || "We couldn't verify your payment. Contact support if money was deducted."
        );
    }
}

// ─────────────────────────────────────────────────────────────
// RENDER RESULT
// ─────────────────────────────────────────────────────────────
function renderResult(
    type: "success" | "error" | "pending",
    title: string,
    body: string
) {
    const card = document.getElementById("pcb-card");
    if (!card) return;

    const icons: Record<string, string> = {
        success: `<div class="pcb-icon pcb-icon--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17L4 12"/></svg>
        </div>`,
        error: `<div class="pcb-icon pcb-icon--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>`,
        pending: `<div class="pcb-icon pcb-icon--pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>`,
    };

    card.innerHTML = `
        <div class="pcb-result pcb-result--${type}">
            ${icons[type]}
            <h1 class="pcb-title">${title}</h1>
            <p class="pcb-body">${body}</p>
            <div class="pcb-actions">
                <button class="pcb-btn-primary" id="pcb-primary-btn">
                    ${type === "success" ? "Browse more events" : "Back to explore"}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                ${type === "success" ? `
                <button class="pcb-btn-ghost" id="pcb-dash-btn">
                    Go to dashboard
                </button>` : ""}
            </div>
            ${type === "success" ? `
            <div class="pcb-success-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z"/>
                </svg>
                Your QR ticket will be available in your dashboard
            </div>` : ""}
        </div>
    `;

    document.getElementById("pcb-primary-btn")?.addEventListener("click", () => navigate("/explore"));
    document.getElementById("pcb-dash-btn")?.addEventListener("click", () => navigate("/dashboard"));
}