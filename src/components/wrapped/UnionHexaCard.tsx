'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function UnionHexaCard({ data }: { data: WrappedData }) {
  const { union, hexa } = data;

  return (
    <div className="wrapped-card card-bg-union" data-card-index={6}>
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        {/* 유니온 섹션 */}
        <div className="space-y-4 w-full">
          <p className="card-label animate-fade-in-up">Union</p>

          <div className="big-number animate-count-up delay-100" style={{ color: '#38bdf8' }}>
            {union.unionLevel.toLocaleString()}
          </div>
          <p className="card-subtitle animate-fade-in-up delay-200" style={{ marginTop: '-0.5rem' }}>
            {union.unionGrade || '유니온'}
          </p>

          {union.artifactLevel > 0 && (
            <div className="flex justify-between items-center animate-fade-in-up delay-200">
              <span className="text-sm text-white/50">아티팩트 레벨</span>
              <span className="text-lg font-bold text-cyan-300">{union.artifactLevel}</span>
            </div>
          )}

          <div className={`text-xl font-bold grade-${union.grade} animate-scale-in delay-300`}>
            등급: {union.grade}
          </div>
        </div>

        <div className="w-full h-px bg-white/10" />

        {/* 헥사 섹션 */}
        <div className="space-y-4 w-full">
          <p className="card-label animate-fade-in-up delay-300">HEXA Matrix</p>

          <div className="big-number animate-count-up delay-400" style={{ color: '#22d3ee' }}>
            {hexa.totalCoreLevel}
          </div>
          <p className="card-subtitle animate-fade-in-up delay-400" style={{ marginTop: '-0.5rem' }}>
            코어 레벨 합
          </p>

          <div className="w-full space-y-3 animate-fade-in-up delay-500">
            {hexa.maxedCores > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">만렙 코어</span>
                <span className="text-lg font-bold text-cyan-400 animate-glow">
                  {hexa.maxedCores}개
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">스탯 코어 레벨 합</span>
              <span className="text-lg font-bold text-white">{hexa.totalStatCoreLevel}</span>
            </div>
          </div>

          <div className={`text-xl font-bold grade-${hexa.grade} animate-scale-in delay-600`}>
            등급: {hexa.grade}
          </div>
        </div>
      </div>
    </div>
  );
}
