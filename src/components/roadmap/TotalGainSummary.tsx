import type { Roadmap } from '@/lib/engine';
import Card from '@/components/common/Card';

interface Props {
  roadmap: Roadmap;
}

function formatMeso(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  return value.toLocaleString();
}

export default function TotalGainSummary({ roadmap }: Props) {
  const sfSteps = roadmap.steps.filter((s) => s.candidate.category === 'starforce');
  const potSteps = roadmap.steps.filter((s) => s.candidate.category === 'potential');

  const sfCost = sfSteps.reduce((sum, s) => sum + s.candidate.expectedCost, 0);
  const sfGain = sfSteps.reduce((sum, s) => sum + s.candidate.convertedStatGain, 0);

  const potCost = potSteps.reduce((sum, s) => sum + s.candidate.expectedCost, 0);
  const potGain = potSteps.reduce((sum, s) => sum + s.candidate.convertedStatGain, 0);

  if (roadmap.steps.length === 0) return null;

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">요약</h2>
      <div className="space-y-2">
        {sfSteps.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
            <div>
              <p className="font-medium text-yellow-800">스타포스</p>
              <p className="text-xs text-yellow-600">{sfSteps.length}개 강화</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-yellow-800">+{Math.round(sfGain * 10) / 10} 환산스탯</p>
              <p className="text-xs text-yellow-600">{formatMeso(sfCost)}</p>
            </div>
          </div>
        )}
        {potSteps.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
            <div>
              <p className="font-medium text-green-800">잠재능력</p>
              <p className="text-xs text-green-600">{potSteps.length}개 재설정</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">+{Math.round(potGain * 10) / 10} 환산스탯</p>
              <p className="text-xs text-green-600">{formatMeso(potCost)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
