import { renderAgendaSection, setupAgendaSection } from "./agendaSection";
import { renderPricingSection, setupPricingSection } from "./pricingSection";
import { 
    expandAgendaSection, 
    setupAgendaClickOutside, 
    setupAgendaHeaderClick,
    monitorAgendaInputs 
} from "./agendaCollapsible";
import {
    expandPricingSection,
    setupPricingClickOutside,
    setupPricingHeaderClick,
    monitorPricingInputs
} from "./pricingCollapsible";

const AGENDA_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3A3247" viewBox="0 0 24 24">
        <path d="M16 10h2V6h-2V4h-2v2H8V4H6v2H4v13h7.5v-2H6v-7zm4.5 1.5H13v1.667h7.5zM13 14.416h7.5v1.667H13v-1.666Zm7.5 2.918H13V19h7.5z" clip-rule="evenodd"></path>
    </svg>`;

const PRICING_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>`;

export function setupAddSectionLogic(): void {

    const sectionState = { agenda: false, pricing: false };

    const addAgendaBtn     = document.getElementById("addAgendaBtn");
    const addPricingBtn    = document.getElementById("addPricingBtn");
    const dynamicContainer = document.getElementById("dynamicSections")!;
    const addBlock         = document.getElementById("addSectionsBlock")!;

    addAgendaBtn?.addEventListener("click", () => {
        if (sectionState.agenda) return;
        appendSection("agenda");
    });

    addPricingBtn?.addEventListener("click", () => {
        if (sectionState.pricing) return;
        appendSection("pricing");
    });

    // Delegate click for restored "Add" buttons
    addBlock.addEventListener("click", (e) => {
        const addBtn = (e.target as HTMLElement).closest(".add-btn") as HTMLElement;
        if (!addBtn) return;

        const type = addBtn.dataset.type;
        if (type === "agenda" && !sectionState.agenda) appendSection("agenda");
        if (type === "pricing" && !sectionState.pricing) appendSection("pricing");
    });

    function appendSection(type: "agenda" | "pricing"): void {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = type === "agenda" ? renderAgendaSection() : renderPricingSection();

        const sectionElement = wrapper.firstElementChild as HTMLElement;
        dynamicContainer.appendChild(sectionElement);

        if (type === "agenda") {
            setupAgendaSection(sectionElement);
            
            // CUSTOM AGENDA BEHAVIOR
            expandAgendaSection();
            setupAgendaHeaderClick();
            setupAgendaClickOutside();
            monitorAgendaInputs();
            
            sectionState.agenda = true;
            document.getElementById("addAgendaItem")?.remove();
        } else {
            setupPricingSection(sectionElement);
            
            // CUSTOM PRICING BEHAVIOR
            expandPricingSection();
            setupPricingHeaderClick();
            setupPricingClickOutside();
            monitorPricingInputs();
            
            sectionState.pricing = true;
            document.getElementById("addPricingItem")?.remove();
        }

        setupDeleteSection(sectionElement, type);
        cleanupDivider();
    }

    function cleanupDivider(): void {
        const agendaExists  = document.getElementById("addAgendaItem");
        const pricingExists = document.getElementById("addPricingItem");
        const divider       = document.getElementById("addDivider");

        if (!agendaExists || !pricingExists) divider?.remove();
        if (!agendaExists && !pricingExists) addBlock.remove();
    }

    function setupDeleteSection(sectionElement: HTMLElement, type: "agenda" | "pricing"): void {
        const deleteBtn = sectionElement.querySelector(".delete-section-btn");

        deleteBtn?.addEventListener("click", () => {
            sectionElement.remove();

            if (type === "agenda") {
                sectionState.agenda = false;
                restoreAddItem("agenda");
            } else {
                sectionState.pricing = false;
                restoreAddItem("pricing");
            }
        });
    }

    function restoreAddItem(type: "agenda" | "pricing"): void {
        const block = document.getElementById("addSectionsBlock");
        if (!block) return;

        if (type === "agenda" && !document.getElementById("addAgendaItem")) {
            block.insertAdjacentHTML("beforeend", `
                <div id="addAgendaItem" class="add-section-item">
                    <div class="add-section-left">
                        <div class="add-icon">${AGENDA_ICON}</div>
                        <div><div class="add-title-row"><h3>Agenda</h3></div></div>
                    </div>
                    <button class="add-btn" data-type="agenda">Add</button>
                </div>
            `);
        }

        if (type === "pricing" && !document.getElementById("addPricingItem")) {
            block.insertAdjacentHTML("beforeend", `
                <div id="addPricingItem" class="add-section-item">
                    <div class="add-section-left">
                        <div class="add-icon">${PRICING_ICON}</div>
                        <div><div class="add-title-row"><h3>Pricing</h3></div></div>
                    </div>
                    <button class="add-btn" data-type="pricing">Add</button>
                </div>
            `);
        }
    }
}