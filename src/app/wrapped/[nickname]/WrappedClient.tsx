'use client';

import { useState, useRef } from 'react';
import type { WrappedData, Grade } from '@/lib/wrapped/types';
import { generateCardImage, shareCard, generateShareUrl } from '@/lib/wrapped/share';

const gradeColor: Record<Grade, string> = {
  S: '#ffd700', A: '#a855f7', B: '#3b82f6', C: '#22c55e', D: '#6b7280',
};

const GRADE_PCT: Record<Grade, number> = { S: 100, A: 80, B: 60, C: 40, D: 20 };

/* ─── 게이지 행 ─── */
function Gauge({ label, value, sub, grade }: { label: string; value: string; sub?: string; grade: Grade }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end text-xs">
        <span className="text-white/40">{label}</span>
        <div className="flex items-center gap-2">
          {sub && <span className="text-white/30">{sub}</span>}
          <span className="font-bold" style={{ color: gradeColor[grade] }}>{value}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${GRADE_PCT[grade]}%`, background: gradeColor[grade] }} />
      </div>
    </div>
  );
}

/* ─── 스탯 카드 ─── */
function StatCard({ title, grade, children }: { title: string; grade: Grade; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-white/60">{title}</h3>
        <span className="text-lg font-black" style={{ color: gradeColor[grade] }}>{grade}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── 큰 숫자 ─── */
function BigNum({ value, color, unit }: { value: string | number; color: string; unit?: string }) {
  return (
    <p className="text-3xl font-extrabold tracking-tight" style={{ color }}>
      {value}{unit && <span className="text-base font-medium text-white/40 ml-1">{unit}</span>}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80 font-medium">{value}</span>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function WrappedClient({ data }: { data: WrappedData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const blob = await generateCardImage(cardRef.current);
      await shareCard(blob, `${data.nickname}_MapleWrapped`);
    } catch { /* ignore */ } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl(data.nickname));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-dvh bg-[#08080f]">
      {/* ── 저장 대상 카드 영역 ── */}
      <div ref={cardRef} className="max-w-lg mx-auto px-4 pt-10 pb-8" style={{
        background: 'linear-gradient(170deg, #0c0c1d 0%, #18103a 35%, #0f1a2e 65%, #08080f 100%)',
      }}>

        {/* 워터마크 */}
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/20 mb-6">
          MapleStory Wrapped
        </p>

        {/* ── 캐릭터 프로필 ── */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.characterImage}
            alt={data.nickname}
            width={180}
            height={180}
            style={{ imageRendering: 'pixelated' }}
            className="drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]"
          />
          <h1 className="text-2xl font-bold text-white">{data.nickname}</h1>
          <p className="text-sm text-white/50">
            Lv.{data.level} {data.jobName} · {data.worldName}
            {data.guildName && ` · ${data.guildName}`}
          </p>
        </div>

        {/* ── 종합 등급 ── */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <div className={`text-7xl font-black grade-${data.overallGrade}`}>
            {data.overallGrade}
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{data.overallScore}<span className="text-sm text-white/40"> / 100</span></p>
            <p className="text-xs text-white/40 mt-0.5">종합 점수</p>
          </div>
        </div>

        {/* ── 스탯 그리드 ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard title="스타포스" grade={data.starforce.grade}>
            <BigNum value={data.starforce.totalStars} color="#fbbf24" unit="성" />
            <Row label="평균" value={`${data.starforce.avgStar}성`} />
            <Row label="22성 이상" value={`${data.starforce.count22plus}개`} />
            {data.starforce.count25plus > 0 && <Row label="25성 이상" value={`${data.starforce.count25plus}개`} />}
            <Row label="최고" value={`${data.starforce.maxStar}성 (${data.starforce.maxStarItem})`} />
          </StatCard>

          <StatCard title="잠재능력" grade={data.potential.grade}>
            <BigNum value={data.potential.legendaryCount} color="#4ade80" unit="레전" />
            <Row label="유니크" value={`${data.potential.uniqueCount}개`} />
            <Row label="에픽 이하" value={`${data.potential.epicOrBelow}개`} />
            <Row label="에디 레전" value={`${data.potential.addiLegendaryCount}개`} />
            <Row label="에디 유니크" value={`${data.potential.addiUniqueCount}개`} />
          </StatCard>

          <StatCard title="심볼" grade={data.symbol.grade}>
            <BigNum value={data.symbol.totalForce.toLocaleString()} color="#e879f9" unit="포스" />
            <Row label="아케인 만렙" value={`${data.symbol.arcaneMax}개`} />
            <Row label="어센틱 만렙" value={`${data.symbol.sacredMax}개`} />
          </StatCard>

          <StatCard title="유니온 · 헥사" grade={data.union.grade}>
            <BigNum value={data.union.unionLevel.toLocaleString()} color="#38bdf8" />
            <Row label="등급" value={data.union.unionGrade || '-'} />
            {data.union.artifactLevel > 0 && <Row label="아티팩트" value={`Lv.${data.union.artifactLevel}`} />}
            <div className="border-t border-white/5 pt-2 mt-1">
              <Row label="헥사 코어합" value={data.hexa.totalCoreLevel} />
              {data.hexa.maxedCores > 0 && <Row label="만렙 코어" value={`${data.hexa.maxedCores}개`} />}
            </div>
          </StatCard>
        </div>

        {/* ── 종합 게이지 ── */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-2.5">
          <Gauge label="스타포스" value={data.starforce.grade} sub={`평균 ${data.starforce.avgStar}성`} grade={data.starforce.grade} />
          <Gauge label="잠재능력" value={data.potential.grade} sub={`레전 ${data.potential.legendaryCount}`} grade={data.potential.grade} />
          <Gauge label="심볼" value={data.symbol.grade} sub={`포스 ${data.symbol.totalForce.toLocaleString()}`} grade={data.symbol.grade} />
          <Gauge label="유니온" value={data.union.grade} sub={`Lv.${data.union.unionLevel.toLocaleString()}`} grade={data.union.grade} />
          <Gauge label="헥사" value={data.hexa.grade} sub={`코어합 ${data.hexa.totalCoreLevel}`} grade={data.hexa.grade} />
        </div>

        <p className="text-center text-[9px] text-white/15 mt-4">maple-specup.vercel.app</p>
      </div>

      {/* ── 버튼 (캡처 영역 밖) ── */}
      <div className="max-w-lg mx-auto px-4 pb-12 space-y-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-4 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? '이미지 생성 중...' : '리포트 카드 저장'}
        </button>
        <button
          onClick={handleCopy}
          className="w-full rounded-xl bg-white/10 hover:bg-white/15 px-6 py-4 text-white font-medium transition-colors"
        >
          {isCopied ? '복사됨!' : 'URL 복사'}
        </button>
        <a
          href="/"
          className="block w-full rounded-xl border border-white/15 hover:bg-white/5 px-6 py-4 text-center text-white/60 font-medium transition-colors"
        >
          다른 캐릭터 검색
        </a>
      </div>
    </div>
  );
}
