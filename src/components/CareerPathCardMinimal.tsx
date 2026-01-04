/**
 * CareerPathCardMinimal Component
 * Lightweight version showing only essential information in carousel
 */

import type { CareerPathMinimal } from "@/lib/types";
import { TrendingUp, Zap } from "lucide-react";

interface CareerPathCardMinimalProps {
  path: CareerPathMinimal;
  isSelected?: boolean;
  onSelect?: (pathId: string) => void;
}

export function CareerPathCardMinimal({
  path,
  isSelected = false,
  onSelect,
}: CareerPathCardMinimalProps) {
  return (
    <div
      onClick={() => onSelect?.(path.roleId)}
      className={`flex-shrink-0 w-80 card p-5 cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-emerald-500 shadow-lg bg-emerald-50"
          : "hover:shadow-md hover:bg-slate-50"
      }`}
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div>
          <h3 className="font-bold text-lg text-emerald-700 line-clamp-2">
            {path.roleName}
          </h3>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {path.description}
          </p>
        </div>

        {/* Metrics - Market and Industry Fit */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
            <TrendingUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-600">Market</p>
              <p className="font-bold text-emerald-600">
                {path.marketDemandScore}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
            <Zap className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-600">Fit</p>
              <p className="font-bold text-emerald-600">
                {path.industryAlignment}%
              </p>
            </div>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-xs font-semibold text-slate-600 mb-2">
            Key Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {path.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded"
              >
                {skill}
              </span>
            ))}
            {path.requiredSkills.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                +{path.requiredSkills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="text-center pt-2 border-t border-emerald-200">
            <p className="text-xs font-semibold text-emerald-600">Selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
