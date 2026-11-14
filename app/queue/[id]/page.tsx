import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthGuard } from "../../components/auth-guard";
import { RouteMap } from "../../components/route-map";
import { AssignButton, type AssignableVolunteer } from "./assign-sheet";
import { ForwardButton } from "./forward-button";
import {
  IconActivity,
  IconAlertTriangle,
  IconBaby,
  IconBandage,
  IconBowlSpoon,
  IconChevronLeft,
  IconDroplet,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconPregnant,
  IconTent,
  IconThermometer,
  IconUser,
  IconUsers,
  type IconType,
} from "../../components/icons";
import { prisma } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { assessRisk } from "../../../lib/risk";
import { fetchRoute } from "../../../lib/osrm";
import { LiveAgentAnalysisCard } from "../../components/live-agent-analysis-card";
import { runLiveMultiAgentPipeline, type LiveMultiAgentPipelineResult, type StockSnapshotItem } from "../../../lib/agents/live";
import { fetchRainfall } from "../../../lib/weather";
import { displayPriority, formatFullDate, parseNeeds } from "../../../lib/needs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Details — RippleNet AI",
};

const needStyles: { match: RegExp; Icon: IconType; tone: string }[] = [
  { match: /fever|temperature|pain/i, Icon: IconThermometer, tone: "bg-red-50 text-red-500" },
  { match: /water|thirst|dehydra|diarrhea|ors/i, Icon: IconDroplet, tone: "bg-sky-50 text-sky-500" },
  { match: /food|meal|hungry|nutrition/i, Icon: IconBowlSpoon, tone: "bg-amber-50 text-amber-600" },
  { match: /pregnan|mother|newborn/i, Icon: IconPregnant, tone: "bg-pink-50 text-pink-500" },
  { match: /child|baby|infant|under 5/i, Icon: IconBaby, tone: "bg-violet-50 text-violet-500" },
  { match: /elder/i, Icon: IconUsers, tone: "bg-slate-100 text-slate-500" },
  { match: /injur|wound|bleed|bandage|cut/i, Icon: IconBandage, tone: "bg-rose-50 text-rose-500" },
  { match: /rescue|boat|stranded|evacuat|snake|drown/i, Icon: IconAlertTriangle, tone: "bg-orange-50 text-orange-500" },
  { match: /tent|shelter|blanket|roof/i, Icon: IconTent, tone: "bg-emerald-50 text-emerald-600" },
];

function needStyle(label: string) {
  for (const rule of needStyles) {
    if (rule.match.test(label)) return rule;
  }
  return { Icon: IconActivity, tone: "bg-slate-100 text-slate-500" };
}

const statusPills: Record<string, { label: string; className: string }> = {
  pending: { label: "New", className: "bg-orange-100 text-orange-600" },
  assigned: { label: "Assigned", className: "bg-sky-100 text-sky-700" },
  in_transit: { label: "In Transit", className: "bg-violet-100 text-violet-600" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-600" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500" },
};

function RiskGauge({
  score,
  level,
  levelColor,
  stroke,
  track,
}: {
  score: number;
  level: string;
  levelColor: string;
  stroke: string;
  track: string;
}) {
  const r = 33;
  const c = 2 * Math.PI * r;
  const fill = Math.min(1, score / 10);
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative h-[86px] w-[86px]">
        <svg viewBox="0 0 86 86" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="43" cy="43" r={r} fill="none" stroke={track} strokeWidth="8" />
          <circle
            cx="43"
            cy="43"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${c * fill} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-baseline justify-center">
          <span className={`font-display text-[20px] font-extrabold ${levelColor}`}>{score.toFixed(1)}</span>
          <span className={`text-[9px] font-semibold ${levelColor} opacity-60`}>&nbsp;/10</span>
        </div>
      </div>
      <span className={`mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${levelColor}`}>
        {level}
      </span>
    </div>
  );
}

export default async function RequestDetailsPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "camp_manager") redirect("/login");

  const { id } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const rawRefreshAnalysis = searchParams.refreshAnalysis;
  const forceAnalysisRefresh = Array.isArray(rawRefreshAnalysis)
    ? rawRefreshAnalysis[0] === "1"
    : rawRefreshAnalysis === "1";
  const numeric = Number(id);
  const decodedId = decodeURIComponent(id).trim();
  let request: any = await prisma.request.findFirst({
    where: {
      OR: [
        ...(Number.isFinite(numeric) && /^\d+$/.test(decodedId) ? [{ id: numeric }] : []),
        { code: decodedId },
        { code: decodedId.toUpperCase() },
        { code: decodedId.toLowerCase() },
      ],
    },
    include: { camp: true, volunteer: true },
  });

  if (!request) notFound();

  const camp = request.camp;
  const needs = parseNeeds(request.needs);
  const risk = assessRisk({
    priority: request.priority,
    type: request.type,
    peopleCount: request.peopleCount,
    needs,
  });
  const pill = statusPills[request.status] ?? statusPills.pending;

  const [route, liveRainfall] = await Promise.all([
    camp ? fetchRoute({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) : null,
    fetchRainfall({ lat: request.lat, lng: request.lng }),
  ]);


  const volunteers = await prisma.user.findMany({
    where: { role: "volunteer", campId: session.campId },
    orderBy: [{ available: "desc" }, { name: "asc" }],
  });
  const volunteerIds = volunteers.map((v) => v.id);
  const [activeCounts, totalCounts] = await Promise.all([
    volunteerIds.length
      ? prisma.request.groupBy({
          by: ["volunteerId"],
          where: { volunteerId: { in: volunteerIds }, status: { in: ["assigned", "in_transit"] } },
          _count: { _all: true },
        })
      : [],
    volunteerIds.length
      ? prisma.request.groupBy({
          by: ["volunteerId"],
          where: { volunteerId: { in: volunteerIds } },
          _count: { _all: true },
        })
      : [],
  ]);
  
  const activeMap = new Map<number, number>();
  for (const a of activeCounts) {
    if (a.volunteerId != null) activeMap.set(a.volunteerId, a._count._all);
  }
  const totalMap = new Map<number, number>();
  for (const t of totalCounts) {
    if (t.volunteerId != null) totalMap.set(t.volunteerId, t._count._all);
  }

  const assignable: AssignableVolunteer[] = volunteers.map((v) => ({
    id: v.id,
    name: v.name,
    phone: v.phone ?? "",
    available: v.available,
    activeTasks: activeMap.get(v.id) ?? 0,
    totalTasks: totalMap.get(v.id) ?? 0,
  }));

  const priorityLabel = displayPriority(request.priority);
  const priorityAction =
    risk.score >= 8
      ? "recommend immediate human review"
      : risk.score >= 6
        ? "review before routine requests"
        : risk.score >= 4
          ? "consider scheduling within the day"
          : "standard queue review";

  const vulnerableNeeds = needs.filter((n) =>
    /child|baby|infant|under 5|elderly|pregnan|mother|newborn|disabled/i.test(n)
  );

  let resolution: { items?: string[]; peopleHelped?: number; notes?: string } | null = null;
  if (request.resolution) {
    try {
      resolution = JSON.parse(request.resolution);
    } catch {
      resolution = null;
    }
  }

  const symptomItems = needs.slice(0, 4);

  let stock: StockSnapshotItem[] | null = null;
  if (camp?.id) {
    try {
      const stockRows = await prisma.stockItem.findMany({ where: { campId: camp.id } });
      stock = stockRows.map((row) => ({
        name: row.name,
        quantity: row.quantity,
        unit: row.unit,
        reorderLevel: row.reorderLevel,
      }));
    } catch (error) {
      console.warn("Could not load camp stock:", error);
      stock = null;
    }
  }

  const analysisIsFresh =
    !forceAnalysisRefresh &&
    request.agentAnalysisAt instanceof Date &&
    Date.now() - request.agentAnalysisAt.getTime() < 10 * 60 * 1000;
  let pipeline: LiveMultiAgentPipelineResult | null = null;

  if (analysisIsFresh && typeof request.agentAnalysis === "string") {
    try {
      pipeline = JSON.parse(request.agentAnalysis) as LiveMultiAgentPipelineResult;
    } catch {
      pipeline = null;
    }
  }

  if (!pipeline) {
    pipeline = await runLiveMultiAgentPipeline({
      requestId: request.code,
      needs,
      priority: request.priority,
      type: request.type,
      peopleCount: request.peopleCount,
      district: request.district,
      weather: liveRainfall,
      route,
      stock,
    });

    const anyAgentCompleted = [
      pipeline.floodAgent,
      pipeline.healthAgent,
      pipeline.logisticsAgent,
      pipeline.routeAgent,
      pipeline.resourceAgent,
    ].some((agent) => agent.status === "completed");

    if (anyAgentCompleted) {
      try {
        await prisma.request.update({
          where: { id: request.id },
          data: {
            agentAnalysis: JSON.stringify(pipeline),
            agentAnalysisAt: new Date(),
          },
        });
      } catch (error) {
        console.warn("Could not cache request agent analysis:", error);
      }
    }
  }

  const parcel = pipeline.logisticsAgent.output?.items.map((item) => ({
    name: item.name,
    qty: `${item.quantity} ${item.unit}`,
  })) ?? [];

  return (
    <AuthGuard role="camp_manager" loginHref="/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center gap-2 px-5 pt-2">
        <Link
          href="/queue"
          aria-label="Back to queue"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Request Details
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
            {request.code}
          </p>
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${pill.className}`}>
          {pill.label}
        </span>
      </header>

      <main className="pb-10">
        <section className="mt-4 px-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="font-display text-[16px] font-bold text-ink">{request.citizenName}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-snug text-slate-500">
              <IconMapPin className="mt-[1px] h-3.5 w-3.5 shrink-0 text-slate-400" />
              {request.location ?? `${request.district} District`}
            </p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              Received {formatFullDate(request.createdAt)} · {request.peopleCount} people
            </p>

            <div className="relative mt-3.5 h-[110px] overflow-hidden rounded-xl">
              <RouteMap
                from={{ lat: camp?.lat ?? request.lat, lng: camp?.lng ?? request.lng, label: camp?.district ? `${camp.district} Camp` : "Camp" }}
                to={{ lat: request.lat, lng: request.lng, label: request.citizenName }}
                geometry={route?.geometry ?? []}
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${request.lat}&mlon=${request.lng}#map=15/${request.lat}/${request.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-channel text-[12.5px] font-bold text-white shadow-md shadow-channel/25 transition active:scale-[0.98]"
            >
              View on Map
            </a>
          </div>
        </section>

        <section className="mt-5 px-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-5">
              <RiskGauge
                score={risk.score}
                level={risk.level}
                levelColor={risk.levelColor}
                stroke={risk.stroke}
                track={risk.track}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Symptoms &amp; Needs
                </p>
                <div className="mt-2.5 flex justify-between gap-1">
                  {symptomItems.map((label) => {
                    const { Icon, tone } = needStyle(label);
                    return (
                      <div key={label} className="flex min-w-0 flex-col items-center gap-1.5">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
                          <Icon className="h-[19px] w-[19px]" />
                        </span>
                        <span className="text-center text-[9.5px] font-semibold leading-tight text-slate-600">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                AI Health Triage
              </p>
              <p className="mt-1 font-display text-[14px] font-bold text-ink">
                {pipeline.healthAgent.output?.urgency ?? "Unavailable"}
              </p>
              <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                Advisory signal only. A qualified clinician must review health decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 px-5">
          <LiveAgentAnalysisCard pipeline={pipeline} />
        </section>

        <section className="mt-6 px-5">
          <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
            Deployment Manifest
          </h2>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Five advisory agents summarize available evidence; all dispatch decisions remain human-controlled.
          </p>
          <div className="mt-3.5 flex flex-col gap-2.5">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-rose-500">
                1. Flood &amp; Risk Driver
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-slate-600">
                <span className="font-semibold text-ink">{priorityLabel} priority</span> request with{" "}
                {request.peopleCount} people
                {vulnerableNeeds.length > 0 && (
                  <>
                    {" "}including{" "}
                    <span className="font-semibold text-ink">
                      {vulnerableNeeds.join(", ").toLowerCase()}
                    </span>
                  </>
                )}{" "}
                — {needs.slice(0, 2).join(", ").toLowerCase() || "relief needs"} reported in {request.district}.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-orange-500">
                2. Priority &amp; Health Triage Effect
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-slate-600">
                Risk score <span className="font-semibold text-ink">{risk.score.toFixed(1)}</span> is a rule-based triage heuristic — {priorityAction}. Health Agent triage:{" "}
                <span className="font-semibold text-ink">{pipeline.healthAgent.output?.urgency ?? "unavailable"}</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-sky-600">
                3. Route Agent Decision
              </p>
              <div className="mt-1.5 space-y-1 text-[12px] leading-[1.55] text-slate-600">
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  {route
                    ? `OSRM route: ${route.distanceKm} km${route.viaName ? ` via ${route.viaName}` : ""}`
                    : "Route data unavailable"}
                </p>
                <p className="pt-0.5 font-bold text-sky-700">
                  {route ? `OSRM estimated duration: ${route.durationMin} min` : "No route estimate available"}
                </p>
                <p className="text-[11px] text-slate-500">Road passability is not verified.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-emerald-600">
                4. Logistics Agent Allocation
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-slate-600">
                {request.volunteer ? (
                  <>
                    <span className="font-semibold text-ink">{request.volunteer.name}</span> assigned with{" "}
                    {parcel.length} relief items tailored to distress needs
                    {request.status === "in_transit" && " — currently en route"}.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-ink">
                      {assignable.filter((v) => v.available).length} available volunteer(s)
                    </span>{" "}
                    ready for assignment with {parcel.length} relief items.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-teal-600">
                5. Resource Agent Cost Estimate
              </p>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-slate-600">
                {pipeline.resourceAgent.summary}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 px-5">
          <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
            AI-Suggested Parcel
          </h2>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
            {parcel.map((item) => (
              <span
                key={item.name}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700 shadow-sm"
              >
                <IconPackage className="h-3.5 w-3.5 text-slate-400" />
                {item.name}
                <span className="font-medium text-slate-400">{item.qty}</span>
              </span>
            ))}
          </div>
          {request.status === "pending" && <ForwardButton requestCode={request.code} />}
        </section>

        {request.status === "pending" ? (
          <section className="mt-5 px-5">
            <AssignButton requestCode={request.code} volunteers={assignable} />
          </section>
        ) : (
          <section className="mt-5 px-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {request.status === "resolved" ? "Resolved by" : "Assigned Volunteer"}
              </p>
              {request.volunteer ? (
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <IconUser className="h-[21px] w-[21px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[14px] font-bold text-ink">{request.volunteer.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-slate-500">
                      <IconPhone className="h-3 w-3 text-slate-400" />
                      {request.volunteer.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[12px] text-slate-500">No volunteer recorded.</p>
              )}
              {resolution && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  {resolution.items && resolution.items.length > 0 && (
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      <span className="font-semibold text-ink">Delivered:</span>{" "}
                      {resolution.items.join(", ")}
                    </p>
                  )}
                  {typeof resolution.peopleHelped === "number" && (
                    <p className="mt-1 text-[12px] text-slate-600">
                      <span className="font-semibold text-ink">{resolution.peopleHelped}</span> people helped
                    </p>
                  )}
                  {resolution.notes && (
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{resolution.notes}</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
