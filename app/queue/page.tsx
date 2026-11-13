import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "../components/auth-guard";
import { StaffNav } from "../components/staff-nav";
import { NotificationBell } from "../components/notification-bell";
import { CampSwitcher } from "../components/camp-switcher";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/session";
import { parseNeeds } from "../../lib/needs";
import { assessRisk } from "../../lib/risk";
import { mergeCamps, getNearbyDistricts, getMockRequestsForCamp } from "../../lib/camps";
import { QueueList } from "./queue-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Incoming Requests — RippleNet AI",
};

function sortQueueItems<T extends { status: string; score: number; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aFinished = a.status === "resolved" || a.status === "cancelled";
    const bFinished = b.status === "resolved" || b.status === "cancelled";

    if (aFinished !== bFinished) return aFinished ? 1 : -1;

    if (!aFinished) {
      return b.score - a.score || Date.parse(a.createdAt) - Date.parse(b.createdAt);
    }

    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export default async function QueuePage(props: {
  searchParams?: Promise<{ campId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const searchParams = props.searchParams ? await props.searchParams : {};
  const qCampId = searchParams.campId ? Number(searchParams.campId) : null;

  let dbCamps: any[] = [];
  try {
    dbCamps = await prisma.camp.findMany({
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.warn("Could not query camps:", e);
  }

  const allCamps = mergeCamps(dbCamps);
  const effectiveCampId = qCampId || session.campId || allCamps[0]?.id || 101;
  const currentCamp = allCamps.find((c) => c.id === effectiveCampId) || allCamps[0];

  const nearbyDistricts = getNearbyDistricts(currentCamp.district);

  let requests: any[] = [];
  try {
    requests = await prisma.request.findMany({
      where: {
        OR: [
          { campId: currentCamp.id },
          { district: { in: nearbyDistricts } },
        ],
      },
      orderBy: [{ createdAt: "desc" }],
    });
  } catch (e) {
    console.warn("Could not query requests:", e);
  }

  // If no DB requests yet for this camp, use regional synthesized requests
  if (requests.length === 0) {
    requests = getMockRequestsForCamp(currentCamp);
  }

  const items = sortQueueItems(requests.map((r) => {
    const needs = parseNeeds(r.needs);
    const risk = assessRisk({ priority: r.priority, type: r.type, peopleCount: r.peopleCount, needs });
    const createdDate = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt || Date.now());
    return {
      code: r.code,
      name: r.citizenName,
      location: r.location ?? `${r.district} District`,
      issues: needs.slice(0, 2).join(", ") || "Relief delivery",
      status: r.status,
      createdAt: createdDate.toISOString(),
      score: risk.score,
      level: risk.level,
      levelColor: risk.levelColor,
      badge: risk.badge,
    };
  }));

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        <header className="flex items-center justify-between px-5 pt-7">
          <CampSwitcher
            currentCamp={currentCamp}
            allCamps={allCamps}
            basePath="/queue"
          />
          <NotificationBell role="camp_manager" />
        </header>

        <main className="pb-[110px]">
          <QueueList items={items} />
        </main>

        <StaffNav active="queue" />
      </div>
    </AuthGuard>
  );
}
