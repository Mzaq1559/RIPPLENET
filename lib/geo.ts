export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export interface RainfallFigures {
  last24hMm: number | null;
  last7dMm: number | null;
  next24hMm: number | null;
  next72hMm: number | null;
  currentPrecipitationMm?: number | null;
  tempC?: number | null;
  source?: string;
  available: boolean;
}

export type RiskLevel = "Low" | "Moderate" | "High" | "Extreme" | "Unavailable";

export interface FloodRisk {
  score: number | null;
  level: RiskLevel;
  factors: { label: string; value: string }[];
}

export function computeFloodRisk(
  baseWeight: number,
  rain: RainfallFigures,
): FloodRisk {
  const hasDailyRainfall = [rain.last24hMm, rain.last7dMm, rain.next24hMm, rain.next72hMm].some(
    (value) => value !== null,
  );
  if (!rain.available || !hasDailyRainfall) {
    const displayUnavailable = (value: number | null) =>
      value === null ? "Unavailable" : `${value.toFixed(1)} mm`;
    return {
      score: null,
      level: "Unavailable",
      factors: [
        { label: "Rain last 7 days", value: displayUnavailable(rain.last7dMm) },
        { label: "Rain last 24 hours", value: displayUnavailable(rain.last24hMm) },
        { label: "Forecast next 24 hours", value: displayUnavailable(rain.next24hMm) },
        { label: "Forecast next 72 hours", value: displayUnavailable(rain.next72hMm) },
      ],
    };
  }
  const last7 = rain.last7dMm ?? 0;
  const last24 = rain.last24hMm ?? 0;
  const next72 = rain.next72hMm ?? 0;
  const score =
    baseWeight * 2.5 +
    Math.min(last7 / 100, 1.4) * 3.2 +
    Math.min(last24 / 50, 1) * 1.6 +
    Math.min(next72 / 80, 1.2) * 2.4;

  const rounded = Math.min(10, Math.round(score * 10) / 10);
  const level: RiskLevel =
    rounded >= 7.5 ? "Extreme" : rounded >= 5.5 ? "High" : rounded >= 3.5 ? "Moderate" : "Low";

  const display = (value: number | null) =>
    value === null ? "Unavailable" : `${value.toFixed(1)} mm`;

  return {
    score: rounded,
    level,
    factors: [
      { label: "Rain last 7 days", value: display(rain.last7dMm) },
      { label: "Rain last 24 hours", value: display(rain.last24hMm) },
      { label: "Forecast next 24 hours", value: display(rain.next24hMm) },
      { label: "Forecast next 72 hours", value: display(rain.next72hMm) },
    ],
  };
}
