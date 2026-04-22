import type { StatContext } from '@/lib/calculator/stat-converter';
import { convertToMainStat } from '@/lib/calculator/stat-converter';
import {
  getExpectedTotalCost,
  SHATARFORCE_OPTIONS,
  NORMAL_OPTIONS,
} from '@/lib/calculator/starforce/expected-cost';
import { getTotalStarforceStatGain } from '@/lib/calculator/starforce';
import {
  parsePotential,
  getPotentialConvertedStat,
  getExpectedResetResult,
  getCurrentStatPercent,
  getCurrentCritLines,
  getArmorTargets,
  getWeaponTargets,
  getGloveTargets,
} from '@/lib/calculator/potential';
import {
  getEquipmentPotentialCategory,
  parsePotentialGrade,
  POTENTIAL_EXCLUDED_PARTS,
} from '@/lib/constants/potential-table';
import type { PotentialType } from '@/lib/constants/potential-table';
import type { EquipmentItem, SymbolItem } from '@/lib/nexon-api/types';

export type UpgradeCategory = 'starforce' | 'potential';

export interface UpgradeCandidate {
  id: string;
  category: UpgradeCategory;
  label: string;
  description: string;
  /** 평소 기대비용 */
  expectedCost: number;
  /** 샤타포스 기대비용 (잠재능력은 평소와 동일) */
  expectedCostShatar: number;
  convertedStatGain: number;
  /** 평소 ROI (환산스탯/억) */
  roi: number;
  /** 샤타포스 ROI */
  roiShatar: number;
  equipmentName?: string;
  fromStar?: number;
  toStar?: number;
  symbolName?: string;
  fromLevel?: number;
  toLevel?: number;
  /** 장비 레벨 (스타포스 후보용) */
  itemLevel?: number;
  /** 잠재능력 타입 */
  potentialType?: PotentialType;
  /** 현재 잠재 요약 (e.g. "LUK 9%+9%+9% = 27%") */
  currentPotentialSummary?: string;
  /** 목표 잠재 라벨 (e.g. "스탯 33%") */
  targetPotentialLabel?: string;
  /** 같은 장비+타입의 후보끼리 중복 방지 그룹 */
  exclusionGroup?: string;
}

/** 스타포스 불가 장비 부위 */
const STARFORCE_EXCLUDED_PARTS = new Set([
  '훈장', '메달',
  '엠블렘',
  '뱃지',
  '칭호',
  '펫장비',
  '안드로이드',
  '포켓 아이템',
]);

/** 시드링/이벤트링 키워드 */
const STARFORCE_EXCLUDED_NAME_KEYWORDS = [
  '리스트레인트', '컨티뉴어스', '리미트', '엔들리스',
  '어웨이크', '코스모스', '글로리', '원더',
  '카오스', '이벤트',
];

/** 스타포스 가능한 보조무기 키워드 화이트리스트 */
const SUB_WEAPON_ALLOWED_KEYWORDS = [
  '아스트라', '실드', '쉴드', '방패', '블레이드', '포스실드', '소울실드',
];

function isStarforceableSubWeapon(item: EquipmentItem): boolean {
  const name = item.item_name;
  return SUB_WEAPON_ALLOWED_KEYWORDS.some((kw) => name.includes(kw));
}

function canStarforce(item: EquipmentItem): boolean {
  if (STARFORCE_EXCLUDED_PARTS.has(item.item_equipment_part)) return false;
  // 보조무기는 화이트리스트 키워드 포함 시만 허용
  if (item.item_equipment_part === '보조무기' && !isStarforceableSubWeapon(item)) return false;
  if (item.starforce === undefined || item.starforce === null) return false;
  if (item.special_ring_level > 0) return false;
  const name = item.item_name;
  for (const kw of STARFORCE_EXCLUDED_NAME_KEYWORDS) {
    if (name.includes(kw)) return false;
  }
  return true;
}

/** 타일런트(Superior) 장비 키워드 */
const SUPERIOR_KEYWORDS = ['타일런트'];

function isSuperiorItem(item: EquipmentItem): boolean {
  return SUPERIOR_KEYWORDS.some((kw) => item.item_name.includes(kw));
}

/** 아이템 레벨별 최대 강화 가능 성수 */
function getMaxStarByItemLevel(itemLevel: number): number {
  if (itemLevel >= 138) return 30;
  if (itemLevel >= 128) return 20;
  if (itemLevel >= 118) return 15;
  if (itemLevel >= 108) return 10;
  if (itemLevel >= 95) return 8;
  return 5;
}

/** 장비에서 레벨 추출 */
function getItemLevel(item: EquipmentItem): number {
  // base_equipment_level이 가장 정확
  const baseLevel = item.item_base_option?.base_equipment_level;
  if (baseLevel && baseLevel > 0) return baseLevel;
  // 이름으로 대략 추정 (앱솔=160, 아케인=200, 에테르넬=250 등)
  const name = item.item_name;
  if (name.includes('에테르넬') || name.includes('에테르널')) return 250;
  if (name.includes('아케인셰이드') || name.includes('아케인')) return 200;
  if (name.includes('앱솔랩스') || name.includes('앱솔')) return 160;
  if (name.includes('카오스 루즈') || name.includes('루즈컨트롤')) return 160;
  if (name.includes('파프니르')) return 150;
  if (name.includes('CRA') || name.includes('반레온')) return 150;
  if (name.includes('하이네스')) return 140;
  if (name.includes('펜살리르')) return 140;
  return 150; // 기본값
}

function generateStarforceCandidates(
  equipment: EquipmentItem[],
  ctx: StatContext,
): UpgradeCandidate[] {
  const candidates: UpgradeCandidate[] = [];

  for (const item of equipment) {
    if (!canStarforce(item)) continue;

    const currentStar = parseInt(item.starforce) || 0;
    const itemLevel = getItemLevel(item);

    const maxStar = isSuperiorItem(item) ? 15 : getMaxStarByItemLevel(itemLevel);
    const targets = [17, 22, 25, 30].filter((t) => t > currentStar && t <= maxStar);

    for (const targetStar of targets) {
      const normalCost = getExpectedTotalCost(
        currentStar, targetStar, itemLevel, undefined, NORMAL_OPTIONS,
      );
      const shatarCost = getExpectedTotalCost(
        currentStar, targetStar, itemLevel, undefined, SHATARFORCE_OPTIONS,
      );

      const statGain = getTotalStarforceStatGain(currentStar, targetStar, itemLevel);
      const converted = convertToMainStat(ctx, {
        mainStat: statGain.mainStat,
        attackPower: statGain.attackPower,
      });

      if (normalCost <= 0 || converted <= 0) continue;

      const roi = converted / (normalCost / 1e8);
      const roiShatar = converted / (shatarCost / 1e8);

      candidates.push({
        id: `sf-${item.item_name}-${currentStar}-${targetStar}`,
        category: 'starforce',
        label: `${item.item_name} ${currentStar}→${targetStar}성`,
        description: `스타포스 (Lv.${itemLevel})`,
        expectedCost: normalCost,
        expectedCostShatar: shatarCost,
        convertedStatGain: Math.round(converted * 10) / 10,
        roi: Math.round(roi * 100) / 100,
        roiShatar: Math.round(roiShatar * 100) / 100,
        equipmentName: item.item_name,
        fromStar: currentStar,
        toStar: targetStar,
        itemLevel,
      });
    }
  }

  return candidates;
}


/** 잠재능력 불가 판별 */
function canPotential(item: EquipmentItem): boolean {
  if (POTENTIAL_EXCLUDED_PARTS.has(item.item_equipment_part)) return false;
  if (item.special_ring_level > 0) return false;
  return true;
}

/** 현재 잠재 요약 텍스트 생성 */
function buildPotentialSummary(lines: { type: string; value: number; rawText: string }[]): string {
  if (lines.length === 0) return '없음';
  return lines
    .map((l) => {
      if (l.type === 'other') return '기타';
      return `${l.value}%`;
    })
    .join('+');
}

function generatePotentialCandidatesForType(
  equipment: EquipmentItem[],
  ctx: StatContext,
  potentialType: PotentialType,
): UpgradeCandidate[] {
  const candidates: UpgradeCandidate[] = [];

  for (const item of equipment) {
    if (!canPotential(item)) continue;

    const isMain = potentialType === 'main';
    const gradeStr = isMain
      ? item.potential_option_grade
      : item.additional_potential_option_grade;
    const line1 = isMain ? item.potential_option_1 : item.additional_potential_option_1;
    const line2 = isMain ? item.potential_option_2 : item.additional_potential_option_2;
    const line3 = isMain ? item.potential_option_3 : item.additional_potential_option_3;

    // 잠재가 없으면 스킵
    const grade = parsePotentialGrade(gradeStr);
    if (!grade) continue;
    // 레어/에픽은 ROI 대상에서 제외 (업그레이드 우선순위 낮음)
    if (grade === 'rare' || grade === 'epic') continue;

    const parsed = parsePotential(gradeStr, line1, line2, line3, ctx.jobName);
    const currentConverted = getPotentialConvertedStat(parsed, ctx);
    const currentStatPct = getCurrentStatPercent(parsed.lines);
    const currentCritLines = getCurrentCritLines(parsed.lines);

    const itemLevel = getItemLevel(item);
    const equipCategory = getEquipmentPotentialCategory(item.item_equipment_part);
    const targetGrade = 'legendary' as const;

    // 타겟 생성
    let targets;
    if (equipCategory === 'weapon') {
      targets = getWeaponTargets(potentialType);
    } else if (equipCategory === 'glove') {
      targets = getGloveTargets(currentStatPct, currentCritLines);
    } else {
      targets = getArmorTargets(currentStatPct, itemLevel);
    }

    const typeLabel = isMain ? '윗잠' : '에디';
    const exclusionGroup = `pot-${potentialType}-${item.item_name}`;
    const currentSummary = buildPotentialSummary(parsed.lines);

    for (const target of targets) {
      // 기대비용 + 기대환산스탯 동시 계산
      const result = getExpectedResetResult(
        equipCategory,
        itemLevel,
        grade,
        targetGrade,
        target,
        ctx,
        potentialType,
      );

      if (!isFinite(result.cost) || result.cost <= 0) continue;

      // 스탯 이득 = 타겟 달성 시 기대환산 - 현재 환산
      const statGain = result.expectedConvertedStat - currentConverted;
      if (statGain <= 0) continue;

      const roi = statGain / (result.cost / 1e8);

      candidates.push({
        id: `pot-${potentialType}-${item.item_name}-${target.label}`,
        category: 'potential',
        label: `${item.item_name} ${typeLabel} → ${target.label}`,
        description: `잠재능력 ${typeLabel} (Lv.${itemLevel})`,
        expectedCost: result.cost,
        expectedCostShatar: result.cost,
        convertedStatGain: Math.round(statGain * 10) / 10,
        roi: Math.round(roi * 100) / 100,
        roiShatar: Math.round(roi * 100) / 100,
        equipmentName: item.item_name,
        itemLevel,
        potentialType,
        currentPotentialSummary: `${currentSummary} (${grade})`,
        targetPotentialLabel: target.label,
        exclusionGroup,
      });
    }
  }

  return candidates;
}

function generatePotentialCandidates(
  equipment: EquipmentItem[],
  ctx: StatContext,
): UpgradeCandidate[] {
  const mainCandidates = generatePotentialCandidatesForType(equipment, ctx, 'main');
  const addiCandidates = generatePotentialCandidatesForType(equipment, ctx, 'additional');
  return [...mainCandidates, ...addiCandidates];
}


export function generateAllCandidates(
  equipment: EquipmentItem[],
  _symbols: SymbolItem[],
  ctx: StatContext,
): UpgradeCandidate[] {
  const starforceCandidates = generateStarforceCandidates(equipment, ctx);
  const potentialCandidates = generatePotentialCandidates(equipment, ctx);

  const all = [...starforceCandidates, ...potentialCandidates];
  all.sort((a, b) => b.roi - a.roi);

  return all;
}
