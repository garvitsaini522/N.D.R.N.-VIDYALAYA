import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default marker icon paths in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Exact School Coordinates
const SCHOOL_COORDINATES = {
  lat: 27.1140855,
  lng: 80.1439216,
};

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/5yCbv6myG3H9mEFN7';
const GOOGLE_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${SCHOOL_COORDINATES.lat},${SCHOOL_COORDINATES.lng}`;

/**
 * CampusMap Component - Real Interactive Map using Leaflet.js & OpenStreetMap
 * Displays N.D.R.N. Vidyalaya at exact coordinates (27.1140855, 80.1439216)
 * Supports zooming, panning, touch gestures, and quick action buttons.
 */
export default function CampusMap({ className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate initialization

    // Initialize Leaflet map centered on exact coordinates
    const map = L.map(mapContainerRef.current, {
      center: [SCHOOL_COORDINATES.lat, SCHOOL_COORDINATES.lng],
      zoom: 15,
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Add standard OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create prestigious custom school brand marker pin
    const customIcon = L.divIcon({
      className: 'custom-school-marker',
      html: `
        <div style="
          position: relative;
          width: 38px;
          height: 38px;
          background: #E98B2A;
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(74, 53, 37, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: #FFFFFF;
            border-radius: 50%;
            transform: rotate(45deg);
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36],
    });

    // Add marker labeled "N.D.R.N. Vidyalaya"
    const marker = L.marker([SCHOOL_COORDINATES.lat, SCHOOL_COORDINATES.lng], {
      icon: customIcon,
      title: 'N.D.R.N. Vidyalaya',
    }).addTo(map);

    // Attach institutional label popup
    const popupContent = `
      <div style="font-family: inherit; padding: 2px; text-align: center; min-width: 175px;">
        <h6 style="margin: 0; font-weight: 800; font-size: 13px; color: #382619; letter-spacing: -0.01em;">
          N.D.R.N. Vidyalaya
        </h6>
        <p style="margin: 3px 0 0; font-size: 11px; color: #5F4A3B; line-height: 1.35;">
          Daulatyarpur, Madhoganj<br/>Uttar Pradesh, India
        </p>
        <span style="display: inline-block; margin-top: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #B05E12; background: #FFF8E7; padding: 2px 7px; border-radius: 9999px; border: 1px solid #EBDDCB;">
          UP Board • Nursery to Class 5
        </span>
        <div style="margin-top: 8px;">
          <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener noreferrer" style="color: #E98B2A; font-weight: 700; font-size: 11px; text-decoration: underline; display: inline-block;">
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    `;

    marker
      .bindPopup(popupContent, {
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
      })
      .openPopup();

    // Recalculate container dimensions after layout stabilization
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Real Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-cream-200 shadow-soft-sm relative z-0 bg-cream-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 focus-visible:ring-offset-2"
        tabIndex="0"
        role="region"
        aria-label="Interactive map showing N.D.R.N. Vidyalaya campus location in Daulatyarpur, Madhoganj"
      />

      {/* Map Action Buttons */}
      <div>
        <a
          href={GOOGLE_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-xs sm:text-sm font-bold shadow-soft-xs hover:shadow-soft-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 focus-visible:ring-offset-2"
          aria-label="Get directions to N.D.R.N. Vidyalaya on Google Maps (opens in a new tab)"
        >
          <Navigation className="w-4 h-4" aria-hidden="true" />
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  );
}
