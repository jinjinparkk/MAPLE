import Container from '@/components/common/Container';
import SearchForm from '@/components/search/SearchForm';
import RecentSearches from '@/components/search/RecentSearches';

export default function HomePage() {
  return (
    <Container>
      <div className="mx-auto max-w-2xl py-16 sm:py-24">
        {/* 히어로 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            메이플 스펙업 가이드
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            예산 대비 가성비 높은 스펙업 순서를 자동으로 분석합니다
          </p>
        </div>

        {/* 검색 */}
        <SearchForm />
        <RecentSearches />

        {/* 설명 */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl mb-2">1</div>
            <h3 className="font-medium text-gray-900">닉네임 입력</h3>
            <p className="mt-1 text-sm text-gray-500">
              메이플스토리 캐릭터 닉네임을 입력하세요
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl mb-2">2</div>
            <h3 className="font-medium text-gray-900">예산 설정</h3>
            <p className="mt-1 text-sm text-gray-500">
              사용할 메소 예산을 설정하세요
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl mb-2">3</div>
            <h3 className="font-medium text-gray-900">로드맵 확인</h3>
            <p className="mt-1 text-sm text-gray-500">
              가성비 순으로 정렬된 강화 순서를 확인하세요
            </p>
          </div>
        </div>

        {/* 기능 소개 */}
        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">주요 기능</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-orange-600 font-medium">-</span>
              환산주스탯 기반 가성비 분석 (메소 대비 환산주스탯 상승률)
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-medium">-</span>
              스타포스 기대비용 계산 (성공/실패/파괴 확률 반영)
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-medium">-</span>
              심볼 레벨업 비용 대비 효율 분석
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-medium">-</span>
              예산 내 최적 강화 순서 자동 추천
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-medium">-</span>
              실시간 넥슨 API 연동으로 최신 캐릭터 정보 반영
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
