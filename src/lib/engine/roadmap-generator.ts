import type { CharacterFullData } from '@/lib/nexon-api/types';
import { extractStatContext } from '@/lib/calculator/stat-converter';
import { generateAllCandidates } from './roi-engine';
import { getPresetEquipment } from '@/lib/utils/equipment';
import type { UpgradeCandidate } from './roi-engine';

export interface RoadmapStep {
  order: number;
  candidate: UpgradeCandidate;
  cumulativeCost: number;
  cumulativeStatGain: number;
}

export interface Roadmap {
  steps: RoadmapStep[];
  totalCost: number;
  totalStatGain: number;
  remainingBudget: number;
  allCandidates: UpgradeCandidate[];
}

/**
 * Greedy 알고리즘으로 예산 내 최적 강화 순서 생성
 *
 * 매 스텝마다:
 * 1. 모든 후보의 ROI를 현재 스탯 기준으로 계산
 * 2. ROI가 가장 높은 후보 선택
 * 3. 해당 강화 적용 (스탯 컨텍스트 갱신)
 * 4. 예산 차감
 * 5. 반복
 */
export function generateRoadmap(
  charData: CharacterFullData,
  budget: number,
): Roadmap {
  const ctx = extractStatContext(charData.stat, charData.equipment);
  const equipment = getPresetEquipment(charData.equipment);
  const symbols = charData.symbol.symbol ?? [];

  // 전체 후보 (정보 제공용)
  const allCandidates = generateAllCandidates(equipment, symbols, ctx);

  const steps: RoadmapStep[] = [];
  let remainingBudget = budget;
  let cumulativeCost = 0;
  let cumulativeStatGain = 0;
  const usedIds = new Set<string>();

  // Greedy loop (최대 50단계로 제한)
  for (let i = 0; i < 50; i++) {
    // 남은 예산으로 가능한 후보 필터링
    const availableCandidates = allCandidates.filter(
      (c) => !usedIds.has(c.id) && c.expectedCost <= remainingBudget,
    );

    if (availableCandidates.length === 0) break;

    // ROI가 가장 높은 후보 선택
    const best = availableCandidates[0]; // 이미 ROI 내림차순 정렬됨

    usedIds.add(best.id);
    // exclusionGroup: 같은 장비+타입의 다른 티어 후보를 모두 제외
    if (best.exclusionGroup) {
      for (const c of allCandidates) {
        if (c.exclusionGroup === best.exclusionGroup) {
          usedIds.add(c.id);
        }
      }
    }
    remainingBudget -= best.expectedCost;
    cumulativeCost += best.expectedCost;
    cumulativeStatGain += best.convertedStatGain;

    steps.push({
      order: i + 1,
      candidate: best,
      cumulativeCost,
      cumulativeStatGain: Math.round(cumulativeStatGain * 10) / 10,
    });
  }

  return {
    steps,
    totalCost: cumulativeCost,
    totalStatGain: Math.round(cumulativeStatGain * 10) / 10,
    remainingBudget,
    allCandidates,
  };
}
