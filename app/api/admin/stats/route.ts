import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { computeFloodRisk } from "@/lib/geo";
import { findDistrict } from "@/lib/pakistan-districts";
import { fetchRainfallBatch } from "@/lib/weather";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Admin login required" }, { status: 401 });
  }

  const [statusGroups, camps, volunteerCount, availableVolunteers, restockPending, openComplaints, recentRequests] =
    await Promise.all([
      prisma.request.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.camp.findMany({ include: { _count: { select: { requests: true } } } }),
      prisma.user.count({ where: { role: "volunteer" } }),
      prisma.user.count({ where: { role: "volunteer", available: true } }),
      prisma.restockRequest.count({ where: { status: "pending" } }),
      prisma.complaint.count({ where: { status: "open" } }),
      prisma.request.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          camp: { select: { name: true, district: true } },
          volunteer: { select: { name: true } },
        },
      }),
    ]);

  const statusCounts: Record<string, number> = {};
  for (const g of statusGroups) statusCounts[g.status] = g._count._all;

  // Live rainfall for each camp district, one batched Open-Meteo call.
  const districtNames = [...new Set(camps.map((c) => c.district))];
  const districtInfos = districtNames
    .map((name) => findDistrict(name))
    .filter((d): d is NonNullable<typeof d> => d !== null);
  const rainfalls = await fetchRainfallBatch(districtInfos.map((d) => ({ lat: d.lat, lng: d.lng })));

  const districtRisks = districtInfos
    .map((d, i) => ({
      name: d.name,
      province: d.province,
      ...computeFloodRisk(d.floodWeight, rainfalls[i]),
    }))
    .sort((a, b) => {
      if (a.score === null) return b.score === null ? 0 : 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

  return Response.json({
    requests: {
      total: Object.values(statusCounts).reduce((s, n) => s + n, 0),
      pending: statusCounts.pending ?? 0,
      assigned: statusCounts.assigned ?? 0,
      inTransit: statusCounts.in_transit ?? 0,
      resolved: statusCounts.resolved ?? 0,
      cancelled: statusCounts.cancelled ?? 0,
    },
    camps: {
      total: camps.length,
      open: camps.filter((c) => c.status === "open").length,
      full: camps.filter((c) => c.status === "full").length,
      capacity: camps.reduce((s, c) => s + c.capacity, 0),
      occupancy: camps.reduce((s, c) => s + c.occupancy, 0),
      list: camps.map((c) => ({
        id: c.id,
        name: c.name,
        district: c.district,
        province: c.province,
        capacity: c.capacity,
        occupancy: c.occupancy,
        status: c.status,
        requestCount: c._count.requests,
      })),
    },
    volunteers: { total: volunteerCount, available: availableVolunteers },
    restockPending,
    openComplaints,
    districtRisks,
    recentRequests,
    generatedAt: new Date().toISOString(),
  });
}
