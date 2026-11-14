import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { computeFloodRisk, haversineKm } from "@/lib/geo";
import { findDistrict, nearestDistrict } from "@/lib/pakistan-districts";
import { fetchRainfall } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const districtName = url.searchParams.get("district");
  const rawLat = url.searchParams.get("lat");
  const rawLng = url.searchParams.get("lng");
  const lat = rawLat === null ? NaN : Number(rawLat);
  const lng = rawLng === null ? NaN : Number(rawLng);

  let district =
    districtName ? findDistrict(districtName) : null;

  let point: { lat: number; lng: number };
  if (district) {
    point = { lat: district.lat, lng: district.lng };
  } else if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  ) {
    point = { lat, lng };
    district = nearestDistrict(lat, lng);
  } else {
    return Response.json({ error: "Provide ?district= or ?lat=&lng=" }, { status: 400 });
  }

  const rainfall = await fetchRainfall(point);
  const baseWeight = district?.floodWeight ?? 0.3;
  const risk = computeFloodRisk(baseWeight, rainfall);

  const camps = await prisma.camp.findMany();
  const nearestCamps = camps
    .map((c) => ({
      id: c.id,
      name: c.name,
      district: c.district,
      phone: c.phone,
      status: c.status,
      distanceKm: Math.round(haversineKm(point, { lat: c.lat, lng: c.lng }) * 10) / 10,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  return Response.json({
    district: district ? { name: district.name, province: district.province, lat: district.lat, lng: district.lng } : null,
    rainfall,
    risk,
    nearestCamps,
    generatedAt: new Date().toISOString(),
  });
}
