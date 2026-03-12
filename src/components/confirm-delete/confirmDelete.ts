import "./confirmDelete.css";

export function showDeleteModal(
    eventTitle: string,
    onConfirm: () => Promise<void>
) {
    const existing = document.querySelector(".modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
        <div class="modal">
            <h2>Delete "${eventTitle}"?</h2>
            <p class="warning">
                This action cannot be undone.
            </p>

            <p class="instruction">
                To confirm, type <strong>${eventTitle}</strong> below:
            </p>

            <input 
                type="text" 
                class="confirm-input" 
                placeholder="Type event name exactly"
            />

            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="confirm-delete-btn" disabled>
                    Delete Event
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector(".confirm-input") as HTMLInputElement;
    const confirmBtn = overlay.querySelector(".confirm-delete-btn") as HTMLButtonElement;
    const cancelBtn = overlay.querySelector(".cancel-btn") as HTMLButtonElement;

    input.addEventListener("input", () => {
        confirmBtn.disabled = input.value !== eventTitle;
    });

    cancelBtn.addEventListener("click", () => {
        overlay.remove();
    });

    confirmBtn.addEventListener("click", async () => {
        confirmBtn.textContent = "Deleting...";
        confirmBtn.disabled = true;

        await onConfirm();

        overlay.remove();
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}
