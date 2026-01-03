/**
 * RoadmapTimeline Component
 * Displays the career roadmap as a timeline with phases
 */

import type { CareerRoadmap } from "@/lib/types";
import { CheckCircle2, Target, BookOpen } from "lucide-react";

interface RoadmapTimelineProps {
  roadmap: CareerRoadmap;
}

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <div className="card p-6 space-y-6">
      <div>
        <h3 className="heading-4">
          Career Roadmap: {roadmap.careerPathName}
        </h3>
        <p className="text-small text-slate-600 mt-1">
          {roadmap.timelineMonths}-month transition plan
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {roadmap.phases.map((phase, index) => (
          <div key={phase.phaseNumber} className="relative">
            {/* Timeline connector */}
            {index < roadmap.phases.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-12 bg-gradient-to-b from-emerald-400 to-emerald-200" />
            )}

            {/* Phase card */}
            <div className="pl-20 space-y-3">
              {/* Phase header with number */}
              <div className="flex items-center gap-3 -ml-16">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {phase.phaseNumber}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {phase.duration}
                  </p>
                  <p className="text-small text-slate-600">
                    {phase.learningDirection}
                  </p>
                </div>
              </div>

              {/* Phase content */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                {/* Skills Focus */}
                <div>
                  <p className="text-small font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Skills Focus
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skillsFocus.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <p className="text-small font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Milestones
                  </p>
                  <ul className="space-y-1">
                    {phase.milestones.map((milestone, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div>
                  <p className="text-small font-semibold text-slate-700 mb-2">
                    Action Items
                  </p>
                  <ul className="space-y-1">
                    {phase.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Project Ideas */}
                <div>
                  <p className="text-small font-semibold text-slate-700 mb-2">
                    Project Ideas
                  </p>
                  <ul className="space-y-1">
                    {phase.projectIdeas.map((idea, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-amber-600 font-bold flex-shrink-0">
                          •
                        </span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Metrics */}
      <div className="border-t border-slate-200 pt-6 space-y-3">
        <p className="heading-4">Success Metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {roadmap.successMetrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{metric}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors and Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-6">
        <div className="space-y-3">
          <p className="heading-4 text-amber-700">Risk Factors</p>
          <ul className="space-y-2">
            {roadmap.riskFactors.map((risk, i) => (
              <li
                key={i}
                className="text-sm text-slate-700 flex items-start gap-2"
              >
                <span className="text-amber-600 font-bold flex-shrink-0">
                  ⚠
                </span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <p className="heading-4 text-emerald-700">Support Resources</p>
          <ul className="space-y-2">
            {roadmap.supportResources.map((resource, i) => (
              <li
                key={i}
                className="text-sm text-slate-700 flex items-start gap-2"
              >
                <span className="text-emerald-600 font-bold flex-shrink-0">
                  ✓
                </span>
                {resource}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
