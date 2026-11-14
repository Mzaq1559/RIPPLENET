import type { LatLng, RainfallFigures } from "./geo";

const OM_BASE = "https://api.open-meteo.com/v1/forecast";

interface OmApiResponse {
  current?: {
    time?: string;
    precipitation?: number | null;
    rain?: number | null;
    showers?: number | null;
    temperature_2m?: number | null;
  };
  daily?: {
    time?: string[];
    precipitation_sum?: (number | null)[];
    rain_sum?: (number | null)[];
  };
}

async function fetchOmData(point: LatLng): Promise<OmApiResponse | null> {
  const url = new URL(OM_BASE);
  url.searchParams.set("latitude", point.lat.toFixed(4));
  url.searchParams.set("longitude", point.lng.toFixed(4));
  url.searchParams.set("current", "precipitation,rain,showers,temperature_2m");
  url.searchParams.set("daily", "precipitation_sum,rain_sum");
  url.searchParams.set("past_days", "7");
  url.searchParams.set("forecast_days", "4");
  url.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as OmApiResponse;
  } catch {
    return null;
  }
}

function unavailableRainfall(): RainfallFigures {
  return {
    last24hMm: null,
    last7dMm: null,
    next24hMm: null,
    next72hMm: null,
    currentPrecipitationMm: null,
    tempC: null,
    source: "Open-Meteo unavailable",
    available: false,
  };
}

function parseOmResponse(data: OmApiResponse | null): RainfallFigures {
  const daily = data?.daily;
  const values = daily?.precipitation_sum ?? daily?.rain_sum;
  if (!values || values.length < 8) return unavailableRainfall();

  const at = (index: number): number | null => {
    const value = values[index];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  const sum = (indices: number[]): number | null => {
    const selected = indices.map(at);
    if (selected.every((value) => value === null)) return null;
    return selected.reduce<number>((total, value) => total + (value ?? 0), 0);
  };
  const rounded = (value: number | null) =>
    value === null ? null : Math.round(value * 10) / 10;

  const last24hMm = rounded(at(6));
  const last7dMm = rounded(sum([0, 1, 2, 3, 4, 5, 6]));
  const next24hMm = rounded(at(8));
  const next72hMm = rounded(sum([8, 9, 10]));
  const currentPrecipitation = data?.current?.precipitation ?? data?.current?.rain ?? null;
  const temp = data?.current?.temperature_2m ?? null;
  const currentPrecipitationMm =
    typeof currentPrecipitation === "number" ? rounded(currentPrecipitation) : null;
  const tempC = typeof temp === "number" ? rounded(temp) : null;
  const available = [
    last24hMm,
    last7dMm,
    next24hMm,
    next72hMm,
    currentPrecipitationMm,
  ].some((value) => value !== null);

  return {
    last24hMm,
    last7dMm,
    next24hMm,
    next72hMm,
    currentPrecipitationMm,
    tempC,
    source: "Open-Meteo Forecast API",
    available,
  };
}

export async function fetchRainfall(point: LatLng): Promise<RainfallFigures> {
  return parseOmResponse(await fetchOmData(point));
}

export async function fetchRainfallBatch(
  points: LatLng[],
): Promise<RainfallFigures[]> {
  if (points.length === 0) return [];
  return Promise.all(points.map(fetchRainfall));
}
