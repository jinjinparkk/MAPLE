import SearchForm from '@/components/search/SearchForm';
import RecentSearches from '@/components/search/RecentSearches';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      {/* 히어로 섹션 */}
      <div className="text-center mb-8">
        <p className="text-sm uppercase tracking-widest text-white/40 mb-4">
          MapleStory Wrapped
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          나의 메이플 리포트를
          <br />
          확인해보세요
        </h1>
        <p className="mt-4 text-lg text-white/60">
          캐릭터 닉네임을 입력하면 스타포스, 잠재능력, 심볼, 유니온, 헥사를 분석합니다
        </p>
      </div>

      {/* 검색 */}
      <SearchForm />
      <RecentSearches />

      {/* 카테고리 소개 */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '\u2B50', label: '스타포스', desc: '성급 분포와 평균 분석' },
          { icon: '\uD83D\uDC8E', label: '잠재능력', desc: '레전/유니크 비율' },
          { icon: '\uD83D\uDD2E', label: '심볼', desc: '아케인/그랜드 포스' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-medium text-white">{item.label}</h3>
            <p className="mt-1 text-sm text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { icon: '\uD83C\uDFAF', label: '유니온 & 헥사', desc: '유니온 레벨 + 코어 분석' },
          { icon: '\uD83C\uDFC6', label: '종합 등급', desc: 'S~D 등급 + 점수 리포트' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-medium text-white">{item.label}</h3>
            <p className="mt-1 text-sm text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
