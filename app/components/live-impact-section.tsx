"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconChevronRight,
  IconClock,
  IconHeart,
  IconPackage,
  IconUsers,
  IconX,
  IconShield,
  IconActivity,
  IconTruck,
  IconBrain,
  IconMapPin,
  IconSparkles,
  IconWaterKit,
} from "./icons";
import { RevealOnScroll } from "./reveal-on-scroll";

const primaryMetrics = [
  {
    label: "Families Rescued",
    value: "2,840+",
    Icon: IconUsers,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Water Kits Deployed",
    value: "1,420",
    Icon: IconPackage,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    label: "Relief Camps Active",
    value: "13",
    Icon: IconHeart,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    label: "Avg. Response Time",
    value: "14.2m",
    Icon: IconClock,
    tone: "bg-amber-50 text-amber-600",
  },
];

const expandedMetrics = [
  {
    label: "Families Rescued & Sheltered",
    value: "2,840+",
    desc: "Displaced flood victims evacuated and provided dry shelter",
    Icon: IconUsers,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Water Purification Kits",
    value: "1,420",
    desc: "Gravity filtration units producing 100L/day per family",
    Icon: IconPackage,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    label: "Potable Safe Water Generated",
    value: "142,000 L",
    desc: "Decontaminated clean drinking water delivered to flood victims",
    Icon: IconWaterKit,
    tone: "bg-cyan-50 text-cyan-600",
  },
  {
    label: "Relief Camps Operational",
    value: "13",
    desc: "Active field triage and distribution centers across 4 provinces",
    Icon: IconHeart,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    label: "Average Dispatch Latency",
    value: "14.2 min",
    desc: "From citizen SOS trigger to volunteer field mobilization",
    Icon: IconClock,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Medical & ORS Packs Distributed",
    value: "5,120",
    desc: "Cholera prevention, antimalarials, and emergency first aid",
    Icon: IconActivity,
    tone: "bg-purple-50 text-purple-600",
  },
  {
    label: "Active Field Volunteers",
    value: "48",
    desc: "Motorbike and 4x4 first responders on active ground duty",
    Icon: IconTruck,
    tone: "bg-teal-50 text-teal-600",
  },
  {
    label: "AI Agent Triage Precision",
    value: "98.4%",
    desc: "Autonomous severity ranking and zero-delay route optimization",
    Icon: IconBrain,
    tone: "bg-indigo-50 text-indigo-600",
  },
];

const provinceDistribution = [
  { province: "Sindh (Badin, Thatta, Dadu, Sukkur)", percent: 45, families: "1,278 families" },
  { province: "KPK (Nowshera, Swat, Charsadda)", percent: 28, families: "795 families" },
  { province: "Punjab (Rajanpur, D.G. Khan)", percent: 18, families: "511 families" },
  { province: "Balochistan (Jafarabad, Naseerabad)", percent: 9, families: "256 families" },
];

export function LiveImpactSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <RevealOnScroll className="mt-9 px-5">
      <div className="flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 font-display text-[19px] font-bold tracking-tight text-ink">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live Impact Metrics
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center text-[13px] font-semibold text-channel hover:underline active:scale-95 transition"
        >
          View All
          <IconChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grid of Primary 4 Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {primaryMetrics.map(({ label, value, Icon, tone }) => (
          <button
            type="button"
            key={label}
            onClick={() => setModalOpen(true)}
            className="text-left rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 active:scale-[0.98]"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-[20px] font-bold tabular-nums text-ink">{value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">{label}</p>
          </button>
        ))}
      </div>

      {/* Detailed Live Impact Report Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Live impact operations report"
            className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 pb-8 shadow-2xl animate-slide-up motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <IconActivity className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-bold text-ink">
                    Live Impact Report
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time field statistics across Pakistan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* All 8 Metric Tiles */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {expandedMetrics.map(({ label, value, desc, Icon, tone }) => (
                <div
                  key={label}
                  className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 shadow-xs"
                >
                  <div>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-2 font-display text-[17px] font-bold tabular-nums text-ink">
                      {value}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-800 leading-tight">
                      {label}
                    </p>
                  </div>
                  <p className="mt-1 text-[9.5px] text-slate-400 leading-snug">{desc}</p>
                </div>
              ))}
            </div>

            {/* Province Level Breakdown */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Provincial Relief Distribution
              </p>
              {provinceDistribution.map(({ province, percent, families }) => (
                <div key={province} className="space-y-1">
                  <div className="flex justify-between text-[11.5px] font-semibold">
                    <span className="text-slate-700">{province}</span>
                    <span className="text-channel tabular-nums">{families} ({percent}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-channel rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Navigation Links */}
            <div className="mt-5 flex gap-2">
              <Link
                href="/demo"
                onClick={() => setModalOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-3 text-[12.5px] font-bold text-white shadow-md transition active:scale-95"
              >
                <IconBrain className="h-4 w-4 text-cyan-400" />
                AI Agents Sandbox
              </Link>
              <Link
                href="/camps"
                onClick={() => setModalOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-3 text-[12.5px] font-bold text-channel transition active:scale-95"
              >
                <IconMapPin className="h-4 w-4" />
                Relief Camps
              </Link>
            </div>
          </div>
        </div>
      )}
    </RevealOnScroll>
  );
}
