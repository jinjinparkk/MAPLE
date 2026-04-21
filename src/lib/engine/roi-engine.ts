import type { StatContext } from '@/lib/calculator/stat-converter';
import { convertToMainStat } from '@/lib/calculator/stat-converter';
import {
  getExpectedTotalCost,
  SHATARFORCE_OPTIONS,
  NORMAL_OPTIONS,
} from '@/lib/calculator/starforce/expected-cost';
import { getTotalStarforceStatGain } from '@/lib/calculator/starforce';
import type { EquipmentItem, SymbolItem } from '@/lib/nexon-api/types';

export type UpgradeCategory = 'starforce';

export interface UpgradeCandidate {
  id: string;
  category: UpgradeCategory;
  label: string;
  description: string;
  /** 평소 기대비용 */
  expectedCost: number;
  /** 샤타포스 기대비용 */
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

    const maxStar = getMaxStarByItemLevel(itemLevel);
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


export function generateAllCandidates(
  equipment: EquipmentItem[],
  _symbols: SymbolItem[],
  ctx: StatContext,
): UpgradeCandidate[] {
  const starforceCandidates = generateStarforceCandidates(equipment, ctx);

  starforceCandidates.sort((a, b) => b.roi - a.roi);

  return starforceCandidates;
}
