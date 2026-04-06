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
    const DROPDOWN_HEIGHT = 260;
    
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
    
    const listEl = dropdown.querySelector(".time-picker-list") as HTMLElement;
    document.body.appendChild(dropdown);

    function positionDropdown() {
        const rect = btn.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const openUpward = spaceBelow < DROPDOWN_HEIGHT + 20 && rect.top > spaceBelow;
        const top = openUpward
            ? Math.max(12, rect.top - DROPDOWN_HEIGHT - 6)
            : Math.min(viewportHeight - DROPDOWN_HEIGHT - 12, rect.bottom + 6);
        const left = Math.min(rect.left, viewportWidth - 180);
        const width = Math.max(rect.width, 160);

        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${Math.max(12, left)}px`;
        dropdown.style.width = `${width}px`;
        dropdown.classList.toggle("open-upward", openUpward);
    }

    function handleOutsidePointerDown(event: PointerEvent) {
        const target = event.target as Node | null;
        if (!target) return;
        if (!wrapper.contains(target) && !dropdown.contains(target)) {
            toggleDropdown(false);
        }
    }

    function handleViewportChange() {
        if (isOpen) {
            positionDropdown();
        }
    }
    
    // Toggle dropdown
    function toggleDropdown(show?: boolean) {
        isOpen = show !== undefined ? show : !isOpen;
        
        if (isOpen) {
            positionDropdown();
            dropdown.classList.add("active");
            btn.classList.add("active");
            wrapper.classList.add("is-open");
            document.addEventListener("pointerdown", handleOutsidePointerDown);
            window.addEventListener("resize", handleViewportChange);
            window.addEventListener("scroll", handleViewportChange, true);
            
            // Scroll to selected option
            if (selectedValue) {
                const selectedOption = dropdown.querySelector(`[data-value="${selectedValue}"]`);
                if (selectedOption) {
                    setTimeout(() => {
                        selectedOption.scrollIntoView({ block: "center", behavior: "smooth" });
                    }, 10);
                }
            }
        } else {
            dropdown.classList.remove("active");
            btn.classList.remove("active");
            wrapper.classList.remove("is-open");
            document.removeEventListener("pointerdown", handleOutsidePointerDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
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
            
            const optionEl = listEl.querySelector(`[data-value="${matchingOption.value}"]`);
            optionEl?.classList.add("selected");
        }
    }
}
