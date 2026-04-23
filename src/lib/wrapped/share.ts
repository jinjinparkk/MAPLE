import html2canvas from 'html2canvas';

/** 외부 이미지를 data URL로 변환 (CORS 우회) */
async function convertImagesToDataUrl(container: HTMLElement): Promise<() => void> {
  const imgs = container.querySelectorAll('img');
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      if (img.src.startsWith('data:')) return;
      originals.push({ img, src: img.src });
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // 변환 실패 시 원본 유지
      }
    }),
  );

  // 복원 함수 반환
  return () => {
    for (const { img, src } of originals) {
      img.src = src;
    }
  };
}

export async function generateCardImage(cardElement: HTMLElement): Promise<Blob> {
  const restore = await convertImagesToDataUrl(cardElement);

  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#08080f',
      scale: 2,
      useCORS: true,
      allowTaint: true,
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
  } finally {
    restore();
  }
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
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function generateShareUrl(nickname: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/wrapped/${encodeURIComponent(nickname)}`;
}
