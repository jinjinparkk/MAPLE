/**
 * 잠재능력 3줄 → 환산주스탯 변환
 *
 * 기존 convertToMainStat() 재사용
 */

import type { StatContext } from '@/lib/calculator/stat-converter';
import { convertToMainStat } from '@/lib/calculator/stat-converter';
import type { ParsedPotential } from './parser';

/**
 * 파싱된 잠재능력의 총 환산주스탯 계산
 */
export function getPotentialConvertedStat(
  parsed: ParsedPotential,
  ctx: StatContext,
): number {
  let total = 0;

  for (const line of parsed.lines) {
    if (line.type === 'other' || line.value === 0) continue;

    let converted = 0;

    switch (line.type) {
      case 'mainStat_pct':
        converted = convertToMainStat(ctx, {
          mainStat: ctx.mainStat * line.value / 100,
        });
        break;

      case 'subStat_pct':
        converted = convertToMainStat(ctx, {
          subStat: ctx.subStat * line.value / 100,
        });
        break;

      case 'allStat_pct':
        converted = convertToMainStat(ctx, {
          allStat: line.value,
        });
        break;

      case 'atk_pct':
        converted = convertToMainStat(ctx, {
          attackPower: ctx.attackPower * line.value / 100,
        });
        break;

      case 'boss_dmg':
        converted = convertToMainStat(ctx, {
          bossDamage: line.value,
        });
        break;

      case 'ied':
        converted = convertToMainStat(ctx, {
          ignoreDefense: line.value,
        });
        break;

      case 'crit_dmg':
        converted = convertToMainStat(ctx, {
          critDamage: line.value,
        });
        break;

      case 'damage_pct':
        converted = convertToMainStat(ctx, {
          damage: line.value,
        });
        break;
    }

    total += converted;
  }

  return total;
}

/**
 * 잠재 옵션의 환산주스탯 값 계산 (옵션 테이블용)
 *
 * potential-table의 PotentialOption.type + value → 환산주스탯
 */
export function getOptionConvertedStat(
  type: string,
  value: number,
  ctx: StatContext,
): number {
  if (value === 0) return 0;

  switch (type) {
    case 'mainStat_pct':
      return convertToMainStat(ctx, { mainStat: ctx.mainStat * value / 100 });
    case 'allStat_pct':
      return convertToMainStat(ctx, { allStat: value });
    case 'atk_pct':
      return convertToMainStat(ctx, { attackPower: ctx.attackPower * value / 100 });
    case 'boss_dmg':
      return convertToMainStat(ctx, { bossDamage: value });
    case 'ied':
      return convertToMainStat(ctx, { ignoreDefense: value });
    case 'crit_dmg':
      return convertToMainStat(ctx, { critDamage: value });
    case 'damage_pct':
      return convertToMainStat(ctx, { damage: value });
    default:
      return 0;
  }
}
