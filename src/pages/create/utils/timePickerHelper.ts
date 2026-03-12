import "./timePickerHelper.css";

interface TimeOption {
    value: string;      // "14:30"
    display: string;    // "2:30 PM"
}

// Generate time options (every 15 minutes)
function generateTimeOptions(): TimeOption[] {
    const options: TimeOption[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 15) {
            const value = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
            
            // Convert to 12-hour format for display
            const period = hour >= 12 ? "PM" : "AM";
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const display = `${displayHour}:${String(min).padStart(2, "0")} ${period}`;
            
            options.push({ value, display });
        }
    }
    
    return options;
}

const TIME_OPTIONS = generateTimeOptions();

export function setupTimePicker(
    btn: HTMLButtonElement,
    inputEl: HTMLInputElement,
    labelEl: HTMLElement,
    onSelect?: (formatted: string) => void
): void {
    let isOpen = false;
    let selectedValue = "";
    
    // CRITICAL: Wrap button in a positioning container
    const wrapper = document.createElement("div");
    wrapper.className = "time-picker-wrapper";
    btn.parentNode?.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);
    
    // Create dropdown element
    const dropdown = document.createElement("div");
    dropdown.className = "time-picker-dropdown";
    dropdown.innerHTML = `
        <div class="time-picker-list">
            ${TIME_OPTIONS.map(opt => `
                <div class="time-picker-option" data-value="${opt.value}">
                    ${opt.display}
                </div>
            `).join("")}
        </div>
    `;
    
    // Insert dropdown INSIDE wrapper (after button)
    wrapper.appendChild(dropdown);
    
    // Create overlay for click-outside-to-close
    const overlay = document.createElement("div");
    overlay.className = "time-picker-overlay";
    document.body.appendChild(overlay);
    
    // Toggle dropdown
    function toggleDropdown(show?: boolean) {
        isOpen = show !== undefined ? show : !isOpen;
        
        if (isOpen) {
            dropdown.classList.add("active");
            overlay.classList.add("active");
            btn.classList.add("active");
            
            // Scroll to selected option
            if (selectedValue) {
                const selectedOption = dropdown.querySelector(`[data-value="${selectedValue}"]`);
                if (selectedOption) {
                    setTimeout(() => {
                        selectedOption.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    }, 10);
                }
            }
        } else {
            dropdown.classList.remove("active");
            overlay.classList.remove("active");
            btn.classList.remove("active");
        }
    }
    
    // Button click
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });
    
    // Option click
    dropdown.addEventListener("click", (e) => {
        const option = (e.target as HTMLElement).closest(".time-picker-option");
        if (!option) return;
        
        const value = option.getAttribute("data-value")!;
        const displayText = option.textContent!.trim();
        
        // Update selection
        dropdown.querySelectorAll(".time-picker-option").forEach(opt => {
            opt.classList.remove("selected");
        });
        option.classList.add("selected");
        
        selectedValue = value;
        labelEl.textContent = displayText;
        btn.classList.add("has-value");
        
        // Update hidden input
        inputEl.value = value;
        
        // Trigger change event
        const event = new Event("change", { bubbles: true });
        inputEl.dispatchEvent(event);
        
        // Call callback
        if (onSelect) {
            onSelect(displayText);
        }
        
        // Close dropdown
        toggleDropdown(false);
    });
    
    // Overlay click (close)
    overlay.addEventListener("click", () => {
        toggleDropdown(false);
    });
    
    // Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) {
            toggleDropdown(false);
        }
    });
    
    // Set initial value if input has one
    if (inputEl.value) {
        const matchingOption = TIME_OPTIONS.find(opt => opt.value === inputEl.value);
        if (matchingOption) {
            selectedValue = matchingOption.value;
            labelEl.textContent = matchingOption.display;
            btn.classList.add("has-value");
            
            const optionEl = dropdown.querySelector(`[data-value="${matchingOption.value}"]`);
            optionEl?.classList.add("selected");
        }
    }
}