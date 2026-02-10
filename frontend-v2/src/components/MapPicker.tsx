"use client";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import { defaultMarker } from "./map/icons";

import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationMarker = ({ position, onSelect }: { position: L.LatLng | null, onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const MapPicker = ({ onSelect, initialLat, initialLng }: MapPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    (initialLat !== undefined && initialLng !== undefined) ? L.latLng(initialLat, initialLng) : null
  );

  useEffect(() => {
    // Ensure default marker icon is configured
    L.Marker.prototype.options.icon = defaultMarker;
  }, []);

  const handleSelect = (lat: number, lng: number) => {
    setPosition(L.latLng(lat, lng));
    onSelect(lat, lng);
  };

  const defaultCenter: [number, number] = [initialLat || -34.6037, initialLng || -58.3816];

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={defaultCenter}
        zoom={position ? 15 : 13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onSelect={handleSelect} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
