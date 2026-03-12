import { launchConfetti } from "./sectionProgress";

let isPricingSectionComplete = false;
let hasShownConfetti = false;

/**
 * Check if ALL tickets are complete
 */
export function checkPricingCompletion(): { allComplete: boolean; hasCompleteTicket: boolean } {
    const tickets = document.querySelectorAll(".ticket-card");
    
    if (tickets.length === 0) return { allComplete: false, hasCompleteTicket: false };
    
    let completeCount = 0;
    
    tickets.forEach(card => {
        const nameInput = card.querySelector(".ticket-name-input") as HTMLInputElement;
        const priceInput = card.querySelector(".ticket-price-input") as HTMLInputElement;
        const quantityInput = card.querySelector(".ticket-quantity-input") as HTMLInputElement;
        
        // Check if free or priced
        const isFree = card.querySelector('[data-type="free"]')?.classList.contains("active");
        
        const hasName = nameInput?.value.trim();
        const hasQuantity = quantityInput?.value.trim();
        const hasPrice = isFree || priceInput?.value.trim();
        
        const isComplete = !!(hasName && hasQuantity && hasPrice);
        
        if (isComplete) completeCount++;
    });
    
    return {
        allComplete: completeCount === tickets.length && completeCount > 0,
        hasCompleteTicket: completeCount > 0
    };
}

/**
 * Create collapsed preview header showing all completed tickets
 */
function createPreviewHeader(): string {
    const tickets = document.querySelectorAll(".ticket-card");
    const completedTickets: string[] = [];
    
    const TICKET_COLORS = [
        { bar: '#3B82F6', bg: '#DBEAFE' },
        { bar: '#8B5CF6', bg: '#EDE9FE' },
        { bar: '#EC4899', bg: '#FCE7F3' },
        { bar: '#F59E0B', bg: '#FEF3C7' },
        { bar: '#10B981', bg: '#D1FAE5' },
        { bar: '#EF4444', bg: '#FEE2E2' },
        { bar: '#06B6D4', bg: '#CFFAFE' },
        { bar: '#F97316', bg: '#FFEDD5' },
    ];
    
    tickets.forEach(card => {
        const nameInput = card.querySelector(".ticket-name-input") as HTMLInputElement;
        const priceInput = card.querySelector(".ticket-price-input") as HTMLInputElement;
        const quantityInput = card.querySelector(".ticket-quantity-input") as HTMLInputElement;
        
        // Check if free or priced
        const isFree = card.querySelector('[data-type="free"]')?.classList.contains("active");
        const hasName = nameInput?.value.trim();
        const hasQuantity = quantityInput?.value.trim();
        const hasPrice = isFree || priceInput?.value.trim();
        
        const isComplete = !!(hasName && hasQuantity && hasPrice);
        
        if (!isComplete) return;
        
        const name = nameInput.value.trim();
        const price = priceInput.value.trim() || "0";
        const quantity = quantityInput.value.trim();
        
        const ticketIndex = parseInt(card.getAttribute("data-ticket-id") || "0");
        const colorPair = TICKET_COLORS[ticketIndex % TICKET_COLORS.length];
        
        completedTickets.push(`
            <div class="pricing-preview-ticket" style="background: ${colorPair.bg};">
                <div class="ticket-preview-accent" style="background: ${colorPair.bar};"></div>
                <div class="pricing-preview-ticket-content">
                    <h4 class="pricing-preview-ticket-name">${name}</h4>
                    <div class="pricing-preview-ticket-details">
                        <span class="pricing-preview-ticket-price">${isFree || price === "0" ? 'Free' : '$' + price}</span>
                        <span class="pricing-preview-ticket-qty">${quantity} available</span>
                    </div>
                </div>
            </div>
        `);
    });
    
    return completedTickets.join("");
}

/**
 * Auto-expand pricing section
 */
export function expandPricingSection(): void {
    const header = document.getElementById("pricingHeader");
    const content = document.getElementById("pricingContent");
    const subtext = document.getElementById("pricingSubtext");
    const statusEl = document.getElementById("pricingStatus");
    const deleteBtn = document.getElementById("pricingDeleteBtn");
    const pricingSection = document.querySelector(".pricing-section");
    
    if (!content || !header || !pricingSection) return;
    
    // Remove preview container if exists
    const existingPreview = pricingSection.querySelector(".pricing-preview-slots-container");
    if (existingPreview) existingPreview.remove();
    
    // Show original subtext
    if (subtext) subtext.style.display = "block";
    
    // HIDE green tick when expanded
    if (statusEl) statusEl.style.display = "none";
    
    // SHOW delete button when expanded
    if (deleteBtn) deleteBtn.style.display = "block";
    
    // Expand the section
    content.classList.remove("hidden");
}

/**
 * Collapse pricing section with preview
 */
export function collapsePricingSection(): void {
    const header = document.getElementById("pricingHeader");
    const content = document.getElementById("pricingContent");
    const subtext = document.getElementById("pricingSubtext");
    const statusEl = document.getElementById("pricingStatus");
    const deleteBtn = document.getElementById("pricingDeleteBtn");
    const pricingSection = document.querySelector(".pricing-section");
    
    if (!content || !header || !pricingSection || content.classList.contains("hidden")) return;
    
    const { hasCompleteTicket } = checkPricingCompletion();
    
    // Hide original subtext
    if (subtext) subtext.style.display = "none";
    
    // SHOW green tick when collapsed
    if (statusEl && hasCompleteTicket) {
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
    const existing = pricingSection.querySelector(".pricing-preview-slots-container");
    if (existing) existing.remove();
    
    // Create and insert preview
    const previewHTML = createPreviewHeader();
    const previewContainer = document.createElement("div");
    previewContainer.className = "pricing-preview-slots-container";
    previewContainer.innerHTML = previewHTML;
    
    // Insert preview AFTER header
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
 * Update completion status
 */
export function updatePricingStatus(): void {
    const { hasCompleteTicket } = checkPricingCompletion();
    isPricingSectionComplete = hasCompleteTicket;
}

/**
 * Check if clicked outside pricing section
 */
function isClickOutsidePricing(target: HTMLElement): boolean {
    const pricingSection = document.querySelector(".pricing-section");
    if (!pricingSection) return false;
    
    return !pricingSection.contains(target);
}

/**
 * Setup header click to re-expand
 */
export function setupPricingHeaderClick(): void {
    const header = document.getElementById("pricingHeader");
    if (!header) return;
    
    header.addEventListener("click", (e) => {
        const content = document.getElementById("pricingContent");
        if (!content) return;
        
        if (content.classList.contains("hidden")) {
            e.stopPropagation();
            expandPricingSection();
        }
    });
}

/**
 * Setup click-outside detection
 */
export function setupPricingClickOutside(): void {
    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        
        const content = document.getElementById("pricingContent");
        if (!content || content.classList.contains("hidden")) return;
        
        const { allComplete } = checkPricingCompletion();
        
        // ONLY collapse if ALL tickets complete AND clicked outside
        if (allComplete && isClickOutsidePricing(target)) {
            collapsePricingSection();
        }
    });
}

/**
 * Monitor pricing inputs
 */
export function monitorPricingInputs(): void {
    const observer = new MutationObserver(() => {
        updatePricingStatus();
    });
    
    const ticketList = document.getElementById("ticketList");
    if (ticketList) {
        observer.observe(ticketList, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    }
    
    document.addEventListener("input", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".pricing-section")) {
            updatePricingStatus();
        }
    });
}