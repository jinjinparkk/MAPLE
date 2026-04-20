import { NextRequest, NextResponse } from 'next/server';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';
import { cacheGet, cacheSet } from '@/lib/cache';
import { generateRoadmap } from '@/lib/engine/roadmap-generator';
import type { CharacterFullData } from '@/lib/nexon-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, budget } = body as { nickname: string; budget: number };

    if (!nickname || !budget || budget <= 0) {
      return NextResponse.json(
        { error: '닉네임과 예산(양수)을 입력해주세요.' },
        { status: 400 },
      );
    }

    // 캐릭터 데이터 조회 (캐시 활용)
    const cacheKey = `character:${nickname}`;
    let charData = cacheGet<CharacterFullData>(cacheKey);

    if (!charData) {
      const ocid = await fetchOcid(nickname);
      charData = await fetchCharacterFullData(ocid);
      cacheSet(cacheKey, charData);
    }

    // 로드맵 생성
    const roadmap = generateRoadmap(charData, budget);

    return NextResponse.json(roadmap);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
