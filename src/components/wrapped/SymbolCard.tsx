'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function SymbolCard({ data }: { data: WrappedData }) {
  const { symbol } = data;

  return (
    <div className="wrapped-card card-bg-symbol" data-card-index={4}>
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        <p className="card-label animate-fade-in-up">Symbol</p>

        <div className="space-y-1 animate-count-up delay-100">
          <div className="big-number" style={{ color: '#e879f9' }}>
            {symbol.totalForce.toLocaleString()}
          </div>
          <p className="card-subtitle">총 심볼 포스</p>
        </div>

        <div className="w-full space-y-4 animate-fade-in-up delay-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">아케인 심볼 합</span>
            <span className="text-lg font-bold text-purple-300">{symbol.arcaneTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">아케인 만렙(20)</span>
            <span className="text-lg font-bold text-fuchsia-400">{symbol.arcaneMax}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">그랜드/어센틱 합</span>
            <span className="text-lg font-bold text-purple-300">{symbol.sacredTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">그랜드/어센틱 만렙(11)</span>
            <span className="text-lg font-bold text-fuchsia-400">{symbol.sacredMax}개</span>
          </div>
        </div>

        <div className={`text-2xl font-bold grade-${symbol.grade} animate-scale-in delay-300`}>
          등급: {symbol.grade}
        </div>
      </div>
    </div>
  );
}
