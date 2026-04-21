'use client';

import { useState, FormEvent } from 'react';

interface NicknameFormProps {
  onSubmit: (nickname: string) => void;
}

export default function NicknameForm({ onSubmit }: NicknameFormProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && trimmed.length <= 12) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">닉네임 설정</h2>
          <p className="mt-1 text-sm text-gray-500">채팅에서 사용할 닉네임을 입력하세요</p>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="닉네임 (1~12자)"
          maxLength={12}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          입장하기
        </button>
      </form>
    </div>
  );
}
