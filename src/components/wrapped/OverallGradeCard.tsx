'use client';

import type { WrappedData, Grade } from '@/lib/wrapped/types';

const GRADE_SCORE: Record<Grade, number> = { S: 100, A: 80, B: 60, C: 40, D: 20 };

function GaugeRow({ label, grade }: { label: string; grade: Grade }) {
  const pct = GRADE_SCORE[grade];
  const colorMap: Record<Grade, string> = {
    S: '#ffd700',
    A: '#a855f7',
    B: '#3b82f6',
    C: '#22c55e',
    D: '#9ca3af',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/60">{label}</span>
        <span className={`font-bold grade-${grade}`}>{grade}</span>
      </div>
      <div className="gauge-bar">
        <div
          className="gauge-fill"
          style={{ width: `${pct}%`, background: colorMap[grade] }}
        />
      </div>
    </div>
  );
}

export default function OverallGradeCard({ data }: { data: WrappedData }) {
  return (
    <div className="wrapped-card card-bg-overall" data-card-index={7}>
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        <p className="card-label animate-fade-in-up">Overall Grade</p>

        <div className={`big-grade grade-${data.overallGrade} animate-scale-in delay-100`}>
          {data.overallGrade}
        </div>

        <div className="animate-count-up delay-200">
          <span className="text-4xl font-bold text-white">{data.overallScore}</span>
          <span className="text-lg text-white/50"> / 100</span>
        </div>

        <div className="w-full space-y-3 animate-fade-in-up delay-300">
          <GaugeRow label="스타포스" grade={data.starforce.grade} />
          <GaugeRow label="잠재능력" grade={data.potential.grade} />
          <GaugeRow label="심볼" grade={data.symbol.grade} />
          <GaugeRow label="유니온" grade={data.union.grade} />
          <GaugeRow label="헥사" grade={data.hexa.grade} />
        </div>
      </div>
    </div>
  );
}
