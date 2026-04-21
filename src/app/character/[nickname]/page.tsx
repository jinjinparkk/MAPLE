import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/common/Container';
import CharacterProfile from '@/components/character/CharacterProfile';
import StatSummary from '@/components/character/StatSummary';
import EquipmentGrid from '@/components/character/EquipmentGrid';
import SymbolList from '@/components/character/SymbolList';
import CharacterClient from './CharacterClient';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';
import { getBestPresetEquipment } from '@/lib/utils/equipment';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ nickname: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nickname } = await params;
  const decodedNickname = decodeURIComponent(nickname);

  return {
    title: `${decodedNickname} 스펙업 로드맵`,
    description: `메이플스토리 ${decodedNickname} 캐릭터의 예산 대비 최적 스펙업 순서를 분석합니다.`,
    openGraph: {
      title: `${decodedNickname} 스펙업 로드맵 | 메이플 스펙업 가이드`,
      description: `${decodedNickname}의 환산주스탯 기반 가성비 스펙업 로드맵`,
    },
  };
}

export default async function CharacterPage({ params }: PageProps) {
  const { nickname } = await params;
  const decodedNickname = decodeURIComponent(nickname);

  let charData: Awaited<ReturnType<typeof fetchCharacterFullData>> | null = null;
  try {
    const ocid = await fetchOcid(decodedNickname);

    // unstable_cache가 결과를 캐싱하므로, 재시도는 1회만 (API 호출 절약)
    try {
      charData = await fetchCharacterFullData(ocid);
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        charData = await fetchCharacterFullData(ocid);
      } catch {
        // 2번째도 실패하면 포기
      }
    }
  } catch {
    // ignore
  }

  if (!charData) notFound();

  const bestPreset = getBestPresetEquipment(charData.equipment);

  return (
    <Container>
      <div className="py-8 space-y-6">
        <CharacterProfile basic={charData.basic} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <StatSummary stat={charData.stat} />
            <SymbolList symbols={charData.symbol.symbol ?? []} />
          </div>
          <EquipmentGrid
            equipment={bestPreset.equipment}
            presetNo={bestPreset.presetNo}
            presetLabel={bestPreset.label}
          />
        </div>
        <CharacterClient nickname={decodedNickname} charData={charData} />
      </div>
    </Container>
  );
}
