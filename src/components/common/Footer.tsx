export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-8 mt-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center text-sm text-white/40">
          <p>본 사이트는 NEXON의 공식 사이트가 아닙니다.</p>
          <p className="mt-1">
            데이터 출처: NEXON Open API | 메이플스토리는 NEXON의 등록상표입니다.
          </p>
          <p className="mt-2 text-white/25">
            &copy; {new Date().getFullYear()} MapleStory Wrapped
          </p>
        </div>
      </div>
    </footer>
  );
}
