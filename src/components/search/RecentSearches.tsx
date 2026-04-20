'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') ?? '[]') as string[];
      setSearches(stored);
    } catch {
      // ignore
    }
  }, []);

  if (searches.length === 0) return null;

  const handleClear = () => {
    localStorage.removeItem('recentSearches');
    setSearches([]);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">최근 검색</h3>
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          전체 삭제
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((name) => (
          <Link
            key={name}
            href={`/character/${encodeURIComponent(name)}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
          >
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
}
