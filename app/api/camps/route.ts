import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { haversineKm } from "@/lib/geo";
import { findDistrict } from "@/lib/pakistan-districts";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const districtParam = url.searchParams.get("district")?.trim() ?? "";
  const rawLat = url.searchParams.get("lat");
  const rawLng = url.searchParams.get("lng");
  let lat = rawLat === null ? NaN : Number(rawLat);
  let lng = rawLng === null ? NaN : Number(rawLng);
  let hasPoint =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  if (!hasPoint && districtParam) {
    const district = findDistrict(districtParam);
    if (district) {
      lat = district.lat;
      lng = district.lng;
      hasPoint = true;
    }
  }

  try {
    const dbCamps = await prisma.camp.findMany({
      include: { _count: { select: { requests: true, restocks: true } } },
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });

    let result = dbCamps.map((camp) => ({
      id: camp.id,
      name: camp.name,
      district: camp.district,
      province: camp.province,
      lat: camp.lat,
      lng: camp.lng,
      phone: camp.phone,
      capacity: camp.capacity,
      occupancy: camp.occupancy,
      status: camp.status,
      requestCount: camp._count.requests,
      distanceKm: hasPoint
        ? Math.round(haversineKm({ lat, lng }, { lat: camp.lat, lng: camp.lng }) * 10) / 10
        : null,
    }));

    if (districtParam) {
      const matches = result.filter(
        (camp) => camp.district.toLowerCase() === districtParam.toLowerCase(),
      );
      const others = result.filter(
        (camp) => camp.district.toLowerCase() !== districtParam.toLowerCase(),
      );
      if (hasPoint) {
        matches.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
        others.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      }
      result = [...matches, ...others];
    } else if (hasPoint) {
      result.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return Response.json({ camps: result, total: result.length });
  } catch (error) {
    console.error("GET /api/camps database error:", error);
    return Response.json({ error: "Could not retrieve camps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return Response.json({ error: "Only admins can create camps" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 120);
    const districtName = String(body.district ?? "").trim();
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const capacity = Number(body.capacity);
    const district = findDistrict(districtName);

    if (!name || !districtName || !phone) {
      return Response.json({ error: "Camp name, district, and phone are required" }, { status: 400 });
    }
    if (!district) {
      return Response.json({ error: "Select a recognized district" }, { status: 400 });
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) {
      return Response.json({ error: "Capacity must be between 1 and 100000" }, { status: 400 });
    }

    const camp = await prisma.camp.create({
      data: {
        name,
        district: district.name,
        province: district.province,
        lat: district.lat,
        lng: district.lng,
        phone,
        capacity,
        occupancy: 0,
        status: "open",
      },
    });

    return Response.json({ camp, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/camps error:", error);
    return Response.json({ error: "Failed to create camp" }, { status: 500 });
  }
}
