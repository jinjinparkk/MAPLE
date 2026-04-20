import { NextRequest, NextResponse } from 'next/server';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';
import { cacheGet, cacheSet } from '@/lib/cache';
import type { CharacterFullData } from '@/lib/nexon-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> },
) {
  try {
    const { nickname } = await params;
    const decodedNickname = decodeURIComponent(nickname);
    const cacheKey = `character:${decodedNickname}`;

    // 캐시 확인
    const cached = cacheGet<CharacterFullData>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // OCID 조회
    const ocid = await fetchOcid(decodedNickname);

    // 전체 데이터 조회
    const data = await fetchCharacterFullData(ocid);

    // 캐시 저장
    cacheSet(cacheKey, data);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    const status = message.includes('400') ? 400 : message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
