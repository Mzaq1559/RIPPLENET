"use client";

import { useState } from "react";
import {
  IconCheck,
  IconClock,
  IconX,
  IconMapPin,
  IconSearch,
  IconTruck,
  IconUserCheck,
  IconPackage,
} from "../../components/icons";

export interface ActivityItem {
  id: string | number;
  title: string;
  detail: string;
  campName: string;
  district: string;
  time: string;
  fullDate: string;
  type: "resolved" | "in_transit" | "assigned" | "pending" | "restock";
  status: string;
}

interface RecentActivitySectionProps {
  initialActivities: ActivityItem[];
}

const typeConfig: Record<
  ActivityItem["type"],
  { label: string; icon: typeof IconCheck; bg: string; text: string; badge: string }
> = {
  resolved: {
    label: "Resolved",
    icon: IconCheck,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  in_transit: {
    label: "In Transit",
    icon: IconTruck,
    bg: "bg-violet-100",
    text: "text-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  assigned: {
    label: "Assigned",
    icon: IconUserCheck,
    bg: "bg-sky-100",
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  pending: {
    label: "New SOS",
    icon: IconMapPin,
    bg: "bg-amber-100",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  restock: {
    label: "Restock",
    icon: IconPackage,
    bg: "bg-rose-100",
    text: "text-rose-600",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function RecentActivitySection({ initialActivities }: RecentActivitySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const previewList = initialActivities.slice(0, 4);

  const filtered = initialActivities.filter((item) => {
    if (selectedFilter !== "all" && item.type !== selectedFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.detail.toLowerCase().includes(q) ||
      item.campName.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q)
    );
  });

  const filterTabs = [
    { id: "all", label: "All Activities", count: initialActivities.length },
    { id: "pending", label: "New Requests", count: initialActivities.filter((a) => a.type === "pending").length },
    { id: "in_transit", label: "Dispatches", count: initialActivities.filter((a) => a.type === "in_transit").length },
    { id: "assigned", label: "Assignments", count: initialActivities.filter((a) => a.type === "assigned").length },
    { id: "resolved", label: "Resolved", count: initialActivities.filter((a) => a.type === "resolved").length },
  ];

  return (
    <>
      <section className="mt-5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
              Recent Activity
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Live
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-[12px] font-bold text-sky-500 hover:text-sky-600 transition"
          >
            <span>View All</span>
            <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600">
              ({initialActivities.length})
            </span>
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {previewList.map((item) => {
            const config = typeConfig[item.type] || typeConfig.pending;
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 cursor-pointer rounded-2xl border border-slate-100/80 bg-white p-3 shadow-xs hover:border-slate-200 transition"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink truncate">
                    {item.title}
                    <span className="font-medium text-slate-500"> — {item.detail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {item.campName} · {item.district}
                  </p>
                </div>
                <span className="shrink-0 text-[10.5px] font-semibold tabular-nums text-slate-400">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* View All Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-t-[28px] bg-paper shadow-2xl sm:rounded-[28px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h3 className="font-display text-[17px] font-bold text-ink">
                  National Activity Feed
                </h3>
                <p className="text-[11.5px] text-slate-500 font-medium">
                  Live operational dispatches and relief actions across Pakistan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                aria-label="Close"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="border-b border-slate-100 bg-white px-5 pb-3 pt-2">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by camp, city or detail..."
                  className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-[12px] font-medium text-ink placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Filter Pills */}
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {filterTabs.map((tab) => {
                  const active = selectedFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedFilter(tab.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        active
                          ? "bg-ink text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Activity List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
              {filtered.map((item) => {
                const config = typeConfig[item.type] || typeConfig.pending;
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display text-[13.5px] font-bold text-ink truncate">
                          {item.title}
                        </span>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold transition-colors duration-300 motion-reduce:transition-none ${config.badge}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] font-medium text-slate-600">
                        {item.detail}
                      </p>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2 text-[10.5px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1 truncate text-slate-500">
                          <IconMapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          {item.campName} ({item.district})
                        </span>
                        <span className="shrink-0 flex items-center gap-1 tabular-nums">
                          <IconClock className="h-3 w-3" />
                          {item.fullDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <p className="text-[13px] font-bold text-slate-600">No activities found</p>
                  <p className="mt-1 text-[11.5px] text-slate-400">
                    Try adjusting your search query or filter tab.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-white px-5 py-3 text-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-full bg-slate-100 py-2.5 text-[12.5px] font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close Activity Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
