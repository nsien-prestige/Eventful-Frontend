import "./agendaSection.css";
import "../createEventPage.css";
import { setupTimePicker } from "./timePickerHelper";

export interface AgendaSlot {
    title: string;
    startTime: string;
    endTime: string;
    host: string;
    description: string;
}

let slotCounter = 0;

// NEW: Helper to check if slot is complete
function isSlotComplete(card: HTMLElement): boolean {
    const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
    const startInput = card.querySelector(".agenda-slot-start") as HTMLInputElement;
    const endInput = card.querySelector(".agenda-slot-end") as HTMLInputElement;
    
    return !!(
        titleInput?.value.trim() &&
        startInput?.value.trim() &&
        endInput?.value.trim()
    );
}

// Eventbrite-style color pairs: [barColor, backgroundColor]
const SLOT_COLORS = [
    { bar: '#FF6B6B', bg: '#FFE5E5' }, // coral red
    { bar: '#4ECDC4', bg: '#E0F7F5' }, // teal
    { bar: '#6C5CE7', bg: '#EEEAFD' }, // purple
    { bar: '#FFA502', bg: '#FFF3E0' }, // orange
    { bar: '#26DE81', bg: '#E0F9EF' }, // green
    { bar: '#45AAF2', bg: '#E3F2FD' }, // blue
    { bar: '#F368E0', bg: '#FCE4EC' }, // pink
    { bar: '#A29BFE', bg: '#EDE7F6' }, // lavender
];

// NEW: Collapse slot to preview card
function collapseSlotToPreview(card: HTMLElement): void {
    if (!isSlotComplete(card) || card.classList.contains("collapsed")) return;
    
    // Get slot data
    const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
    const hostInput = card.querySelector(".agenda-slot-host") as HTMLInputElement;
    const descInput = card.querySelector(".agenda-slot-desc") as HTMLTextAreaElement;
    
    const startLabel = card.querySelector("#startLabel_" + card.dataset.slotId) as HTMLElement;
    const endLabel = card.querySelector("#endLabel_" + card.dataset.slotId) as HTMLElement;
    
    const title = titleInput.value.trim();
    const startTime = startLabel?.textContent || "Start time";
    const endTime = endLabel?.textContent || "End time";
    const host = hostInput?.value.trim() || "";
    const description = descInput?.value.trim() || "";
    
    // Get color based on slot index
    const slotIndex = parseInt(card.dataset.slotId || "0");
    const colorPair = SLOT_COLORS[slotIndex % SLOT_COLORS.length];
    
    // Create preview card with colored bar + matching background
    const previewCard = document.createElement("div");
    previewCard.className = "agenda-slot-preview";
    previewCard.style.background = colorPair.bg; // Set background color
    
    previewCard.innerHTML = `
        <div class="agenda-preview-accent" style="background: ${colorPair.bar};"></div>
        <div class="agenda-slot-preview-content">
            <div class="agenda-preview-header">
                <p class="agenda-slot-preview-time">${startTime} - ${endTime}</p>
                <h4 class="agenda-slot-preview-title">${title}</h4>
                ${host ? `<span class="agenda-slot-preview-host-badge">${host}</span>` : ''}
            </div>
            ${description ? `<p class="agenda-slot-preview-desc">${description}</p>` : ''}
        </div>
        <button class="agenda-slot-edit-btn" type="button" title="Edit slot">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </button>
    `;
    
    // Hide original card content, show preview
    const titleWrapper = card.querySelector(".agenda-title-wrapper") as HTMLElement;
    const timeRow = card.querySelector(".agenda-time-row") as HTMLElement;
    const descWrapper = card.querySelector(".agenda-desc-wrapper") as HTMLElement;
    const hostInputEl = card.querySelector(".agenda-slot-host") as HTMLElement;
    const inlineActions = card.querySelector(".agenda-inline-actions") as HTMLElement;
    
    if (titleWrapper) titleWrapper.style.display = "none";
    if (timeRow) timeRow.style.display = "none";
    if (descWrapper) descWrapper.style.display = "none";
    if (hostInputEl) hostInputEl.style.display = "none";
    if (inlineActions) inlineActions.style.display = "none";
    
    // Insert preview card
    card.insertBefore(previewCard, card.firstChild);
    card.classList.add("collapsed");
    
    // Edit button click - expand slot
    const editBtn = previewCard.querySelector(".agenda-slot-edit-btn") as HTMLButtonElement;
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        expandSlot(card);
    });
}

// NEW: Expand slot from preview
function expandSlot(card: HTMLElement): void {
    const previewCard = card.querySelector(".agenda-slot-preview");
    if (previewCard) previewCard.remove();
    
    const titleWrapper = card.querySelector(".agenda-title-wrapper") as HTMLElement;
    const timeRow = card.querySelector(".agenda-time-row") as HTMLElement;
    const descWrapper = card.querySelector(".agenda-desc-wrapper") as HTMLElement;
    const hostInput = card.querySelector(".agenda-slot-host") as HTMLElement;
    const inlineActions = card.querySelector(".agenda-inline-actions") as HTMLElement;
    
    if (titleWrapper) titleWrapper.style.display = "";
    if (timeRow) timeRow.style.display = "";
    if (inlineActions) inlineActions.style.display = "";
    
    // Restore desc/host if they were visible before
    if (descWrapper && descWrapper.querySelector("textarea")?.value) {
        descWrapper.style.display = "block";
    }
    if (hostInput && (hostInput as HTMLInputElement).value) {
        hostInput.style.display = "block";
    }
    
    card.classList.remove("collapsed");
}

// NEW: Collapse all complete slots
export function collapseCompleteSlots(): void {
    document.querySelectorAll(".agenda-slot-card").forEach(card => {
        collapseSlotToPreview(card as HTMLElement);
    });
}

export function renderAgendaSection(): string {
    return `
        <div class="section-card collapsible agenda-section" data-section="agenda">

            <div class="section-header" id="agendaHeader">
                <div class="section-heading-group">
                    <h2 class="agenda-title">Agenda</h2>
                    <p class="section-subtext" id="agendaSubtext">
                        Add an itinerary, schedule, or lineup to your event. You can include a time,
                        a description of what will happen, and who will host or perform during the event.
                        (Ex. Speaker, performer, artist, guide, etc.)
                    </p>
                </div>

                <div class="section-actions">
                    <div class="section-status" id="agendaStatus">
                        <svg viewBox="0 0 24 24" class="check-icon">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                    <!-- REMOVED: Expand button - no longer needed -->
                    <button class="delete-section-btn" id="agendaDeleteBtn" type="button">Delete section</button>
                </div>
            </div>

            <!-- COLLAPSIBLE CONTENT -->
            <div class="section-content hidden" id="agendaContent">
                <!-- SLOT LIST -->
                <div class="agenda-slot-list" id="agendaSlotList"></div>

                <!-- ADD SLOT BUTTON -->
                <button class="agenda-add-slot-btn" id="addAgendaSlotBtn" type="button">
                    + Add slot
                </button>
            </div>

        </div>
    `;
}

export function setupAgendaSection(sectionElement: HTMLElement): void {
    const slotListEl = sectionElement.querySelector("#agendaSlotList") as HTMLElement;
    const addSlotBtn = sectionElement.querySelector("#addAgendaSlotBtn") as HTMLButtonElement;

    function addSlot(): void {
        // FIRST: Collapse all complete slots before adding new one
        collapseCompleteSlots();
        
        const slotId = slotCounter++;
        const card   = document.createElement("div");
        card.className      = "agenda-slot-card";
        card.dataset.slotId = String(slotId);

        card.innerHTML = `
            <div class="agenda-title-wrapper">
                <div class="agenda-slot-top">
                    <div class="agenda-slot-title-field">
                        <label class="agenda-slot-title-label" for="slotTitle_${slotId}">Title <span class="agenda-required">*</span></label>
                        <input
                            class="agenda-slot-title-input"
                            id="slotTitle_${slotId}"
                            type="text"
                            placeholder=""
                            autocomplete="off"
                        />
                    </div>
                    <button class="agenda-slot-trash" type="button" title="Remove slot">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
                <span class="agenda-slot-error hidden" id="slotError_${slotId}">Title can't be left blank</span>
            </div>

            <div class="agenda-time-row">
                <button class="time-picker-btn agenda-time-btn" data-target="slotStart_${slotId}" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span class="time-picker-label" id="startLabel_${slotId}">Start time</span>
                    <input class="time-picker-input agenda-slot-start" id="slotStart_${slotId}" type="hidden" />
                </button>
                
                <button class="time-picker-btn agenda-time-btn" data-target="slotEnd_${slotId}" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span class="time-picker-label" id="endLabel_${slotId}">End time</span>
                    <input class="time-picker-input agenda-slot-end" id="slotEnd_${slotId}" type="hidden" />
                </button>
            </div>

            <div class="agenda-desc-wrapper" style="display:none">
                <div class="agenda-desc-header">
                    <span class="agenda-desc-label">Description</span>
                    <button class="agenda-desc-remove" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <textarea class="agenda-slot-desc agenda-collapsible-field" style="display:block" rows="3" placeholder="Describe this slot..."></textarea>
            </div>

            <input class="agenda-slot-host agenda-collapsible-field" style="display:none" type="text" placeholder="Host or Artist name" />

            <div class="agenda-inline-actions">
                <button class="agenda-inline-btn agenda-toggle-host" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#3A3247" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M11.998 6.002c1.208 0 2.19.982 2.19 2.19s-.982 2.191-2.19 2.191a2.194 2.194 0 0 1-2.191-2.19c0-1.209.982-2.191 2.19-2.191ZM12 12.386A4.193 4.193 0 1 0 12 4a4.193 4.193 0 0 0 0 8.387Zm6.541 2.707a9.5 9.5 0 0 1-1.275 1.131c-.966-1.917-3.004-3.193-5.252-3.193-2.252 0-4.3 1.28-5.263 3.207a9.6 9.6 0 0 1-1.292-1.145L4 16.46C6.135 18.743 8.976 20 12.001 20s5.865-1.257 7.999-3.538zm-10.05 2.166a8.7 8.7 0 0 0 7.044-.01c-.604-1.322-1.983-2.214-3.52-2.214-1.54 0-2.923.897-3.524 2.224" clip-rule="evenodd"></path>
                    </svg>
                    Host or Artist
                </button>
                <button class="agenda-inline-btn agenda-toggle-desc" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#3A3247" viewBox="0 0 24 24">
                        <path d="M6 5H4v2h2zm0 6H4v2h2zm-2 6h2v2H4zM20 5H8v2h12zM8 11h12v2H8zm12 6H8v2h12z" clip-rule="evenodd"></path>
                    </svg>
                    Add description
                </button>
            </div>
        `;

        const titleInput = card.querySelector(".agenda-slot-title-input") as HTMLInputElement;
        const errorEl    = card.querySelector(`#slotError_${slotId}`) as HTMLElement;

        titleInput.addEventListener("blur", () => {
            if (!titleInput.value.trim()) {
                titleInput.classList.add("has-error");
                errorEl.classList.remove("hidden");
            }
        });
        titleInput.addEventListener("input", () => {
            if (titleInput.value.trim()) {
                titleInput.classList.remove("has-error");
                errorEl.classList.add("hidden");
            }
        });

        card.querySelectorAll<HTMLButtonElement>(".time-picker-btn").forEach(btn => {
            const targetId  = btn.dataset.target!;
            const inputEl   = card.querySelector(`#${targetId}`) as HTMLInputElement;
            const labelEl   = btn.querySelector(".time-picker-label") as HTMLElement;
            
            setupTimePicker(btn, inputEl, labelEl);
        });

        card.querySelector(".agenda-slot-trash")!.addEventListener("click", () => card.remove());

        const hostInput = card.querySelector(".agenda-slot-host") as HTMLInputElement;
        const hostBtn   = card.querySelector(".agenda-toggle-host") as HTMLButtonElement;
        const actionsEl = card.querySelector(".agenda-inline-actions") as HTMLElement;

        hostBtn.addEventListener("click", () => {
            const isVisible = hostInput.style.display === "block";
            hostInput.style.display = isVisible ? "none" : "block";
            actionsEl.insertAdjacentElement("beforebegin", hostInput);
            hostBtn.classList.toggle("active", !isVisible);
            if (!isVisible) hostInput.focus();
            else hostInput.value = "";
        });

        const descWrapper = card.querySelector(".agenda-desc-wrapper") as HTMLElement;
        const descInput   = card.querySelector(".agenda-slot-desc") as HTMLTextAreaElement;
        const descBtn     = card.querySelector(".agenda-toggle-desc") as HTMLButtonElement;
        const descRemove  = card.querySelector(".agenda-desc-remove") as HTMLButtonElement;

        descBtn.addEventListener("click", () => {
            descBtn.style.display     = "none";
            descWrapper.style.display = "block";
            hostInput.insertAdjacentElement("beforebegin", descWrapper);
            descInput.focus();
        });

        descRemove.addEventListener("click", () => {
            descWrapper.style.display = "none";
            descInput.value           = "";
            descBtn.style.display     = "";
            actionsEl.insertAdjacentElement("beforebegin", descWrapper);
        });

        slotListEl.appendChild(card);
    }

    // TRIGGER: + Add slot button
    addSlotBtn.addEventListener("click", () => addSlot());
    
    // Initial slot
    addSlot();
}

export function getAgendaData(): AgendaSlot[] {
    return Array.from(document.querySelectorAll(".agenda-slot-card")).map(card => ({
        title:       (card.querySelector(".agenda-slot-title-input") as HTMLInputElement)?.value.trim()    ?? "",
        startTime:   (card.querySelector(".agenda-slot-start")       as HTMLInputElement)?.value.trim()    ?? "",
        endTime:     (card.querySelector(".agenda-slot-end")         as HTMLInputElement)?.value.trim()    ?? "",
        host:        (card.querySelector(".agenda-slot-host")        as HTMLInputElement)?.value.trim()    ?? "",
        description: (card.querySelector(".agenda-slot-desc")        as HTMLTextAreaElement)?.value.trim() ?? "",
    }));
}