export interface RiskAssessment {
  score: number;
  level: string;
  levelColor: string;
  badge: string;
  stroke: string;
  track: string;
}

const VULNERABLE = /child|baby|infant|under 5|elderly|pregnan|mother|newborn|disabled/i;

export function assessRisk(request: {
  priority: string;
  type: string;
  peopleCount: number;
  needs: string[];
}): RiskAssessment {
  let score = { critical: 8, high: 6.4, medium: 4.2, low: 2.4 }[request.priority] ?? 4.2;

  const vulnerableNeeds = request.needs.filter((n) => VULNERABLE.test(n));
  score += Math.min(0.9, vulnerableNeeds.length * 0.3);

  if (request.type === "rescue") score += 0.5;
  if (request.type === "medical") score += 0.2;
  if (/fever|diarrhea|cholera|bleed|injur|snake/i.test(request.needs.join(" "))) score += 0.3;

  score += Math.min(0.8, Math.max(0, request.peopleCount - 1) * 0.1);

  const clamped = Math.min(9.9, Math.max(1, score));
  const rounded = Math.round(clamped * 10) / 10;

  if (rounded >= 8) {
    return { score: rounded, level: "Very High", levelColor: "text-red-500", badge: "bg-red-500", stroke: "#ef4444", track: "#fee2e2" };
  }
  if (rounded >= 6) {
    return { score: rounded, level: "High", levelColor: "text-orange-500", badge: "bg-orange-500", stroke: "#f97316", track: "#ffedd5" };
  }
  if (rounded >= 4) {
    return { score: rounded, level: "Medium", levelColor: "text-amber-500", badge: "bg-amber-400", stroke: "#f59e0b", track: "#fef3c7" };
  }
  return { score: rounded, level: "Low", levelColor: "text-emerald-500", badge: "bg-emerald-500", stroke: "#10b981", track: "#d1fae5" };
}

export function priorityPercentile(_score: number): string {
  // No historical population dataset exists to support a statistical percentile.
  return "Not statistically calibrated";
}
