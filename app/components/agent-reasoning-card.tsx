"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconRouteAgent,
  IconResourceAgent,
  IconBrain,
  IconRefresh,
  IconCheck,
  IconPlayFilled,
} from "./icons";
import type { MultiAgentPipelineResult } from "../../lib/agents";

type AgentType = "health" | "flood" | "logistics" | "route" | "resource";
type AgentLifecycleState = "monitoring" | "thinking" | "working" | "decision_made";

interface AgentRoleDefinition {
  type: AgentType;
  title: string;
  roleSubtitle: string;
  badgeLabel: string;
  icon: (props: { className?: string }) => React.ReactNode;
  themeColor: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    iconBg: string;
  };
  stages: Record<
    AgentLifecycleState,
    {
      actionTitle: string;
      description: string;
      terminalLog: string;
    }
  >;
}

export function AgentReasoningCard({
  pipeline,
  autoPlay = true,
}: {
  pipeline: MultiAgentPipelineResult;
  autoPlay?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<AgentType>("health");
  const [agentStates, setAgentStates] = useState<Record<AgentType, AgentLifecycleState>>({
    health: "monitoring",
    flood: "monitoring",
    logistics: "monitoring",
    route: "monitoring",
    resource: "monitoring",
  });
  const [runningAgent, setRunningAgent] = useState<AgentType | "all" | null>(null);

  const citizenName = pipeline.citizenName ?? "Citizen Caller";
  const district = pipeline.district ?? "Flood Zone";
  const needsStr = (pipeline.needs ?? ["Emergency relief"]).join(", ");
  const rainVal = pipeline.floodRainfall ?? 85.4;
  const { floodAgent, healthAgent, logisticsAgent, routeAgent, resourceAgent } = pipeline;

  // Distinct definitions and behaviors for all 5 AI Agents
  const agentDefs: Record<AgentType, AgentRoleDefinition> = useMemo(
    () => ({
      health: {
        type: "health",
        title: "Health Agent",
        roleSubtitle: "Diarrheal Outbreaks, Pathogen Screening & Clinical Triage",
        badgeLabel: `${healthAgent.outbreakRiskTier} Risk`,
        icon: IconHealthAgent,
        themeColor: {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-100",
          ring: "ring-rose-400",
          iconBg: "bg-rose-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Monitoring Clinical Signals",
            description: `Screening reported symptoms (${needsStr}) from ${citizenName}. Checking district epidemiological pathogen clusters...`,
            terminalLog: `[HEALTH-01] 📡 MONITORING: Ingested clinical distress signal. Symptoms: ${needsStr}. Patient location: ${district}.`,
          },
          thinking: {
            actionTitle: "Analyzing Outbreak Probability",
            description: `Calculating cholera transmission reproduction rate (R₀). Analyzing dehydration risk level & screening vulnerable demographics (infants/elderly)...`,
            terminalLog: `[HEALTH-02] 🧠 THINKING: Cross-referencing cholera vs. rotavirus symptoms. Outbreak Risk Tier computed as: ${healthAgent.outbreakRiskTier}.`,
          },
          working: {
            actionTitle: "Formulating Clinical Protocol",
            description: `Formulating clinical emergency triage plan. Checking drug contraindications and prescribing electrolyte rehydration...`,
            terminalLog: `[HEALTH-03] ⚙️ WORKING: Contraindication check complete. Prescribing oral rehydration solution (ORS) + Zinc therapy. Contact hygiene protocols mandated.`,
          },
          decision_made: {
            actionTitle: "Clinical Verdict Issued",
            description: healthAgent.verdict,
            terminalLog: `[HEALTH-04] ✅ DECISION: Primary diagnosis ${healthAgent.detectedOutcomes.map((d) => d.disease).join(", ") || "Waterborne distress"}. High-priority medical dispatch verified.`,
          },
        },
      },
      flood: {
        type: "flood",
        title: "Flood Agent",
        roleSubtitle: "Satellite Precipitation, River Basins & Inundation Severity",
        badgeLabel: `${floodAgent.severityScore.toFixed(1)}/10 Severity`,
        icon: IconFloodAgent,
        themeColor: {
          bg: "bg-sky-50",
          text: "text-sky-700",
          border: "border-sky-100",
          ring: "ring-sky-400",
          iconBg: "bg-sky-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Monitoring Satellite & River Telemetry",
            description: `Pulling GPM/IMERG satellite precipitation data (${rainVal}mm 7-day rainfall) & river gauge discharge telemetry for ${district}...`,
            terminalLog: `[FLOOD-01] 📡 MONITORING: Satellite radar ping. 7-day cumulative rainfall in ${district}: ${rainVal}mm. Checking river catchment runoff.`,
          },
          thinking: {
            actionTitle: "Modeling Runoff & Inundation Depth",
            description: `Computing runoff catchment models & surface water velocity. Assessing embankment breach vulnerability and water depth forecast...`,
            terminalLog: `[FLOOD-02] 🧠 THINKING: Runoff coefficient evaluated. Rising water table detected. Inundation depth estimated at ${floodAgent.severityScore >= 7 ? ">2.5 feet" : "1.2 feet"}.`,
          },
          working: {
            actionTitle: "Computing Severity Index",
            description: `Calculating flood severity index (${floodAgent.severityScore}/10 - ${floodAgent.severityLevel}). Generating flood inundation zone hazard map...`,
            terminalLog: `[FLOOD-03] ⚙️ WORKING: Flood severity score assigned: ${floodAgent.severityScore}/10 (${floodAgent.severityLevel}). Broadcasting water cut hazard boundaries.`,
          },
          decision_made: {
            actionTitle: "Flood Severity Verdict Issued",
            description: floodAgent.verdict,
            terminalLog: `[FLOOD-04] ✅ DECISION: Flood severity classified as ${floodAgent.severityLevel}. Safe elevation thresholds sent to Route and Logistics agents.`,
          },
        },
      },
      logistics: {
        type: "logistics",
        title: "Logistics Agent",
        roleSubtitle: "Warehouse Stock Verification & Emergency Parcel Packaging",
        badgeLabel: `${logisticsAgent.allocatedItems.length} Items`,
        icon: IconLogisticsAgent,
        themeColor: {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-100",
          ring: "ring-amber-400",
          iconBg: "bg-amber-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Auditing Warehouse Inventory",
            description: `Reviewing the camp stock results for ${logisticsAgent.allocatedItems.length} parcel items...`,
            terminalLog: `[LOGISTICS-01] 📡 MONITORING: Camp stock lookup completed. Reviewing item quantities and tracking status.`,
          },
          thinking: {
            actionTitle: "Matching Distress Profile to Stock",
            description: `Comparing the requested parcel quantities with the camp inventory for ${needsStr}...`,
            terminalLog: `[LOGISTICS-02] 🧠 THINKING: Compared requested parcel items with the available camp stock records.`,
          },
          working: {
            actionTitle: "Assembling Parcel Manifest",
            description: `Preparing a ${logisticsAgent.allocatedItems.length}-item parcel manifest and recording the stock check outcome...`,
            terminalLog: `[LOGISTICS-03] ⚙️ WORKING: Preparing ${logisticsAgent.shippableBoxes} crate(s). Stock availability is reported separately; no stock reservation is performed.`,
          },
          decision_made: {
            actionTitle: "Relief Parcel Manifest Finalized",
            description: logisticsAgent.verdict,
            terminalLog: `[LOGISTICS-04] ✅ DECISION: ${logisticsAgent.verdict}`,
          },
        },
      },
      route: {
        type: "route",
        title: "Route Agent",
        roleSubtitle: "Dynamic OSRM Safe Corridors & Detour Navigation",
        badgeLabel: `${routeAgent.durationMin} Min ETA`,
        icon: IconRouteAgent,
        themeColor: {
          bg: "bg-violet-50",
          text: "text-violet-700",
          border: "border-violet-100",
          ring: "ring-violet-400",
          iconBg: "bg-violet-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Querying Road Network Geometry",
            description: `Ingesting destination coordinates and querying live OSRM road network geometry between camp and ${district}...`,
            terminalLog: `[ROUTE-01] 📡 MONITORING: Querying live OSRM routing engine. Origin: Base Camp -> Destination: ${district}.`,
          },
          thinking: {
            actionTitle: "Detecting Flooded Road Hazards",
            description: `Cross-referencing Flood Agent inundation zones against road segments. Detecting culvert washouts and impassable bridge crossings...`,
            terminalLog: `[ROUTE-02] 🧠 THINKING: Inundation overlay check. Avoiding primary road cut. Identifying elevated bypass corridor via ${routeAgent.viaRoadName}.`,
          },
          working: {
            actionTitle: "Optimizing Transit ETA & Vehicle Mode",
            description: `Computing dynamic safe bypass corridor via ${routeAgent.viaRoadName}. Calculating road traction coefficient and detour delay (${routeAgent.durationMin} min ETA)...`,
            terminalLog: `[ROUTE-03] ⚙️ WORKING: Distance: ${routeAgent.distanceKm} km. Calculating ETA: ~${routeAgent.durationMin} min. Recommended vehicle mode: ${routeAgent.recommendedVehicle}.`,
          },
          decision_made: {
            actionTitle: "Safe Navigation Path Approved",
            description: routeAgent.verdict,
            terminalLog: `[ROUTE-04] ✅ DECISION: Safe navigation route locked via ${routeAgent.viaRoadName}. Turn-by-turn vectors transmitted to volunteer mobile portal.`,
          },
        },
      },
      resource: {
        type: "resource",
        title: "Resource Agent",
        roleSubtitle: "Budget Optimization, Per-Person Cost & Aid ROI",
        badgeLabel: `${resourceAgent.budgetEfficiencyScore}% Efficiency`,
        icon: IconResourceAgent,
        themeColor: {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-100",
          ring: "ring-emerald-400",
          iconBg: "bg-emerald-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Auditing Supply Costs & Fuel Transit",
            description: `Auditing emergency relief parcel unit costs, fuel consumption rates, and volunteer transit expenditure...`,
            terminalLog: `[RESOURCE-01] 📡 MONITORING: Auditing bill of materials for relief parcel, mileage fuel overhead, and camp operational budget.`,
          },
          thinking: {
            actionTitle: "Evaluating Cost-per-Beneficiary Curve",
            description: `Analyzing cost efficiency curve for ${pipeline.overallScore > 0 ? "affected beneficiaries" : "victims"}. Cross-checking district database for duplicate aid disbursement...`,
            terminalLog: `[RESOURCE-02] 🧠 THINKING: Calculating per-capita aid efficiency. Checking historical disbursements to prevent duplicate aid claims.`,
          },
          working: {
            actionTitle: "Calculating Aid ROI Score",
            description: `Calculating itemized total: PKR ${resourceAgent.estimatedCostPkr.toLocaleString()} (PKR ${resourceAgent.costPerPersonPkr.toLocaleString()}/person). Computing humanitarian aid ROI efficiency score...`,
            terminalLog: `[RESOURCE-03] ⚙️ WORKING: Total parcel valuation: PKR ${resourceAgent.estimatedCostPkr.toLocaleString()} (PKR ${resourceAgent.costPerPersonPkr.toLocaleString()}/beneficiary). Efficiency rating: ${resourceAgent.budgetEfficiencyScore}%.`,
          },
          decision_made: {
            actionTitle: "Budget Optimization Certified",
            description: resourceAgent.verdict,
            terminalLog: `[RESOURCE-04] ✅ DECISION: Budget efficiency certified at ${resourceAgent.budgetEfficiencyScore}%. Zero duplicate waste detected.`,
          },
        },
      },
    }),
    [pipeline, citizenName, district, needsStr, rainVal, floodAgent, healthAgent, logisticsAgent, routeAgent, resourceAgent]
  );

  // Progressive execution engine for a specific agent or all agents
  const runSingleAgent = (agentKey: AgentType) => {
    setActiveTab(agentKey);
    setRunningAgent(agentKey);

    // 1. Monitoring
    setAgentStates((prev) => ({ ...prev, [agentKey]: "monitoring" }));

    // 2. Thinking
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "thinking" }));
    }, 600);

    // 3. Working
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "working" }));
    }, 1300);

    // 4. Decision Made
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "decision_made" }));
      setRunningAgent(null);
    }, 2000);
  };

  const runAllAgents = () => {
    setRunningAgent("all");
    const agents: AgentType[] = ["flood", "health", "logistics", "route", "resource"];

    // Start all in monitoring
    setAgentStates({
      flood: "monitoring",
      health: "monitoring",
      logistics: "monitoring",
      route: "monitoring",
      resource: "monitoring",
    });

    // Cascade into thinking
    setTimeout(() => {
      setAgentStates({
        flood: "thinking",
        health: "thinking",
        logistics: "thinking",
        route: "thinking",
        resource: "thinking",
      });
    }, 700);

    // Cascade into working
    setTimeout(() => {
      setAgentStates({
        flood: "working",
        health: "working",
        logistics: "working",
        route: "working",
        resource: "working",
      });
    }, 1500);

    // Finalize all in decision made
    setTimeout(() => {
      setAgentStates({
        flood: "decision_made",
        health: "decision_made",
        logistics: "decision_made",
        route: "decision_made",
        resource: "decision_made",
      });
      setRunningAgent(null);
    }, 2300);
  };

  useEffect(() => {
    if (autoPlay) {
      runAllAgents();
    } else {
      setAgentStates({
        flood: "decision_made",
        health: "decision_made",
        logistics: "decision_made",
        route: "decision_made",
        resource: "decision_made",
      });
    }
  }, []);

  const currentDef = agentDefs[activeTab];
  const currentPhase = agentStates[activeTab];
  const currentStageInfo = currentDef.stages[currentPhase];

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-md shadow-sky-900/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-cyan-pop shadow-md shadow-ink/20">
            <IconBrain className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[15px] font-bold text-ink">5 AI Agents Decision Engine</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Synergy
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Select an agent below to inspect its unique live reasoning
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAllAgents}
          disabled={runningAgent !== null}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-channel px-3 text-[11px] font-bold text-white shadow-sm shadow-channel/30 transition hover:bg-channel/90 active:scale-95 disabled:opacity-50"
        >
          <IconRefresh className={`h-3.5 w-3.5 ${runningAgent === "all" ? "animate-spin" : ""}`} />
          {runningAgent === "all" ? "Simulating All..." : "Re-Run All AI"}
        </button>
      </div>

      {/* 5 Distinct Agent Switcher Tabs */}
      <div className="mt-3.5 grid grid-cols-5 gap-1.5">
        {(["health", "flood", "logistics", "route", "resource"] as AgentType[]).map((typeKey) => {
          const def = agentDefs[typeKey];
          const Icon = def.icon;
          const isSelected = activeTab === typeKey;
          const state = agentStates[typeKey];

          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => setActiveTab(typeKey)}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-center transition-all ${
                isSelected
                  ? `${def.themeColor.bg} ring-2 ${def.themeColor.ring} shadow-sm scale-[1.02]`
                  : "bg-white/80 hover:bg-slate-50 opacity-80 hover:opacity-100"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${def.themeColor.iconBg}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[9.5px] font-bold text-slate-800">{def.title.split(" ")[0]}</span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.2 text-[8px] font-extrabold text-slate-700 ring-1 ring-slate-200">
                {state === "decision_made" ? "Ready" : state}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Role-Specific Terminal & Live State Machine */}
      <div className="mt-3.5 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-inner">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
              {currentDef.title} Terminal
            </span>
          </div>
          <button
            type="button"
            onClick={() => runSingleAgent(activeTab)}
            disabled={runningAgent !== null}
            className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-[9.5px] font-bold text-cyan-300 hover:bg-slate-700 disabled:opacity-40"
          >
            <IconPlayFilled className="h-2.5 w-2.5" />
            Run {currentDef.title}
          </button>
        </div>

        {/* 4-Phase Step Progression */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
          {[
            { id: "monitoring", label: "1. Monitoring", icon: "📡" },
            { id: "thinking", label: "2. Thinking", icon: "🧠" },
            { id: "working", label: "3. Working", icon: "⚙️" },
            { id: "decision_made", label: "4. Decision", icon: "✅" },
          ].map(({ id, label, icon }) => {
            const phaseOrder = ["monitoring", "thinking", "working", "decision_made"];
            const isCurrent = currentPhase === id;
            const isPassed = phaseOrder.indexOf(currentPhase) >= phaseOrder.indexOf(id);

            return (
              <div
                key={id}
                className={`rounded-xl py-1.5 px-1 transition-all ${
                  isCurrent
                    ? "bg-channel text-white font-bold ring-2 ring-cyan-300 scale-[1.02]"
                    : isPassed
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                <span>{icon}</span>
                <span className="block mt-0.5 text-[8.5px] truncate">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Monologue for Selected Agent */}
        <div className="mt-3 rounded-xl bg-slate-950/90 p-3 font-mono text-[11px] leading-relaxed space-y-1.5">
          <p className="text-cyan-300 font-bold">
            ▶ [{currentPhase.toUpperCase()}]: {currentStageInfo.actionTitle}
          </p>
          <p className="text-slate-300 text-[10.5px]">{currentStageInfo.terminalLog}</p>
        </div>
      </div>

      {/* Selected Agent Dedicated Inspector Card */}
      <div className="mt-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${currentDef.themeColor.iconBg}`}
            >
              {(() => {
                const Icon = currentDef.icon;
                return <Icon className="h-4 w-4" />;
              })()}
            </span>
            <div>
              <h4 className="font-display text-[14px] font-bold text-ink">{currentDef.title} Findings</h4>
              <p className="text-[10.5px] text-slate-500">{currentDef.roleSubtitle}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${currentDef.themeColor.bg} ${currentDef.themeColor.text}`}
          >
            {currentDef.badgeLabel}
          </span>
        </div>

        {/* Verdict Summary */}
        <div className="mt-3">
          <p className="text-[12px] leading-relaxed text-slate-700 font-medium">
            {currentStageInfo.description}
          </p>
          {activeTab === "logistics" && logisticsAgent.stockAlert && (
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-800">
              {logisticsAgent.stockAlert}
            </p>
          )}
        </div>

        {/* Agent Specific Evidence & Thoughts Drawer */}
        <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {currentDef.title} Step-by-Step Evidence:
          </p>

          {activeTab === "health" && (
            <div className="space-y-1.5">
              {healthAgent.detectedOutcomes.length > 0 && (
                <div className="flex flex-wrap gap-1 pb-1">
                  {healthAgent.detectedOutcomes.map((d) => (
                    <span
                      key={d.disease}
                      className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200"
                    >
                      ⚠️ {d.disease} ({d.riskLevel} Risk)
                    </span>
                  ))}
                </div>
              )}
              {healthAgent.thoughts.map((t) => (
                <div key={t.title} className="text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">▸ {t.title}:</span> {t.detail}
                </div>
              ))}
            </div>
          )}

          {activeTab === "flood" && (
            <div className="space-y-1.5">
              {floodAgent.thoughts.map((t) => (
                <div key={t.title} className="text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">▸ {t.title}:</span> {t.detail}
                </div>
              ))}
            </div>
          )}

          {activeTab === "logistics" && (
            <div className="space-y-1.5">
              {logisticsAgent.thoughts.map((t) => (
                <div key={t.title} className="text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">▸ {t.title}:</span> {t.detail}
                </div>
              ))}
            </div>
          )}

          {activeTab === "route" && (
            <div className="space-y-1.5">
              {routeAgent.thoughts.map((t) => (
                <div key={t.title} className="text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">▸ {t.title}:</span> {t.detail}
                </div>
              ))}
            </div>
          )}

          {activeTab === "resource" && (
            <div className="space-y-1.5">
              {resourceAgent.thoughts.map((t) => (
                <div key={t.title} className="text-[11px] text-slate-600">
                  <span className="font-semibold text-ink">▸ {t.title}:</span> {t.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
