import { getAttemptCost } from './cost';
import { getStarforceProbability } from './probability';

/**
 * 파괴 시 아이템 재구매 비용: 0 (미반영)
 * 순수 스타포스 강화에 소모되는 메소만 계산.
 * 파괴 시 12성 복구 후 재강화 메소비용은 반영됨.
 */
function estimateItemCost(_itemLevel: number): number {
  return 0;
}

export interface StarforceCalcOptions {
  /** 시도 비용 할인율 (0.3 = 샤타포스 30% 할인) */
  costDiscount?: number;
  /** 100% 성공 보장 성수 (샤타포스: 5, 10, 15) */
  guaranteedStars?: Set<number>;
}

/**
 * 스타포스 기대비용 테이블 (2025.3 개편)
 *
 * E(n) = n성 → n+1성 기대비용 (파괴/재강화 반영, 하락 없음)
 *
 * n < 15:  E(n) = 비용 / 성공률  (파괴 없음, 실패=유지)
 * n >= 15: E(n) = [비용 + 파괴율×(아이템값 + ΣE(15..n-1))] / 성공률
 */
function buildExpectedCostTable(
  maxStar: number,
  itemLevel: number,
  itemCost: number,
  options: StarforceCalcOptions = {},
): number[] {
  const { costDiscount = 0, guaranteedStars } = options;
  const discountMult = 1 - costDiscount;

  const E: number[] = new Array(maxStar + 1).fill(0);
  let sumFrom15 = 0;

  for (let n = 0; n < maxStar; n++) {
    // 보장 성수면 비용만 내고 바로 성공
    if (guaranteedStars?.has(n)) {
      const cost = getAttemptCost(n, itemLevel) * discountMult;
      E[n] = cost;
      if (n >= 15) sumFrom15 += E[n];
      continue;
    }

    const { success: ps, destroy: pd } = getStarforceProbability(n);
    const cost = getAttemptCost(n, itemLevel) * discountMult;

    if (ps === 0) {
      E[n] = Infinity;
      continue;
    }

    if (n < 15) {
      // 파괴 없음, 실패 시 유지 → 단순 기하분포
      E[n] = cost / ps;
    } else {
      // 실패 시 유지, 파괴 시 15성부터 재강화
      E[n] = (cost + pd * (itemCost + sumFrom15)) / ps;
      sumFrom15 += E[n];
    }
  }

  return E;
}

/** 캐시 */
const tableCache = new Map<string, number[]>();

function getCacheKey(
  itemLevel: number,
  itemCost: number,
  options: StarforceCalcOptions,
): string {
  const d = options.costDiscount ?? 0;
  const g = options.guaranteedStars ? [...options.guaranteedStars].sort().join(',') : '';
  return `${itemLevel}:${itemCost}:${d}:${g}`;
}

function getTable(
  itemLevel: number,
  itemCost?: number,
  options: StarforceCalcOptions = {},
): number[] {
  const cost = itemCost ?? estimateItemCost(itemLevel);
  const key = getCacheKey(itemLevel, cost, options);
  let table = tableCache.get(key);
  if (!table) {
    table = buildExpectedCostTable(30, itemLevel, cost, options);
    tableCache.set(key, table);
  }
  return table;
}

// ── 샤타포스 프리셋 ──
export const SHATARFORCE_OPTIONS: StarforceCalcOptions = {
  costDiscount: 0.3,
  guaranteedStars: new Set([5, 10, 15]),
};

export const NORMAL_OPTIONS: StarforceCalcOptions = {};

/**
 * n성 → n+1성 기대비용
 */
export function getExpectedCostPerStep(
  currentStar: number,
  itemLevel: number,
  itemCost?: number,
  options?: StarforceCalcOptions,
): number {
  const table = getTable(itemLevel, itemCost, options);
  return Math.round(table[currentStar] ?? Infinity);
}

/**
 * fromStar → toStar 총 기대비용
 */
export function getExpectedTotalCost(
  fromStar: number,
  toStar: number,
  itemLevel: number,
  itemCost?: number,
  options?: StarforceCalcOptions,
): number {
  const table = getTable(itemLevel, itemCost, options);
  let total = 0;
  for (let n = fromStar; n < toStar; n++) {
    total += table[n] ?? 0;
  }
  return Math.round(total);
}
