'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

export default function SearchForm() {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setIsLoading(true);

    // 최근 검색 저장
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') ?? '[]') as string[];
      const updated = [trimmed, ...stored.filter((s) => s !== trimmed)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch {
      // localStorage 실패 무시
    }

    router.push(`/wrapped/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="메이플스토리 닉네임을 입력하세요"
        className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        maxLength={12}
        disabled={isLoading}
      />
      <Button type="submit" size="lg" disabled={isLoading || !nickname.trim()}>
        {isLoading ? '분석 중...' : '분석'}
      </Button>
    </form>
  );
}
