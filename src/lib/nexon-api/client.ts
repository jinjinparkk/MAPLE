import { NEXON_API_BASE } from './endpoints';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

class NexonApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'NexonApiError';
  }
}

function getApiKey(): string {
  const key = process.env.NEXON_API_KEY;
  if (!key) throw new Error('NEXON_API_KEY 환경변수가 설정되지 않았습니다.');
  return key;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function nexonFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, NEXON_API_BASE);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: {
          'x-nxopen-api-key': getApiKey(),
        },
        cache: 'no-store',
      });

      // 429 Rate Limit — 재시도 없이 즉시 실패 (일일 한도 보호)
      if (res.status === 429) {
        throw new NexonApiError(429, 'Rate limit 초과 — 잠시 후 다시 시도해주세요.');
      }

      if (!res.ok) {
        const body = await res.text();
        throw new NexonApiError(res.status, `Nexon API error ${res.status}: ${body}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err as Error;
      // 4xx 에러(429 포함)는 재시도 무의미 — 즉시 throw
      if (err instanceof NexonApiError && err.status < 500) {
        throw err;
      }
      // 5xx/네트워크 에러만 재시도
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Unknown error');
}
