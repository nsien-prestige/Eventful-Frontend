/**
 * Agenda Slot Collapsible - Eventbrite Style
 * Collapses completed agenda slots into preview cards
 */

export function collapseAgendaSlot(card: HTMLElement): void {
    const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
    const startInput = card.querySelector(".agenda-slot-start") as HTMLInputElement;
    const endInput = card.querySelector(".agenda-slot-end") as HTMLInputElement;
    const hostInput = card.querySelector(".agenda-slot-host") as HTMLInputElement;
    
    // Check if slot is complete (title + start time + end time required)
    const isComplete = 
        titleInput?.value.trim().length > 0 &&
        startInput?.value.trim().length > 0 &&
        endInput?.value.trim().length > 0;
    
    if (!isComplete) return;
    
    // Get values
    const title = titleInput.value.trim();
    const startLabel = card.querySelector("#startLabel_" + card.dataset.slotId)?.textContent || "";
    const endLabel = card.querySelector("#endLabel_" + card.dataset.slotId)?.textContent || "";
    const host = hostInput?.value.trim() || "";
    
    // Create preview card
    const previewHTML = `
        <div class="agenda-slot-preview">
            <div class="agenda-slot-preview-left">
                <div class="agenda-slot-preview-time">${startLabel} - ${endLabel}</div>
                <div class="agenda-slot-preview-title">${title}</div>
                ${host ? `<div class="agenda-slot-preview-host">${host}</div>` : ''}
            </div>
            <button class="agenda-slot-edit-btn" type="button" title="Edit slot">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
        </div>
        <div class="agenda-slot-expanded" style="display: none;">
            ${card.innerHTML}
        </div>
    `;
    
    // Replace content with preview
    card.innerHTML = previewHTML;
    card.classList.add("collapsed");
    
    // Setup edit button
    const editBtn = card.querySelector(".agenda-slot-edit-btn") as HTMLButtonElement;
    editBtn?.addEventListener("click", () => expandAgendaSlot(card));
}

export function expandAgendaSlot(card: HTMLElement): void {
    const previewEl = card.querySelector(".agenda-slot-preview") as HTMLElement;
    const expandedEl = card.querySelector(".agenda-slot-expanded") as HTMLElement;
    
    if (previewEl && expandedEl) {
        previewEl.style.display = "none";
        expandedEl.style.display = "block";
        card.classList.remove("collapsed");
        
        // Need to re-setup all event listeners since we're pulling from stored HTML
        const content = expandedEl.innerHTML;
        card.innerHTML = content;
        card.classList.remove("collapsed");
        
        // Re-setup the card (you'll need to call setupAgendaCard from agendaSection)
        // This will be handled in the main agendaSection.ts file
    }
}

export function collapseAllCompletedSlots(): void {
    const slots = document.querySelectorAll(".agenda-slot-card:not(.collapsed)");
    slots.forEach(slot => {
        collapseAgendaSlot(slot as HTMLElement);
    });
}