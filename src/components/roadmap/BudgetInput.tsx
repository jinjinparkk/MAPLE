'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Props {
  onSubmit: (budget: number) => void;
  isLoading?: boolean;
}

const PRESETS = [
  { label: '10억', value: 1_000_000_000 },
  { label: '50억', value: 5_000_000_000 },
  { label: '100억', value: 10_000_000_000 },
  { label: '500억', value: 50_000_000_000 },
  { label: '1000억', value: 100_000_000_000 },
];

function formatMeso(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toLocaleString()}억`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toLocaleString()}만`;
  }
  return value.toLocaleString();
}

export default function BudgetInput({ onSubmit, isLoading }: Props) {
  const [budget, setBudget] = useState<number>(10_000_000_000); // 100억 기본값
  const [customInput, setCustomInput] = useState('');

  const handlePreset = (value: number) => {
    setBudget(value);
    setCustomInput('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(raw);
    if (raw) {
      const meso = parseInt(raw) * 100_000_000; // 억 단위 입력
      setBudget(meso);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">예산 설정</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePreset(preset.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              budget === preset.value
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">직접 입력 (억 메소)</label>
          <input
            type="text"
            value={customInput}
            onChange={handleCustomChange}
            placeholder="예: 200"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <Button onClick={() => onSubmit(budget)} disabled={isLoading || budget <= 0} size="lg">
          {isLoading ? '분석 중...' : `${formatMeso(budget)} 로드맵 생성`}
        </Button>
      </div>
    </Card>
  );
}
