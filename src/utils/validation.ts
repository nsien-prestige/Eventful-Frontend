import { showMessage } from "../components/notify/notify";

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export function validateEventForm(data: {
    title?: string;
    summary?: string;
    description?: string;
    organizer?: string;
    category?: string;
    date?: string;
    endDate?: string;
    venueAddress?: string;
    meetingLink?: string;
    locationType?: string;
}): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.title || data.title.trim().length === 0) {
        errors.push({ field: 'title', message: 'Event title is required' });
    } else if (data.title.trim().length > 75) {
        errors.push({ field: 'title', message: 'Title must be 75 characters or less' });
    }

    if (!data.summary || data.summary.trim().length === 0) {
        errors.push({ field: 'summary', message: 'Event summary is required' });
    } else if (data.summary.trim().length > 140) {
        errors.push({ field: 'summary', message: 'Summary must be 140 characters or less' });
    }

    if (!data.organizer || data.organizer.trim().length === 0) {
        errors.push({ field: 'organizer', message: 'Organizer name is required' });
    }

    if (!data.category) {
        errors.push({ field: 'category', message: 'Event category is required' });
    }

    if (!data.date) {
        errors.push({ field: 'date', message: 'Event start date is required' });
    } else {
        const startDate = new Date(data.date);
        const now = new Date();
        
        if (isNaN(startDate.getTime())) {
            errors.push({ field: 'date', message: 'Invalid start date format' });
        } else if (startDate < now) {
            errors.push({ field: 'date', message: 'Event cannot be in the past' });
        }

        if (data.endDate) {
            const endDate = new Date(data.endDate);
            if (isNaN(endDate.getTime())) {
                errors.push({ field: 'endDate', message: 'Invalid end date format' });
            } else if (endDate < startDate) {
                errors.push({ field: 'endDate', message: 'End date cannot be before start date' });
            }
        }
    }

    if (data.locationType === 'in-person' || data.locationType === 'venue') {
        if (!data.venueAddress || data.venueAddress.trim().length === 0) {
            errors.push({ field: 'venueAddress', message: 'Venue address is required for in-person events' });
        }
    } else if (data.locationType === 'online') {
        if (!data.meetingLink || data.meetingLink.trim().length === 0) {
            errors.push({ field: 'meetingLink', message: 'Meeting link is required for online events' });
        } else if (!isValidUrl(data.meetingLink)) {
            errors.push({ field: 'meetingLink', message: 'Please enter a valid URL (e.g., https://zoom.us/...)' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function showValidationErrors(errors: ValidationError[]): void {
    const errorsByField: Record<string, string[]> = {};
    
    errors.forEach(error => {
        if (!errorsByField[error.field]) {
            errorsByField[error.field] = [];
        }
        errorsByField[error.field].push(error.message);
    });

    const errorMessages = Object.entries(errorsByField).map(([field, messages]) => {
        return messages.join('; ');
    }).join('\n');

    showMessage(`Please fix the following errors:\n\n${errorMessages}`, "error");
}


export function highlightInvalidFields(errors: ValidationError[]): void {
    document.querySelectorAll('.field-error').forEach(el => {
        el.classList.remove('field-error');
    });

    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('field-error');
            
            if (errors[0].field === error.field) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}