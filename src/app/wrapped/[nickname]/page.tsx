import { notFound } from 'next/navigation';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';
import { analyzeCharacter } from '@/lib/wrapped';
import WrappedClient from './WrappedClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ nickname: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nickname } = await params;
  const decoded = decodeURIComponent(nickname);

  return {
    title: `${decoded}의 메이플 리포트`,
    description: `${decoded}의 메이플스토리 캐릭터 분석 리포트 — 스타포스, 잠재능력, 심볼, 유니온, 헥사 종합 등급`,
    openGraph: {
      title: `${decoded}의 메이플 리포트 | MapleStory Wrapped`,
      description: '나의 메이플 캐릭터를 분석해보세요!',
    },
  };
}

export default async function WrappedPage({ params }: PageProps) {
  const { nickname } = await params;
  const decoded = decodeURIComponent(nickname);

  try {
    const ocid = await fetchOcid(decoded);
    const fullData = await fetchCharacterFullData(ocid);
    const wrappedData = analyzeCharacter(fullData);

    return <WrappedClient data={wrappedData} />;
  } catch {
    notFound();
  }
}
