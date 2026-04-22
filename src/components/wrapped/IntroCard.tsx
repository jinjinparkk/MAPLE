'use client';

import type { WrappedData } from '@/lib/wrapped/types';

export default function IntroCard({ data }: { data: WrappedData }) {
  return (
    <div className="wrapped-card card-bg-intro" data-card-index={0}>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="card-label animate-fade-in-up">MapleStory Wrapped</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.characterImage}
          alt={data.nickname}
          width={180}
          height={180}
          className="animate-scale-in delay-100"
          style={{ imageRendering: 'pixelated' }}
        />

        <h1 className="card-title animate-fade-in-up delay-200">
          {data.nickname}
        </h1>

        <p className="card-subtitle animate-fade-in-up delay-300">
          Lv.{data.level} {data.jobName}
        </p>

        <p className="card-subtitle animate-fade-in-up delay-400">
          {data.worldName}
          {data.guildName && ` / ${data.guildName}`}
        </p>
      </div>

      <div className="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </div>
  );
}
