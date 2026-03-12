import { collapseCompleteSlots } from "./agendaSection";

interface CollapsibleSection {
    headerId:  string;
    contentId: string;
    toggleId:  string;
    subtextId: string;
    onExpand?: () => void;
}

const registry: CollapsibleSection[] = [];

export function collapseSection(contentId: string, toggleId?: string): void {
    const content = document.getElementById(contentId);
    if (!content || content.classList.contains("hidden")) return;

    content.style.height = content.scrollHeight + "px";

    requestAnimationFrame(() => {
        content.style.transition = "height 0.35s ease, opacity 0.25s ease";
        content.style.height     = "0px";
        content.style.opacity    = "0";
    });

    setTimeout(() => {
        content.classList.add("hidden");
        content.style.height     = "";
        content.style.opacity    = "";
        content.style.transition = "";
    }, 350);

    // KEEP BUTTON HIDDEN - Don't show it again after collapsing
    if (toggleId) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            // Keep the button hidden permanently after first expansion
            // Don't set textContent or make it visible again
        }
    }
}

function expandSection(section: CollapsibleSection): void {
    const content = document.getElementById(section.contentId);
    if (!content) return;

    // Restore the section's default header if it has a custom preview state
    section.onExpand?.();

    content.classList.remove("hidden");

    // Hide intro subtext while the form is open
    const subtext = document.getElementById(section.subtextId);
    if (subtext) subtext.style.display = "none";
    
    // ADDED: Hide the expand button when section is expanded
    const toggle = document.getElementById(section.toggleId);
    if (toggle) toggle.style.display = "none";
}

function collapseOthers(exceptContentId: string): void {
    // ADDED: Collapse all completed agenda slots when switching sections
    try {
        collapseCompleteSlots();
    } catch (e) {
        // Agenda section might not be loaded yet
    }
    
    registry.forEach(sec => {
        if (sec.contentId === exceptContentId) return;

        const content = document.getElementById(sec.contentId);
        if (!content || content.classList.contains("hidden")) return;

        collapseSection(sec.contentId, sec.toggleId);

        const subtext = document.getElementById(sec.subtextId);
        if (subtext) subtext.style.display = "block";
    });
}

export function setupCollapsible(
    headerId:  string,
    contentId: string,
    toggleId:  string,
    subtextId: string,
    onExpand?: () => void
): void {
    const section: CollapsibleSection = { headerId, contentId, toggleId, subtextId, onExpand };
    registry.push(section);

    const header = document.getElementById(headerId);
    if (!header) return;

    header.addEventListener("click", (e) => {
        if (!(e.target as HTMLElement).closest(".section-header")) return;

        const content = document.getElementById(contentId);
        if (!content) return;

        if (content.classList.contains("hidden")) {
            collapseOthers(contentId);
            expandSection(section);
        }
    });
}