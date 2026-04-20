import type { StatContext } from '../stat-converter';
import { convertToMainStat } from '../stat-converter';

/**
 * 하이퍼스탯 레벨별 필요 포인트
 */
const HYPER_STAT_POINT_TABLE: Record<number, number> = {
  1: 1, 2: 2, 3: 4, 4: 8, 5: 10,
  6: 15, 7: 20, 8: 25, 9: 30, 10: 35,
  11: 50, 12: 65, 13: 80, 14: 95, 15: 110,
};

/**
 * 하이퍼스탯 종류별 레벨당 증가량 (주스탯 환산에 사용)
 */
interface HyperStatOption {
  name: string;
  getStatGain: (level: number) => {
    mainStat?: number;
    attackPower?: number;
    bossDamage?: number;
    ignoreDefense?: number;
    critDamage?: number;
    damage?: number;
  };
}

const HYPER_STAT_OPTIONS: HyperStatOption[] = [
  {
    name: '주스탯',
    getStatGain: (level) => ({ mainStat: level * 30 }),
  },
  {
    name: '공격력/마력',
    getStatGain: (level) => ({ attackPower: level * 3 }),
  },
  {
    name: '데미지',
    getStatGain: (level) => ({ damage: level * 3 }),
  },
  {
    name: '보스 데미지',
    getStatGain: (level) => ({ bossDamage: level * 3 + Math.floor(level / 5) * 1 }),
  },
  {
    name: '방어율 무시',
    getStatGain: (level) => ({ ignoreDefense: level * 3 }),
  },
  {
    name: '크리티컬 데미지',
    getStatGain: (level) => ({ critDamage: level }),
  },
];

/**
 * 하이퍼스탯 레벨 0→targetLevel 까지 필요한 총 포인트
 */
function getPointsForLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 1; i <= targetLevel; i++) {
    total += HYPER_STAT_POINT_TABLE[i] ?? 0;
  }
  return total;
}

export interface HyperStatAllocation {
  name: string;
  level: number;
  convertedStat: number;
}

/**
 * 현재 사용 가능한 하이퍼스탯 포인트로 최적 배분 계산
 * Greedy 방식: 1포인트당 환산스탯 증가가 가장 큰 스탯에 투자
 */
export function optimizeHyperStat(
  ctx: StatContext,
  availablePoints: number,
): HyperStatAllocation[] {
  const allocation: Record<string, number> = {};
  HYPER_STAT_OPTIONS.forEach((opt) => {
    allocation[opt.name] = 0;
  });

  let remainingPoints = availablePoints;
  const maxLevel = 15;

  while (remainingPoints > 0) {
    let bestOption: string | null = null;
    let bestRoi = 0;
    let bestCost = 0;

    for (const opt of HYPER_STAT_OPTIONS) {
      const currentLevel = allocation[opt.name];
      if (currentLevel >= maxLevel) continue;

      const nextLevel = currentLevel + 1;
      const cost = HYPER_STAT_POINT_TABLE[nextLevel] ?? Infinity;
      if (cost > remainingPoints) continue;

      // 현재 레벨 → 다음 레벨의 추가 환산스탯
      const currentGain = opt.getStatGain(currentLevel);
      const nextGain = opt.getStatGain(nextLevel);

      const currentConverted = convertToMainStat(ctx, currentGain);
      const nextConverted = convertToMainStat(ctx, nextGain);
      const marginalGain = nextConverted - currentConverted;

      const roi = marginalGain / cost;

      if (roi > bestRoi) {
        bestRoi = roi;
        bestOption = opt.name;
        bestCost = cost;
      }
    }

    if (!bestOption) break;

    allocation[bestOption]++;
    remainingPoints -= bestCost;
  }

  return HYPER_STAT_OPTIONS.map((opt) => ({
    name: opt.name,
    level: allocation[opt.name],
    convertedStat: convertToMainStat(ctx, opt.getStatGain(allocation[opt.name])),
  })).filter((a) => a.level > 0);
}

export { getPointsForLevel };
