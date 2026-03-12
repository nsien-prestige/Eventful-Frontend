import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.css";
import "./DatePicker.css";

let datePicker: Instance;

/**
 * Initialize ONLY the date picker
 * Time pickers are now handled by the custom timePickerHelper
 */
export function initDatePickers() {
  const dateInput = document.getElementById("eventDate") as HTMLInputElement;

  if (!dateInput) return;

  /* ---------------- DATE PICKER ---------------- */
  datePicker = flatpickr(dateInput, {
    altInput: true,
    altFormat: "D, M j, Y", // Wed, Mar 5, 2026
    dateFormat: "Y-m-d",
    disableMobile: true,
    animate: true,
    minDate: "today",
    monthSelectorType: "static",
    onChange: () => applyFloatingState(dateInput)
  });
}

/**
 * Get event date and time values
 * Now gets time from the custom time picker inputs
 */
export function getEventDateTimeValues() {
  const startTimeInput = document.getElementById("startTime") as HTMLInputElement;
  const endTimeInput = document.getElementById("endTime") as HTMLInputElement;

  if (!datePicker?.selectedDates.length) {
    alert("Please select an event date.");
    return null;
  }

  if (!startTimeInput?.value || !endTimeInput?.value) {
    alert("Please select start and end times.");
    return null;
  }

  const date = datePicker.selectedDates[0];
  
  // Parse time values (format: "HH:mm")
  const [startHour, startMin] = startTimeInput.value.split(":").map(Number);
  const [endHour, endMin] = endTimeInput.value.split(":").map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  return {
    dateISO: start.toISOString(),
    endISO: end.toISOString()
  };
}

function applyFloatingState(input: HTMLInputElement) {
  const wrapper = input.closest(".floating-field");
  if (!wrapper) return;

  if (input.value) {
    wrapper.classList.add("has-value");
  } else {
    wrapper.classList.remove("has-value");
  }
}