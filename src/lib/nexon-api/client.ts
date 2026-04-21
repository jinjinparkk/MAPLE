import { NEXON_API_BASE } from './endpoints';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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
        next: { revalidate: 600 },
      });

      if (res.status === 429) {
        // Rate limit — wait and retry
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new NexonApiError(res.status, `Nexon API error ${res.status}: ${body}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err as Error;
      if (err instanceof NexonApiError && err.status !== 429 && err.status < 500) {
        throw err; // 클라이언트 에러는 재시도하지 않음
      }
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Unknown error');
}
