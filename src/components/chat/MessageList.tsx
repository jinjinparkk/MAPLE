'use client';

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/supabase/types';

interface MessageListProps {
  messages: ChatMessage[];
  myNickname: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageList({ messages, myNickname, hasMore, loadingMore, onLoadMore }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      const isNewMessage = messages.length - prevLengthRef.current <= 2;
      if (isNewMessage) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // 초기 로드 시 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-2">
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
          >
            {loadingMore ? '불러오는 중...' : '이전 메시지 불러오기'}
          </button>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          아직 메시지가 없습니다. 첫 메시지를 보내보세요!
        </div>
      )}

      {messages.map((msg) => {
        const isMine = msg.nickname === myNickname;
        return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] space-y-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
              {!isMine && (
                <p className="text-xs font-medium text-gray-600 px-1">{msg.nickname}</p>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-sm break-words ${
                  isMine
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-[10px] text-gray-400 px-1 ${isMine ? 'text-right' : ''}`}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
