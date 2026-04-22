'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function StarforceCard({ data }: { data: WrappedData }) {
  const { starforce } = data;

  return (
    <div className="wrapped-card card-bg-starforce" data-card-index={3}>
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        <p className="card-label animate-fade-in-up">Starforce</p>

        <div className="big-number animate-count-up delay-100" style={{ color: '#fbbf24' }}>
          {starforce.totalStars}
        </div>
        <p className="card-subtitle animate-fade-in-up delay-200" style={{ marginTop: '-1rem' }}>
          총 성급
        </p>

        <div className="w-full space-y-4 animate-fade-in-up delay-300">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">최고 성급</span>
            <span className="text-lg font-bold text-yellow-300">
              {starforce.maxStar}성 ({starforce.maxStarItem})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">평균 성급</span>
            <span className="text-lg font-bold text-white">{starforce.avgStar}성</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">22성 이상</span>
            <span className="text-lg font-bold text-yellow-400">{starforce.count22plus}개</span>
          </div>
          {starforce.count25plus > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">25성 이상</span>
              <span className="text-lg font-bold text-amber-300 animate-glow">
                {starforce.count25plus}개
              </span>
            </div>
          )}
        </div>

        <div className={`text-2xl font-bold grade-${starforce.grade} animate-scale-in delay-400`}>
          등급: {starforce.grade}
        </div>
      </div>
    </div>
  );
}
