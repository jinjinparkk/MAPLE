'use client';

import { useState } from 'react';
import type { CharacterFullData } from '@/lib/nexon-api/types';
import type { Roadmap } from '@/lib/engine';
import BudgetInput from '@/components/roadmap/BudgetInput';
import RoadmapTimeline from '@/components/roadmap/RoadmapTimeline';
import RoiChart from '@/components/roadmap/RoiChart';
import TotalGainSummary from '@/components/roadmap/TotalGainSummary';

interface Props {
  nickname: string;
  charData: CharacterFullData;
}

export default function CharacterClient({ nickname, charData: _charData }: Props) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBudgetSubmit = async (budget: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, budget }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '로드맵 생성에 실패했습니다.');
      }

      const data: Roadmap = await res.json();
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <BudgetInput onSubmit={handleBudgetSubmit} isLoading={isLoading} />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {roadmap && (
        <>
          <TotalGainSummary roadmap={roadmap} />
          <RoadmapTimeline roadmap={roadmap} />
          <RoiChart candidates={roadmap.allCandidates} />
        </>
      )}
    </div>
  );
}
