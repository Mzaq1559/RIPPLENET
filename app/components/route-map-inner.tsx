"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { MapZoomControls } from "./map-zoom-controls";
import "leaflet/dist/leaflet.css";

export interface RouteMapPoint {
  lat: number;
  lng: number;
  label: string;
}

function pinIcon(fill: string): L.DivIcon {
  return L.divIcon({
    className: "rn-pin",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.1 11.03 19.26 11.5 19.69.44.41 1.11.41 1.55 0C13.5 32.26 26 22.1 26 13 26 5.82 20.18 0 13 0z" fill="${fill}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="13" cy="12.5" r="4.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    tooltipAnchor: [0, -28],
  });
}

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [20, 20] });
  }, [map, points]);
  return null;
}

export default function RouteMapInner({
  from,
  to,
  geometry,
}: {
  from: RouteMapPoint;
  to: RouteMapPoint;
  geometry: { lat: number; lng: number }[];
}) {
  const positions: [number, number][] = (geometry.length >= 2 ? geometry : [from, to]).map((p) => [
    p.lat,
    p.lng,
  ]);

  return (
    <MapContainer
      center={positions[Math.floor(positions.length / 2)]}
      zoom={12}
      zoomControl={false}
      scrollWheelZoom={true}
      attributionControl
      className="h-full w-full relative z-[1] isolate"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={positions} pathOptions={{ color: "#0e5a8a", weight: 4, opacity: 0.9 }} />
      <Marker position={[from.lat, from.lng]} icon={pinIcon("#0b3d5c")}>
        <Tooltip direction="top" offset={[0, -6]} opacity={1}>
          {from.label}
        </Tooltip>
      </Marker>
      <Marker position={[to.lat, to.lng]} icon={pinIcon("#c1440e")}>
        <Tooltip direction="top" offset={[0, -6]} opacity={1}>
          {to.label}
        </Tooltip>
      </Marker>
      <FitRoute points={positions} />
      <MapZoomControls />
    </MapContainer>
  );
}
