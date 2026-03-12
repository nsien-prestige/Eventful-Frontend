import "./dateSection.css";
import { setupTimePicker } from "./timePickerHelper";

export type LocationMode = "in-person" | "online" | "tbd";

export function renderDateSection(): string {
    return `
        <div class="section-card collapsible" id="dateSection">
            <div class="section-header" id="dateHeader">

                <!-- DEFAULT STATE -->
                <div class="section-heading-group" id="dateDefaultHeader">
                    <h2 id="dateHeading">Date &amp; Location</h2>
                    <p class="section-subtext" id="dateSubtext">
                        When is your event and where will it take place?
                    </p>
                </div>

                <!-- PREVIEW STATE -->
                <div class="date-preview-header hidden" id="datePreviewHeader">
                    <div class="date-preview-col">
                        <p class="date-preview-col-title">Date and time</p>
                        <p class="date-preview-value">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            <span id="datePreviewDatetimeText">—</span>
                        </p>
                    </div>

                    <div class="date-preview-divider"></div>

                    <div class="date-preview-col">
                        <p class="date-preview-col-title">Location</p>
                        <p class="date-preview-value">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            <span id="datePreviewLocationText">—</span>
                        </p>
                    </div>
                </div>

                <div class="section-actions">
                    <div class="section-status" id="dateStatus">
                        <svg viewBox="0 0 24 24" class="check-icon">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                    </div>
                    <button class="section-expand-btn" id="dateToggle" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#3659e3" viewBox="0 0 24 24" data-testid="sectionPlusIcon">
                            <path d="M13.333 4h-2.667v6.668H4v2.666h6.666V20h2.667v-6.666H20v-2.666h-6.667z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- FIXED: Added id="dateContent" and class="section-content hidden" -->
            <div class="section-content hidden" id="dateContent">

                <!-- LOCATION MODE PILLS -->
                <div class="field-group">
                    <label>Location type</label>
                    <div class="loc-pills">
                        <button class="loc-pill active" data-mode="in-person" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            Venue
                        </button>
                        <button class="loc-pill" data-mode="online" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            Online
                        </button>
                        <button class="loc-pill" data-mode="tbd" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                            TBD
                        </button>
                    </div>
                </div>

                <!-- DATE & TIME -->
                <div class="field-group">
                    <label>Date and time <span class="field-required">*</span></label>
                    <div class="date-time-grid">
                        <!-- Event Date (still using Flatpickr) -->
                        <div class="floating-field">
                            <input type="text" id="eventDate" placeholder=" " />
                            <label for="eventDate">Event Date</label>
                        </div>
                        
                        <!-- Start Time (custom picker) -->
                        <button class="time-picker-btn" data-target="startTime" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span class="time-picker-label" id="startTimeLabel">Start Time</span>
                            <input class="time-picker-input" id="startTime" type="hidden" />
                        </button>

                        <!-- End Time (custom picker) -->
                        <button class="time-picker-btn" data-target="endTime" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span class="time-picker-label" id="endTimeLabel">End Time</span>
                            <input class="time-picker-input" id="endTime" type="hidden" />
                        </button>
                    </div>
                </div>

                <!-- VENUE BLOCK -->
                <div class="field-group" id="venueBlock">
                    <label for="locationSearch">Event location <span class="field-required">*</span></label>
                    <div class="location-search-wrapper">
                        <input
                            type="text"
                            id="locationSearch"
                            placeholder="Search for a venue or address"
                            autocomplete="off"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="search-icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>

                <!-- ONLINE BLOCK -->
                <div class="field-group hidden" id="onlineBlock">
                    <label for="onlineUrl">Online event URL</label>
                    <input
                        type="url"
                        id="onlineUrl"
                        placeholder="https://zoom.us/j/..."
                        autocomplete="off"
                    />
                    <p class="field-hint">
                        Attendees will be notified once confirmed.
                    </p>
                </div>

                <!-- TBD BLOCK -->
                <div class="field-group hidden" id="tbdBlock">
                    <p class="tbd-notice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        Attendees will be notified once confirmed.
                    </p>
                </div>

            </div>
        </div>
    `;
}

export function setupDateSection(): void {
    document.getElementById("datePreviewHeader")?.classList.add("hidden");
    document.getElementById("dateDefaultHeader")?.classList.remove("hidden");

    const pills       = document.querySelectorAll<HTMLButtonElement>(".loc-pill");
    const venueBlock  = document.getElementById("venueBlock")!;
    const onlineBlock = document.getElementById("onlineBlock")!;
    const tbdBlock    = document.getElementById("tbdBlock")!;

    let currentMode: LocationMode = "in-person";

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            const mode = pill.dataset.mode as LocationMode;
            if (mode === currentMode) return;
            currentMode = mode;
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            venueBlock.classList.toggle("hidden",  mode !== "in-person");
            onlineBlock.classList.toggle("hidden", mode !== "online");
            tbdBlock.classList.toggle("hidden",    mode !== "tbd");
        });
    });

    /* Setup custom time pickers */
    document.querySelectorAll<HTMLButtonElement>(".time-picker-btn").forEach(btn => {
        const targetId = btn.dataset.target!;
        const inputEl  = document.getElementById(targetId) as HTMLInputElement;
        const labelEl  = btn.querySelector(".time-picker-label") as HTMLElement;
        
        setupTimePicker(btn, inputEl, labelEl, () => {
            updateDatePreview();
        });
    });
}

export function getDateLocationMode(): LocationMode {
    const active = document.querySelector<HTMLButtonElement>(".loc-pill.active");
    return (active?.dataset.mode as LocationMode) ?? "in-person";
}

function getFlatpickrDisplayValue(inputId: string): string {
    const original = document.getElementById(inputId) as HTMLInputElement | null;
    if (!original) return "";

    // Check for Flatpickr's alt input
    const sibling = original.nextElementSibling as HTMLInputElement | null;
    if (sibling && sibling.tagName === "INPUT" && sibling.value) {
        return sibling.value;
    }

    const wrapper = original.closest(".floating-field");
    if (wrapper) {
        for (const input of wrapper.querySelectorAll<HTMLInputElement>("input")) {
            if (input !== original && input.value) return input.value;
        }
    }

    return original.value;
}

export function updateDatePreview(): void {
    const defaultHeader = document.getElementById("dateDefaultHeader")!;
    const previewHeader = document.getElementById("datePreviewHeader")!;

    const dateStr = getFlatpickrDisplayValue("eventDate");
    
    // Get time labels (they now contain the formatted display text)
    const startEl = document.getElementById("startTimeLabel") as HTMLElement;
    const endEl = document.getElementById("endTimeLabel") as HTMLElement;

    const startStr = startEl?.textContent !== "Start Time" ? startEl.textContent ?? "" : "";
    const endStr = endEl?.textContent !== "End Time" ? endEl.textContent ?? "" : "";

    const timeRange = [startStr, endStr].filter(Boolean).join(" - ");
    const datetimeStr = [dateStr, timeRange].filter(Boolean).join(" · ");

    document.getElementById("datePreviewDatetimeText")!.textContent = datetimeStr || "—";

    const mode = getDateLocationMode();
    const locationStr =
        mode === "online" ? "Online event" :
        mode === "tbd"    ? "Location TBD" :
        (document.getElementById("locationSearch") as HTMLInputElement)?.value.trim() || "In-person";

    document.getElementById("datePreviewLocationText")!.textContent = locationStr;

    if (dateStr || startStr || endStr) {
        defaultHeader.classList.add("hidden");
        previewHeader.classList.remove("hidden");
    }
}

export function restoreDateHeader(): void {
    document.getElementById("dateDefaultHeader")?.classList.remove("hidden");
    document.getElementById("datePreviewHeader")?.classList.add("hidden");
}

export function getDateData() {
    const locationSearch = document.getElementById("locationSearch") as HTMLInputElement;
    const onlineUrl = document.getElementById("onlineUrl") as HTMLInputElement;
    
    const mode = getDateLocationMode();
    
    // Get time values from the label text (which the time picker updates)
    const startTimeLabel = document.getElementById("startTimeLabel") as HTMLElement;
    const endTimeLabel = document.getElementById("endTimeLabel") as HTMLElement;
    
    const startTime = startTimeLabel?.textContent !== "Start Time" ? startTimeLabel.textContent : "";
    const endTime = endTimeLabel?.textContent !== "End Time" ? endTimeLabel.textContent : "";
    
    // Get date value (Flatpickr creates a sibling input with display value)
    const dateValue = getFlatpickrDisplayValue("eventDate");
    
    return {
        // Combine date + time into ISO strings
        date: combineDateAndTime(dateValue, startTime || ""),
        endDate: combineDateAndTime(dateValue, endTime || ""),
        
        // Location details
        locationType: mode,  // 'in-person' | 'online' | 'tbd'
        venueAddress: mode === 'in-person' ? locationSearch?.value.trim() : undefined,
        meetingLink: mode === 'online' ? onlineUrl?.value.trim() : undefined,
        
        // Coordinates (TODO: extract from Google Maps API)
        latitude: undefined,
        longitude: undefined,
    };
}

/**
 * Helper function to combine date and time into ISO string
 */
function combineDateAndTime(dateStr: string, timeStr: string): string {
    if (!dateStr) return "";
    
    // Parse date (format: "December 15, 2024" or similar)
    const dateParts = new Date(dateStr);
    
    if (!timeStr || timeStr === "Start Time" || timeStr === "End Time") {
        // No time specified, use midnight
        return dateParts.toISOString();
    }
    
    // Parse time (format: "09:00 AM" or "2:30 PM")
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!timeMatch) {
        return dateParts.toISOString();
    }
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const meridiem = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (meridiem === "PM" && hours !== 12) {
        hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
        hours = 0;
    }
    
    // Set the time
    dateParts.setHours(hours, minutes, 0, 0);
    
    return dateParts.toISOString();
}