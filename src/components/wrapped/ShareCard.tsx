'use client';

import { useRef, useState } from 'react';
import type { WrappedData } from '@/lib/wrapped/types';
import { generateCardImage, shareCard, generateShareUrl } from '@/lib/wrapped/share';

export default function ShareCard({ data }: { data: WrappedData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    // 종합 결과 카드(data-card-index="7")를 캡처
    const overallCard = document.querySelector('[data-card-index="7"]') as HTMLElement | null;
    if (!overallCard) return;

    setIsSaving(true);
    try {
      const blob = await generateCardImage(overallCard);
      await shareCard(blob, `${data.nickname}_MapleWrapped`);
    } catch {
      // 실패 시 무시
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    const url = generateShareUrl(data.nickname);
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard API 미지원
    }
  };

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="wrapped-card card-bg-share" data-card-index={8} ref={captureRef}>
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <p className="card-label animate-fade-in-up">Share</p>

        <h2 className="card-title animate-fade-in-up delay-100">
          내 메이플 리포트를 공유해보세요
        </h2>

        <div className="w-full space-y-3 animate-fade-in-up delay-200">
          <button
            onClick={handleSaveImage}
            disabled={isSaving}
            className="w-full rounded-xl bg-white/10 hover:bg-white/20 px-6 py-4 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? '이미지 생성 중...' : '결과 이미지 저장'}
          </button>

          <button
            onClick={handleCopyUrl}
            className="w-full rounded-xl bg-white/10 hover:bg-white/20 px-6 py-4 text-white font-medium transition-colors"
          >
            {isCopied ? '복사됨!' : 'URL 복사'}
          </button>

          <button
            onClick={handleRetry}
            className="w-full rounded-xl border border-white/20 hover:bg-white/5 px-6 py-4 text-white/70 font-medium transition-colors"
          >
            다른 캐릭터 검색
          </button>
        </div>

        <p className="text-xs text-white/30 animate-fade-in-up delay-300">
          데이터 출처: NEXON Open API
        </p>
      </div>
    </div>
  );
}
