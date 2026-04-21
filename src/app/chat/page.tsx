import type { Metadata } from 'next';
import Container from '@/components/common/Container';
import ChatRoom from '@/components/chat/ChatRoom';

export const metadata: Metadata = {
  title: '고스톱갤러리',
  description: '메이플 유저들의 실시간 익명 채팅 공간',
};

export default function ChatPage() {
  return (
    <Container>
      <div className="py-4">
        <ChatRoom />
      </div>
    </Container>
  );
}
