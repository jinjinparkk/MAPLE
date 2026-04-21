'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/supabase/types';
import NicknameForm from './NicknameForm';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const PAGE_SIZE = 50;

export default function ChatRoom() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 닉네임 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_nickname');
      if (saved) setNickname(saved);
    } catch {
      // ignore
    }
  }, []);

  const handleSetNickname = (name: string) => {
    setNickname(name);
    try {
      localStorage.setItem('chat_nickname', name);
    } catch {
      // ignore
    }
  };

  // 초기 메시지 로드
  useEffect(() => {
    if (!nickname) return;

    const supabase = getSupabaseBrowser();

    async function loadInitial() {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('id, nickname, content, created_at')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (fetchError) {
        console.error('Failed to load messages:', fetchError);
        setError('메시지를 불러오지 못했습니다.');
        return;
      }

      const sorted = (data ?? []).reverse();
      setMessages(sorted);
      setHasMore((data?.length ?? 0) >= PAGE_SIZE);
    }

    loadInitial();

    // Realtime 구독
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nickname]);

  // 이전 메시지 로드
  const loadMore = useCallback(async () => {
    if (loadingMore || !messages.length) return;
    setLoadingMore(true);

    const oldest = messages[0];
    const supabase = getSupabaseBrowser();

    const { data } = await supabase
      .from('messages')
      .select('id, nickname, content, created_at')
      .lt('created_at', oldest.created_at)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (data && data.length > 0) {
      const sorted = data.reverse();
      setMessages((prev) => [...sorted, ...prev]);
      setHasMore(data.length >= PAGE_SIZE);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [loadingMore, messages]);

  // 메시지 전송
  const sendMessage = async (content: string) => {
    setError(null);
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, content }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '전송 실패' }));
      setError(data.error ?? '전송 실패');
    }
  };

  if (nickname === null) {
    return <NicknameForm onSubmit={handleSetNickname} />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">고스톱갤러리</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{nickname}</span>
          <button
            onClick={() => {
              setNickname(null);
              try { localStorage.removeItem('chat_nickname'); } catch { /* ignore */ }
            }}
            className="text-xs text-gray-400 hover:text-orange-600 transition-colors"
          >
            닉네임 변경
          </button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mx-3 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        myNickname={nickname}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />

      {/* 입력 */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
