'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function PotentialCard({ data }: { data: WrappedData }) {
  const { potential } = data;

  return (
    <div className="wrapped-card card-bg-potential" data-card-index={4}>
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        <p className="card-label animate-fade-in-up">Potential</p>

        <div className="space-y-1 animate-count-up delay-100">
          <div className="big-number" style={{ color: '#4ade80' }}>
            {potential.legendaryCount}
          </div>
          <p className="card-subtitle">레전드리 장비</p>
        </div>

        <div className="w-full space-y-4 animate-fade-in-up delay-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">유니크</span>
            <span className="text-lg font-bold text-purple-400">{potential.uniqueCount}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">에픽 이하</span>
            <span className="text-lg font-bold text-white/70">{potential.epicOrBelow}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">에디 레전드리</span>
            <span className="text-lg font-bold text-emerald-400">{potential.addiLegendaryCount}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">에디 유니크</span>
            <span className="text-lg font-bold text-purple-300">{potential.addiUniqueCount}개</span>
          </div>
        </div>

        {potential.bestPotential && (
          <div className="animate-fade-in-up delay-300 text-sm text-white/60">
            <p className="text-xs text-white/40 mb-1">Best Potential — {potential.bestPotentialItem}</p>
            <p className="text-emerald-300">{potential.bestPotential}</p>
          </div>
        )}

        <div className={`text-2xl font-bold grade-${potential.grade} animate-scale-in delay-400`}>
          등급: {potential.grade}
        </div>
      </div>
    </div>
  );
}
