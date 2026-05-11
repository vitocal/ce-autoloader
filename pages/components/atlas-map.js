import L from 'https://esm.sh/leaflet@1.9.4';

export default class AtlasMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Leaflet requires CSS
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
                :host { display: block; width: 100%; height: 300px; }
                #map { width: 100%; height: 100%; }
            </style>
            <div id="map"></div>
        `;

        const mapContainer = this.shadowRoot.getElementById('map');

        // Initialize Map (Coordinates for "Null Island" / Atlantic Ocean)
        const map = L.map(mapContainer).setView([0, 0], 3);

        // Add Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add Marker
        L.marker([0, 0]).addTo(map)
            .bindPopup('<b>Null Island</b><br>Where bugs live.')
            .openPopup();

        // Fix Leaflet sizing issues in Shadow DOM
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}
customElements.define('atlas-map', AtlasMap);