import DemoPlaySession from '@/components/DemoPlaySession';

export default function PlayPage({ searchParams }: { searchParams: { demo?: string } }) {
  const isDemoMode = searchParams.demo === '1';

  if (isDemoMode) {
    return <DemoPlaySession />;
  }

  // 실제 플레이 로직 (기존 session 페이지로 리다이렉트)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-display-sm mb-4">플레이 준비 중...</h1>
        <p className="text-body-md text-muted-foreground">
          세션 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}

