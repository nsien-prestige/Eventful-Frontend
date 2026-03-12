import { launchConfetti } from "./sectionProgress";

let isAgendaSectionComplete = false;
let hasShownConfetti = false;

export function checkAgendaCompletion(): { allComplete: boolean; hasCompleteSlot: boolean } {
    const slots = document.querySelectorAll(".agenda-slot-card");
    
    if (slots.length === 0) return { allComplete: false, hasCompleteSlot: false };
    
    let completeCount = 0;
    
    slots.forEach(card => {
        const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
        const startInput = card.querySelector(".agenda-slot-start") as HTMLInputElement;
        const endInput = card.querySelector(".agenda-slot-end") as HTMLInputElement;
        
        const isComplete = !!(
            titleInput?.value.trim() &&
            startInput?.value.trim() &&
            endInput?.value.trim()
        );
        
        if (isComplete) completeCount++;
    });
    
    return {
        allComplete: completeCount === slots.length && completeCount > 0,
        hasCompleteSlot: completeCount > 0
    };
}

function createPreviewHeader(): string {
    const slots = document.querySelectorAll(".agenda-slot-card");
    const completedSlots: string[] = [];
    
    slots.forEach(card => {
        const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
        const startInput = card.querySelector(".agenda-slot-start") as HTMLInputElement;
        const endInput = card.querySelector(".agenda-slot-end") as HTMLInputElement;
        const hostInput = card.querySelector(".agenda-slot-host") as HTMLInputElement;
        const descInput = card.querySelector(".agenda-slot-desc") as HTMLTextAreaElement;
        
        const isComplete = !!(
            titleInput?.value.trim() &&
            startInput?.value.trim() &&
            endInput?.value.trim()
        );
        
        if (!isComplete) return;
        
        const startLabel = card.querySelector(`#startLabel_${card.getAttribute("data-slot-id")}`) as HTMLElement;
        const endLabel = card.querySelector(`#endLabel_${card.getAttribute("data-slot-id")}`) as HTMLElement;
        
        const title = titleInput.value.trim();
        const startTime = startLabel?.textContent || "Start time";
        const endTime = endLabel?.textContent || "End time";
        const host = hostInput?.value.trim() || "";
        const description = descInput?.value.trim() || "";
        
        // Get color based on slot index
        const slotIndex = parseInt(card.getAttribute("data-slot-id") || "0");
        const SLOT_COLORS = [
            { bar: '#FF6B6B', bg: '#FFE5E5' },
            { bar: '#4ECDC4', bg: '#E0F7F5' },
            { bar: '#6C5CE7', bg: '#EEEAFD' },
            { bar: '#FFA502', bg: '#FFF3E0' },
            { bar: '#26DE81', bg: '#E0F9EF' },
            { bar: '#45AAF2', bg: '#E3F2FD' },
            { bar: '#F368E0', bg: '#FCE4EC' },
            { bar: '#A29BFE', bg: '#EDE7F6' },
        ];
        const colorPair = SLOT_COLORS[slotIndex % SLOT_COLORS.length];
        
        completedSlots.push(`
            <div class="agenda-preview-slot" style="background: ${colorPair.bg};">
                <div class="agenda-preview-accent" style="background: ${colorPair.bar};"></div>
                <div class="agenda-preview-slot-content">
                    <p class="agenda-preview-slot-time">${startTime} - ${endTime}</p>
                    <h4 class="agenda-preview-slot-title">${title}</h4>
                    ${host ? `<span class="agenda-preview-slot-host">${host}</span>` : ''}
                    ${description ? `<p class="agenda-preview-slot-desc">${description}</p>` : ''}
                </div>
            </div>
        `);
    });
    
    return completedSlots.join("");
}
export function expandAgendaSection(): void {
    const header = document.getElementById("agendaHeader");
    const content = document.getElementById("agendaContent");
    const subtext = document.getElementById("agendaSubtext");
    const statusEl = document.getElementById("agendaStatus");
    const deleteBtn = document.getElementById("agendaDeleteBtn");
    const agendaSection = document.querySelector(".agenda-section");
    
    if (!content || !header || !agendaSection) return;
    
    // Remove preview container if it exists
    const existingPreview = agendaSection.querySelector(".agenda-preview-slots-container");
    if (existingPreview) existingPreview.remove();
    
    // Show original subtext
    if (subtext) subtext.style.display = "block";
    
    // HIDE green tick when expanded
    if (statusEl) statusEl.style.display = "none";
    
    // SHOW delete button when expanded
    if (deleteBtn) deleteBtn.style.display = "block";
    
    content.classList.remove("hidden");
}

export function collapseAgendaSection(): void {
    const header = document.getElementById("agendaHeader");
    const content = document.getElementById("agendaContent");
    const subtext = document.getElementById("agendaSubtext");
    const statusEl = document.getElementById("agendaStatus");
    const deleteBtn = document.getElementById("agendaDeleteBtn");
    const agendaSection = document.querySelector(".agenda-section");
    
    if (!content || !header || !agendaSection || content.classList.contains("hidden")) return;
    
    const { hasCompleteSlot } = checkAgendaCompletion();
    
    // Hide original subtext
    if (subtext) subtext.style.display = "none";
    
    // SHOW green tick when collapsed (only if section is complete)
    if (statusEl && hasCompleteSlot) {
        statusEl.style.display = "flex";
        if (!hasShownConfetti) {
            statusEl.classList.add("completed");
            launchConfetti(statusEl);
            hasShownConfetti = true;
        }
    }
    
    // HIDE delete button when collapsed
    if (deleteBtn) deleteBtn.style.display = "none";
    
    // Remove existing preview if any
    const existing = agendaSection.querySelector(".agenda-preview-slots-container");
    if (existing) existing.remove();
    
    // Create and insert preview slots directly in the section (not in header)
    const previewHTML = createPreviewHeader();
    const previewContainer = document.createElement("div");
    previewContainer.className = "agenda-preview-slots-container";
    previewContainer.innerHTML = previewHTML;
    
    // Insert preview AFTER header, BEFORE (collapsed) content
    header.insertAdjacentElement("afterend", previewContainer);
    
    // Animate collapse
    content.style.height = content.scrollHeight + "px";
    
    requestAnimationFrame(() => {
        content.style.transition = "height 0.35s ease, opacity 0.25s ease";
        content.style.height = "0px";
        content.style.opacity = "0";
    });
    
    setTimeout(() => {
        content.classList.add("hidden");
        content.style.height = "";
        content.style.opacity = "";
        content.style.transition = "";
    }, 350);
}

/**
 * Update completion status (but don't show green tick until collapsed)
 */
export function updateAgendaStatus(): void {
    const { hasCompleteSlot } = checkAgendaCompletion();
    isAgendaSectionComplete = hasCompleteSlot;
}

/**
 * Check if user clicked outside the agenda section
 */
function isClickOutsideAgenda(target: HTMLElement): boolean {
    const agendaSection = document.querySelector(".agenda-section");
    if (!agendaSection) return false;
    
    return !agendaSection.contains(target);
}

/**
 * Setup header click to re-expand collapsed section
 */
export function setupAgendaHeaderClick(): void {
    const header = document.getElementById("agendaHeader");
    if (!header) return;
    
    header.addEventListener("click", (e) => {
        const content = document.getElementById("agendaContent");
        if (!content) return;
        
        // If collapsed, expand it
        if (content.classList.contains("hidden")) {
            e.stopPropagation();
            expandAgendaSection();
        }
    });
}

/**
 * Setup click-outside detection for auto-collapse
 */
export function setupAgendaClickOutside(): void {
    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        
        // Don't do anything if agenda section doesn't exist
        const content = document.getElementById("agendaContent");
        if (!content || content.classList.contains("hidden")) return;
        
        // Check if ALL slots are complete
        const { allComplete } = checkAgendaCompletion();
        
        // ONLY collapse if ALL slots complete AND clicked outside
        if (allComplete && isClickOutsideAgenda(target)) {
            collapseAgendaSection();
        }
    });
}

/**
 * Monitor agenda inputs for completion changes
 */
export function monitorAgendaInputs(): void {
    const observer = new MutationObserver(() => {
        updateAgendaStatus();
    });
    
    const slotList = document.getElementById("agendaSlotList");
    if (slotList) {
        observer.observe(slotList, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    }
    
    // Also listen to input events
    document.addEventListener("input", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".agenda-section")) {
            updateAgendaStatus();
        }
    });
    
    // Listen to time picker changes
    document.addEventListener("change", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".agenda-section")) {
            updateAgendaStatus();
        }
    });
}