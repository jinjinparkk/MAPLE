import { STARFORCE_SUCCESS_RATE, STARFORCE_DESTROY_RATE } from '@/lib/constants/starforce-table';

export interface StarforceProbability {
  success: number;
  fail: number;
  destroy: number;
}

/**
 * 현재 성수에서의 성공/실패/파괴 확률
 */
export function getStarforceProbability(currentStar: number): StarforceProbability {
  const success = STARFORCE_SUCCESS_RATE[currentStar] ?? 0;
  const destroy = STARFORCE_DESTROY_RATE[currentStar] ?? 0;
  const fail = 1 - success - destroy;

  return { success, fail: Math.max(0, fail), destroy };
}
