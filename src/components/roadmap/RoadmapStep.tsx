import type { RoadmapStep as RoadmapStepType } from '@/lib/engine';

interface Props {
  step: RoadmapStepType;
}

function formatMeso(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(0)}만`;
  }
  return value.toLocaleString();
}

/** 1 환산스탯당 메소 비용 */
function formatCostPerStat(cost: number, statGain: number): string {
  if (statGain <= 0) return '-';
  const perStat = cost / statGain;
  return formatMeso(perStat);
}

const CATEGORY_COLORS: Record<string, string> = {
  starforce: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  potential: 'bg-green-100 text-green-800 border-green-300',
};

const CATEGORY_LABELS: Record<string, string> = {
  starforce: '스타포스',
  potential: '잠재능력',
};

export default function RoadmapStepCard({ step }: Props) {
  const { candidate } = step;
  const colorClass = CATEGORY_COLORS[candidate.category];
  const hasShatarDiff = candidate.expectedCostShatar !== candidate.expectedCost;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
          {step.order}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200" />
      </div>

      <div className="flex-1 pb-6">
        <div className={`rounded-lg border p-3 ${colorClass}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded px-2 py-0.5 text-xs font-medium mb-1">
                {CATEGORY_LABELS[candidate.category]}
              </span>
              <h3 className="font-medium text-gray-900">{candidate.label}</h3>
              {candidate.currentPotentialSummary && (
                <p className="text-xs text-gray-500">현재: {candidate.currentPotentialSummary}</p>
              )}
              {candidate.itemLevel && !candidate.potentialType && (
                <p className="text-xs text-gray-500">Lv.{candidate.itemLevel} 장비</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">+{candidate.convertedStatGain}</p>
              <p className="text-xs text-gray-500">환산주스탯</p>
            </div>
          </div>

          {/* 비용 정보 */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-white/60 p-2">
              <p className="text-gray-500 mb-1">{candidate.category === 'potential' ? '기대비용' : '평소'}</p>
              <p className="font-bold text-gray-800 text-sm">{formatMeso(candidate.expectedCost)}</p>
              <p className="text-gray-500 mt-0.5">
                환산 1당 {formatCostPerStat(candidate.expectedCost, candidate.convertedStatGain)}
              </p>
            </div>
            {hasShatarDiff ? (
              <div className="rounded bg-green-50 border border-green-200 p-2">
                <p className="text-green-700 mb-1 font-medium">샤타포스</p>
                <p className="font-bold text-green-800 text-sm">{formatMeso(candidate.expectedCostShatar)}</p>
                <p className="text-green-600 mt-0.5">
                  환산 1당 {formatCostPerStat(candidate.expectedCostShatar, candidate.convertedStatGain)}
                </p>
              </div>
            ) : (
              <div className="rounded bg-white/60 p-2">
                {candidate.category === 'potential' ? (
                  <>
                    <p className="text-gray-500 mb-1">{candidate.potentialType === 'main' ? '윗잠' : '에디'}</p>
                    <p className="text-gray-500">{candidate.targetPotentialLabel}</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 mb-1">샤타포스</p>
                    <p className="text-gray-400">동일</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
