import Link from 'next/link';

export default function BreakDemoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-display-sm mb-6">휴식 시간</h1>
        <p className="text-body-lg text-muted-foreground mb-8">
          50초 동안 박스 호흡을 따라해보세요
        </p>

        {/* 박스 호흡 애니메이션 */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div
            className="absolute inset-0 bg-primary/20 rounded-lg animate-box-breathing"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-title-lg font-bold animate-breathing-text">
                들이쉬기
              </p>
              <p className="text-label-md text-muted-foreground mt-2">
                4초
              </p>
            </div>
          </div>
        </div>

        {/* 진행도 */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full animate-break-progress"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="휴식 진행률"
            />
          </div>
          <p className="text-label-sm text-muted-foreground mt-2">
            0:50
          </p>
        </div>

        {/* 안내 */}
        <div className="bg-card p-6 rounded-lg border border-border/50">
          <h2 className="text-title-md mb-4">박스 호흡법</h2>
          <ol className="text-left space-y-2 text-body-sm text-muted-foreground">
            <li>1. 들이쉬기 (4초)</li>
            <li>2. 참기 (4초)</li>
            <li>3. 내쉬기 (4초)</li>
            <li>4. 참기 (4초)</li>
          </ol>
        </div>

        {/* 데모 안내 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/30">
          <p className="text-label-sm text-muted-foreground">
            🎮 데모 모드 · <Link href="/play?demo=1" className="text-primary hover:underline">플레이로 돌아가기</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes box-breathing {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(0.8); }
        }
        .animate-box-breathing {
          animation: box-breathing 16s ease-in-out infinite;
        }
        @keyframes breathing-text {
          0% { content: '들이쉬기'; }
          25% { content: '참기'; }
          50% { content: '내쉬기'; }
          75% { content: '참기'; }
        }
        @keyframes break-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-break-progress {
          animation: break-progress 50s linear;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-box-breathing,
          .animate-break-progress {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

