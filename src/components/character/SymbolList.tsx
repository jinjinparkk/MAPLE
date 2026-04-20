import type { SymbolItem } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';

interface Props {
  symbols: SymbolItem[];
}

export default function SymbolList({ symbols }: Props) {
  if (!symbols || symbols.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-3">심볼</h2>
        <p className="text-sm text-gray-500">심볼 정보가 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">심볼</h2>
      <div className="space-y-2">
        {symbols.map((symbol) => {
          const isAuthentic = symbol.symbol_name.includes('어센틱');
          const maxLevel = isAuthentic ? 11 : 20;
          const progress = (symbol.symbol_level / maxLevel) * 100;

          return (
            <div key={symbol.symbol_name} className="flex items-center gap-3">
              {symbol.symbol_icon && (
                <img src={symbol.symbol_icon} alt={symbol.symbol_name} width={32} height={32} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {symbol.symbol_name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Lv.{symbol.symbol_level}/{maxLevel}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isAuthentic ? 'bg-purple-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
