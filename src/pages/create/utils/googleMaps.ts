/// <reference types="google.maps" />

let map: google.maps.Map;
let marker: google.maps.marker.AdvancedMarkerElement | null = null;

export function loadGoogleMaps(): void {
    if ((window as any).google) {
        initMap();
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAYB4cCId58nh_j4sC3LJvEAL_xj8mO4tU&libraries=places&callback=initMap`;
    script.async = true;

    document.head.appendChild(script);
    (window as any).initMap = initMap;
}

async function initMap(): Promise<void> {
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const mapElement = document.getElementById("map") as HTMLElement;
    const input = document.getElementById("locationSearch") as HTMLInputElement;

    if (!mapElement || !input) return;

    map = new Map(mapElement, {
        center: { lat: -25.2744, lng: 133.7751 },
        zoom: 5,
    });

    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        mapElement.classList.remove("hidden");
        map.setCenter(place.geometry.location as google.maps.LatLng);
        map.setZoom(15);

        if (marker) marker.map = null;

        marker = new AdvancedMarkerElement({
            map,
            position: place.geometry.location,
        });
    });
}
