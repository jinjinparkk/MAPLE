/**
 * 심볼 레벨업 관련 상수 테이블
 */

export type SymbolType = 'arcane' | 'authentic';

/** 아케인심볼 레벨별 성장 비용 (심볼 개수) */
export const ARCANE_GROWTH_COST: Record<number, number> = {
  1: 12, 2: 15, 3: 20, 4: 27, 5: 36,
  6: 47, 7: 60, 8: 75, 9: 92, 10: 111,
  11: 132, 12: 155, 13: 180, 14: 207, 15: 236,
  16: 267, 17: 300, 18: 335, 19: 372,
  // 20은 만렙
};

/** 어센틱심볼 레벨별 성장 비용 (심볼 개수) */
export const AUTHENTIC_GROWTH_COST: Record<number, number> = {
  1: 29, 2: 76, 3: 141, 4: 224, 5: 325,
  6: 444, 7: 581, 8: 736, 9: 909,
  // 10은 만렙, 11은 만렙
};

/** 아케인심볼 레벨업 메소 비용 */
export const ARCANE_MESO_COST: Record<number, number> = {
  1: 7_120_000, 2: 8_900_000, 3: 11_860_000, 4: 16_010_000, 5: 21_350_000,
  6: 27_880_000, 7: 35_600_000, 8: 44_510_000, 9: 54_610_000, 10: 65_900_000,
  11: 78_380_000, 12: 92_050_000, 13: 106_910_000, 14: 122_960_000, 15: 140_200_000,
  16: 158_630_000, 17: 178_250_000, 18: 199_060_000, 19: 221_060_000,
};

/** 어센틱심볼 레벨업 메소 비용 */
export const AUTHENTIC_MESO_COST: Record<number, number> = {
  1: 50_000_000, 2: 131_560_000, 3: 243_880_000, 4: 386_960_000, 5: 562_500_000,
  6: 768_320_000, 7: 1_005_160_000, 8: 1_272_640_000, 9: 1_572_200_000,
};

/** 심볼 레벨별 주스탯 증가량 */
export function getSymbolStatPerLevel(type: SymbolType): number {
  return type === 'arcane' ? 100 : 200;
}

/** 심볼 이름으로 타입 판별 */
export function getSymbolType(symbolName: string): SymbolType {
  if (symbolName.includes('어센틱')) return 'authentic';
  return 'arcane';
}

/** 심볼 레벨업 메소 비용 가져오기 */
export function getSymbolMesoCost(type: SymbolType, currentLevel: number): number {
  if (type === 'arcane') {
    return ARCANE_MESO_COST[currentLevel] ?? 0;
  }
  return AUTHENTIC_MESO_COST[currentLevel] ?? 0;
}

/** 심볼 최대 레벨 */
export function getSymbolMaxLevel(type: SymbolType): number {
  return type === 'arcane' ? 20 : 11;
}
