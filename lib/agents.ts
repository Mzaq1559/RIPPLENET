import { assessRisk, priorityPercentile, type RiskAssessment } from "./risk";
import { parseNeeds, suggestParcel, type ParcelItem } from "./needs";
import { haversineKm, type LatLng } from "./geo";

export interface AgentThought {
  step: number;
  agent: "flood" | "health" | "logistics" | "route" | "resource";
  title: string;
  detail: string;
  timestamp: string;
}

export interface FloodAgentResult {
  agentName: "Flood Agent";
  role: "Predicts flood severity & surface water accumulation";
  severityScore: number; // 1-10
  severityLevel: "Low" | "Moderate" | "High" | "Extreme";
  rainfall24hMm: number;
  rainfall7dMm: number;
  currentRainfallRateMmH?: number;
  weatherSource?: string;
  surfaceWaterRisk: "Low" | "Moderate" | "Severe" | "Critical Inundation" | "Not assessed";
  terrainElevationNote: string;
  thoughts: AgentThought[];
  verdict: string;
}

export interface HealthAgentResult {
  agentName: "Health Agent";
  role: "Predicts diarrheal outbreaks, infectious diseases & clinical triage";
  outbreakRiskTier: "Primary" | "Secondary" | "Monitored";
  outbreakSignal: boolean;
  detectedOutcomes: {
    disease: "Diarrheal Outbreak / Cholera" | "Malaria" | "Dengue Fever" | "Typhoid" | "Dysentery" | "Skin / Wound Infection" | "Dehydration" | "Respiratory Infection";
    riskLevel: "High" | "Medium" | "Low";
    rationale: string;
  }[];
  contraindications: string[];
  clinicalRecommendations: string[];
  thoughts: AgentThought[];
  verdict: string;
}

export interface StockSnapshotItem {
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export interface LogisticsAgentResult {
  agentName: "Logistics Agent";
  role: "Checks relief parcel quantities against camp stock";
  allocatedItems: {
    name: string;
    qty: string;
    category: string;
    stockStatus?: "in_stock" | "short" | "not_tracked" | "unchecked";
    needed?: number;
    available?: number;
  }[];
  stockCeilingVerified: boolean;
  stockAlert: string | null;
  autoRestockTriggered: boolean;
  shippableBoxes: number;
  assignedVolunteerName: string | null;
  thoughts: AgentThought[];
  verdict: string;
}

export interface RouteAgentResult {
  agentName: "Route Agent";
  role: "Reports OSRM route data when available; road passability is not verified";
  routeFound: boolean;
  passabilityVerified: false;
  distanceKm: number | null;
  durationMin: number | null;
  viaRoadName: string | null;
  roadPassability: "Not verified";
  hazards: string[];
  recommendedVehicle: "4x4 Relief Truck" | "Motorboat / Dinghy" | "All-Terrain Motorbike" | "Foot Patrol with Lifejackets" | "Not determined";
  thoughts: AgentThought[];
  verdict: string;
}

export interface ResourceAgentResult {
  agentName: "Resource Agent";
  role: "Estimates relief parcel and per-person costs";
  estimatedCostPkr: number;
  costPerPersonPkr: number;
  fundWasteRisk: "Not assessed";
  economicVerdict: string;
  thoughts: AgentThought[];
  verdict: string;
}

export interface MultiAgentPipelineResult {
  requestId: string;
  citizenName?: string;
  district?: string;
  needs?: string[];
  floodRainfall?: number;
  evaluatedAt: string;
  overallScore: number;
  percentile: string;
  allAgentsSynced: boolean;
  floodAgent: FloodAgentResult;
  healthAgent: HealthAgentResult;
  logisticsAgent: LogisticsAgentResult;
  routeAgent: RouteAgentResult;
  resourceAgent: ResourceAgentResult;
  justificationBlock: {
    riskDriver: string;
    priorityEffect: string;
    routeDecision: string;
    allocationDecision: string;
    resourceEfficiency: string;
  };
}

export function runDemoPipelinePreview(params: {
  requestId: string;
  citizenName: string;
  needs: string[];
  priority: string;
  type: string;
  peopleCount: number;
  district: string;
  lat?: number;
  lng?: number;
  campName?: string;
  volunteerName?: string | null;
  routeDistanceKm?: number | null;
  routeDurationMin?: number | null;
  routeVia?: string | null;
  rainfall24h?: number;
  rainfall7d?: number;
  currentRainfallRate?: number;
  weatherSource?: string;
  stock?: StockSnapshotItem[] | null;
}): MultiAgentPipelineResult {
  const needs = params.needs;
  const needsJoined = needs.join(" ").toLowerCase();
  const people = Math.max(1, params.peopleCount);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });

  // 1. Flood Agent (static sample-data preview only)
  const currentRainRate = params.currentRainfallRate ?? 0;
  const rain24 = params.rainfall24h ?? 0;
  const rain7d = params.rainfall7d ?? 0;
  const isRescue = params.type === "rescue" || /drown|boat|stranded|submerged|water rising|flood/i.test(needsJoined);
  const rainRateFactor = Math.min(2.0, currentRainRate * 0.4);
  const floodScoreRaw = 3.5 + Math.min(3.5, rain7d / 30) + Math.min(2.0, rain24 / 25) + rainRateFactor + (isRescue ? 2.2 : 0.5);
  const floodSeverityScore = Math.min(9.9, Math.round(floodScoreRaw * 10) / 10);
  const floodSeverityLevel =
    floodSeverityScore >= 8.5 ? "Extreme" : floodSeverityScore >= 6.5 ? "High" : floodSeverityScore >= 4.5 ? "Moderate" : "Low";

  const floodThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "flood",
      title: "Sample Rainfall Inputs",
      detail: `Static scenario values: ${rain24.toFixed(1)} mm over 24h and ${rain7d.toFixed(1)} mm over 7 days.`,
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "flood",
      title: "Evidence Limitations",
      detail: "This preview has no river gauges, flood maps, soil saturation, elevation, or measured inundation data.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "flood",
      title: "Illustrative Scenario Indicator",
      detail: `Demo-only rainfall indicator: ${floodSeverityScore}/10. This is not a flood prediction or dispatch instruction.`,
      timestamp: timeStr,
    },
  ];

  const floodAgent: FloodAgentResult = {
    agentName: "Flood Agent",
    role: "Static sample rainfall indicator; not a flood prediction",
    severityScore: floodSeverityScore,
    severityLevel: floodSeverityLevel,
    rainfall24hMm: rain24,
    rainfall7dMm: rain7d,
    currentRainfallRateMmH: currentRainRate,
    weatherSource: params.weatherSource || "Static scenario sample data",
    surfaceWaterRisk: "Not assessed",
    terrainElevationNote: "No terrain or elevation evidence is included in this static scenario.",
    thoughts: floodThoughts,
    verdict: `Illustrative rainfall indicator ${floodSeverityScore}/10 (${floodSeverityLevel}); not a flood prediction.`,
  };

  // 2. Health Agent (static demo only; never presents diagnoses or treatment)
  const detectedOutcomes: HealthAgentResult["detectedOutcomes"] = [];
  const contraindications: string[] = [];
  const clinicalRecommendations = [
    "Demo preview only: refer reported symptoms to a qualified clinician. No diagnosis or medication advice is generated.",
  ];
  const outbreakSignal = false;
  const outbreakTier = "Monitored" as const;

  const healthThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "health",
      title: "Reported Needs Review",
      detail: `Sample scenario includes: ${needs.join(", ") || "no reported health needs"}.`,
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "health",
      title: "Clinical Safety Boundary",
      detail: "This static preview does not diagnose, estimate outbreak probability, or recommend medication.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "health",
      title: "Clinician Review",
      detail: "A qualified clinician must assess any reported symptoms before medical action.",
      timestamp: timeStr,
    },
  ];

  const healthAgent: HealthAgentResult = {
    agentName: "Health Agent",
    role: "Static demo preview of health-signal review",
    outbreakRiskTier: outbreakTier,
    outbreakSignal,
    detectedOutcomes,
    contraindications,
    clinicalRecommendations,
    thoughts: healthThoughts,
    verdict: "Reported symptoms require qualified clinician review. No diagnosis or medication advice is generated.",
  };

  // 3. 📦 Logistics Agent
  const baseParcel = suggestParcel(needs, params.type).filter(
    (item) => !/paracetamol|zinc|antibiotic|medicine|medication/i.test(item.name),
  );
  const stockProvided = params.stock !== undefined && params.stock !== null;
  const allocatedItems: LogisticsAgentResult["allocatedItems"] = baseParcel.map((item) => {
    const needed = Number(item.qty.match(/^\s*(\d+)/)?.[1] ?? 1);
    const matchingRows = params.stock?.filter(
      (row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    ) ?? [];
    const available = matchingRows.reduce((total, row) => total + row.quantity, 0);
    const stockStatus = !stockProvided
      ? "unchecked"
      : matchingRows.length === 0
        ? "not_tracked"
        : available >= needed
          ? "in_stock"
          : "short";

    return {
      name: item.name,
      qty: item.qty,
      category: "Standard",
      stockStatus,
      needed,
      ...(stockProvided ? { available } : {}),
    };
  });
  const stockCeilingVerified = stockProvided && allocatedItems.length > 0 &&
    allocatedItems.every((item) => item.stockStatus === "in_stock");
  const confirmedItems = allocatedItems.filter((item) => item.stockStatus === "in_stock");
  const shortItems = allocatedItems.filter((item) => item.stockStatus === "short");
  const untrackedItems = allocatedItems.filter((item) => item.stockStatus === "not_tracked");
  const stockAlert = stockCeilingVerified
    ? null
    : !stockProvided
      ? "Stock was not checked for this request."
      : [
          confirmedItems.length ? `Confirmed in stock: ${confirmedItems.map((item) => item.name).join(", ")}` : "",
          shortItems.length ? `Short: ${shortItems.map((item) => `${item.name} (need ${item.needed}, have ${item.available})`).join(", ")}` : "",
          untrackedItems.length ? `Not tracked at this camp: ${untrackedItems.map((item) => item.name).join(", ")}` : "",
          allocatedItems.length === 0 ? "No parcel items were available to verify" : "",
        ].filter(Boolean).join("; ") + ".";

  const logisticsThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "logistics",
      title: "Camp Inventory Check",
      detail: stockProvided
        ? `Checked ${params.campName ?? "Alkhidmat Camp"} stock for ${allocatedItems.length} parcel items. ${stockCeilingVerified ? "Every item is available in the required quantity." : stockAlert}`
        : "Camp stock was not available to check; no inventory verification was performed.",
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "logistics",
      title: "Emergency Relief Parcel Allocation",
      detail: `Prepared ${allocatedItems.length} parcel items from the citizen distress signal. ${confirmedItems.length} confirmed in stock, ${shortItems.length} short, ${untrackedItems.length} not tracked, ${allocatedItems.filter((item) => item.stockStatus === "unchecked").length} unchecked.`,
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "logistics",
      title: "Volunteer Matching & Packaging",
      detail: `Matched volunteer (${params.volunteerName ?? "Nearest Available"}). Prepared ${Math.ceil(people / 3)} waterproof crate(s); stock reservation is not performed by this check.`,
      timestamp: timeStr,
    },
  ];

  const logisticsAgent: LogisticsAgentResult = {
    agentName: "Logistics Agent",
    role: "Checks relief parcel quantities against camp stock",
    allocatedItems,
    stockCeilingVerified,
    stockAlert,
    autoRestockTriggered: false,
    shippableBoxes: Math.ceil(people / 3),
    assignedVolunteerName: params.volunteerName ?? null,
    thoughts: logisticsThoughts,
    verdict: stockCeilingVerified
      ? `All ${allocatedItems.length} parcel items confirmed in camp stock.`
      : stockAlert ?? "Camp stock could not be verified.",
  };

  // 4. 🗺️ Route Agent
  const distKm = params.routeDistanceKm ?? null;
  const durMin = params.routeDurationMin ?? null;
  const viaName = params.routeVia ?? null;
  const routeFound = distKm !== null;
  const vehicle = "Not determined";
  const routeSummary = routeFound
    ? `Sample route metrics: ${distKm} km${durMin !== null ? `, ${durMin} min example ETA` : ""}${viaName ? ` via ${viaName}` : ""}. These are static demo values; road passability is not verified.`
    : "No sample route metrics were supplied. Road passability is not verified.";
  const routeHazards =
    (params.rainfall24h != null && params.rainfall24h > 35) || (params.currentRainfallRate != null && params.currentRainfallRate > 2)
      ? [
          params.rainfall24h != null && params.rainfall24h > 35
            ? `Static scenario rainfall value: ${params.rainfall24h.toFixed(1)} mm in 24h; road conditions are not verified`
            : `Static scenario current precipitation value: ${params.currentRainfallRate?.toFixed(1)}; road conditions are not verified`,
        ]
      : [];

  const routeThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "route",
      title: "Static Route Example",
      detail: routeFound
        ? `Static sample route: ${distKm} km${durMin !== null ? `, ${durMin} min example ETA` : ""}${viaName ? ` via ${viaName}` : ""}.`
        : "Route data unavailable.",
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "route",
      title: "Road Passability Status",
      detail: "Road passability is not verified; no live road-flood data is available.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "route",
      title: "Vehicle Suitability",
      detail: "No vehicle suitability or road-passability evidence is supplied; manual assessment is required.",
      timestamp: timeStr,
    },
  ];

  const routeAgent: RouteAgentResult = {
    agentName: "Route Agent",
    role: "Static sample route preview; not live OSRM data",
    routeFound,
    passabilityVerified: false,
    distanceKm: distKm,
    durationMin: durMin,
    viaRoadName: viaName,
    roadPassability: "Not verified",
    hazards: routeHazards,
    recommendedVehicle: vehicle,
    thoughts: routeThoughts,
    verdict: routeSummary,
  };

  // 5. Resource Agent (static demo; no verified price catalog)
  const totalCostPkr = 0;
  const costPerPerson = 0;
  const resourceEstimateSentence = "Cost estimate unavailable: no verified price catalog is configured.";

  const resourceThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "resource",
      title: "Price Catalog Check",
      detail: "No verified price catalog was supplied.",
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "resource",
      title: "Cost Estimate",
      detail: "No placeholder prices or totals are displayed.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "resource",
      title: "Assessment Scope",
      detail: "Cost and fuel estimates remain unavailable until maintained price data is configured.",
      timestamp: timeStr,
    },
  ];

  const resourceAgent: ResourceAgentResult = {
    agentName: "Resource Agent",
    role: "Static demo preview of verified-price availability",
    estimatedCostPkr: totalCostPkr,
    costPerPersonPkr: costPerPerson,
    fundWasteRisk: "Not assessed",
    economicVerdict: resourceEstimateSentence,
    thoughts: resourceThoughts,
    verdict: resourceEstimateSentence,
  };

  // Overall Risk Score synthesis
  const riskAssessment = assessRisk({
    priority: params.priority,
    type: params.type,
    peopleCount: people,
    needs,
  });
  const percentile = priorityPercentile(riskAssessment.score);

  return {
    requestId: params.requestId,
    citizenName: params.citizenName,
    district: params.district,
    needs,
    floodRainfall: rain7d,
    evaluatedAt: now.toISOString(),
    overallScore: riskAssessment.score,
    percentile,
    allAgentsSynced: false,
    floodAgent,
    healthAgent,
    logisticsAgent,
    routeAgent,
    resourceAgent,
    justificationBlock: {
      riskDriver: `${params.priority.toUpperCase()} priority request affecting ${people} people in ${params.district}. Reported needs: ${needs.slice(0, 2).join(", ") || "No needs listed"}.${healthAgent.detectedOutcomes.length > 0 ? ` Health Agent flagged: ${healthAgent.detectedOutcomes.map((outcome) => outcome.disease).join(", ")}.` : ""}`,
      priorityEffect: `Risk score ${riskAssessment.score.toFixed(1)}/10; percentile: ${percentile}.${riskAssessment.score >= 8 ? " Recommended for immediate attention." : ""}`,
      routeDecision: routeSummary,
      allocationDecision: stockCeilingVerified
        ? `All ${allocatedItems.length} parcel items confirmed in camp stock.`
        : `Parcel stock result: ${stockAlert ?? "Stock could not be verified."}`,
      resourceEfficiency: resourceEstimateSentence,
    },
  };
}
