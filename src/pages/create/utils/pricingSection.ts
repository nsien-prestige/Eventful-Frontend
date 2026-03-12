import "./pricingSection.css";
import "../createEventPage.css";

export interface PricingTicket {
    name: string;
    price: string;
    quantity: string;
}

let ticketCounter = 0;

// Helper to check if ticket is complete
function isTicketComplete(card: HTMLElement): boolean {
    const nameInput = card.querySelector(".ticket-name-input") as HTMLInputElement;
    const priceInput = card.querySelector(".ticket-price-input") as HTMLInputElement;
    const quantityInput = card.querySelector(".ticket-quantity-input") as HTMLInputElement;
    
    // Check if free or priced
    const isFree = card.querySelector('[data-type="free"]')?.classList.contains("active");
    
    // Name and quantity are always required
    const hasName = nameInput?.value.trim();
    const hasQuantity = quantityInput?.value.trim();
    
    // Price only required if ticket is priced
    const hasPrice = isFree || priceInput?.value.trim();
    
    return !!(hasName && hasQuantity && hasPrice);
}

// Ticket colors (rotating palette like agenda)
const TICKET_COLORS = [
    { bar: '#3B82F6', bg: '#DBEAFE' }, // blue
    { bar: '#8B5CF6', bg: '#EDE9FE' }, // purple
    { bar: '#EC4899', bg: '#FCE7F3' }, // pink
    { bar: '#F59E0B', bg: '#FEF3C7' }, // amber
    { bar: '#10B981', bg: '#D1FAE5' }, // green
    { bar: '#EF4444', bg: '#FEE2E2' }, // red
    { bar: '#06B6D4', bg: '#CFFAFE' }, // cyan
    { bar: '#F97316', bg: '#FFEDD5' }, // orange
];

// Collapse ticket to preview card
function collapseTicketToPreview(card: HTMLElement): void {
    if (!isTicketComplete(card) || card.classList.contains("collapsed")) return;
    
    const nameInput = card.querySelector(".ticket-name-input") as HTMLInputElement;
    const priceInput = card.querySelector(".ticket-price-input") as HTMLInputElement;
    const quantityInput = card.querySelector(".ticket-quantity-input") as HTMLInputElement;
    
    const name = nameInput.value.trim();
    const price = priceInput.value.trim() || "0";
    const quantity = quantityInput.value.trim();
    const isFree = price === "0" || card.querySelector('[data-type="free"]')?.classList.contains("active");
    
    // Get color based on ticket index
    const ticketIndex = parseInt(card.dataset.ticketId || "0");
    const colorPair = TICKET_COLORS[ticketIndex % TICKET_COLORS.length];
    
    // Create preview card
    const previewCard = document.createElement("div");
    previewCard.className = "ticket-preview";
    previewCard.style.background = colorPair.bg;
    
    previewCard.innerHTML = `
        <div class="ticket-preview-accent" style="background: ${colorPair.bar};"></div>
        <div class="ticket-preview-content">
            <h4 class="ticket-preview-name">${name}</h4>
            <div class="ticket-preview-details">
                <span class="ticket-preview-price">${isFree ? 'Free' : '$' + price}</span>
                <span class="ticket-preview-qty">${quantity} available</span>
            </div>
        </div>
        <button class="ticket-edit-btn" type="button" title="Edit ticket">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </button>
    `;
    
    // Hide original card content
    const titleWrapper = card.querySelector(".ticket-title-wrapper") as HTMLElement;
    const typeToggle = card.querySelector(".ticket-type-toggle") as HTMLElement;
    const inputRow = card.querySelector(".ticket-input-row") as HTMLElement;
    
    if (titleWrapper) titleWrapper.style.display = "none";
    if (typeToggle) typeToggle.style.display = "none";
    if (inputRow) inputRow.style.display = "none";
    
    // Insert preview
    card.insertBefore(previewCard, card.firstChild);
    card.classList.add("collapsed");
    
    // Edit button click
    const editBtn = previewCard.querySelector(".ticket-edit-btn") as HTMLButtonElement;
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        expandTicket(card);
    });
}

// Expand ticket from preview
function expandTicket(card: HTMLElement): void {
    const previewCard = card.querySelector(".ticket-preview");
    if (previewCard) previewCard.remove();
    
    const titleWrapper = card.querySelector(".ticket-title-wrapper") as HTMLElement;
    const typeToggle = card.querySelector(".ticket-type-toggle") as HTMLElement;
    const inputRow = card.querySelector(".ticket-input-row") as HTMLElement;
    
    if (titleWrapper) titleWrapper.style.display = "";
    if (typeToggle) typeToggle.style.display = "";
    if (inputRow) inputRow.style.display = "";
    
    card.classList.remove("collapsed");
}

// Collapse all complete tickets
export function collapseCompleteTickets(): void {
    document.querySelectorAll(".ticket-card").forEach(card => {
        collapseTicketToPreview(card as HTMLElement);
    });
}

export function renderPricingSection(): string {
    return `
        <div class="section-card collapsible pricing-section" data-section="pricing">

            <div class="section-header" id="pricingHeader">
                <div class="section-heading-group">
                    <h2 class="pricing-title">Pricing</h2>
                    <p class="section-subtext" id="pricingSubtext">
                        Set up ticket types and pricing for your event. You can offer free tickets or set prices for different tiers.
                    </p>
                </div>

                <div class="section-actions">
                    <div class="section-status" id="pricingStatus">
                        <svg viewBox="0 0 24 24" class="check-icon">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                    <!-- NO expand button needed -->
                    <button class="delete-section-btn" id="pricingDeleteBtn" type="button">Delete section</button>
                </div>
            </div>

            <!-- COLLAPSIBLE CONTENT -->
            <div class="section-content hidden" id="pricingContent">
                <!-- TICKET LIST -->
                <div class="ticket-list" id="ticketList"></div>

                <!-- ADD TICKET BUTTON -->
                <button class="pricing-add-ticket-btn" id="addTicketBtn" type="button">
                    + Add ticket
                </button>
            </div>

        </div>
    `;
}

export function setupPricingSection(sectionElement: HTMLElement): void {
    const ticketListEl = sectionElement.querySelector("#ticketList") as HTMLElement;
    const addTicketBtn = sectionElement.querySelector("#addTicketBtn") as HTMLButtonElement;

    function addTicket(): void {
        // Collapse all complete tickets before adding new one
        collapseCompleteTickets();
        
        const ticketId = ticketCounter++;
        const card = document.createElement("div");
        card.className = "ticket-card";
        card.dataset.ticketId = String(ticketId);

        card.innerHTML = `
            <div class="ticket-title-wrapper">
                <div class="ticket-top">
                    <div class="ticket-name-field">
                        <label class="ticket-label" for="ticketName_${ticketId}">Ticket name <span class="field-required">*</span></label>
                        <input
                            class="ticket-name-input"
                            id="ticketName_${ticketId}"
                            type="text"
                            placeholder="e.g. Early Bird, VIP, General Admission"
                            autocomplete="off"
                        />
                    </div>
                    <button class="ticket-trash" type="button" title="Remove ticket">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- FREE/PRICED TOGGLE -->
            <div class="ticket-type-toggle">
                <button class="ticket-type-btn active" data-type="free" type="button">Free</button>
                <button class="ticket-type-btn" data-type="priced" type="button">Priced</button>
            </div>

            <div class="ticket-input-row">
                <!-- PRICE FIELD (hidden by default for free tickets) -->
                <div class="ticket-field ticket-price-field" style="display: none;">
                    <label class="ticket-label" for="ticketPrice_${ticketId}">Price <span class="field-required">*</span></label>
                    <div class="ticket-price-wrapper">
                        <span class="ticket-currency">$</span>
                        <input
                            class="ticket-price-input"
                            id="ticketPrice_${ticketId}"
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>
                </div>

                <!-- QUANTITY FIELD -->
                <div class="ticket-field">
                    <label class="ticket-label" for="ticketQty_${ticketId}">Quantity <span class="field-required">*</span></label>
                    <input
                        class="ticket-quantity-input"
                        id="ticketQty_${ticketId}"
                        type="number"
                        placeholder="100"
                        min="1"
                    />
                </div>
            </div>
        `;

        // Setup free/priced toggle
        const freeBtn = card.querySelector('[data-type="free"]') as HTMLButtonElement;
        const pricedBtn = card.querySelector('[data-type="priced"]') as HTMLButtonElement;
        const priceField = card.querySelector('.ticket-price-field') as HTMLElement;
        const priceInput = card.querySelector('.ticket-price-input') as HTMLInputElement;
        
        freeBtn.addEventListener("click", () => {
            freeBtn.classList.add("active");
            pricedBtn.classList.remove("active");
            priceField.style.display = "none";
            priceInput.value = "0"; // Set to 0 for free tickets
        });
        
        pricedBtn.addEventListener("click", () => {
            pricedBtn.classList.add("active");
            freeBtn.classList.remove("active");
            priceField.style.display = "block";
            priceInput.value = ""; // Clear value when switching to priced
            priceInput.focus();
        });

        // Trash button
        card.querySelector(".ticket-trash")!.addEventListener("click", () => card.remove());

        ticketListEl.appendChild(card);
    }

    // Add ticket button
    addTicketBtn.addEventListener("click", () => addTicket());
    
    // Add first ticket by default
    addTicket();
}

export function getPricingData(): PricingTicket[] {
    return Array.from(document.querySelectorAll(".ticket-card")).map(card => ({
        name:     (card.querySelector(".ticket-name-input")     as HTMLInputElement)?.value.trim() ?? "",
        price:    (card.querySelector(".ticket-price-input")    as HTMLInputElement)?.value.trim() ?? "",
        quantity: (card.querySelector(".ticket-quantity-input") as HTMLInputElement)?.value.trim() ?? "",
    }));
}