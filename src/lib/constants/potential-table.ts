/**
 * 잠재능력 시스템 상수 (2024 메소화 이후 기준)
 *
 * 윗잠(main potential) = 블랙 큐브 재설정 (블큐 확률 동일)
 * 에디(additional potential) = 에디셔널 큐브 재설정
 *
 * 데이터 소스: 넥슨 공식 확률 공개 페이지 + 테스트 월드 패치노트
 *
 * 주요 차이점:
 * - 250제: 레전 주스탯 13%, 유니크 10% (일반: 12%/9%)
 * - 에디: 레전 주스탯 10%, 유니크 6% (윗잠보다 낮음)
 * - 에디 무기: 보뎀 12%, 방무 10% (윗잠: 30~40%)
 * - 에디 장갑: 크뎀 4% (윗잠: 8%)
 * - 줄 등급: 윗잠 2줄 20%/3줄 5%, 에디 2줄 0.4975%/3줄 0.4975%
 */

export type PotentialGrade = 'rare' | 'epic' | 'unique' | 'legendary';

export type PotentialType = 'main' | 'additional';

export type EquipPotentialCategory = 'weapon' | 'glove' | 'armor';

// ── 재설정 비용 (메소) — 넥슨 테스트 월드 패치노트 기준 ──
export const MAIN_RESET_COST: Record<string, Record<PotentialGrade, number>> = {
  '1-159':   { rare: 4_000_000, epic: 16_000_000, unique: 34_000_000, legendary: 40_000_000 },
  '160-199': { rare: 4_250_000, epic: 17_000_000, unique: 36_125_000, legendary: 42_500_000 },
  '200-249': { rare: 4_500_000, epic: 18_000_000, unique: 38_250_000, legendary: 45_000_000 },
  '250+':    { rare: 5_000_000, epic: 20_000_000, unique: 42_500_000, legendary: 50_000_000 },
};

export const ADDI_RESET_COST: Record<string, Record<PotentialGrade, number>> = {
  '1-159':   { rare: 13_000_000, epic: 36_400_000, unique: 44_200_000, legendary: 52_000_000 },
  '160-199': { rare: 13_812_500, epic: 38_675_000, unique: 46_962_500, legendary: 55_250_000 },
  '200-249': { rare: 14_625_000, epic: 40_950_000, unique: 49_725_000, legendary: 58_500_000 },
  '250+':    { rare: 16_250_000, epic: 45_500_000, unique: 55_250_000, legendary: 65_000_000 },
};

export function getLevelBracket(itemLevel: number): string {
  if (itemLevel >= 250) return '250+';
  if (itemLevel >= 200) return '200-249';
  if (itemLevel >= 160) return '160-199';
  return '1-159';
}

export function getResetCost(
  potentialType: PotentialType,
  itemLevel: number,
  grade: PotentialGrade,
): number {
  const bracket = getLevelBracket(itemLevel);
  const table = potentialType === 'main' ? MAIN_RESET_COST : ADDI_RESET_COST;
  return table[bracket][grade];
}

// ── 등급업 확률 (넥슨 공식 확률 공개) ──
export const TIER_UP_RATES: Record<PotentialType, Record<string, number>> = {
  main: {
    'rare_to_epic': 0.15,
    'epic_to_unique': 0.035,
    'unique_to_legendary': 0.014,
  },
  additional: {
    'rare_to_epic': 0.02381,
    'epic_to_unique': 0.009804,
    'unique_to_legendary': 0.007,
  },
};

// ── 천장(pity) — 등급 전환별 개별 천장 ──
export const PITY_COUNT: Record<PotentialType, Record<string, number>> = {
  main: {
    'rare_to_epic': 10,
    'epic_to_unique': 42,
    'unique_to_legendary': 107,
  },
  additional: {
    'rare_to_epic': 62,
    'epic_to_unique': 152,
    'unique_to_legendary': 214,
  },
};

// ── 줄 등급 확률 (블큐=윗잠 재설정, 에디큐=에디 재설정) ──
export const LINE_GRADE_PROB: Record<PotentialType, { line2: number; line3: number }> = {
  main: {
    line2: 0.20,
    line3: 0.05,
  },
  additional: {
    line2: 0.004975,
    line3: 0.004975,
  },
};

// ── 줄 옵션 가중치 ──

export interface PotentialOption {
  key: string;
  label: string;
  type: 'mainStat_pct' | 'allStat_pct' | 'atk_pct' | 'boss_dmg' | 'ied' | 'crit_dmg' | 'damage_pct' | 'other';
  value: number;
  weight: number;
}

// ════════════════════════════════════════
//  윗잠 (main) — 일반 (Lv < 250)
// ═══════���════════════════════════════════

const MAIN_WEAPON_LEG: PotentialOption[] = [
  { key: 'boss40', label: '보스뎀 40%', type: 'boss_dmg', value: 40, weight: 6 },
  { key: 'boss35', label: '보스뎀 35%', type: 'boss_dmg', value: 35, weight: 8 },
  { key: 'boss30', label: '보스뎀 30%', type: 'boss_dmg', value: 30, weight: 8 },
  { key: 'ied40', label: '방무 40%', type: 'ied', value: 40, weight: 6 },
  { key: 'ied35', label: '방무 35%', type: 'ied', value: 35, weight: 8 },
  { key: 'atk12', label: '공/마 12%', type: 'atk_pct', value: 12, weight: 8 },
  { key: 'stat12', label: '주스탯 12%', type: 'mainStat_pct', value: 12, weight: 10 },
  { key: 'allstat9', label: '올스탯 9%', type: 'allStat_pct', value: 9, weight: 6 },
  { key: 'dmg12', label: '데미지 12%', type: 'damage_pct', value: 12, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 32 },
];

const MAIN_WEAPON_UNI: PotentialOption[] = [
  { key: 'boss30u', label: '보스뎀 30%', type: 'boss_dmg', value: 30, weight: 8 },
  { key: 'ied30u', label: '방무 30%', type: 'ied', value: 30, weight: 8 },
  { key: 'atk9', label: '공/마 9%', type: 'atk_pct', value: 9, weight: 10 },
  { key: 'stat9', label: '주스탯 9%', type: 'mainStat_pct', value: 9, weight: 10 },
  { key: 'allstat6', label: '��스탯 6%', type: 'allStat_pct', value: 6, weight: 8 },
  { key: 'dmg9', label: '데미지 9%', type: 'damage_pct', value: 9, weight: 8 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 48 },
];

const MAIN_GLOVE_LEG: PotentialOption[] = [
  { key: 'critdmg8', label: '크뎀 8%', type: 'crit_dmg', value: 8, weight: 5 },
  { key: 'stat12', label: '주���탯 12%', type: 'mainStat_pct', value: 12, weight: 14 },
  { key: 'allstat9', label: '올스�� 9%', type: 'allStat_pct', value: 9, weight: 8 },
  { key: 'atk12', label: '공/마 12%', type: 'atk_pct', value: 12, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 65 },
];

const MAIN_GLOVE_UNI: PotentialOption[] = [
  { key: 'stat9', label: '주스탯 9%', type: 'mainStat_pct', value: 9, weight: 14 },
  { key: 'allstat6', label: '올스탯 6%', type: 'allStat_pct', value: 6, weight: 10 },
  { key: 'atk9', label: '공/마 9%', type: 'atk_pct', value: 9, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 66 },
];

const MAIN_ARMOR_LEG: PotentialOption[] = [
  { key: 'stat12', label: '주스탯 12%', type: 'mainStat_pct', value: 12, weight: 14 },
  { key: 'allstat9', label: '올스탯 9%', type: 'allStat_pct', value: 9, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 78 },
];

const MAIN_ARMOR_UNI: PotentialOption[] = [
  { key: 'stat9', label: '주스탯 9%', type: 'mainStat_pct', value: 9, weight: 14 },
  { key: 'allstat6', label: '올스탯 6%', type: 'allStat_pct', value: 6, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 76 },
];

// ════════════════════════════════════════
//  윗잠 (main) — 250제 (Lv ≥ 250)
//  레전 주스탯 13%, 올스탯 10%, 공/마 13%
//  유니크 주스탯 10%, 올스탯 7%, 공/마 10%
// ════════════════════════════════════════

const MAIN250_WEAPON_LEG: PotentialOption[] = [
  { key: 'boss40', label: '보스뎀 40%', type: 'boss_dmg', value: 40, weight: 6 },
  { key: 'boss35', label: '보스뎀 35%', type: 'boss_dmg', value: 35, weight: 8 },
  { key: 'boss30', label: '보스뎀 30%', type: 'boss_dmg', value: 30, weight: 8 },
  { key: 'ied40', label: '방무 40%', type: 'ied', value: 40, weight: 6 },
  { key: 'ied35', label: '방무 35%', type: 'ied', value: 35, weight: 8 },
  { key: 'atk13', label: '공/마 13%', type: 'atk_pct', value: 13, weight: 8 },
  { key: 'stat13', label: '주스탯 13%', type: 'mainStat_pct', value: 13, weight: 10 },
  { key: 'allstat10', label: '올스탯 10%', type: 'allStat_pct', value: 10, weight: 6 },
  { key: 'dmg13', label: '데미지 13%', type: 'damage_pct', value: 13, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 32 },
];

const MAIN250_WEAPON_UNI: PotentialOption[] = [
  { key: 'boss30u', label: '보스뎀 30%', type: 'boss_dmg', value: 30, weight: 8 },
  { key: 'ied30u', label: '방무 30%', type: 'ied', value: 30, weight: 8 },
  { key: 'atk10', label: '공/마 10%', type: 'atk_pct', value: 10, weight: 10 },
  { key: 'stat10', label: '주스탯 10%', type: 'mainStat_pct', value: 10, weight: 10 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 8 },
  { key: 'dmg10', label: '데미지 10%', type: 'damage_pct', value: 10, weight: 8 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 48 },
];

const MAIN250_GLOVE_LEG: PotentialOption[] = [
  { key: 'critdmg8', label: '크뎀 8%', type: 'crit_dmg', value: 8, weight: 5 },
  { key: 'stat13', label: '주스탯 13%', type: 'mainStat_pct', value: 13, weight: 14 },
  { key: 'allstat10', label: '올스탯 10%', type: 'allStat_pct', value: 10, weight: 8 },
  { key: 'atk13', label: '공/마 13%', type: 'atk_pct', value: 13, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 65 },
];

const MAIN250_GLOVE_UNI: PotentialOption[] = [
  { key: 'stat10', label: '주스탯 10%', type: 'mainStat_pct', value: 10, weight: 14 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 10 },
  { key: 'atk10', label: '공/마 10%', type: 'atk_pct', value: 10, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 66 },
];

const MAIN250_ARMOR_LEG: PotentialOption[] = [
  { key: 'stat13', label: '주스탯 13%', type: 'mainStat_pct', value: 13, weight: 14 },
  { key: 'allstat10', label: '올스탯 10%', type: 'allStat_pct', value: 10, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 78 },
];

const MAIN250_ARMOR_UNI: PotentialOption[] = [
  { key: 'stat10', label: '주스탯 10%', type: 'mainStat_pct', value: 10, weight: 14 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 76 },
];

// ═══���═════════════���══════════════════════
//  에디 (additional) — 전 레벨 공통
//  레전 주스탯 10%, 올스탯 7%, 공/마 10%
//  유니크 주스탯 6%, 올스탯 4%, 공/��� 6%
//  무기: 보뎀 12%, 방무 10% (레전) / 보뎀 8%, 방무 6% (유니크)
//  ��갑: 크뎀 4%
// ════��═══════════════════════════════════

const ADDI_WEAPON_LEG: PotentialOption[] = [
  { key: 'boss12', label: '보스뎀 12%', type: 'boss_dmg', value: 12, weight: 8 },
  { key: 'ied10', label: '방무 10%', type: 'ied', value: 10, weight: 8 },
  { key: 'atk10', label: '공/마 10%', type: 'atk_pct', value: 10, weight: 8 },
  { key: 'stat10', label: '���스탯 10%', type: 'mainStat_pct', value: 10, weight: 10 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 6 },
  { key: 'dmg10', label: '데미지 10%', type: 'damage_pct', value: 10, weight: 6 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 54 },
];

const ADDI_WEAPON_UNI: PotentialOption[] = [
  { key: 'boss8u', label: '보스뎀 8%', type: 'boss_dmg', value: 8, weight: 8 },
  { key: 'ied6u', label: '방무 6%', type: 'ied', value: 6, weight: 8 },
  { key: 'atk6', label: '공/마 6%', type: 'atk_pct', value: 6, weight: 10 },
  { key: 'stat6', label: '주스탯 6%', type: 'mainStat_pct', value: 6, weight: 10 },
  { key: 'allstat4', label: '올스탯 4%', type: 'allStat_pct', value: 4, weight: 8 },
  { key: 'dmg6', label: '데미지 6%', type: 'damage_pct', value: 6, weight: 8 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 48 },
];

const ADDI_GLOVE_LEG: PotentialOption[] = [
  { key: 'critdmg4', label: '크뎀 4%', type: 'crit_dmg', value: 4, weight: 5 },
  { key: 'stat10', label: '주스탯 10%', type: 'mainStat_pct', value: 10, weight: 14 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 8 },
  { key: 'atk10', label: '공/마 10%', type: 'atk_pct', value: 10, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 65 },
];

const ADDI_GLOVE_UNI: PotentialOption[] = [
  { key: 'stat6', label: '주스탯 6%', type: 'mainStat_pct', value: 6, weight: 14 },
  { key: 'allstat4', label: '올스탯 4%', type: 'allStat_pct', value: 4, weight: 10 },
  { key: 'atk6', label: '공/마 6%', type: 'atk_pct', value: 6, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 66 },
];

const ADDI_ARMOR_LEG: PotentialOption[] = [
  { key: 'stat10', label: '주스탯 10%', type: 'mainStat_pct', value: 10, weight: 14 },
  { key: 'allstat7', label: '올스탯 7%', type: 'allStat_pct', value: 7, weight: 8 },
  { key: 'other_l', label: '기타', type: 'other', value: 0, weight: 78 },
];

const ADDI_ARMOR_UNI: PotentialOption[] = [
  { key: 'stat6', label: '주스탯 6%', type: 'mainStat_pct', value: 6, weight: 14 },
  { key: 'allstat4', label: '올��탯 4%', type: 'allStat_pct', value: 4, weight: 10 },
  { key: 'other_u', label: '기타', type: 'other', value: 0, weight: 76 },
];

// ─── 옵션 풀 접근 ───

export interface OptionPool {
  prime: PotentialOption[];
  secondary: PotentialOption[];
}

/**
 * potentialType + itemLevel + equipCategory → 옵션 풀 반환
 *
 * - 윗잠 250제: 레전 13%/유니크 10%
 * - 윗잠 일반: 레전 12%/유니크 9%
 * - 에디: 레전 10%/유니크 6% (전 레벨 동일)
 */
export function getOptionPool(
  category: EquipPotentialCategory,
  potentialType: PotentialType,
  itemLevel: number,
): OptionPool {
  if (potentialType === 'additional') {
    switch (category) {
      case 'weapon': return { prime: ADDI_WEAPON_LEG, secondary: ADDI_WEAPON_UNI };
      case 'glove':  return { prime: ADDI_GLOVE_LEG, secondary: ADDI_GLOVE_UNI };
      case 'armor':  return { prime: ADDI_ARMOR_LEG, secondary: ADDI_ARMOR_UNI };
    }
  }

  // 윗잠 (main)
  const is250 = itemLevel >= 250;

  if (is250) {
    switch (category) {
      case 'weapon': return { prime: MAIN250_WEAPON_LEG, secondary: MAIN250_WEAPON_UNI };
      case 'glove':  return { prime: MAIN250_GLOVE_LEG, secondary: MAIN250_GLOVE_UNI };
      case 'armor':  return { prime: MAIN250_ARMOR_LEG, secondary: MAIN250_ARMOR_UNI };
    }
  }

  switch (category) {
    case 'weapon': return { prime: MAIN_WEAPON_LEG, secondary: MAIN_WEAPON_UNI };
    case 'glove':  return { prime: MAIN_GLOVE_LEG, secondary: MAIN_GLOVE_UNI };
    case 'armor':  return { prime: MAIN_ARMOR_LEG, secondary: MAIN_ARMOR_UNI };
  }
}

// ── 장비 부위 분류 ──

const WEAPON_PARTS = new Set(['무기', '보조무기', '엠블렘']);
const GLOVE_PARTS = new Set(['장갑']);

export function getEquipmentPotentialCategory(part: string): EquipPotentialCategory {
  if (WEAPON_PARTS.has(part)) return 'weapon';
  if (GLOVE_PARTS.has(part)) return 'glove';
  return 'armor';
}

// ── 등급 파싱 ──

export function parsePotentialGrade(gradeStr: string | null): PotentialGrade | null {
  if (!gradeStr) return null;
  const lower = gradeStr.toLowerCase();
  if (lower.includes('레전') || lower.includes('legendary')) return 'legendary';
  if (lower.includes('유니크') || lower.includes('unique')) return 'unique';
  if (lower.includes('에픽') || lower.includes('epic')) return 'epic';
  if (lower.includes('레어') || lower.includes('rare')) return 'rare';
  return null;
}

/** 잠재능력 불가 부위 */
export const POTENTIAL_EXCLUDED_PARTS = new Set([
  '훈장', '메달', '뱃지', '칭호', '펫장비', '안드로이드',
]);
