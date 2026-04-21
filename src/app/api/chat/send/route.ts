import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 5;
const rateMap = new Map<string, number[]>();

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')).digest('hex').slice(0, 16);
}

function checkRate(ipHash: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ipHash) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateMap.set(ipHash, timestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!nickname || nickname.length > 12) {
      return NextResponse.json({ error: '닉네임은 1~12자여야 합니다.' }, { status: 400 });
    }
    if (!content || content.length > 500) {
      return NextResponse.json({ error: '메시지는 1~500자여야 합니다.' }, { status: 400 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? '0.0.0.0';
    const ipHash = hashIp(ip);

    if (!checkRate(ipHash)) {
      return NextResponse.json({ error: '메시지를 너무 빠르게 보내고 있습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('messages').insert({
      nickname,
      content,
      ip_hash: ipHash,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: '메시지 전송에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
