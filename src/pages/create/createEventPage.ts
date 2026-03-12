/// <reference types="google.maps" />
import "./createEventPage.css";
import { initDatePickers } from "../../components/date-picker/DatePicker";

import { renderTitleSection, setupTitleSection }         from "./utils/titleSection";
import { renderDateSection, setupDateSection,
         restoreDateHeader }                             from "./utils/dateSection";
import { setupImageUpload }                              from "./utils/imageUpload";
import { setupCollapsible }                              from "./utils/collapsible";
import { loadGoogleMaps }                                from "./utils/googleMaps";
import { initSectionProgress }                           from "./utils/sectionProgress";
import { setupAddSectionLogic }                          from "./utils/addSections";

import { createEvent } from "../../api/createEvent.api";
import { showMessage } from "../../components/notify/notify";
import { navigate } from "../../router";

export { getAgendaData }  from "./utils/agendaSection";
export { getTitleData }   from "./utils/titleSection";
export { getImageData }   from "./utils/imageUpload";
export { getDateData } from "./utils/dateSection"
export { getPricingData } from "./utils/pricingSection";

export function renderCreateEventPage(): void {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="create-page" id="createPageRoot">

            <!-- IMAGE SECTION -->
            <div class="section-card">
                <h2>Event Image</h2>
                <p class="section-subtext">
                    Upload a high-quality banner to grab attention.
                    Recommended size: 1200 x 600.
                </p>

                <div class="upload-area" id="uploadArea">
                    <input type="file" id="imageInput" accept="image/*" hidden />

                    <div class="upload-content" id="uploadContent">
                        <div class="upload-icon">📷</div>
                        <p><strong>Click to upload</strong> or drag and drop</p>
                        <span>PNG, JPG up to 5MB</span>
                    </div>

                    <img id="imagePreview" class="image-preview hidden" />
                </div>
            </div>

            <!-- BASIC INFO SECTION -->
            ${renderTitleSection()}

            <!-- DATE & LOCATION SECTION -->
            ${renderDateSection()}

            <!-- DYNAMIC SECTIONS (agenda, pricing, etc.) -->
            <div id="dynamicSections"></div>

            <!-- ADD MORE SECTIONS BLOCK -->
            <div class="section-card add-sections-block" id="addSectionsBlock">
                <h2>Add more sections to your event page</h2>
                <p class="section-subtext">
                    Make your event stand out even more. These sections help attendees
                    find information easily and boost ticket sales.
                </p>

                <div id="addAgendaItem" class="add-section-item">
                    <div class="add-section-left">
                        <div class="add-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3A3247" viewBox="0 0 24 24">
                                <path d="M16 10h2V6h-2V4h-2v2H8V4H6v2H4v13h7.5v-2H6v-7zm4.5 1.5H13v1.667h7.5zM13 14.416h7.5v1.667H13v-1.666Zm7.5 2.918H13V19h7.5z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div><div class="add-title-row"><h3>Agenda</h3></div></div>
                    </div>
                    <button class="add-btn" id="addAgendaBtn">Add</button>
                </div>

                <div class="divider" id="addDivider"></div>

                <div id="addPricingItem" class="add-section-item">
                    <div class="add-section-left">
                        <div class="add-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                            </svg>
                        </div>
                        <div><div class="add-title-row"><h3>Pricing</h3></div></div>
                    </div>
                    <button class="add-btn" id="addPricingBtn">Add</button>
                </div>
            </div>

            <!-- CREATE EVENT BUTTON -->
            <div class="create-button-section">
                <div class="create-button-container">
                    <button type="submit" class="create-event-btn" id="createEventBtn">
                        <span class="create-btn-text">Create Event</span>
                        <svg class="create-btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                    <p class="create-button-help">
                        Your event will be saved as a draft and you can publish it later.
                    </p>
                </div>
            </div>

        </div>
    `;

    setupImageUpload();
    setupTitleSection();
    setupDateSection();  

    setupCollapsible("titleHeader", "titleContent", "titleToggle", "titleSubtext");

    setupCollapsible("dateHeader", "dateContent", "dateToggle", "dateSubtext", restoreDateHeader);

    initDatePickers();  
    loadGoogleMaps();
    initSectionProgress();
    setupAddSectionLogic();
    setupCreateButton(); 
}


function setupCreateButton(): void {
    const createBtn = document.getElementById("createEventBtn");
    
    if (!createBtn) return;
    
    createBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        
        // Add loading state
        createBtn.classList.add("loading");
        createBtn.setAttribute("disabled", "true");
        
        try {
            // Call API to create event
            const result = await createEvent();
            
            // Success!
            showMessage("Event created successfully! 🎉", "success");
            
            // Navigate to event details or my events page
            setTimeout(() => {
                navigate(`/event/${result.publicId}`);
                // OR: navigate("/my-events");
            }, 1000);
            
        } catch (error: any) {
            // Error handling
            console.error("Create event error:", error);
            showMessage(error.message || "Failed to create event", "error");
            
            // Remove loading state on error
            createBtn.classList.remove("loading");
            createBtn.removeAttribute("disabled");
        }
    });
}