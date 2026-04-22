/**
 * 잠재능력 재설정 기대비용 계산
 *
 * 무기: 보뎀/방무/공% 줄 수 기반 타겟 (보뎀 2줄, 3줄 등)
 * 방어구: 스탯% 합산 기반 타겟 (21%, 27%, 33% 등)
 * 장갑: 크뎀 줄 수 + 스탯% 조합
 *
 * 3줄 조합 열거 → 성공확률 + 기대환산스탯 동시 계산
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
  /** 방어구용: 주스탯% + 올스탯% 합산 최소값 */
  minStatPercent?: number;
  /** 장갑용: 크뎀 줄 수 최소값 */
  minCritDmgLines?: number;
  /** 무기용: 보뎀 줄 수 최소값 */
  minBossDmgLines?: number;
  /** 무기용: 공/마% 줄 수 최소값 */
  minAtkLines?: number;
}

/**
 * 방어구/악세 타겟 티어 (stat% 기준)
 *
 * 윗잠: 21/27/30/33/36% (250제 39%)
 * 에디: 21%만 현실적 (줄 등급 0.5%로 2줄 이상 레전 비현실적)
 */
export function getArmorTargets(
  currentStatPct: number,
  itemLevel: number,
  potentialType?: PotentialType,
): PotentialTarget[] {
  // 에디는 줄 등급 확률이 0.5%이므로 높은 타겟은 비현실적
  if (potentialType === 'additional') {
    const tiers = [
      { pct: 21, label: '스탯 21%' },
    ];
    return tiers
      .filter((t) => t.pct > currentStatPct)
      .map((t) => ({ label: t.label, minStatPercent: t.pct }));
  }

  const tiers = [
    { pct: 21, label: '스탯 21%' },
    { pct: 27, label: '스탯 27%' },
    { pct: 30, label: '스탯 30%' },
    { pct: 33, label: '스탯 33%' },
    { pct: 36, label: '스탯 36%' },
  ];

  if (itemLevel >= 250) {
    tiers.push({ pct: 39, label: '스탯 39%' });
  }

  return tiers
    .filter((t) => t.pct > currentStatPct)
    .map((t) => ({ label: t.label, minStatPercent: t.pct }));
}

/**
 * 무기/보조/엠블렘 타겟 티어 (줄 수 기반)
 *
 * 윗잠: 보뎀 2줄 → 보뎀 2줄+공/마 → 보뎀 3줄
 * 에디: 공/마 1줄 → 공/마 2줄 (에디 보뎀 12~18%로 낮아 공/마가 정석)
 */
export function getWeaponTargets(potentialType: PotentialType): PotentialTarget[] {
  if (potentialType === 'main') {
    return [
      { label: '보뎀 2줄', minBossDmgLines: 2 },
      { label: '보뎀 2줄+공/마', minBossDmgLines: 2, minAtkLines: 1 },
      { label: '보뎀 3줄', minBossDmgLines: 3 },
    ];
  }
  // additional — 에디 보뎀은 12~18%로 낮으므로 공/마%가 정석 타겟
  return [
    { label: '공/마 1줄', minAtkLines: 1 },
    { label: '공/마 2줄', minAtkLines: 2 },
  ];
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

  if (currentStatPct < 33) {
    targets.push({ label: '스탯 33%', minStatPercent: 33 });
  }

  return targets;
}

// ── 기대비용 계산 ──

/** 천장(pity) 보정 기하분포 기댓값 */
function expectedTrialsWithPity(successProb: number, pity: number): number {
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
    const pity = PITY_COUNT[potentialType][tierKey];
    const expectedResets = expectedTrialsWithPity(prob, pity);

    totalCost += expectedResets * resetCost;
  }

  return totalCost;
}

// ── 줄 조합 확률 계산 ──

interface LineProbEntry {
  convertedStat: number;
  statPercent: number;
  isCritDmg: boolean;
  isBossDmg: boolean;
  isAtk: boolean;
  prob: number;
}

function buildLineProbEntries(
  pool: PotentialOption[],
  ctx: StatContext,
): LineProbEntry[] {
  const totalWeight = pool.reduce((s, o) => s + o.weight, 0);
  return pool.map((opt) => ({
    convertedStat: getOptionConvertedStat(opt.type, opt.value, ctx),
    statPercent: (opt.type === 'mainStat_pct' || opt.type === 'allStat_pct') ? opt.value : 0,
    isCritDmg: opt.type === 'crit_dmg',
    isBossDmg: opt.type === 'boss_dmg',
    isAtk: opt.type === 'atk_pct',
    prob: opt.weight / totalWeight,
  }));
}

function getLineProbDistribution(
  primeEntries: LineProbEntry[],
  secondaryEntries: LineProbEntry[],
  gradeProb: number,
): LineProbEntry[] {
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
 * 버킷 엔트리: 같은 특성을 가진 옵션들을 그룹화
 */
interface BucketEntry {
  convertedStat: number;
  statPercent: number;
  critDmgCount: number;
  bossDmgCount: number;
  atkCount: number;
  prob: number;
}

function bucketize(entries: LineProbEntry[]): BucketEntry[] {
  const map = new Map<string, BucketEntry>();
  for (const e of entries) {
    const key = `${e.convertedStat.toFixed(2)}|${e.statPercent}|${e.isCritDmg ? 1 : 0}|${e.isBossDmg ? 1 : 0}|${e.isAtk ? 1 : 0}`;
    const existing = map.get(key);
    if (existing) {
      existing.prob += e.prob;
    } else {
      map.set(key, {
        convertedStat: e.convertedStat,
        statPercent: e.statPercent,
        critDmgCount: e.isCritDmg ? 1 : 0,
        bossDmgCount: e.isBossDmg ? 1 : 0,
        atkCount: e.isAtk ? 1 : 0,
        prob: e.prob,
      });
    }
  }
  return Array.from(map.values());
}

/**
 * 타겟 조건을 충족하는 3줄 조합의 확률 합산 + 기대환산스탯
 *
 * Returns:
 * - successProb: P(타겟 충족)
 * - expectedConverted: E[환산스탯 | 타겟 충족] (조건부 기대값)
 */
function calcTargetResult(
  line1Dist: LineProbEntry[],
  line2Dist: LineProbEntry[],
  line3Dist: LineProbEntry[],
  target: PotentialTarget,
): { successProb: number; expectedConverted: number } {
  const b1 = bucketize(line1Dist);
  const b2 = bucketize(line2Dist);
  const b3 = bucketize(line3Dist);

  let successProb = 0;
  let weightedConverted = 0;

  for (const e1 of b1) {
    for (const e2 of b2) {
      for (const e3 of b3) {
        const totalConverted = e1.convertedStat + e2.convertedStat + e3.convertedStat;
        const totalStatPct = e1.statPercent + e2.statPercent + e3.statPercent;
        const totalCritLines = e1.critDmgCount + e2.critDmgCount + e3.critDmgCount;
        const totalBossLines = e1.bossDmgCount + e2.bossDmgCount + e3.bossDmgCount;
        const totalAtkLines = e1.atkCount + e2.atkCount + e3.atkCount;

        let meets = true;

        if (target.minStatPercent !== undefined && totalStatPct < target.minStatPercent) {
          meets = false;
        }
        if (target.minCritDmgLines !== undefined && totalCritLines < target.minCritDmgLines) {
          meets = false;
        }
        if (target.minBossDmgLines !== undefined && totalBossLines < target.minBossDmgLines) {
          meets = false;
        }
        if (target.minAtkLines !== undefined && totalAtkLines < target.minAtkLines) {
          meets = false;
        }

        if (meets) {
          const p = e1.prob * e2.prob * e3.prob;
          successProb += p;
          weightedConverted += p * totalConverted;
        }
      }
    }
  }

  return {
    successProb,
    expectedConverted: successProb > 0 ? weightedConverted / successProb : 0,
  };
}

// ── 결과 ──

export interface ResetCostResult {
  /** 기대비용 (메소) */
  cost: number;
  /** 타겟 달성 시 기대환산스탯 (조건부 기대값) */
  expectedConvertedStat: number;
}

const resultCache = new Map<string, ResetCostResult>();

/**
 * 잠재능력 재설정 기대비용 + 기대환산스탯
 */
export function getExpectedResetResult(
  equipCategory: EquipPotentialCategory,
  itemLevel: number,
  currentGrade: PotentialGrade,
  targetGrade: PotentialGrade,
  target: PotentialTarget,
  ctx: StatContext,
  potentialType: PotentialType,
): ResetCostResult {
  const cacheKey = `${equipCategory}|${itemLevel}|${currentGrade}|${targetGrade}|${target.label}|${potentialType}|${ctx.mainStat}|${ctx.attackPower}`;
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  // 1. 등급업 비용
  const tierUpCost = getTierUpExpectedCost(potentialType, itemLevel, currentGrade, targetGrade);

  // 2. 타겟 줄 확률 + 기대환산 계산
  const pool = getOptionPool(equipCategory, potentialType, itemLevel);
  const primeEntries = buildLineProbEntries(pool.prime, ctx);
  const secondaryEntries = buildLineProbEntries(pool.secondary, ctx);

  const lineGradeProb = LINE_GRADE_PROB[potentialType];

  const line1Dist = getLineProbDistribution(primeEntries, secondaryEntries, 1.0);
  const line2Dist = getLineProbDistribution(primeEntries, secondaryEntries, lineGradeProb.line2);
  const line3Dist = getLineProbDistribution(primeEntries, secondaryEntries, lineGradeProb.line3);

  const { successProb, expectedConverted } = calcTargetResult(line1Dist, line2Dist, line3Dist, target);

  let targetCost: number;
  if (successProb <= 0) {
    targetCost = Infinity;
  } else {
    const resetCost = getResetCost(potentialType, itemLevel, targetGrade);
    targetCost = (1 / successProb) * resetCost;
  }

  const result: ResetCostResult = {
    cost: tierUpCost + targetCost,
    expectedConvertedStat: expectedConverted,
  };

  resultCache.set(cacheKey, result);
  return result;
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
