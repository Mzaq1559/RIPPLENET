import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthGuard } from "../../../components/auth-guard";
import { RouteMap } from "../../../components/route-map";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
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
} from "../../../components/icons";
import {
  StockIconAntiseptic,
  StockIconBandage,
  StockIconOrs,
  StockIconParacetamol,
  StockIconWaterFilter,
  StockIconWaterTabs,
  StockIconZinc,
} from "../../../stock/stock-icons";
import { prisma } from "../../../../lib/db";
import { getSession } from "../../../../lib/session";
import { haversineKm } from "../../../../lib/geo";
import { fetchRoute } from "../../../../lib/osrm";
import { parseNeeds, displayPriority, formatDayTime } from "../../../../lib/needs";
import type { LiveMultiAgentPipelineResult } from "../../../../lib/agents/live";
import { StartTripButton } from "./start-trip-button";

export const metadata: Metadata = {
  title: "Task Detail — RippleNet AI",
};

type IconType = (props: { className?: string }) => React.ReactNode;

function IconPackageLight({ className }: { className?: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
      <IconPackage className={className} />
    </span>
  );
}

const priorityBadges: Record<string, { label: string; className: string }> = {
  Critical: { label: "Critical Priority", className: "bg-red-500" },
  High: { label: "High Priority", className: "bg-red-500" },
  Medium: { label: "Medium Priority", className: "bg-orange-500" },
  Low: { label: "Low Priority", className: "bg-emerald-500" },
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

const parcelIcons: Record<string, IconType> = {
  "RippleNet Water Purification Kit": StockIconWaterFilter,
  "Paracetamol (500mg)": StockIconParacetamol,
  "ORS Sachets": StockIconOrs,
  "Zinc Tablets": StockIconZinc,
  "Water Purification Tabs": StockIconWaterTabs,
  "Antiseptic Liquid (100ml)": StockIconAntiseptic,
  "Bandage Rolls": StockIconBandage,
  "Mineral Water (1.5L)": IconDroplet,
  "Family Food Pack": IconBowlSpoon,
  "Family Tent": IconTent,
  Blankets: IconUsers,
  "Rescue Rope (20m)": IconActivity,
  "Life Jackets": IconUsers,
  "Hygiene Kit": IconPackageLight,
  "Soap Bars": IconPackageLight,
  "Clean Delivery Kit": IconPackageLight,
};

function needStyle(label: string) {
  for (const rule of needStyles) {
    if (rule.match.test(label)) return rule;
  }
  return { Icon: IconActivity, tone: "bg-slate-100 text-slate-500" };
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">{title}</h2>;
}

function parseCachedPipeline(serialized: string | null): LiveMultiAgentPipelineResult | null {
  if (!serialized) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    const isExecution = (candidate: unknown): boolean => {
      if (!candidate || typeof candidate !== "object") return false;
      const execution = candidate as Record<string, unknown>;
      return (
        (execution.status === "completed" || execution.status === "failed") &&
        typeof execution.summary === "string"
      );
    };
    return (
      typeof value.requestId === "string" &&
      isExecution(value.floodAgent) &&
      isExecution(value.healthAgent) &&
      isExecution(value.logisticsAgent) &&
      isExecution(value.routeAgent) &&
      isExecution(value.resourceAgent)
    )
      ? (parsed as LiveMultiAgentPipelineResult)
      : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session || session.role !== "volunteer") redirect("/volunteer/login");

  const numeric = Number(id);
  const decodedId = decodeURIComponent(id).trim();
  const request = await prisma.request.findFirst({
    where: {
      volunteerId: session.id,
      OR: [
        ...(Number.isFinite(numeric) && /^\d+$/.test(decodedId) ? [{ id: numeric }] : []),
        { code: decodedId },
        { code: decodedId.toUpperCase() },
        { code: decodedId.toLowerCase() },
      ],
    },
    include: { camp: true },
  });

  if (!request) notFound();

  let resolutionData: { items?: string[]; peopleHelped?: number; notes?: string } = {};
  if (request.resolution) {
    try {
      resolutionData = JSON.parse(request.resolution);
    } catch {
      resolutionData = {};
    }
  }

  const camp = request.camp;
  const needs = parseNeeds(request.needs);
  const pipeline = parseCachedPipeline(request.agentAnalysis);
  const suggestedItems = pipeline?.logisticsAgent.output?.items ?? [];

  const route = camp ? await fetchRoute({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) : null;
  const distanceKm = route?.distanceKm ?? (camp ? Math.round(haversineKm({ lat: camp.lat, lng: camp.lng }, { lat: request.lat, lng: request.lng }) * 10) / 10 : null);
  const etaMin = route?.durationMin ?? null;

  const dueAt = new Date((request.assignedAt ?? request.createdAt).getTime() + 2 * 60 * 60 * 1000);
  const summary = [
    { label: "Distance", value: distanceKm != null ? `${distanceKm} km` : "—" },
    { label: "ETA", value: etaMin != null ? `${etaMin} min` : "—" },
    { label: "Due Time", value: formatDayTime(dueAt) },
  ] as const;

  const priority = displayPriority(request.priority);
  const badge = priorityBadges[priority];



  return (
    <AuthGuard role="volunteer" loginHref="/volunteer/login">
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <header className="flex items-center gap-2 px-5 pt-7">
        <Link
          href={request.status === "resolved" ? "/volunteer/history" : "/volunteer/tasks"}
          aria-label={request.status === "resolved" ? "Back to delivery history" : "Back to my tasks"}
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <IconChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Task Detail
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">{request.code}</p>
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <main className="pb-10">
        <section className="mt-4 px-5" aria-label="Task summary">
          <div className="grid grid-cols-3 gap-2">
            {summary.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm"
              >
                <p className="font-display text-[16px] font-extrabold leading-none text-ink">
                  {value}
                </p>
                <p className="mt-1.5 text-[8.5px] font-semibold uppercase leading-[1.3] tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 px-5">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50/50 p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[12px] font-bold text-ink">
                AI Advisory Briefing
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                {pipeline ? "Cached analysis" : "Not available"}
              </span>
            </div>
            <div className="mt-2 space-y-2 text-[11.5px] text-slate-600">
              <p>
                <span className="font-semibold text-ink">Route information:</span>{" "}
                {pipeline?.routeAgent.summary ?? "No saved route analysis is available for this request."}
              </p>
              <p>
                <span className="font-semibold text-ink">Health triage:</span>{" "}
                {pipeline?.healthAgent.summary ?? "No saved health triage is available for this request."}
              </p>
              <p className="border-t border-sky-100 pt-2 text-[10.5px] text-slate-500">
                Advisory only. Road passability is unverified. A qualified clinician must review health decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Victim Details" />
          <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <IconUser className="h-[21px] w-[21px]" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[14px] font-bold text-ink">{request.citizenName}</p>
                <p className="mt-1 flex items-start gap-1 text-[11px] leading-snug text-slate-500">
                  <IconMapPin className="mt-[1px] h-3 w-3 shrink-0 text-slate-400" />
                  {request.location ?? `${request.district} District`} — {request.peopleCount}{" "}
                  {request.peopleCount === 1 ? "person" : "people"}
                </p>
              </div>
              <a
                href={`tel:${request.phone.replace(/\s+/g, "")}`}
                aria-label={`Call ${request.citizenName}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition active:scale-95"
              >
                <IconPhone className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Symptoms / Needs" />
          <div className="mt-3 flex flex-wrap gap-2">
            {needs.length > 0 ? (
              needs.map((label) => {
                const { Icon, tone } = needStyle(label);
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold ${tone}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                );
              })
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-[12px] font-semibold text-slate-500">
                <IconActivity className="h-4 w-4" />
                General relief
              </span>
            )}
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="AI Suggested Items" />
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Suggestions are advisory only. Check physical stock and confirm the allocation before dispatch; no stock is reserved by this analysis.
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {suggestedItems.length > 0 ? (
              suggestedItems.map((item, i) => {
                const Icon = parcelIcons[item.name] ?? IconPackageLight;
                const stockLabel =
                  item.stockStatus === "in_stock"
                    ? "Matching stock record"
                    : item.stockStatus === "short"
                      ? `Recorded stock short: ${item.available ?? 0} ${item.unit}`
                      : item.stockStatus === "unit_mismatch"
                        ? "Stock unit mismatch"
                        : item.stockStatus === "not_tracked"
                          ? "Not tracked in camp stock"
                          : "Stock not checked";
                return (
                  <div
                    key={`${item.name}-${i}`}
                    className={`flex items-center gap-3 px-3.5 py-2.5 ${i > 0 ? "border-t border-slate-100" : ""}`}
                  >
                    <Icon className="h-9 w-9 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink">{item.name}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{stockLabel}</span>
                    </span>
                    <span className="shrink-0 text-[11.5px] font-bold tabular-nums text-slate-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-[11.5px] leading-relaxed text-slate-500">
                No saved AI item suggestions are available. Ask the camp manager to run the analysis, then verify stock manually.
              </p>
            )}
          </div>
        </section>

        <section className="mt-5 px-5">
          <SectionHeading title="Route" />
          <p className="mt-1 text-[11.5px] text-slate-500">
            {route?.viaName ? `Via ${route.viaName}` : "Fastest road route"} · OpenStreetMap road-network estimate
          </p>
          <div className="relative mt-3 h-[175px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            {camp ? (
              <RouteMap
                from={{ lat: camp.lat, lng: camp.lng, label: camp.name }}
                to={{ lat: request.lat, lng: request.lng, label: request.location ?? request.district }}
                geometry={route?.geometry ?? []}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                Camp location unavailable
              </div>
            )}
            <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[9.5px] font-bold text-white shadow-md">
              {etaMin != null ? `${etaMin} min` : "ETA unavailable"}
            </span>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">
            Route distance and ETA do not verify live road closures or flood passability.
          </p>
        </section>

        <section className="mt-6 px-5">
          {request.status === "resolved" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm text-left">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-[13.5px] font-bold text-emerald-800">
                  ✓ Relief Delivery Completed
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-bold text-white">
                  Verified Record
                </span>
              </div>
              <div className="mt-2.5 space-y-1 text-[11.5px] text-emerald-950">
                <p>
                  👥 <strong>{resolutionData.peopleHelped ?? request.peopleCount} beneficiaries</strong> received emergency aid
                </p>
                <p>
                  📦 <strong>Items:</strong> {(resolutionData.items ?? parseNeeds(request.needs)).join(", ")}
                </p>
                {resolutionData.notes && (
                  <p className="mt-1.5 border-t border-emerald-200/80 pt-1.5 text-[11px] italic text-emerald-800">
                    &quot;{resolutionData.notes}&quot;
                  </p>
                )}
                <p className="pt-1 text-[10.5px] text-emerald-700">
                  📅 Resolved {request.resolvedAt ? formatDayTime(request.resolvedAt) : formatDayTime(request.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <a
                href={`tel:${(camp?.phone ?? "").replace(/\s+/g, "")}`}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-[13px] font-bold text-ink shadow-sm transition active:scale-[0.98]"
              >
                <IconPhone className="h-[18px] w-[18px] text-emerald-500" />
                Call Camp
              </a>
              {request.status === "assigned" ? (
                <StartTripButton requestId={request.code} />
              ) : (
                <Link
                  href={`/volunteer/tasks/${request.code}/resolve`}
                  className="flex h-[52px] flex-[1.3] items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
                >
                  Resolve Delivery
                  <IconArrowRight className="h-[18px] w-[18px]" />
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
    </AuthGuard>
  );
}
