import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { fetchRoute } from "@/lib/osrm";
import { parseNeeds } from "@/lib/needs";
import { haversineKm } from "@/lib/geo";

async function findRequest(idOrCode: string) {
  const numeric = Number(idOrCode);
  return prisma.request.findFirst({
    where:
      Number.isFinite(numeric) && /^\d+$/.test(idOrCode)
        ? { id: numeric }
        : { code: idOrCode.toUpperCase() },
    include: {
      camp: { select: { id: true, name: true, district: true, phone: true, lat: true, lng: true } },
      volunteer: { select: { id: true, name: true, phone: true } },
    },
  });
}

type RequestLookup = Awaited<ReturnType<typeof findRequest>>;

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/requests/[id]">
) {
  const { id } = await ctx.params;
  let request: RequestLookup;
  try {
    request = await findRequest(id);
  } catch (error) {
    console.error("GET /api/requests/[id] database error:", error);
    return Response.json({ error: "Could not retrieve request" }, { status: 500 });
  }
  if (!request) {
    return Response.json({ error: "Request not found" }, { status: 404 });
  }

  let route = null;
  const withRoute = new URL(req.url).searchParams.get("withRoute");
  if (withRoute && request.camp) {
    route = await fetchRoute(
      { lat: request.camp.lat, lng: request.camp.lng },
      { lat: request.lat, lng: request.lng }
    );
  }

  return Response.json({
    request: { ...request, needsList: parseNeeds(request.needs) },
    route,
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/requests/[id]">
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let request: RequestLookup;
  try {
    request = await findRequest(id);
  } catch (error) {
    console.error("PATCH /api/requests/[id] database error:", error);
    return Response.json({ error: "Could not retrieve request" }, { status: 500 });
  }
  if (!request) {
    return Response.json({ error: "Request not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action === "assign") {
    if (session.role !== "camp_manager") {
      return Response.json({ error: "Only camp managers can assign requests" }, { status: 403 });
    }
    if (request.status !== "pending") {
      return Response.json({ error: "Only pending requests can be assigned" }, { status: 400 });
    }
    const volunteerId = Number(body.volunteerId);
    const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!volunteer || volunteer.role !== "volunteer" || !volunteer.available) {
      return Response.json({ error: "Volunteer not available" }, { status: 400 });
    }
    if (session.campId && volunteer.campId !== session.campId) {
      return Response.json({ error: "Volunteer belongs to another camp" }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id: request.id },
      data: {
        volunteerId,
        campId: session.campId ?? request.campId,
        status: "assigned",
        assignedAt: new Date(),
      },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    return Response.json({ request: { ...updated, needsList: parseNeeds(updated.needs) } });
  }

  if (action === "start") {
    const isOwner = session.role === "volunteer" && session.id === request.volunteerId;
    const isCampManager = session.role === "camp_manager" && session.campId === request.campId;
    if (!isOwner && !isCampManager) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }
    if (request.status !== "assigned") {
      return Response.json({ error: "Request is not in assigned state" }, { status: 400 });
    }
    const updated = await prisma.request.update({
      where: { id: request.id },
      data: { status: "in_transit", startedAt: new Date() },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    return Response.json({ request: { ...updated, needsList: parseNeeds(updated.needs) } });
  }

  if (action === "resolve") {
    const isOwner = session.role === "volunteer" && session.id === request.volunteerId;
    const isCampManager = session.role === "camp_manager" && session.campId === request.campId;
    if (!isOwner && !isCampManager) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }
    if (request.status !== "in_transit") {
      return Response.json({ error: "Request is not in transit" }, { status: 400 });
    }
    const resolution = {
      itemsDelivered: Array.isArray(body.itemsDelivered) ? body.itemsDelivered.map(String) : [],
      peopleHelped: Number(body.peopleHelped ?? request.peopleCount) || request.peopleCount,
      notes: String(body.notes ?? ""),
      proofPhotos: Array.isArray(body.proofPhotos) ? body.proofPhotos.map(String).slice(0, 6) : [],
      resolvedBy: session.name,
      resolvedAt: new Date().toISOString(),
    };
    const updated = await prisma.request.update({
      where: { id: request.id },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
        resolution: JSON.stringify(resolution),
      },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    return Response.json({ request: { ...updated, needsList: parseNeeds(updated.needs) } });
  }

  if (action === "forward") {
    if (session.role === "volunteer") {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }
    if (request.status !== "pending") {
      return Response.json({ error: "Only pending requests can be forwarded" }, { status: 400 });
    }

    const camps = await prisma.camp.findMany({
      where: { id: { not: request.campId ?? -1 } },
    });
    const target = camps
      .map((c) => ({ camp: c, distanceKm: haversineKm({ lat: request.lat, lng: request.lng }, { lat: c.lat, lng: c.lng }) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
    if (!target) {
      return Response.json({ error: "No other camp available" }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id: request.id },
      data: { campId: target.camp.id },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    return Response.json({
      request: { ...updated, needsList: parseNeeds(updated.needs) },
      forwardedTo: target.camp,
      distanceKm: Math.round(target.distanceKm * 10) / 10,
    });
  }

  if (action === "cancel") {
    if (session.role === "volunteer") {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }
    if (request.status === "resolved") {
      return Response.json({ error: "Resolved requests cannot be cancelled" }, { status: 400 });
    }
    const updated = await prisma.request.update({
      where: { id: request.id },
      data: { status: "cancelled" },
      include: {
        camp: { select: { id: true, name: true, district: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
      },
    });
    return Response.json({ request: { ...updated, needsList: parseNeeds(updated.needs) } });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
