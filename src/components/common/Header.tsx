import Link from 'next/link';
import Container from './Container';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">
            메이플 스펙업 가이드
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              홈
            </Link>
            <Link href="/chat" className="hover:text-orange-600 transition-colors">
              고스톱갤러리
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
