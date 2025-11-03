'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Jihoo Quest</h1>
      <p className="text-xl mb-8 text-gray-600">ADHD 친화형 학습·집중력 게임</p>
      
      <div className="space-y-4">
        <Link href="/session">
          <Button size="lg" className="w-full">
            세션 시작
          </Button>
        </Link>
        
        <Link href="/diagnostic">
          <Button size="lg" variant="outline" className="w-full">
            진단 테스트
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="w-full">
            대시보드
          </Button>
        </Link>
        
        <Link href="/report">
          <Button size="lg" variant="outline" className="w-full">
            리포트
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button size="lg" variant="outline" className="w-full">
            설정
          </Button>
        </Link>
      </div>
    </main>
  )
}
