/**
 * 스타포스 강화 관련 상수 테이블
 * 메이플스토리 스타포스 시스템 기준
 */

/** 성수별 성공 확률 (2025.3 개편) */
export const STARFORCE_SUCCESS_RATE: Record<number, number> = {
  0: 0.95, 1: 0.90, 2: 0.85, 3: 0.85, 4: 0.80,
  5: 0.75, 6: 0.70, 7: 0.65, 8: 0.60, 9: 0.55,
  10: 0.50, 11: 0.45, 12: 0.40, 13: 0.35, 14: 0.30,
  15: 0.30, 16: 0.30, 17: 0.15, 18: 0.15, 19: 0.15,
  20: 0.30, 21: 0.15, 22: 0.15, 23: 0.10, 24: 0.10,
  25: 0.10, 26: 0.07, 27: 0.05, 28: 0.03, 29: 0.01,
};

/** 성수별 파괴 확률 (2025.3 개편, 15성 이상) */
export const STARFORCE_DESTROY_RATE: Record<number, number> = {
  0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
  5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
  15: 0.021, 16: 0.021, 17: 0.068, 18: 0.068, 19: 0.085,
  20: 0.105, 21: 0.1275, 22: 0.17, 23: 0.18, 24: 0.18,
  25: 0.18, 26: 0.186, 27: 0.19, 28: 0.194, 29: 0.198,
};

/** 스타포스 1회 강화 비용 공식 (메소) */
export function getStarforceCostPerAttempt(
  currentStar: number,
  itemLevel: number,
): number {
  const lvl = itemLevel;
  if (currentStar < 10) {
    return Math.round(1000 + (lvl ** 3) * (currentStar + 1) / 25);
  }
  if (currentStar < 15) {
    return Math.round(1000 + (lvl ** 3) * ((currentStar + 1) ** 2.7) / 400);
  }
  // 15성 이상
  return Math.round(1000 + (lvl ** 3) * ((currentStar + 1) ** 2.7) / 200);
}

/**
 * 장비 레벨 + 현재 성수에 따른 스타포스 스탯 증가량
 * 간략화된 테이블 (150레벨 이상 장비 기준)
 */
export interface StarforceStatGain {
  mainStat: number;
  attackPower: number;
}

/** 성수별 주스탯 증가량 (150레벨 이상 장비 기준) */
export function getStarforceStatGain(
  currentStar: number,
  itemLevel: number,
): StarforceStatGain {
  // 간략화: 실제로는 장비 레벨에 따라 다르지만, 150+ 장비 기준
  if (itemLevel < 140) {
    if (currentStar < 5) return { mainStat: 2, attackPower: 0 };
    if (currentStar < 15) return { mainStat: 3, attackPower: 0 };
    return { mainStat: 7, attackPower: 0 };
  }

  // 140~149 레벨
  if (itemLevel < 150) {
    if (currentStar < 5) return { mainStat: 2, attackPower: 0 };
    if (currentStar < 15) return { mainStat: 3, attackPower: 0 };
    if (currentStar < 16) return { mainStat: 7, attackPower: 7 };
    return { mainStat: 9, attackPower: 8 };
  }

  // 150 레벨 이상
  if (currentStar < 5) return { mainStat: 2, attackPower: 0 };
  if (currentStar < 15) return { mainStat: 3, attackPower: 0 };
  if (currentStar === 15) return { mainStat: 7, attackPower: 8 };
  if (currentStar === 16) return { mainStat: 9, attackPower: 9 };
  if (currentStar === 17) return { mainStat: 11, attackPower: 10 };
  if (currentStar === 18) return { mainStat: 13, attackPower: 11 };
  if (currentStar === 19) return { mainStat: 15, attackPower: 12 };
  if (currentStar === 20) return { mainStat: 17, attackPower: 13 };
  if (currentStar === 21) return { mainStat: 19, attackPower: 14 };
  if (currentStar === 22) return { mainStat: 21, attackPower: 15 };
  if (currentStar === 23) return { mainStat: 23, attackPower: 16 };
  if (currentStar === 24) return { mainStat: 25, attackPower: 17 };
  if (currentStar === 25) return { mainStat: 27, attackPower: 18 };
  if (currentStar === 26) return { mainStat: 29, attackPower: 19 };
  if (currentStar === 27) return { mainStat: 31, attackPower: 20 };
  if (currentStar === 28) return { mainStat: 33, attackPower: 21 };
  return { mainStat: 35, attackPower: 22 };
}
