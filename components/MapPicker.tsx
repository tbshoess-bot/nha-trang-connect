"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: number | null;
  lng: number | null;
  address: string;
  onChange: (lat: number, lng: number, address: string) => void;
}

export default function MapPicker({ lat, lng, address, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (mapRef.current || !containerRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [12.2388, 109.1967],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      mapRef.current = map;

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 15);
      }

      map.on("click", async (e: any) => {
        const { lat: newLat, lng: newLng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng]).addTo(map);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json&accept-language=en`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const parts = [
            data.address?.road,
            data.address?.suburb || data.address?.neighbourhood || data.address?.quarter,
            data.address?.city || data.address?.town || data.address?.village,
          ].filter(Boolean);
          const shortAddr = parts.join(", ") || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
          onChange(newLat, newLng, shortAddr);
        } catch {
          onChange(newLat, newLng, `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-sand-300"
        style={{ height: 220 }}
      />
      {address ? (
        <p className="text-xs text-sea-700 truncate">📍 {address}</p>
      ) : (
        <p className="text-xs text-ink-700/40">Tap on the map to pin the location</p>
      )}
    </div>
  );
}
