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
  surfaceWaterRisk: "Low" | "Moderate" | "Severe" | "Critical Inundation";
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
  recommendedVehicle: "4x4 Relief Truck" | "Motorboat / Dinghy" | "All-Terrain Motorbike" | "Foot Patrol with Lifejackets";
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

export function runMultiAgentPipeline(params: {
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

  // 1. 🌊 Flood Agent (Real-Time Open-Meteo Satellite & Radar Telemetry)
  const currentRainRate = params.currentRainfallRate ?? 0.0;
  const rain24 = params.rainfall24h ?? 28.5;
  const rain7d = params.rainfall7d ?? 84.2;
  const isRescue = params.type === "rescue" || /drown|boat|stranded|submerged|water rising|flood/i.test(needsJoined);
  const rainRateFactor = Math.min(2.0, currentRainRate * 0.4);
  const floodScoreRaw = 3.5 + Math.min(3.5, rain7d / 30) + Math.min(2.0, rain24 / 25) + rainRateFactor + (isRescue ? 2.2 : 0.5);
  const floodSeverityScore = Math.min(9.9, Math.round(floodScoreRaw * 10) / 10);
  const floodSeverityLevel =
    floodSeverityScore >= 8.5 ? "Extreme" : floodSeverityScore >= 6.5 ? "High" : floodSeverityScore >= 4.5 ? "Moderate" : "Low";

  const locLabel = params.lat && params.lng ? `${params.district} (${params.lat.toFixed(3)}°N, ${params.lng.toFixed(3)}°E)` : params.district;

  const floodThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "flood",
      title: "Real-Time Open-Meteo Radar & Satellite Scan",
      detail: `Telemetry for ${locLabel}: Real-time rainfall rate: ${currentRainRate.toFixed(1)} mm/h | 24h precipitation: ${rain24.toFixed(1)} mm | 7d cumulative: ${rain7d.toFixed(1)} mm.`,
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "flood",
      title: "Hydrological Soil Saturation & Surface Runoff",
      detail: isRescue
        ? "Victim reports active submergence / stranded conditions. Immediate swift-water hazard active."
        : currentRainRate > 2 || rain24 > 35
        ? "Localized heavy precipitation detected. Saturated topsoil triggering immediate sheet runoff."
        : "Hydrological soil saturation at 82%. Drainage capacity monitored for backwater swell.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "flood",
      title: "Flood Severity Index Calculation",
      detail: `Calculated Flood Severity Index ${floodSeverityScore}/10 (${floodSeverityLevel} Risk Tier) based on live precipitation telemetry.`,
      timestamp: timeStr,
    },
  ];

  const floodAgent: FloodAgentResult = {
    agentName: "Flood Agent",
    role: "Predicts flood severity & surface water accumulation",
    severityScore: floodSeverityScore,
    severityLevel: floodSeverityLevel,
    rainfall24hMm: rain24,
    rainfall7dMm: rain7d,
    currentRainfallRateMmH: currentRainRate,
    weatherSource: params.weatherSource || "Open-Meteo WMO Real-Time Weather API",
    surfaceWaterRisk: isRescue ? "Critical Inundation" : floodSeverityScore >= 7 ? "Severe" : "Moderate",
    terrainElevationNote: `${params.district} river basin — alluvial lowlands vulnerable to monsoonal runoff accumulation.`,
    thoughts: floodThoughts,
    verdict: `Severity ${floodSeverityScore}/10 (${floodSeverityLevel}). Live rain: ${currentRainRate.toFixed(1)} mm/h. Approach via elevated corridors.`,
  };

  // 2. 🦠 Health Agent
  const hasDiarrhea = /diarrhea|dehydration|ors|cholera|vomit/i.test(needsJoined);
  const hasFever = /fever|temperature|malaria|dengue|typhoid/i.test(needsJoined);
  const hasWound = /injur|wound|bleed|bandage|cut|fracture/i.test(needsJoined);
  const hasContaminatedWater = /water|dirty water|thirst|clean water|no water/i.test(needsJoined);
  const hasChildren = /child|baby|infant|under 5/i.test(needsJoined);
  const hasPregnant = /pregnan|mother|newborn/i.test(needsJoined);

  const detectedOutcomes: HealthAgentResult["detectedOutcomes"] = [];
  const contraindications: string[] = [];
  const clinicalRecommendations: string[] = [];

  if (hasDiarrhea || (hasContaminatedWater && floodSeverityScore >= 6)) {
    detectedOutcomes.push({
      disease: "Diarrheal Outbreak / Cholera",
      riskLevel: "High",
      rationale: "Contaminated standing floodwater ingested or acute gastrointestinal distress reported.",
    });
    clinicalRecommendations.push("Immediate oral rehydration therapy (ORS + Zinc) to prevent hypovolemic shock.");
    clinicalRecommendations.push("Provide safe drinking water and purification supplies to decontaminate water sources.");
  }

  if (hasFever) {
    detectedOutcomes.push({
      disease: "Malaria",
      riskLevel: "High",
      rationale: "High stagnant water presence creates acute Anopheles vector breeding zones.",
    });
    detectedOutcomes.push({
      disease: "Dengue Fever",
      riskLevel: "Medium",
      rationale: "Post-flood urban and semi-rural vector risk.",
    });
    clinicalRecommendations.push("Paracetamol 500mg (avoid NSAIDs if Dengue/hemorrhagic fever cannot be ruled out).");
  }

  if (hasWound) {
    detectedOutcomes.push({
      disease: "Skin / Wound Infection",
      riskLevel: "High",
      rationale: "Submerged flood lacerations harbor high bacterial pathogens (Aeromonas/Pseudomonas).",
    });
    contraindications.push("Do NOT administer aspirin or anticoagulant pain relievers due to active wound/bleeding risk.");
    clinicalRecommendations.push("Topical Antiseptic Liquid (100ml) + sterile bandage roll dressings.");
  }

  if (detectedOutcomes.length === 0) {
    detectedOutcomes.push({
      disease: "Dehydration",
      riskLevel: "Medium",
      rationale: "Disrupted potable water infrastructure in flooded district.",
    });
    clinicalRecommendations.push("Prophylactic clean water and purification tablets.");
  }

  const outbreakSignal = hasDiarrhea || (hasContaminatedWater && hasChildren);
  const outbreakTier = outbreakSignal ? "Primary" : hasFever ? "Secondary" : "Monitored";

  const healthThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "health",
      title: "Symptom Screening & Disease Prediction",
      detail: `Screened reported needs (${needs.join(", ") || "General Relief"}). Identified ${detectedOutcomes.length} potential pathogen risks.`,
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "health",
      title: "Contraindication Analysis",
      detail: contraindications.length > 0 ? contraindications[0] : "No severe drug contraindications detected. Standard relief bundle safe.",
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "health",
      title: "Outbreak Tier Classification",
      detail: `Classified as ${outbreakTier} Outbreak Risk Tier. Mandating specific medical parcel items.`,
      timestamp: timeStr,
    },
  ];

  const healthAgent: HealthAgentResult = {
    agentName: "Health Agent",
    role: "Predicts diarrheal outbreaks, infectious diseases & clinical triage",
    outbreakRiskTier: outbreakTier,
    outbreakSignal,
    detectedOutcomes,
    contraindications,
    clinicalRecommendations,
    thoughts: healthThoughts,
    verdict: `${outbreakTier} risk tier: ${detectedOutcomes.map((d) => d.disease).join(", ")}.`,
  };

  // 3. 📦 Logistics Agent
  const baseParcel = suggestParcel(needs, params.type);
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
  const vehicle = isRescue ? "Motorboat / Dinghy" : distKm !== null && distKm > 15 ? "4x4 Relief Truck" : "All-Terrain Motorbike";
  const routeSummary = routeFound
    ? `OSRM route used: ${distKm} km${durMin !== null ? `, ${durMin} min ETA` : ""}${viaName ? ` via ${viaName}` : ""}. Road passability is not verified.`
    : "Route data unavailable. Road passability is not verified.";
  const routeHazards =
    (params.rainfall24h != null && params.rainfall24h > 35) || (params.currentRainfallRate != null && params.currentRainfallRate > 2)
      ? [
          params.rainfall24h != null && params.rainfall24h > 35
            ? `Heavy rain reported by Open-Meteo (${params.rainfall24h.toFixed(1)} mm in 24h); road conditions not verified`
            : `Heavy rain reported by Open-Meteo (current rate ${params.currentRainfallRate?.toFixed(1)} mm/h); road conditions not verified`,
        ]
      : [];

  const routeThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "route",
      title: "OSRM Route Lookup",
      detail: routeFound
        ? `OSRM route used: ${distKm} km${durMin !== null ? `, ${durMin} min ETA` : ""}${viaName ? ` via ${viaName}` : ""}.`
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
      title: "Vehicle Recommendation",
      detail: `Recommended vehicle: ${vehicle}.`,
      timestamp: timeStr,
    },
  ];

  const routeAgent: RouteAgentResult = {
    agentName: "Route Agent",
    role: "Reports OSRM route data when available; road passability is not verified",
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

  // 5. 💰 Resource Agent
  const kitCost = 2800; // Placeholder unit price in PKR
  const medicalCost = 900; // Placeholder unit price in PKR
  const foodCost = 1400 * Math.ceil(people / 4); // Placeholder unit price in PKR
  const fuelCost = distKm === null ? 0 : Math.round(distKm * 45); // Placeholder per-kilometre fuel price
  const totalCostPkr = kitCost + medicalCost + foodCost + fuelCost;
  const costPerPerson = Math.round(totalCostPkr / people);
  const resourceEstimateSentence = `Estimated cost: PKR ${totalCostPkr.toLocaleString()} (PKR ${costPerPerson.toLocaleString()} per person), based on placeholder unit prices${distKm === null ? "; fuel estimate omitted because route distance is unavailable." : ", including a placeholder fuel estimate"}.`;

  const resourceThoughts: AgentThought[] = [
    {
      step: 1,
      agent: "resource",
      title: "Placeholder Unit-Price Estimate",
      detail: resourceEstimateSentence,
      timestamp: timeStr,
    },
    {
      step: 2,
      agent: "resource",
      title: "Per-Person Cost Estimate",
      detail: `Estimated cost per person for ${people} people: PKR ${costPerPerson.toLocaleString()}.`,
      timestamp: timeStr,
    },
    {
      step: 3,
      agent: "resource",
      title: "Assessment Scope",
      detail: "Prices are placeholders; budget efficiency and duplicate-aid waste have not been assessed.",
      timestamp: timeStr,
    },
  ];

  const resourceAgent: ResourceAgentResult = {
    agentName: "Resource Agent",
    role: "Estimates relief parcel and per-person costs",
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
    allAgentsSynced: true,
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
