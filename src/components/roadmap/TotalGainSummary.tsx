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
  const symSteps = roadmap.steps.filter((s) => s.candidate.category === 'symbol');

  const sfCost = sfSteps.reduce((sum, s) => sum + s.candidate.expectedCost, 0);
  const symCost = symSteps.reduce((sum, s) => sum + s.candidate.expectedCost, 0);
  const sfGain = sfSteps.reduce((sum, s) => sum + s.candidate.convertedStatGain, 0);
  const symGain = symSteps.reduce((sum, s) => sum + s.candidate.convertedStatGain, 0);

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">카테고리별 요약</h2>
      <div className="space-y-3">
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
        {symSteps.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
            <div>
              <p className="font-medium text-blue-800">심볼</p>
              <p className="text-xs text-blue-600">{symSteps.length}개 레벨업</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-800">+{Math.round(symGain * 10) / 10} 환산스탯</p>
              <p className="text-xs text-blue-600">{formatMeso(symCost)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
