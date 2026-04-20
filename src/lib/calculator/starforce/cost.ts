import { getStarforceCostPerAttempt } from '@/lib/constants/starforce-table';

/**
 * 스타포스 1회 강화 메소 비용
 */
export function getAttemptCost(currentStar: number, itemLevel: number): number {
  return getStarforceCostPerAttempt(currentStar, itemLevel);
}
