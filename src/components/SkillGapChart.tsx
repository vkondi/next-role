'use client';

/**
 * SkillGapChart Component
 * Displays skill gaps using a bar chart visualization
 */

import type { SkillGapAnalysis } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SkillGapChartProps {
  analysis: SkillGapAnalysis;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      current: number;
      required: number;
      importance: string;
      fullName: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const levelLabels = [
    'None',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
  ];

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
      <p className="font-semibold text-slate-900">{data.fullName}</p>
      <p className="text-sm text-slate-600">
        Current: {levelLabels[data.current]}
      </p>
      <p className="text-sm text-slate-600">
        Required: {levelLabels[data.required]}
      </p>
      <p className="text-sm mt-1 text-amber-600 font-semibold">
        Importance: {data.importance}
      </p>
    </div>
  );
};

export function SkillGapChart({ analysis }: SkillGapChartProps) {
  // Convert skill levels to numeric values for charting
  const skillLevelMap = {
    None: 0,
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };

  const chartData = analysis.skillGaps.map((gap) => ({
    name: gap.skillName.substring(0, 15), // Truncate long names
    current: skillLevelMap[gap.currentLevel],
    required: skillLevelMap[gap.requiredLevel],
    importance: gap.importance,
    fullName: gap.skillName,
  }));

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="heading-4 text-lg sm:text-2xl">Skill Gap Analysis</h3>
        <p className="text-small text-xs sm:text-sm text-slate-600 mt-1">
          Current vs. Required skill levels
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 15, left: 10, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tickFormatter={(val) => {
              const labels = [
                'None',
                'Beginner',
                'Intermediate',
                'Advanced',
                'Expert',
              ];
              return labels[val];
            }}
            tick={{ fontSize: 10 }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Bar
            dataKey="current"
            fill="#10b981"
            name="Current Level"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="required"
            fill="#f59e0b"
            name="Required Level"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            Overall Severity
          </p>
          <p className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5 sm:mt-1">
            {analysis.overallGapSeverity}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            Time to Close
          </p>
          <p className="text-base sm:text-lg font-bold text-blue-700 mt-0.5 sm:mt-1">
            {analysis.estimatedTimeToClose}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            Total Skills
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-700 mt-0.5 sm:mt-1">
            {analysis.skillGaps.length} skills
          </p>
        </div>
      </div>

      {/* Summary text */}
      <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
        <p className="text-xs sm:text-sm text-slate-700">{analysis.summary}</p>
      </div>
    </div>
  );
}
