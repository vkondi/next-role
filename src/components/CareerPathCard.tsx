/**
 * CareerPathCard Component
 * Displays a single career path option
 */

import type { CareerPath } from "@/lib/types";
import { TrendingUp, Zap } from "lucide-react";

interface CareerPathCardProps {
  path: CareerPath;
  isSelected?: boolean;
  onSelect?: (pathId: string) => void;
}

export function CareerPathCard({
  path,
  isSelected = false,
  onSelect,
}: CareerPathCardProps) {
  const effortColors = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };

  const rewardColors = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div
      onClick={() => onSelect?.(path.roleId)}
      className={`card p-6 cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-emerald-500 shadow-lg"
          : "hover:shadow-md"
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="heading-4 text-emerald-700">{path.roleName}</h3>
          <p className="text-small mt-1">{path.description}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-small font-semibold">Market Demand</p>
              <p className="text-lg font-bold text-emerald-600">
                {path.marketDemandScore}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-small font-semibold">Industry Fit</p>
              <p className="text-lg font-bold text-emerald-600">
                {path.industryAlignment}%
              </p>
            </div>
          </div>
        </div>

        {/* Effort and Reward */}
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${effortColors[path.effortLevel]}`}>
            Effort: {path.effortLevel}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${rewardColors[path.rewardPotential]}`}>
            Reward: {path.rewardPotential}
          </span>
        </div>

        {/* Reasoning */}
        <p className="text-small bg-slate-50 p-3 rounded-lg border border-slate-200">
          {path.reasoning}
        </p>

        {/* Skills */}
        <div>
          <p className="text-small font-semibold mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {path.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded"
              >
                {skill}
              </span>
            ))}
            {path.requiredSkills.length > 4 && (
              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded">
                +{path.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="pt-3 border-t border-emerald-200">
            <p className="text-sm font-semibold text-emerald-600">
              ✓ Selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
