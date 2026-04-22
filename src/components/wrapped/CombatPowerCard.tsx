'use client';

import type { WrappedData } from '@/lib/wrapped/types';

function formatNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

export default function CombatPowerCard({ data }: { data: WrappedData }) {
  return (
    <div className="wrapped-card card-bg-combat" data-card-index={2}>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="card-label animate-fade-in-up">Combat Power</p>

        <div className="big-number animate-count-up delay-100" style={{ color: '#fb923c' }}>
          {formatNumber(data.combatPower)}
        </div>

        <p className="card-subtitle animate-fade-in-up delay-200">
          전투력
        </p>

        <div className={`animate-scale-in delay-300 big-grade grade-${data.overallGrade}`}>
          {data.overallGrade}
        </div>
      </div>
    </div>
  );
}
