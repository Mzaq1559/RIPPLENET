"use client";

import { useState } from "react";
import { IconChevronRight } from "../components/icons";
import { formatDayTime } from "../../lib/needs";

export interface QueueItem {
  code: string;
  name: string;
  location: string;
  issues: string;
  status: string;
  createdAt: string;
  score: number;
  level: string;
  levelColor: string;
  badge: string;
}

type Filter = "All" | "New" | "Processing" | "Resolved";

const statusTag: Record<string, string> = {
  pending: "bg-orange-100 text-orange-600",
  assigned: "bg-sky-100 text-sky-700",
  in_transit: "bg-violet-100 text-violet-600",
  resolved: "bg-emerald-100 text-emerald-600",
  cancelled: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<string, string> = {
  pending: "New",
  assigned: "Assigned",
  in_transit: "In Transit",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

function filterOf(status: string): Filter {
  if (status === "pending") return "New";
  if (status === "assigned" || status === "in_transit") return "Processing";
  return "Resolved";
}

export function QueueList({ items }: { items: QueueItem[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? items : items.filter((r) => filterOf(r.status) === filter);

  const filters: { id: Filter; count: number }[] = [
    { id: "All", count: items.length },
    { id: "New", count: items.filter((r) => r.status === "pending").length },
    { id: "Processing", count: items.filter((r) => filterOf(r.status) === "Processing").length },
    { id: "Resolved", count: items.filter((r) => r.status === "resolved").length },
  ];

  return (
    <>
      <section className="px-5 pt-5">
        <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
          Incoming Requests
        </h2>
        <div className="mt-3 flex gap-2">
          {filters.map(({ id, count }) => {
            const active = id === filter;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={active}
                className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-full text-[11px] font-bold transition active:scale-[0.97] ${
                  active
                    ? "bg-channel text-white shadow-sm shadow-channel/25"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {id}
                <span
                  className={`rounded-full px-1.5 py-[1px] text-[9.5px] font-bold tabular-nums ${
                    active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-2.5 px-5" aria-label="Request queue">
        {visible.map((item) => (
          <a
            key={item.code}
            href={`/queue/${item.code}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
          >
            <span className="flex w-[44px] shrink-0 flex-col items-center gap-1">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-[14.5px] font-bold text-white ${item.badge}`}
              >
                {item.score.toFixed(1)}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${item.levelColor}`}>
                {item.level}
              </span>
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-display text-[14px] font-bold text-ink">
                {item.name}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.location}</span>
              <span className="mt-1 block truncate text-[11px] font-medium text-slate-600">
                {item.issues}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[10.5px] font-medium tabular-nums text-slate-400">
                {formatDayTime(new Date(item.createdAt))}
              </span>
              <span
                className={`rounded-full px-2 py-[3px] text-[9px] font-bold transition-colors duration-300 motion-reduce:transition-none ${statusTag[item.status] ?? statusTag.pending}`}
              >
                {statusLabel[item.status] ?? item.status}
              </span>
            </span>
            <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </a>
        ))}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-500">No requests in this view</p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              New SOS requests routed to this camp will appear here.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
