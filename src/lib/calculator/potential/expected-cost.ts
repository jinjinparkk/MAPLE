/**
 * 잠재능력 재설정 기대비용 계산
 *
 * 알고리즘:
 * 1. 등급업 필요 시: E[tier-up cost] = E[resets] × reset cost
 *    - E[resets] = pity 보정된 기하분포 기댓값
 * 2. 타겟 줄 충족 확률: 줄별 옵션 풀에서 유효 조합의 확률 합산
 *    - Line 1: 100% prime pool
 *    - Line 2: gradeProb% prime + (1-gradeProb)% secondary
 *    - Line 3: gradeProb% prime + (1-gradeProb)% secondary
 * 3. E[target cost] = (1/P(success)) × reset cost
 * 4. E[total] = E[tier-up cost] + E[target cost]
 */

import type { StatContext } from '@/lib/calculator/stat-converter';
import type {
  PotentialGrade,
  PotentialType,
  EquipPotentialCategory,
  PotentialOption,
} from '@/lib/constants/potential-table';
import {
  getResetCost,
  TIER_UP_RATES,
  PITY_COUNT,
  LINE_GRADE_PROB,
  getOptionPool,
} from '@/lib/constants/potential-table';
import { getOptionConvertedStat } from './stat-value';

// ── 타겟 조건 ──

export interface PotentialTarget {
  label: string;
  /** 조건 판별 함수: 3줄 조합의 환산스탯 합이 이 값 이상이면 성공 */
  minConvertedStat?: number;
  /** 방어구용: 주스탯% + 올스탯% 합산 최소값 */
  minStatPercent?: number;
  /** 장갑용: 크뎀 줄 수 최소값 */
  minCritDmgLines?: number;
}

/**
 * 방어구/악세 타겟 티어 (stat% 기준)
 *
 * 250제: 레전 13% × 3줄 = 최대 39%
 * 일반: 레전 12% × 3줄 = 최대 36%
 */
export function getArmorTargets(currentStatPct: number, itemLevel: number): PotentialTarget[] {
  const tiers = [
    { pct: 21, label: '스탯 21%' },
    { pct: 27, label: '스탯 27%' },
    { pct: 30, label: '스탯 30%' },
    { pct: 33, label: '스탯 33%' },
    { pct: 36, label: '스탯 36%' },
  ];

  // 250제는 39% (13+13+13) 가능
  if (itemLevel >= 250) {
    tiers.push({ pct: 39, label: '스탯 39%' });
  }

  return tiers
    .filter((t) => t.pct > currentStatPct)
    .map((t) => ({ label: t.label, minStatPercent: t.pct }));
}

/**
 * 무기 타겟 티어 (환산주스탯 기준)
 */
export function getWeaponTargets(currentConverted: number): PotentialTarget[] {
  if (currentConverted <= 0) return [];
  const targets: PotentialTarget[] = [];

  // 현재 대비 +20%, +50%, +100% 개선
  for (const mult of [1.2, 1.5, 2.0]) {
    const target = Math.round(currentConverted * mult);
    if (target > currentConverted) {
      targets.push({
        label: `환산 ${target} (+${Math.round((mult - 1) * 100)}%)`,
        minConvertedStat: target,
      });
    }
  }
  return targets;
}

/**
 * 장갑 타겟 티어
 */
export function getGloveTargets(currentStatPct: number, currentCritLines: number): PotentialTarget[] {
  const targets: PotentialTarget[] = [];

  if (currentCritLines < 1) {
    targets.push({ label: '크뎀 1줄+스탯 21%', minCritDmgLines: 1, minStatPercent: 21 });
  }
  if (currentCritLines < 1 || currentStatPct < 27) {
    targets.push({ label: '크뎀 1줄+스탯 27%', minCritDmgLines: 1, minStatPercent: 27 });
  }
  if (currentCritLines < 2) {
    targets.push({ label: '크뎀 2줄', minCritDmgLines: 2 });
  }

  // 크뎀 없이 높은 스탯도 대안으로 제시
  if (currentStatPct < 33) {
    targets.push({ label: '스탯 33%', minStatPercent: 33 });
  }

  return targets;
}

// ── 기대비용 계산 ──

/** 천장(pity) 보정 기하분포 기댓값 */
function expectedTrialsWithPity(successProb: number, pity: number): number {
  // E[X] = Σ_{k=1}^{pity-1} k * p * (1-p)^{k-1} + pity * (1-p)^{pity-1}
  // 간소화: E = (1 - (1-p)^pity) / p 에 pity * (1-p)^(pity-1) 보정
  // 정확한 공식: E = Σ_{k=0}^{pity-1} (1-p)^k = (1 - (1-p)^pity) / p
  const q = 1 - successProb;
  const qPity = Math.pow(q, pity);
  return (1 - qPity) / successProb;
}

/**
 * 등급업 기대비용 (e.g. unique → legendary)
 */
export function getTierUpExpectedCost(
  potentialType: PotentialType,
  itemLevel: number,
  fromGrade: PotentialGrade,
  toGrade: PotentialGrade,
): number {
  if (fromGrade === toGrade) return 0;

  // 현재는 unique→legendary만 지원 (가장 일반적)
  const gradeOrder: PotentialGrade[] = ['rare', 'epic', 'unique', 'legendary'];
  const fromIdx = gradeOrder.indexOf(fromGrade);
  const toIdx = gradeOrder.indexOf(toGrade);
  if (fromIdx >= toIdx) return 0;

  let totalCost = 0;

  for (let i = fromIdx; i < toIdx; i++) {
    const currentGrade = gradeOrder[i];
    const nextGrade = gradeOrder[i + 1];
    const tierKey = `${currentGrade}_to_${nextGrade}`;
    const prob = TIER_UP_RATES[potentialType][tierKey];
    if (!prob) continue;

    const resetCost = getResetCost(potentialType, itemLevel, currentGrade);
    const pity = PITY_COUNT[potentialType];
    const expectedResets = expectedTrialsWithPity(prob, pity);

    totalCost += expectedResets * resetCost;
  }

  return totalCost;
}

// ── 줄 조합 확률 계산 ──

interface LineProbEntry {
  /** 환산 기여: mainStat% 또는 allStat% 환산 값 */
  convertedStat: number;
  /** 주스탯%(mainStat_pct value + allStat_pct value) 합산 */
  statPercent: number;
  /** 크뎀 줄인지 */
  isCritDmg: boolean;
  /** 이 옵션이 뽑힐 확률 */
  prob: number;
}

function buildLineProbEntries(
  pool: PotentialOption[],
  ctx: StatContext,
): LineProbEntry[] {
  const totalWeight = pool.reduce((s, o) => s + o.weight, 0);
  return pool.map((opt) => ({
    convertedStat: getOptionConvertedStat(opt.type, opt.value, ctx),
    statPercent: opt.type === 'mainStat_pct' ? opt.value
      : opt.type === 'allStat_pct' ? opt.value
      : 0,
    isCritDmg: opt.type === 'crit_dmg',
    prob: opt.weight / totalWeight,
  }));
}

/**
 * 특정 줄의 옵션 확률 분포 계산
 *
 * 줄의 등급확률(gradeProb)에 따라 prime/secondary 풀을 혼합
 */
function getLineProbDistribution(
  primeEntries: LineProbEntry[],
  secondaryEntries: LineProbEntry[],
  gradeProb: number,
): LineProbEntry[] {
  // gradeProb 확률로 prime, (1-gradeProb) 확률로 secondary
  const result: LineProbEntry[] = [];

  for (const e of primeEntries) {
    result.push({ ...e, prob: e.prob * gradeProb });
  }
  for (const e of secondaryEntries) {
    result.push({ ...e, prob: e.prob * (1 - gradeProb) });
  }

  return result;
}

/**
 * 3줄 조합의 성공 확률 합산
 *
 * 최적화: 같은 (convertedStat, statPercent, isCritDmg) 값을 가진 엔트리들을
 * 버킷으로 그룹화하여 열거 횟수를 줄임
 */
interface BucketEntry {
  convertedStat: number;
  statPercent: number;
  critDmgCount: number; // 0 or 1
  prob: number;
}

function bucketize(entries: LineProbEntry[]): BucketEntry[] {
  const map = new Map<string, BucketEntry>();
  for (const e of entries) {
    const key = `${e.convertedStat.toFixed(2)}|${e.statPercent}|${e.isCritDmg ? 1 : 0}`;
    const existing = map.get(key);
    if (existing) {
      existing.prob += e.prob;
    } else {
      map.set(key, {
        convertedStat: e.convertedStat,
        statPercent: e.statPercent,
        critDmgCount: e.isCritDmg ? 1 : 0,
        prob: e.prob,
      });
    }
  }
  return Array.from(map.values());
}

/**
 * 타겟 조건을 충족하는 3줄 조합의 확률 합산
 */
function calcSuccessProb(
  line1Dist: LineProbEntry[],
  line2Dist: LineProbEntry[],
  line3Dist: LineProbEntry[],
  target: PotentialTarget,
  currentConvertedStat: number,
): number {
  const b1 = bucketize(line1Dist);
  const b2 = bucketize(line2Dist);
  const b3 = bucketize(line3Dist);

  let successProb = 0;

  for (const e1 of b1) {
    for (const e2 of b2) {
      for (const e3 of b3) {
        const totalConverted = e1.convertedStat + e2.convertedStat + e3.convertedStat;
        const totalStatPct = e1.statPercent + e2.statPercent + e3.statPercent;
        const totalCritLines = e1.critDmgCount + e2.critDmgCount + e3.critDmgCount;

        let meets = true;

        if (target.minConvertedStat !== undefined) {
          if (totalConverted < target.minConvertedStat) meets = false;
        }

        if (target.minStatPercent !== undefined) {
          if (totalStatPct < target.minStatPercent) meets = false;
        }

        if (target.minCritDmgLines !== undefined) {
          if (totalCritLines < target.minCritDmgLines) meets = false;
        }

        if (meets) {
          successProb += e1.prob * e2.prob * e3.prob;
        }
      }
    }
  }

  return successProb;
}

// ── 결과 캐싱 ──
const costCache = new Map<string, number>();

/**
 * 잠재능력 재설정 기대비용 (메소)
 *
 * @param equipCategory 장비 부위 카테고리
 * @param itemLevel 장비 레벨
 * @param currentGrade 현재 잠재등급
 * @param targetGrade 목표 잠재등급 (보통 legendary)
 * @param target 목표 조건
 * @param ctx 캐릭터 스탯 컨텍스트
 * @param potentialType 윗잠/에디
 * @param currentConvertedStat 현재 잠재의 환산주스탯 (무기용)
 */
export function getExpectedResetCost(
  equipCategory: EquipPotentialCategory,
  itemLevel: number,
  currentGrade: PotentialGrade,
  targetGrade: PotentialGrade,
  target: PotentialTarget,
  ctx: StatContext,
  potentialType: PotentialType,
  currentConvertedStat: number = 0,
): number {
  const cacheKey = `${equipCategory}|${itemLevel}|${currentGrade}|${targetGrade}|${target.label}|${potentialType}|${ctx.mainStat}|${ctx.attackPower}`;
  const cached = costCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // 1. 등급업 비용
  const tierUpCost = getTierUpExpectedCost(potentialType, itemLevel, currentGrade, targetGrade);

  // 2. 타겟 줄 확률 계산
  const pool = getOptionPool(equipCategory, potentialType, itemLevel);
  const primeEntries = buildLineProbEntries(pool.prime, ctx);
  const secondaryEntries = buildLineProbEntries(pool.secondary, ctx);

  const lineGradeProb = LINE_GRADE_PROB[potentialType];

  // Line 1: 100% prime (legendary 등급)
  const line1Dist = getLineProbDistribution(primeEntries, secondaryEntries, 1.0);
  // Line 2: lineGradeProb.line2 확률로 legendary, 나머지 unique
  const line2Dist = getLineProbDistribution(primeEntries, secondaryEntries, lineGradeProb.line2);
  // Line 3: lineGradeProb.line3 확률로 legendary, 나머지 unique
  const line3Dist = getLineProbDistribution(primeEntries, secondaryEntries, lineGradeProb.line3);

  const successProb = calcSuccessProb(line1Dist, line2Dist, line3Dist, target, currentConvertedStat);

  let targetCost: number;
  if (successProb <= 0) {
    targetCost = Infinity;
  } else {
    const resetCost = getResetCost(potentialType, itemLevel, targetGrade);
    targetCost = (1 / successProb) * resetCost;
  }

  const totalCost = tierUpCost + targetCost;

  costCache.set(cacheKey, totalCost);
  return totalCost;
}

/**
 * 3줄의 주스탯%+올스탯% 합산 계산 (방어구/장갑용)
 */
export function getCurrentStatPercent(lines: { type: string; value: number }[]): number {
  let total = 0;
  for (const line of lines) {
    if (line.type === 'mainStat_pct' || line.type === 'allStat_pct') {
      total += line.value;
    }
  }
  return total;
}

/**
 * 크뎀 줄 수 계산 (장갑용)
 */
export function getCurrentCritLines(lines: { type: string }[]): number {
  return lines.filter((l) => l.type === 'crit_dmg').length;
}
