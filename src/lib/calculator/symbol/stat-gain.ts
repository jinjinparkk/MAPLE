import { getSymbolStatPerLevel, getSymbolType } from '@/lib/constants/symbol-table';

/**
 * 심볼 1레벨 상승 시 주스탯 증가량
 */
export function getSymbolStatGain(symbolName: string): number {
  const type = getSymbolType(symbolName);
  return getSymbolStatPerLevel(type);
}
