import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { haversineKm } from "@/lib/geo";
import { nearestDistrict } from "@/lib/pakistan-districts";
import { parseNeeds } from "@/lib/needs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const request = await prisma.request.findUnique({
      where: { code },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true, lat: true, lng: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!request) return Response.json({ error: "Request not found" }, { status: 404 });
    return Response.json({ request: { ...request, needsList: parseNeeds(request.needs) } });
  }

  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const status = url.searchParams.get("status");
  const volunteerIdParam = url.searchParams.get("volunteerId");
  const mine = url.searchParams.get("mine");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  if (session.role === "volunteer") {
    where.volunteerId = session.id;
  } else if (mine === "1" && volunteerIdParam) {
    where.volunteerId = Number(volunteerIdParam);
  } else if (session.role === "camp_manager" && session.campId) {
    where.campId = session.campId;
  }

  const requests = await prisma.request.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      camp: { select: { id: true, name: true, district: true, phone: true } },
      volunteer: { select: { id: true, name: true, phone: true } },
    },
  });

  return Response.json({
    requests: requests.map((r) => ({ ...r, needsList: parseNeeds(r.needs) })),
    total: requests.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const citizenName = String(body.citizenName ?? "").trim().slice(0, 120);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const type = String(body.type ?? "medical");
    const priority = String(body.priority ?? "high");
    const needs = parseNeeds(body.needs)
      .slice(0, 20)
      .map((need) => need
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted email]")
        .replace(/(?:\+?92|0)\d[\d\s-]{8,}/g, "[redacted phone]")
        .replace(/-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g, "[redacted coordinates]")
        .trim()
        .slice(0, 120))
      .filter(Boolean);
    const peopleCount = Number(body.peopleCount ?? 1);
    const lat = body.lat === null || body.lat === undefined || body.lat === "" ? NaN : Number(body.lat);
    const lng = body.lng === null || body.lng === undefined || body.lng === "" ? NaN : Number(body.lng);

    if (!citizenName || !phone) {
      return Response.json({ error: "Name and phone are required" }, { status: 400 });
    }
    if (!["medical", "food", "water", "rescue", "shelter"].includes(type)) {
      return Response.json({ error: "Invalid request type" }, { status: 400 });
    }
    if (!["low", "medium", "high", "critical"].includes(priority)) {
      return Response.json({ error: "Invalid priority" }, { status: 400 });
    }
    if (!Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 500) {
      return Response.json({ error: "People count must be between 1 and 500" }, { status: 400 });
    }
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return Response.json({ error: "A valid location is required" }, { status: 400 });
    }

    const districtInfo = nearestDistrict(lat, lng);
    const suppliedDistrict = typeof body.district === "string" ? body.district.trim() : "";
    const districtName = String(suppliedDistrict || districtInfo?.name || "").trim().slice(0, 100);
    if (!districtName) {
      return Response.json({ error: "District could not be determined; provide a district" }, { status: 400 });
    }

    const camps = await prisma.camp.findMany();
    const nearest = camps
      .map((camp) => ({
        camp,
        distanceKm: haversineKm({ lat, lng }, { lat: camp.lat, lng: camp.lng }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null;

    const code = `RIP-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const request = await prisma.request.create({
      data: {
        code,
        citizenName,
        phone,
        type,
        priority,
        needs: JSON.stringify(needs),
        district: districtName,
        location: body.location ? String(body.location).trim().slice(0, 200) : null,
        lat,
        lng,
        peopleCount,
        status: "pending",
        campId: nearest?.camp.id ?? null,
      },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
      },
    });

    return Response.json(
      {
        request: { ...request, needsList: needs },
        routedToCamp: nearest?.camp.name ?? null,
        distanceToCampKm: nearest
          ? Math.round(nearest.distanceKm * 10) / 10
          : null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return Response.json({ error: "Could not submit request" }, { status: 500 });
  }
}
