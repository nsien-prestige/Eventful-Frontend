const SAVED_EVENTS_KEY = "eventful:saved-events";
const REMINDERS_KEY = "eventful:event-reminders";
const ALERTS_KEY = "eventful:event-alert-preferences";

export type ReminderPreset = "24h" | "3h" | "30m";

export type EventAlertPreference = {
    enabled: boolean;
    reminderPreset: ReminderPreset;
    productUpdates: boolean;
    ticketDrops: boolean;
};

const defaultAlertPreference: EventAlertPreference = {
    enabled: false,
    reminderPreset: "24h",
    productUpdates: true,
    ticketDrops: true,
};

function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw);
        return parsed as T;
    } catch {
        return fallback;
    }
}

function writeJson<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedEventIds() {
    const value = readJson<unknown>(SAVED_EVENTS_KEY, []);
    return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export function isEventSaved(eventKey: string) {
    return getSavedEventIds().includes(eventKey);
}

export function toggleSavedEvent(eventKey: string) {
    const saved = new Set(getSavedEventIds());

    if (saved.has(eventKey)) {
        saved.delete(eventKey);
    } else {
        saved.add(eventKey);
    }

    writeJson(SAVED_EVENTS_KEY, [...saved]);
    return saved.has(eventKey);
}

export function getReminderPreset(eventKey: string): ReminderPreset | null {
    const reminders = readJson<Record<string, ReminderPreset>>(REMINDERS_KEY, {});
    return reminders[eventKey] || null;
}

export function setReminderPreset(eventKey: string, preset: ReminderPreset) {
    const reminders = readJson<Record<string, ReminderPreset>>(REMINDERS_KEY, {});
    reminders[eventKey] = preset;
    writeJson(REMINDERS_KEY, reminders);
}

export function clearReminderPreset(eventKey: string) {
    const reminders = readJson<Record<string, ReminderPreset>>(REMINDERS_KEY, {});
    delete reminders[eventKey];
    writeJson(REMINDERS_KEY, reminders);
}

export function getAlertPreference(eventKey: string): EventAlertPreference {
    const preferences = readJson<Record<string, EventAlertPreference>>(ALERTS_KEY, {});

    return {
        ...defaultAlertPreference,
        ...(preferences[eventKey] || {}),
    };
}

export function updateAlertPreference(
    eventKey: string,
    nextValue: Partial<EventAlertPreference>
) {
    const preferences = readJson<Record<string, EventAlertPreference>>(ALERTS_KEY, {});
    preferences[eventKey] = {
        ...defaultAlertPreference,
        ...(preferences[eventKey] || {}),
        ...nextValue,
    };

    writeJson(ALERTS_KEY, preferences);

    return preferences[eventKey];
}
