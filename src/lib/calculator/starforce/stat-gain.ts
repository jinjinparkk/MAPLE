import { getStarforceStatGain } from '@/lib/constants/starforce-table';

/**
 * fromStar → toStar 까지의 총 스탯 증가량
 */
export function getTotalStarforceStatGain(
  fromStar: number,
  toStar: number,
  itemLevel: number,
): { mainStat: number; attackPower: number } {
  let totalMainStat = 0;
  let totalAttackPower = 0;

  for (let star = fromStar; star < toStar; star++) {
    const gain = getStarforceStatGain(star, itemLevel);
    totalMainStat += gain.mainStat;
    totalAttackPower += gain.attackPower;
  }

  return { mainStat: totalMainStat, attackPower: totalAttackPower };
}
