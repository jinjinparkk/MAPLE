import type { StatContext } from '@/lib/calculator/stat-converter';
import { convertToMainStat } from '@/lib/calculator/stat-converter';
import {
  getExpectedTotalCost,
  SHATARFORCE_OPTIONS,
  NORMAL_OPTIONS,
} from '@/lib/calculator/starforce/expected-cost';
import { getTotalStarforceStatGain } from '@/lib/calculator/starforce';
import { getSymbolLevelUpCost } from '@/lib/calculator/symbol';
import { getSymbolStatGain } from '@/lib/calculator/symbol';
import type { EquipmentItem, SymbolItem } from '@/lib/nexon-api/types';
import { getSymbolType, getSymbolMaxLevel } from '@/lib/constants/symbol-table';

export type UpgradeCategory = 'starforce' | 'symbol';

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

/** 스타포스 불가 장비 부위 (item_equipment_part 기준) */
const STARFORCE_EXCLUDED_PARTS = new Set([
  '훈장', '메달',
  '엠블렘',
  '뱃지',
  '칭호',
  '펫장비',
  '안드로이드',
  '포켓 아이템',
]);

/** 스타포스 불가 장비 슬롯 (item_equipment_slot 기준, 직업별 part 이름이 달라도 slot은 동일) */
const STARFORCE_EXCLUDED_SLOTS = new Set([
  '보조무기',
]);

/** 이벤트링 / 시드링 / 스타포스 불가 반지 키워드 */
const STARFORCE_EXCLUDED_NAME_KEYWORDS = [
  // 시드링
  '리스트레인트', '컨티뉴어스', '리미트', '엔들리스',
  // 1티어 이벤트링
  '테네브리스', '글로리온', '어웨이크', '이터널 플레임',
  // 2티어 이벤트링
  '카오스 링', '어비스 헌터스', '크리티컬링', '딥다크',
  // 3티어 이벤트링
  '쥬얼링', '오닉스', '코스모스', '벤젼스', '결속의 반지',
  // 4티어 이벤트링
  '글로리', '원더',
  // 기타
  '이벤트',
];

/**
 * 장비별 현실적 스타포스 목표 성 목록 (유저 메타 기반)
 * - 이론적 최대가 아닌, 실제 효율적인 목표만 추천
 */
function getRealisticTargets(item: EquipmentItem): number[] {
  const name = item.item_name;
  const itemLevel = getItemLevel(item);

  // 타일런트(슈페리얼): 12성이 현실적 종착지 (최대 15성이지만 13성↑ 효율 급감)
  if (name.includes('타일런트')) return [12];

  // 118~127제: 최대 15성
  if (itemLevel <= 127) return [15];

  // 128~137제 (플라즈마 하트, 마이스터링, 데이브레이크 펜던트 등): 17성, 20성
  if (itemLevel <= 137) return [17, 20];

  // 138제 이상 일반 장비: 17성, 22성
  return [17, 22];
}

function canStarforce(item: EquipmentItem): boolean {
  if (STARFORCE_EXCLUDED_PARTS.has(item.item_equipment_part)) return false;
  if (STARFORCE_EXCLUDED_SLOTS.has(item.item_equipment_slot)) return false;
  if (item.starforce === undefined || item.starforce === null) return false;
  if (item.special_ring_level > 0) return false;
  const name = item.item_name;
  for (const kw of STARFORCE_EXCLUDED_NAME_KEYWORDS) {
    if (name.includes(kw)) return false;
  }
  return true;
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

    // 장비별 현실적 목표 성만 추천
    const targets = getRealisticTargets(item).filter((t) => t > currentStar);

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

function generateSymbolCandidates(
  symbols: SymbolItem[],
  _ctx: StatContext,
): UpgradeCandidate[] {
  const candidates: UpgradeCandidate[] = [];

  for (const symbol of symbols) {
    const currentLevel = symbol.symbol_level;
    const type = getSymbolType(symbol.symbol_name);
    const maxLevel = getSymbolMaxLevel(type);
    if (currentLevel >= maxLevel) continue;

    const cost = getSymbolLevelUpCost(symbol.symbol_name, currentLevel);
    const statGain = getSymbolStatGain(symbol.symbol_name);
    if (cost <= 0) continue;

    const roi = statGain / (cost / 1e8);

    candidates.push({
      id: `sym-${symbol.symbol_name}-${currentLevel}`,
      category: 'symbol',
      label: `${symbol.symbol_name} ${currentLevel}→${currentLevel + 1}`,
      description: `심볼 레벨업`,
      expectedCost: cost,
      expectedCostShatar: cost, // 심볼은 이벤트 무관
      convertedStatGain: statGain,
      roi: Math.round(roi * 100) / 100,
      roiShatar: Math.round(roi * 100) / 100,
      symbolName: symbol.symbol_name,
      fromLevel: currentLevel,
      toLevel: currentLevel + 1,
    });
  }

  return candidates;
}

export function generateAllCandidates(
  equipment: EquipmentItem[],
  symbols: SymbolItem[],
  ctx: StatContext,
): UpgradeCandidate[] {
  const starforceCandidates = generateStarforceCandidates(equipment, ctx);
  const symbolCandidates = generateSymbolCandidates(symbols, ctx);

  const all = [...starforceCandidates, ...symbolCandidates];
  all.sort((a, b) => b.roi - a.roi);

  return all;
}
