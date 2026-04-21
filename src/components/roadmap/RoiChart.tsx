'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { UpgradeCandidate } from '@/lib/engine';
import Card from '@/components/common/Card';

interface Props {
  candidates: UpgradeCandidate[];
  maxItems?: number;
}

const CATEGORY_COLORS = {
  starforce: '#f59e0b',
};

function formatMeso(value: number): string {
  if (value >= 100_000_000) return `${(value / 1e8).toFixed(1)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  return value.toLocaleString();
}

export default function RoiChart({ candidates, maxItems = 15 }: Props) {
  // 환산 1당 비용이 낮은 순으로 정렬 (가성비 좋은 순)
  const sorted = [...candidates]
    .filter((c) => c.convertedStatGain > 0)
    .map((c) => ({
      ...c,
      costPerStat: c.expectedCost / c.convertedStatGain,
      costPerStatShatar: c.expectedCostShatar / c.convertedStatGain,
    }))
    .sort((a, b) => a.costPerStat - b.costPerStat)
    .slice(0, maxItems);

  const data = sorted.map((c) => ({
    name: c.label.length > 15 ? c.label.slice(0, 15) + '...' : c.label,
    costPerStat: Math.round(c.costPerStat / 1e8 * 10) / 10, // 억 단위
    category: c.category,
  }));

  if (data.length === 0) return null;

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        가성비 비교 — 환산스탯 1 올리는 데 드는 비용
      </h2>
      <div className="flex gap-4 mb-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-yellow-500" /> 스타포스
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">막대가 짧을수록 가성비 좋음 (평소 기준)</p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="억" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`${value}억`, '환산 1당 비용']}
            />
            <Bar dataKey="costPerStat" name="환산 1당 비용" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
