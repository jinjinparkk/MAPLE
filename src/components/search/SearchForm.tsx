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

    router.push(`/character/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="메이플스토리 닉네임을 입력하세요"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base placeholder-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        maxLength={12}
        disabled={isLoading}
      />
      <Button type="submit" size="lg" disabled={isLoading || !nickname.trim()}>
        {isLoading ? '검색 중...' : '검색'}
      </Button>
    </form>
  );
}
