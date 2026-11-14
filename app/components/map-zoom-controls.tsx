"use client";

import { useMap } from "react-leaflet";

export function MapZoomControls() {
  const map = useMap();

  return (
    <div
      aria-label="Map zoom controls"
      className="absolute bottom-3 right-3 z-[500] flex flex-col gap-1.5"
    >
      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-semibold text-slate-800 shadow-lg transition hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-95"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-semibold text-slate-800 shadow-lg transition hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-95"
      >
        −
      </button>
    </div>
  );
}
