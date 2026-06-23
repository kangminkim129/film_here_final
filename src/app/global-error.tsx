'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ background: '#121212', color: '#FDFBF7', fontFamily: 'sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>문제가 발생했어요</h1>
          <p style={{ opacity: 0.5, fontSize: 14 }}>잠시 후 다시 시도해 주세요.</p>
          <button
            onClick={reset}
            style={{ padding: '10px 20px', background: '#FDFBF7', color: '#000', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            다시 시도
          </button>
          {error?.digest && <small style={{ opacity: 0.3 }}>오류 코드: {error.digest}</small>}
        </div>
      </body>
    </html>
  );
}
