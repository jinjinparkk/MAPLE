import Link from 'next/link';
import Container from '@/components/common/Container';
import Button from '@/components/common/Button';

export default function CharacterNotFound() {
  return (
    <Container>
      <div className="py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-900">캐릭터를 찾을 수 없습니다</h1>
        <p className="mt-4 text-gray-600">
          닉네임을 다시 확인해주세요. 닉네임 변경 후 24시간이 지나지 않은 캐릭터는 검색되지 않을 수 있습니다.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
