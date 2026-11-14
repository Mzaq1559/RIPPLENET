import type { Metadata } from "next";
import { CitizenHeader } from "../components/citizen-header";
import { CitizenNav } from "../components/citizen-nav";
import { LanguageProvider } from "../components/language-context";
import { Translated } from "../components/citizen-translated";
import { RouteMap } from "../components/route-map";
import { NearbyCamps } from "../components/nearby-camps";
import {
  IconCheck,
  IconLocate,
  IconMapPin,
  IconPhone,
  IconTruck,
} from "../components/icons";
import { prisma } from "../../lib/db";
import { fetchRoute } from "../../lib/osrm";
import { haversineKm } from "../../lib/geo";
import { formatFullDate } from "../../lib/needs";
import { CopyRequestId } from "./copy-request-id";
import { TrackSearch } from "./track-search";
import { StatusRefresher } from "./status-refresher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Status — RippleNet AI",
};

const timelineKeys = ["received", "processing", "assigned", "inTransit", "resolved"] as const;

type StepState = "done" | "current" | "todo";

const statusSteps: Record<string, { steps: StepState[]; bigKey: string; subKey?: string }> = {
  pending: { steps: ["done", "current", "todo", "todo", "todo"], bigKey: "received" },
  assigned: { steps: ["done", "done", "current", "todo", "todo"], bigKey: "assigned", subKey: "volunteerOnWay" },
  in_transit: { steps: ["done", "done", "done", "current", "todo"], bigKey: "inTransit", subKey: "volunteerOnWay" },
  resolved: { steps: ["done", "done", "done", "done", "done"], bigKey: "resolved", subKey: "resolvedMsg" },
};

function Timeline({ steps }: { steps: StepState[] }) {
  const doneCount = steps.filter((s) => s === "done").length;
  return (
    <div className="relative mt-6">
      <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[16.5px] flex h-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`flex-1 ${i < doneCount ? "bg-emerald-500" : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="relative grid grid-cols-5">
        {steps.map((state, i) => (
          <div key={timelineKeys[i]} className="flex flex-col items-center gap-2">
            {state === "done" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                <IconCheck className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
            {state === "current" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-channel text-white shadow-md shadow-channel/30 ring-4 ring-sky-100">
                <IconTruck className="h-[18px] w-[18px]" />
              </span>
            )}
            {state === "todo" && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-slate-200 bg-white" />
            )}
            <Translated
              k={timelineKeys[i]}
              as="span"
              className={`text-[9.5px] font-semibold leading-tight ${
                state === "current"
                  ? "text-channel"
                  : state === "done"
                    ? "text-slate-600"
                    : "text-slate-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function StatusPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const rawCode = searchParams.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.trim().toUpperCase() ?? "";
  const shell = (
    children: React.ReactNode,
    navCamp?: { name: string; phone: string; district?: string }
  ) => (
    <LanguageProvider>
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
        <CitizenHeader title="Track Request" subtitle="Request Tracking" />

        <header className="px-5 pt-4">
          <div className="leading-tight">
            <Translated k="myRequest" as="h1" className="font-display text-[22px] font-bold tracking-tight text-ink" />
            <Translated k="trackSos" as="p" className="mt-0.5 text-[12px] font-medium text-slate-500" />
          </div>
        </header>

        <main className="pb-[110px]">{children}</main>

        <CitizenNav active="status" camp={navCamp} />
      </div>
    </LanguageProvider>
  );

  if (!code) return shell(<TrackSearch />);

  const statusData = await (async () => {
    try {
      return await Promise.all([
        prisma.request.findUnique({
          where: { code },
          include: {
            camp: { select: { id: true, name: true, district: true, province: true, phone: true, lat: true, lng: true } },
            volunteer: { select: { id: true, name: true, phone: true } },
          },
        }),
        prisma.camp.findMany({
          select: { id: true, name: true, district: true, province: true, phone: true, lat: true, lng: true },
        }),
      ] as const);
    } catch (error) {
      console.error("Database query error on /status:", error);
      return null;
    }
  })();

  if (!statusData) {
    return shell(
      <div className="mx-5 mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
        Request tracking is temporarily unavailable. Please try again shortly.
      </div>,
    );
  }

  const [request, dbCamps] = statusData;
  if (!request) return shell(<TrackSearch notFound />);

  // Resolve a camp only from persisted records. Do not synthesize fallback camps.
  const nearestDbCamp = (lat: number, lng: number) =>
    dbCamps
      .map((candidate) => ({
        camp: candidate,
        distanceKm: haversineKm({ lat, lng }, { lat: candidate.lat, lng: candidate.lng }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]?.camp ?? null;

  let resolvedCamp = request.camp;
  const isLocationValid =
    Number.isFinite(request.lat) &&
    Number.isFinite(request.lng) &&
    request.lat >= -90 &&
    request.lat <= 90 &&
    request.lng >= -180 &&
    request.lng <= 180;

  if (
    isLocationValid &&
    (!resolvedCamp ||
      (request.district &&
        resolvedCamp.district &&
        resolvedCamp.district.toLowerCase() !== request.district.toLowerCase()))
  ) {
    resolvedCamp = nearestDbCamp(request.lat, request.lng);
  } else if (!resolvedCamp && request.district) {
    resolvedCamp =
      dbCamps.find(
        (candidate) => candidate.district.toLowerCase() === request.district.toLowerCase(),
      ) ?? null;
  }

  const camp = resolvedCamp;

  const volunteer = request.volunteer;

  const route = camp
    ? await fetchRoute(
        { lat: camp.lat, lng: camp.lng },
        { lat: request.lat, lng: request.lng },
      )
    : null;

  const distanceKm = route?.distanceKm ?? null;
  const etaMin = route?.durationMin ?? null;
  const live = request.status !== "resolved" && request.status !== "cancelled";
  const stepInfo = statusSteps[request.status];


  return shell(
    <>
      <StatusRefresher enabled={live} />

      <section className="mt-4 px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="min-w-0 flex-1 leading-tight">
            <Translated k="requestId" as="p" className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
            <p className="mt-1 font-display text-[16px] font-bold text-ink">{request.code}</p>
            <p className="mt-1 text-[11.5px] text-slate-500">
              <Translated k="requestedOn" /> {formatFullDate(request.createdAt)}
            </p>
          </div>
          <CopyRequestId value={request.code} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <Translated k="currentStatus" as="h2" className="text-[12px] font-semibold text-slate-600" />
        {request.status === "cancelled" ? (
          <div className="mt-1.5 rounded-2xl bg-red-50 px-4 py-4 text-center">
            <Translated k="statusCancelled" as="p" className="font-display text-[22px] font-bold text-red-600" />
          </div>
        ) : (
          <>
            <Translated
              k={stepInfo?.bigKey ?? "received"}
              as="p"
              className="mt-1.5 font-display text-[26px] font-bold leading-tight text-channel"
            />
            {stepInfo?.subKey && (
              <Translated k={stepInfo.subKey} as="p" className="mt-0.5 text-[12.5px] text-slate-500" />
            )}
            <Timeline steps={stepInfo?.steps ?? statusSteps.pending.steps} />
          </>
        )}
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <h2 className="font-display text-[13px] font-bold text-ink">Relief Coordination</h2>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
            This tracker reflects persisted request, camp, and volunteer records. A volunteer appears only after the relief team records an assignment.
          </p>
        </div>
      </section>

      {camp && (
        <section className="mt-7 px-5" aria-label="Route map">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[20px] shadow-lg shadow-ink/10">
            <RouteMap
              from={{ lat: camp.lat, lng: camp.lng, label: camp.name }}
              to={{ lat: request.lat, lng: request.lng, label: request.location ?? request.district }}
              geometry={route?.geometry ?? []}
            />

            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <IconMapPin className="h-3.5 w-3.5 shrink-0 text-channel" />
              <Translated k="yourLocation" as="span" className="text-[10.5px] font-bold text-ink" />
            </span>

            <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">ETA</p>
              <p className="font-display text-[18px] font-bold leading-tight text-ink">
                {etaMin != null ? `${etaMin} min` : "—"}
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                Road distance: {distanceKm != null ? `${distanceKm} km` : "Unavailable"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Recenter map"
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-channel shadow-md transition active:scale-95"
            >
              <IconLocate className="h-[18px] w-[18px]" />
            </button>
          </div>
          <p className="mt-2 px-1 text-[10px] leading-relaxed text-slate-400">
            Route distance and ETA use the OpenStreetMap road network. Live road closures and flood passability are not verified.
          </p>
        </section>
      )}

      {/* Contact Cards - Layered in front of map with z-10 */}
      <section className="relative z-10 mt-7 px-5">
        <Translated k="contactCard" as="h2" className="font-display text-[19px] font-bold tracking-tight text-ink" />

        <div className="mt-3.5 space-y-3">
          {volunteer && (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-md shadow-sky-950/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-channel">
                <IconPhone className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-channel">Assigned Relief Volunteer</p>
                <h3 className="mt-1 font-display text-[15px] font-bold text-ink">{volunteer.name}</h3>
                {volunteer.phone ? (
                  <a href={`tel:${volunteer.phone.replace(/\s+/g, "")}`} className="mt-1 block text-[12px] font-bold text-slate-500">
                    {volunteer.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Phone number not provided</p>
                )}
              </div>
              {volunteer.phone && (
                <a
                  href={`tel:${volunteer.phone.replace(/\s+/g, "")}`}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-channel px-4 text-[12.5px] font-bold text-white shadow-md shadow-channel/30 transition active:scale-[0.98]"
                >
                  <IconPhone className="h-3.5 w-3.5" />
                  <Translated k="call" />
                </a>
              )}
            </div>
          )}

          {camp && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-900/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                <IconPhone className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <Translated k="nearestCamp" as="p" className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
                <h3 className="mt-1 font-display text-[15px] font-bold text-ink">{camp.name}</h3>
                {camp.phone ? (
                  <a href={`tel:${camp.phone.replace(/\s+/g, "")}`} className="mt-1 block text-[12px] font-bold text-slate-500">
                    {camp.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Phone number not provided</p>
                )}
              </div>
              {camp.phone && (
                <a
                  href={`tel:${camp.phone.replace(/\s+/g, "")}`}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-bold text-white shadow-md shadow-ink/20 transition active:scale-[0.98]"
                >
                  <IconPhone className="h-3.5 w-3.5" />
                  <Translated k="call" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 px-5">
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
          If no volunteer or camp contact is shown, the relief team has not recorded a contact assignment for this request yet.
        </p>
      </section>

      <section className="mt-7 px-5">
        <Translated k="nearbyCamps" as="h2" className="font-display text-[19px] font-bold tracking-tight text-ink" />
        <NearbyCamps lat={request.lat} lng={request.lng} />
      </section>


    </>,
    camp ? { name: camp.name, phone: camp.phone, district: camp.district } : undefined
  );
}
