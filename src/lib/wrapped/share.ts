import html2canvas from 'html2canvas';

export async function generateCardImage(cardElement: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(cardElement, {
    backgroundColor: '#0a0a0a',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('이미지 생성 실패'));
      },
      'image/png',
      1.0,
    );
  });
}

export async function shareCard(blob: Blob, title: string): Promise<void> {
  if (navigator.share) {
    const file = new File([blob], `${title}.png`, { type: 'image/png' });
    try {
      await navigator.share({
        title,
        files: [file],
      });
      return;
    } catch {
      // 공유 취소 또는 미지원 — 다운로드 폴백
    }
  }

  // 다운로드 폴백
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateShareUrl(nickname: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/wrapped/${encodeURIComponent(nickname)}`;
}
