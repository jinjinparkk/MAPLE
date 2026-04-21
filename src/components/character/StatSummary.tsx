import type { CharacterStat } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';
import { calculateCombatPower } from '@/lib/calculator/stat-converter';

interface Props {
  stat: CharacterStat;
  convertedMainStat?: number;
}

const DISPLAY_STATS = [
  'STR', 'DEX', 'INT', 'LUK',
  '공격력', '마력',
  '보스 몬스터 데미지', '방어율 무시',
  '크리티컬 데미지', '스타포스',
];

export default function StatSummary({ stat, convertedMainStat }: Props) {
  // 전투력 직접 계산 (API 값은 인게임 전투력과 다르므로)
  const combatPower = calculateCombatPower(stat);

  const displayItems = stat.final_stat
    .filter((s) => DISPLAY_STATS.includes(s.stat_name))
    .map((s) => ({
      name: s.stat_name,
      value: s.stat_value,
    }));

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">스탯 요약</h2>

      {/* 전투력 */}
      {combatPower > 0 && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
          <p className="text-sm text-blue-100">전투력</p>
          <p className="text-3xl font-bold text-white">
            {combatPower.toLocaleString()}
          </p>
        </div>
      )}

      {/* 환산 주스탯 */}
      {convertedMainStat !== undefined && (
        <div className="mb-4 rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-sm text-orange-600">환산 주스탯</p>
          <p className="text-3xl font-bold text-orange-700">
            {convertedMainStat.toLocaleString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {displayItems.map((item) => (
          <div key={item.name} className="flex justify-between rounded bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">
              {Number(item.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
