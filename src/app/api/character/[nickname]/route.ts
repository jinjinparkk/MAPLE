import { NextRequest, NextResponse } from 'next/server';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> },
) {
  try {
    const { nickname } = await params;
    const decodedNickname = decodeURIComponent(nickname);

    const ocid = await fetchOcid(decodedNickname);
    const data = await fetchCharacterFullData(ocid);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    const status = message.includes('Rate limit') ? 429
      : message.includes('400') ? 400
      : message.includes('404') ? 404
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
