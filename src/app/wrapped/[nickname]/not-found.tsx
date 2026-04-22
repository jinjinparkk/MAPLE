import Link from 'next/link';

export default function WrappedNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-4">캐릭터를 찾을 수 없습니다</h1>
      <p className="text-white/60 mb-8">
        닉네임을 확인하고 다시 시도해주세요.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
