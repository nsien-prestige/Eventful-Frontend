const API_BASE = import.meta.env.VITE_API_URL;
console.log("API_BASE:", API_BASE)

import { 
    getTitleData, 
    getImageData, 
    getDateData, 
    getAgendaData, 
    getPricingData 
} from "../pages/create/createEventPage";

export async function createEvent(): Promise<any> {
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("Not authenticated");
    }

    // Collect all form data
    const titleData = getTitleData();
    const imageData = getImageData();
    const dateData = getDateData();
    const agendaData = getAgendaData();
    const pricingData = getPricingData();

    // Combine into payload matching DTO
    const payload = {
        // From titleSection
        title: titleData.title,
        summary: titleData.summary,
        description: titleData.description,
        organizer: titleData.organizer,
        eventType: titleData.eventType,
        category: titleData.category,
        
        // From imageUpload
        imageUrl: imageData,
        
        // From dateSection
        date: dateData.date,
        endDate: dateData.endDate,
        locationType: dateData.locationType,
        venueAddress: dateData.venueAddress,
        meetingLink: dateData.meetingLink,
        latitude: dateData.latitude,
        longitude: dateData.longitude,
        
        // From agendaSection (if exists)
        agenda: agendaData.length > 0 ? agendaData : undefined,
        
        // From pricingSection (if exists)
        tickets: pricingData.length > 0 ? pricingData : undefined,
    };

    console.log("Creating event with payload:", payload);

    const response = await fetch(`${API_BASE}/events/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
    }

    return response.json();
}