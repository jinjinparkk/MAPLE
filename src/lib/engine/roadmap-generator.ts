import type { CharacterFullData } from '@/lib/nexon-api/types';
import { extractStatContext } from '@/lib/calculator/stat-converter';
import { generateAllCandidates } from './roi-engine';
import { getPresetEquipment } from '@/lib/utils/equipment';
import type { UpgradeCandidate, UpgradeCategory } from './roi-engine';

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

  // 라운드로빈: 스타포스↔잠재 교대 선택하여 양쪽 모두 로드맵에 표시
  const categories: UpgradeCategory[] = ['starforce', 'potential'];
  let categoryIdx = 0;

  for (let i = 0; i < 50; i++) {
    let best: UpgradeCandidate | null = null;

    // 현재 차례 카테고리부터 시도, 없으면 다른 카테고리로 폴백
    for (let attempt = 0; attempt < categories.length; attempt++) {
      const cat = categories[(categoryIdx + attempt) % categories.length];
      const available = allCandidates.filter(
        (c) => !usedIds.has(c.id) && c.expectedCost <= remainingBudget && c.category === cat,
      );
      if (available.length > 0) {
        best = available[0]; // 이미 ROI 내림차순 정렬됨
        categoryIdx = (categoryIdx + attempt + 1) % categories.length;
        break;
      }
    }

    if (!best) break;

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
