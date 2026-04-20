import Container from './Container';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-12">
      <Container>
        <div className="text-center text-sm text-gray-500">
          <p>본 사이트는 NEXON의 공식 사이트가 아닙니다.</p>
          <p className="mt-1">
            데이터 출처: NEXON Open API | 메이플스토리는 NEXON의 등록상표입니다.
          </p>
          <p className="mt-2 text-gray-400">
            &copy; {new Date().getFullYear()} 메이플 스펙업 가이드
          </p>
        </div>
      </Container>
    </footer>
  );
}
