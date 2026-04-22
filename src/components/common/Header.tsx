import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-purple-400">
            MapleStory Wrapped
          </Link>
          <nav className="flex gap-4 text-sm text-white/60">
            <Link href="/" className="hover:text-purple-400 transition-colors">
              홈
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
