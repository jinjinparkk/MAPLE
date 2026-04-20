import { getSymbolMesoCost, getSymbolType } from '@/lib/constants/symbol-table';

/**
 * 심볼 레벨업 메소 비용 계산
 */
export function getSymbolLevelUpCost(symbolName: string, currentLevel: number): number {
  const type = getSymbolType(symbolName);
  return getSymbolMesoCost(type, currentLevel);
}
