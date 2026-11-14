"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBrain,
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconRouteAgent,
  IconResourceAgent,
} from "./icons";
import type {
  LiveMultiAgentPipelineResult,
  AgentExecution,
} from "../../lib/agents/live";

type AgentKey = "flood" | "health" | "logistics" | "route" | "resource";

const agents: {
  key: AgentKey;
  title: string;
  Icon: typeof IconBrain;
  tone: string;
}[] = [
  { key: "health", title: "Health", Icon: IconHealthAgent, tone: "rose" },
  { key: "flood", title: "Flood", Icon: IconFloodAgent, tone: "sky" },
  { key: "logistics", title: "Logistics", Icon: IconLogisticsAgent, tone: "amber" },
  { key: "route", title: "Route", Icon: IconRouteAgent, tone: "violet" },
  { key: "resource", title: "Resources", Icon: IconResourceAgent, tone: "emerald" },
];

function EvidenceList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-[11px] text-slate-400">No evidence was returned.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-[11px] leading-relaxed text-slate-600">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function AgentDetails({
  agent,
}: {
  agent: AgentExecution<unknown>;
}) {
  if (!agent.output || agent.status !== "completed") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[11px] text-amber-800">
        {agent.error ?? "This agent did not return a result. Other agents can still complete."}
      </div>
    );
  }

  const output = agent.output as Record<string, unknown>;
  const list = (key: string) =>
    Array.isArray(output[key])
      ? (output[key] as unknown[]).filter((item): item is string => typeof item === "string")
      : [];

  if ("weatherSignal" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">
          Weather signal: {String(output.weatherSignal).replace(/_/g, " ")}
        </p>
        <EvidenceList items={[...list("signals"), ...list("limitations").map((item) => `Limitation: ${item}`)]} />
      </div>
    );
  }

  if ("urgency" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">
          Triage urgency: {String(output.urgency)}
        </p>
        <EvidenceList
          items={[
            ...list("reportedSignals").map((item) => `Reported: ${item}`),
            ...list("redFlags").map((item) => `Red flag: ${item}`),
            ...list("nextSteps").map((item) => `Next step: ${item}`),
          ]}
        />
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
          Supportive triage only. A qualified clinician must review all health decisions.
        </p>
      </div>
    );
  }

  if ("items" in output) {
    const items = Array.isArray(output.items) ? output.items as Record<string, unknown>[] : [];
    return (
      <div className="space-y-2">
        {items.length ? (
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10.5px]">
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{String(item.name)}</span>
                  <span className="text-slate-500">{String(item.reason)}</span>
                </span>
                <span className="shrink-0 text-right font-bold text-slate-700">
                  {String(item.quantity)} {String(item.unit)}
                  <span className="block text-[9px] font-semibold uppercase text-slate-400">
                    {String(item.stockStatus).replace(/_/g, " ")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">No parcel items were suggested.</p>
        )}
        <EvidenceList items={list("packingNotes")} />
        <p className="text-[10px] text-slate-500">Stock is checked against exact database item names. No stock is reserved or deducted.</p>
      </div>
    );
  }

  if ("passability" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">{String(output.passability).replace(/_/g, " ")}</p>
        <EvidenceList items={list("cautions")} />
        <p className="text-[10px] text-slate-500">A road-network route is not proof that a road is safe or passable during a flood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-700">
        {String(output.reason ?? "A verified cost estimate is unavailable.")}
      </p>
      <p className="text-[10px] text-slate-500">
        No placeholder prices or estimated totals are shown without a verified price catalog.
      </p>
    </div>
  );
}

export function LiveAgentAnalysisCard({
  pipeline,
}: {
  pipeline: LiveMultiAgentPipelineResult;
}) {
  const [active, setActive] = useState<AgentKey>("health");

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("refreshAnalysis") === "1") {
      url.searchParams.delete("refreshAnalysis");
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);
  const agentResults: Record<AgentKey, AgentExecution<unknown>> = {
    flood: pipeline.floodAgent,
    health: pipeline.healthAgent,
    logistics: pipeline.logisticsAgent,
    route: pipeline.routeAgent,
    resource: pipeline.resourceAgent,
  };
  const current = agentResults[active];
  const completedCount = Object.values(agentResults).filter((agent) => agent.status === "completed").length;
  const activeMeta = agents.find((agent) => agent.key === active)!;

  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-md shadow-sky-900/5">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-cyan-pop">
            <IconBrain className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-[15px] font-bold text-ink">Live AI Agent Analysis</h3>
            <p className="text-[10px] text-slate-500">
              Groq · {completedCount}/5 agents completed · {new Date(pipeline.evaluatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
            {pipeline.overallScore.toFixed(1)}/10 rule-based score
          </span>
          <Link
            href={`/queue/${encodeURIComponent(pipeline.requestId)}?refreshAnalysis=1`}
            className="text-[9px] font-bold text-channel underline underline-offset-2"
          >
            Re-run analysis
          </Link>
        </div>
      </header>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {agents.map(({ key, title, Icon }) => {
          const result = agentResults[key];
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-pressed={selected}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl p-2 text-center transition ${selected ? "bg-ink text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-100"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px] font-bold">{title}</span>
              <span className={`text-[8px] font-semibold ${selected ? "text-cyan-200" : result.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                {result.status}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-display text-[13px] font-bold text-ink">{activeMeta.title} Agent</h4>
          {current.model && (
            <span className="max-w-[55%] truncate rounded-full bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-500">
              {current.model}
            </span>
          )}
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-slate-700">{current.summary}</p>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Findings and source evidence
          </p>
          <AgentDetails agent={current} />
          <div className="mt-3">
            <EvidenceList items={current.evidence} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[9.5px] leading-relaxed text-slate-400">
        Agent outputs are advisory and may be incomplete. Dispatch, clinical decisions, and stock movements remain under human and deterministic system controls. Internal model reasoning is not displayed.
      </p>
    </section>
  );
}
