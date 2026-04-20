import type { Roadmap } from '@/lib/engine';
import Card from '@/components/common/Card';
import RoadmapStepCard from './RoadmapStep';

interface Props {
  roadmap: Roadmap;
}

function formatMeso(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  return value.toLocaleString();
}

export default function RoadmapTimeline({ roadmap }: Props) {
  if (roadmap.steps.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-3">스펙업 로드맵</h2>
        <p className="text-sm text-gray-500">
          예산 내에서 강화할 수 있는 항목이 없습니다.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-4">스펙업 로드맵</h2>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-gray-500">총 비용</p>
          <p className="text-lg font-bold text-orange-700">{formatMeso(roadmap.totalCost)}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-gray-500">총 환산스탯</p>
          <p className="text-lg font-bold text-green-700">+{roadmap.totalStatGain}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">잔여 예산</p>
          <p className="text-lg font-bold text-gray-700">{formatMeso(roadmap.remainingBudget)}</p>
        </div>
      </div>
      <div>
        {roadmap.steps.map((step) => (
          <RoadmapStepCard key={step.order} step={step} />
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        * 스타포스 기대비용은 순수 강화 메소만 포함합니다. 파괴 시 아이템 재구매 비용은 미반영.
      </p>
    </Card>
  );
}
