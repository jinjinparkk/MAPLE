'use client';

import type { WrappedData, Grade } from '@/lib/wrapped/types';

const GRADE_SCORE: Record<Grade, number> = { S: 100, A: 80, B: 60, C: 40, D: 20 };

const gradeColor: Record<Grade, string> = {
  S: '#ffd700',
  A: '#a855f7',
  B: '#3b82f6',
  C: '#22c55e',
  D: '#6b7280',
};

function GaugeRow({ label, value, sub, grade }: { label: string; value: string; sub?: string; grade: Grade }) {
  const pct = GRADE_SCORE[grade];
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <span className="text-xs text-white/40">{label}</span>
        <div className="flex items-center gap-2">
          {sub && <span className="text-xs text-white/30">{sub}</span>}
          <span className="text-sm font-bold" style={{ color: gradeColor[grade] }}>{value}</span>
        </div>
      </div>
      <div className="gauge-bar" style={{ height: '6px' }}>
        <div className="gauge-fill" style={{ width: `${pct}%`, background: gradeColor[grade] }} />
      </div>
    </div>
  );
}

export default function OverallGradeCard({ data }: { data: WrappedData }) {
  return (
    <div className="wrapped-card" data-card-index={6} id="summary-card" style={{
      background: 'linear-gradient(160deg, #0c0c1d 0%, #1a1034 40%, #0f1a2e 70%, #0c0c1d 100%)',
    }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        {/* 헤더 */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">MapleStory Wrapped</p>

        {/* 캐릭터 + 이름 */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.characterImage}
            alt={data.nickname}
            width={80}
            height={80}
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="text-left">
            <p className="text-lg font-bold text-white">{data.nickname}</p>
            <p className="text-xs text-white/50">Lv.{data.level} {data.jobName}</p>
            <p className="text-xs text-white/40">{data.worldName}{data.guildName ? ` / ${data.guildName}` : ''}</p>
          </div>
        </div>

        {/* 종합 등급 */}
        <div className="flex items-center gap-4">
          <div className={`big-grade grade-${data.overallGrade}`} style={{ fontSize: 'clamp(4rem, 12vw, 6rem)' }}>
            {data.overallGrade}
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold text-white">{data.overallScore}<span className="text-sm text-white/40"> / 100</span></p>
            <p className="text-xs text-white/40">종합 점수</p>
          </div>
        </div>

        {/* 카테고리별 게이지 */}
        <div className="w-full space-y-2.5 rounded-xl bg-white/5 p-4">
          <GaugeRow
            label="스타포스"
            value={data.starforce.grade}
            sub={`평균 ${data.starforce.avgStar}성 · 22↑ ${data.starforce.count22plus}개`}
            grade={data.starforce.grade}
          />
          <GaugeRow
            label="잠재능력"
            value={data.potential.grade}
            sub={`레전 ${data.potential.legendaryCount} · 유니크 ${data.potential.uniqueCount}`}
            grade={data.potential.grade}
          />
          <GaugeRow
            label="심볼"
            value={data.symbol.grade}
            sub={`포스 ${data.symbol.totalForce.toLocaleString()} · 만렙 ${data.symbol.arcaneMax + data.symbol.sacredMax}`}
            grade={data.symbol.grade}
          />
          <GaugeRow
            label="유니온"
            value={data.union.grade}
            sub={`Lv.${data.union.unionLevel.toLocaleString()}`}
            grade={data.union.grade}
          />
          <GaugeRow
            label="헥사"
            value={data.hexa.grade}
            sub={`코어합 ${data.hexa.totalCoreLevel}`}
            grade={data.hexa.grade}
          />
        </div>

        {/* 워터마크 */}
        <p className="text-[9px] text-white/20">maple-specup.vercel.app</p>
      </div>
    </div>
  );
}
