'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function LevelCard({ data }: { data: WrappedData }) {
  return (
    <div className="wrapped-card card-bg-level" data-card-index={1}>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="card-label animate-fade-in-up">Level</p>

        <div className="big-number animate-count-up delay-100" style={{ color: '#7dd3fc' }}>
          {data.level}
        </div>

        <div className="space-y-2 animate-fade-in-up delay-200">
          <p className="card-title">{data.jobName}</p>
          <p className="card-subtitle">{data.worldName}</p>
          {data.guildName && (
            <p className="card-subtitle">
              길드: {data.guildName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
