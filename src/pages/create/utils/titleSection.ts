// ... (keep all existing imports and constants - EVENT_TYPES, EVENT_CATEGORIES, buildOptions)

const EVENT_TYPES = [
    "Appearance or Signing",
    "Attraction",
    "Camp, Trip or Retreat",
    "Class, Training or Workshop",
    "Concert or Performance",
    "Conference",
    "Convention",
    "Dinner or Gala",
    "Festival or Fair",
    "Game or Competition",
    "Meetup or Networking",
    "Other",
    "Party or Social Gathering",
    "Race or Endurance Event",
    "Rally",
    "Screening",
    "Seminar or Talk",
    "Tour",
    "Tournament",
    "Tradeshow, Consumer Show or Expo",
];

const EVENT_CATEGORIES = [
    "Auto, Boat & Air",
    "Business & Professional",
    "Charity & Causes",
    "Community & Culture",
    "Family & Education",
    "Fashion & Beauty",
    "Film, Media & Entertainment",
    "Food & Drink",
    "Government & Politics",
    "Health & Wellness",
    "Hobbies & Special Interest",
    "Home & Lifestyle",
    "Music",
    "Other",
    "Performing & Visual Arts",
    "Religion & Spirituality",
    "School Activities",
    "Science & Technology",
    "Seasonal & Holiday",
    "Sports & Fitness",
    "Travel & Outdoor",
];

function buildOptions(items: string[]): string {
    return items.map(item => `<option value="${item}">${item}</option>`).join("\n");
}

export function renderTitleSection(): string {
    return `
        <div class="section-card collapsible" id="titleSection">
            <div class="section-header" id="titleHeader">
                <div class="section-heading-group">
                    <h2 id="titleHeading">Basic Info</h2>
                    <p class="section-subtext" id="titleSubtext">
                        Name your event, describe what it's about, and help people find it with a category.
                    </p>
                </div>

                <div class="section-actions">
                    <div class="section-status" id="titleStatus">
                        <svg viewBox="0 0 24 24" class="check-icon">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                    <!-- ADDED: Expand button -->
                    <button class="section-expand-btn" id="titleToggle" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#3659e3" viewBox="0 0 24 24" data-testid="sectionPlusIcon">
                            <path d="M13.333 4h-2.667v6.668H4v2.666h6.666V20h2.667v-6.666H20v-2.666h-6.667z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="section-content hidden" id="titleContent">

                <!-- EVENT TITLE -->
                <div class="field-group">
                    <label for="title">Event Title <span class="field-required">*</span></label>
                    <p class="field-help">
                        Choose a clear, descriptive title — e.g. "Tech Networking Meetup Lagos 2026".
                    </p>
                    <input
                        type="text"
                        id="title"
                        class="field-input"
                        placeholder="e.g. Winter Music Festival 2026"
                        autocomplete="off"
                        maxlength="75"
                    />
                </div>

                <!-- ORGANIZER -->
                <div class="field-group">
                    <label for="organizer">Organizer</label>
                    <input
                        type="text"
                        id="organizer"
                        class="field-input"
                        placeholder="Who's hosting this event?"
                        autocomplete="off"
                    />
                </div>

                <!-- TYPE & CATEGORY ROW -->
                <div class="field-row">
                    <div class="field-group">
                        <label for="eventType">Type</label>
                        <div class="select-wrapper">
                            <select id="eventType" class="field-select">
                                <option value="" disabled selected>Select a type</option>
                                ${buildOptions(EVENT_TYPES)}
                            </select>
                        </div>
                    </div>

                    <div class="field-group">
                        <label for="category">Category <span class="field-required">*</span></label>
                        <div class="select-wrapper">
                            <select id="category" class="field-select">
                                <option value="" disabled selected>Select a category</option>
                                ${buildOptions(EVENT_CATEGORIES)}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SUMMARY -->
                <div class="field-group">
                    <label for="summary">Summary <span class="field-required">*</span></label>
                    <p class="field-help">
                        A short and sweet sentence about your event.
                    </p>
                    <textarea
                        id="summary"
                        class="field-input field-summary"
                        placeholder="Describe your event in one sentence..."
                        rows="2"
                        maxlength="140"
                    ></textarea>
                    <span class="field-char-count" id="summaryCount">0 / 140</span>
                </div>

                <!-- DESCRIPTION -->
                <div class="field-group">
                    <label for="description">Description</label>
                    <p class="field-help">
                        Add more details about the event, schedule, lineup, speakers, etc.
                    </p>
                    <textarea
                        id="description"
                        class="field-input field-description"
                        placeholder="Tell people what to expect..."
                        rows="6"
                    ></textarea>
                </div>

            </div>
        </div>
    `;
}

export function setupTitleSection(): void {
    const summaryInput = document.getElementById("summary") as HTMLTextAreaElement;
    const summaryCount = document.getElementById("summaryCount")!;

    summaryInput?.addEventListener("input", () => {
        const len = summaryInput.value.length;
        summaryCount.textContent = `${len} / 140`;
        summaryCount.classList.toggle("field-char-count--near", len >= 110);
        summaryCount.classList.toggle("field-char-count--max", len >= 140);
    });
}

export function updateTitlePreview(): void {
    const title   = (document.getElementById("title") as HTMLInputElement)?.value.trim();
    const summary = (document.getElementById("summary") as HTMLTextAreaElement)?.value.trim();
    const category = (document.getElementById("category") as HTMLSelectElement)?.value;

    const heading = document.getElementById("titleHeading");
    const subtext = document.getElementById("titleSubtext");

    if (heading && title) {
        heading.textContent = title;
    }

    if (subtext) {
        const parts: string[] = [];
        if (summary)  parts.push(summary);
        if (category) parts.push(category);
        subtext.textContent = parts.join(" · ");
        subtext.style.display = "block";
    }
}

export function getTitleData() {
    return {
        title:       (document.getElementById("title")       as HTMLInputElement)?.value.trim(),
        organizer:   (document.getElementById("organizer")   as HTMLInputElement)?.value.trim(),
        eventType:   (document.getElementById("eventType")   as HTMLSelectElement)?.value,
        category:    (document.getElementById("category")    as HTMLSelectElement)?.value,
        summary:     (document.getElementById("summary")     as HTMLTextAreaElement)?.value.trim(),
        description: (document.getElementById("description") as HTMLTextAreaElement)?.value.trim(),
    };
}