"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconRouteAgent,
  IconResourceAgent,
  IconBrain,
  IconZap,
  IconSparkles,
  IconRefresh,
  IconCheck,
  IconAlertTriangle,
  IconTruck,
  IconMapPin,
  IconPackage,
  IconShield,
  IconWaterKit,
  IconUser,
  IconPhone,
  IconArrowRight,
  IconPlayFilled,
  IconClock,
  IconChevronRight,
  IconHome,
} from "../components/icons";
import { runDemoPipelinePreview, type MultiAgentPipelineResult } from "../../lib/agents";
import { AgentReasoningCard } from "../components/agent-reasoning-card";

interface DemoScenario {
  id: string;
  name: string;
  district: string;
  citizenName: string;
  phone: string;
  peopleCount: number;
  priority: "critical" | "high" | "medium";
  type: "medical" | "water" | "food" | "rescue";
  needs: string[];
  description: string;
  floodRainfall: number;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "badin-cholera",
    name: "Scenario A: Acute Cholera & Diarrhea Outbreak",
    district: "Badin",
    citizenName: "Ghulam Hussain",
    phone: "0300 8765432",
    peopleCount: 5,
    priority: "critical",
    type: "medical",
    needs: ["High Fever", "Diarrhea", "No Clean Water", "Children Under 5"],
    description: "Village Jam Goth, Talhar. Standing water contaminated local well. 3 children displaying severe acute watery diarrhea.",
    floodRainfall: 112.5,
  },
  {
    id: "nowshera-rescue",
    name: "Scenario B: Stranded Pregnant Mother & Newborn",
    district: "Nowshera",
    citizenName: "Zarina Bibi",
    phone: "0311 4445556",
    peopleCount: 4,
    priority: "critical",
    type: "rescue",
    needs: ["Pregnant Woman", "Boat Rescue", "Clean Delivery Kit", "No Clean Water"],
    description: "Kabul River overflowed banks. Family trapped on second floor roof. Immediate medical extraction required.",
    floodRainfall: 95.0,
  },
  {
    id: "rajanpur-isolation",
    name: "Scenario C: Submerged Remote Hamlet Isolation",
    district: "Rajanpur",
    citizenName: "Karim Bux",
    phone: "0321 8882223",
    peopleCount: 8,
    priority: "high",
    type: "water",
    needs: ["Food Packs", "No Clean Water", "Water Purification Tabs", "Elderly Patient"],
    description: "Indus hill torrents submerged connecting link road. 8 villagers without potable drinking water for 36 hours.",
    floodRainfall: 78.4,
  },
];

export function DemoClient() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [pipeline, setPipeline] = useState<MultiAgentPipelineResult>(() =>
    runDemoPipelinePreview({
      requestId: "RIP-DEMO-001",
      citizenName: DEMO_SCENARIOS[0].citizenName,
      needs: DEMO_SCENARIOS[0].needs,
      priority: DEMO_SCENARIOS[0].priority,
      type: DEMO_SCENARIOS[0].type,
      peopleCount: DEMO_SCENARIOS[0].peopleCount,
      district: DEMO_SCENARIOS[0].district,
      campName: `${DEMO_SCENARIOS[0].district} Relief Camp`,
      volunteerName: "Hamza Khan (On Duty)",
      routeDistanceKm: 7.8,
      routeDurationMin: 18,
      routeVia: "Talhar Bypass Highway",
      rainfall7d: DEMO_SCENARIOS[0].floodRainfall,
    })
  );

  const [deliveryStatus, setDeliveryStatus] = useState<"pending" | "assigned" | "in_transit" | "delivered">("pending");

  const selectScenario = (s: DemoScenario) => {
    setSelectedScenario(s);
    setDeliveryStatus("pending");
    const newPipeline = runDemoPipelinePreview({
      requestId: `RIP-DEMO-${s.id.toUpperCase().slice(0, 4)}`,
      citizenName: s.citizenName,
      needs: s.needs,
      priority: s.priority,
      type: s.type,
      peopleCount: s.peopleCount,
      district: s.district,
      campName: `${s.district} Relief Camp`,
      volunteerName: "Hamza Khan (On Duty)",
      routeDistanceKm: s.id === "nowshera-rescue" ? 12.4 : 7.8,
      routeDurationMin: s.id === "nowshera-rescue" ? 32 : 18,
      routeVia: s.id === "nowshera-rescue" ? "Grand Trunk Bypass (Safe Corridor)" : "Talhar Bypass Highway",
      rainfall7d: s.floodRainfall,
    });
    setPipeline(newPipeline);
  };

  const startPipelineSimulation = () => {
    setStep(2);
    setIsProcessing(true);
    setAgentStep(0);

    const interval = setInterval(() => {
      setAgentStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsProcessing(false);
          return 4;
        }
        return prev + 1;
      });
    }, 600);
  };

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[560px] bg-paper p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-cyan-pop shadow-lg shadow-ink/20">
            <IconBrain className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[18px] font-extrabold tracking-tight text-ink">
                RippleNet Scenario Sandbox
              </h1>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-cyan-800">
                Simulation
              </span>
            </div>
            <p className="text-[12px] font-medium text-slate-500">
              Explore the response workflow using sample scenarios
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex h-9 items-center justify-center rounded-full bg-white px-3 text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Exit Demo
        </Link>
      </header>

      {/* Scenario Picker Carousel */}
      <section className="mt-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Step 1: Select Disaster Scenario
        </p>
        <div className="mt-2.5 space-y-2">
          {DEMO_SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenario.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectScenario(s)}
                className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-channel bg-sky-50/90 shadow-md ring-2 ring-channel/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[13.5px] font-bold text-ink">{s.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase ${
                      s.priority === "critical"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {s.priority}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{s.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {s.needs.map((n) => (
                    <span
                      key={n}
                      className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
                    >
                      {n}
                    </span>
                  ))}
                  <span className="ml-auto text-[10.5px] font-bold text-slate-500">
                    👥 {s.peopleCount} people · {s.district}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Simulation Steps Stepper */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Emergency Response Timeline
          </span>
          <span className="text-[11px] font-bold text-channel">Step {step} of 5</span>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1">
          {[
            { s: 1, label: "1. SOS Ingestion" },
            { s: 2, label: "2. 5 Agent Preview" },
            { s: 3, label: "3. Camp Triage" },
            { s: 4, label: "4. Volunteer" },
            { s: 5, label: "5. Admin Radar" },
          ].map(({ s, label }) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s as any)}
              className={`rounded-xl py-2 text-center transition ${
                step === s
                  ? "bg-ink font-bold text-white shadow-sm"
                  : step > s
                    ? "bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 font-medium text-slate-400"
              }`}
            >
              <span className="block text-[9.5px]">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Interactive Stage Body */}
      <main className="mt-5 space-y-4">
        {/* Step 1: Citizen SOS */}
        {step === 1 && (
          <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-channel shadow-sm">
                <IconPhone className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-ink">Citizen Emergency SOS Trigger</h3>
                <p className="text-[11px] text-slate-500">Low-literacy audio, keypad &amp; video channel</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-[12px] space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Caller:</span>
                <span className="font-bold text-ink">{selectedScenario.citizenName} ({selectedScenario.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-ink">{selectedScenario.district} District</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Affected People:</span>
                <span className="font-bold text-ink">{selectedScenario.peopleCount} Victims</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reported Distress:</span>
                <span className="font-bold text-rose-600">{selectedScenario.needs.join(", ")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startPipelineSimulation}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[13.5px] font-bold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
            >
              <IconZap className="h-4 w-4 text-cyan-pop" />
              Run 5 Agent Preview Pipeline
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: 5 AI Multi-Agent Engine */}
        {step === 2 && (
          <div className="space-y-3">
            <AgentReasoningCard pipeline={pipeline} />

            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-channel text-[13.5px] font-bold text-white shadow-lg shadow-channel/25 transition active:scale-[0.98]"
            >
              Forward to Health Camp Triage
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 3: Health Camp Triage */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">
                    {selectedScenario.district} Health Camp Queue
                  </h3>
                  <p className="text-[11.5px] text-slate-500">Illustrative deployment preview</p>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                  Risk Score {pipeline.overallScore.toFixed(1)}/10
                </span>
              </div>

              {/* Justification Block */}
              <div className="mt-4 space-y-2">
                <div className="rounded-2xl bg-rose-50 p-3 text-[11.5px]">
                  <p className="font-bold text-rose-700 uppercase tracking-wide text-[9.5px]">1. Risk Driver</p>
                  <p className="mt-1 text-slate-700">{pipeline.justificationBlock.riskDriver}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-[11.5px]">
                  <p className="font-bold text-sky-700 uppercase tracking-wide text-[9.5px]">2. Route Decision</p>
                  <p className="mt-1 text-slate-700">{pipeline.justificationBlock.routeDecision}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-[11.5px]">
                  <p className="font-bold text-emerald-700 uppercase tracking-wide text-[9.5px]">
                    3. Logistics Allocation (Camp Stock Check)
                  </p>
                  <p className="mt-1 text-slate-700">{pipeline.justificationBlock.allocationDecision}</p>
                </div>
              </div>

              {/* Volunteer Dispatch Action */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-channel text-white font-bold text-[13px]">
                      HK
                    </span>
                    <div>
                      <p className="text-[12.5px] font-bold text-ink">Hamza Khan (Volunteer)</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">Available · Nearest Responder</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryStatus("in_transit");
                      setStep(4);
                    }}
                    className="flex h-9 items-center justify-center rounded-full bg-emerald-600 px-4 text-[12px] font-bold text-white shadow-md transition active:scale-95"
                  >
                    Dispatch Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Volunteer Field Execution */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">Volunteer Field Portal</h3>
                  <p className="text-[11.5px] text-slate-500">Assigned Task: {pipeline.requestId}</p>
                </div>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                  {deliveryStatus === "delivered" ? "Resolved" : "In Transit"}
                </span>
              </div>

              {/* Delivery Checklist */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Packaged Relief Parcel
                </p>
                <div className="space-y-1.5">
                  {pipeline.logisticsAgent.allocatedItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-[12px]"
                    >
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <IconCheck className="h-4 w-4 text-emerald-500" />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-500">{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Action */}
              <div className="mt-5">
                {deliveryStatus !== "delivered" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryStatus("delivered");
                      setStep(5);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-[13.5px] font-bold text-white shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
                  >
                    <IconCheck className="h-5 w-5" />
                    Mark Delivery Completed &amp; Resolve
                  </button>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                    <p className="font-display text-[15px] font-bold text-emerald-700">Delivery Resolved!</p>
                    <p className="mt-1 text-[11.5px] text-slate-600">
                      Sandbox only: no stock was deducted and no record was saved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Admin Overview Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">Admin Oversight Preview</h3>
                  <p className="text-[11.5px] text-slate-500">Sample Scenario Summary</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  Simulation Complete
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                <div className="rounded-2xl bg-sky-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-sky-600">People in Scenario</p>
                  <p className="mt-1 font-display text-[20px] font-extrabold text-ink">
                    {selectedScenario.peopleCount} people
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Verified Cost Data</p>
                  <p className="mt-1 font-display text-[20px] font-extrabold text-ink">
                    Unavailable
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-[12px] space-y-1 text-slate-600">
                <p>
                  <span className="font-bold text-ink">Resource Agent:</span>{" "}
                  {pipeline.resourceAgent.economicVerdict}
                </p>
                <p>
                  <span className="font-bold text-ink">Health Agent note:</span> This static preview does not diagnose or estimate outbreak risk. Reported symptoms require qualified clinician review.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setDeliveryStatus("pending");
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-ink text-[12.5px] font-bold text-white shadow-md transition active:scale-95"
                >
                  Try Another Scenario
                </button>
                <Link
                  href="/queue"
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white text-[12.5px] font-bold text-ink shadow-sm transition active:scale-95"
                >
                  Open Live Camp Queue
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick Jump Portals Footer */}
      <footer className="mt-8 border-t border-slate-200/80 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Jump to Real Role Dashboards
        </p>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          <Link
            href="/sos"
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-2 text-center text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <span className="text-[16px]">📱</span>
            <span className="text-[10px] font-bold">Citizen SOS</span>
          </Link>
          <Link
            href="/queue"
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-2 text-center text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <span className="text-[16px]">🏥</span>
            <span className="text-[10px] font-bold">Health Camp</span>
          </Link>
          <Link
            href="/volunteer/tasks"
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-2 text-center text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <span className="text-[16px]">🚚</span>
            <span className="text-[10px] font-bold">Volunteer</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-2 text-center text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <span className="text-[16px]">📊</span>
            <span className="text-[10px] font-bold">Admin Radar</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
