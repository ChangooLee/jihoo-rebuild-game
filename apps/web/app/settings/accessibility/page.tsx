'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import type { UserProfile } from '@/lib/types';

export default function AccessibilityPage() {
  const [font, setFont] = useState<'default' | 'lexend' | 'opendyslexic'>('default');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const profile = await db.userProfile.get('default');
    if (profile) {
      setFont(profile.preferredFont || 'default');
      setAnimationIntensity(profile.animationIntensity ?? 1);
    }
  };

  const handleSave = async () => {
    const profile: UserProfile = {
      id: 'default',
      preferredFont: font,
      animationIntensity,
    };

    await db.userProfile.put(profile);
    applySettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applySettings = () => {
    // 폰트 적용
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // 기존 폰트 클래스 제거
      root.classList.remove('font-default', 'font-lexend', 'font-opendyslexic');
      
      // 새 폰트 클래스 추가
      root.classList.add(`font-${font}`);
      
      // CSS 변수로 행간/자간 적용
      root.style.setProperty('--line-height', String(lineHeight));
      root.style.setProperty('--letter-spacing', `${letterSpacing}px`);
      root.style.setProperty('--animation-scale', String(animationIntensity));
    }
  };

  useEffect(() => {
    applySettings();
  }, [font, lineHeight, letterSpacing, animationIntensity]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">접근성 설정</h1>

      <div className="max-w-2xl space-y-6">
        {/* 폰트 선택 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">폰트 선택</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="font"
                value="default"
                checked={font === 'default'}
                onChange={(e) => setFont(e.target.value as typeof font)}
              />
              <span>기본 폰트</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="font"
                value="lexend"
                checked={font === 'lexend'}
                onChange={(e) => setFont(e.target.value as typeof font)}
              />
              <span>Lexend (가독성 향상)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="font"
                value="opendyslexic"
                checked={font === 'opendyslexic'}
                onChange={(e) => setFont(e.target.value as typeof font)}
              />
              <span>OpenDyslexic (난독증 친화)</span>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            선택한 폰트가 모든 페이지에 적용됩니다.
          </p>
        </div>

        {/* 행간 조절 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">행간 조절</h2>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.1"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>좁게</span>
            <span className="font-bold">{lineHeight.toFixed(1)}</span>
            <span>넓게</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            현재 행간: {lineHeight.toFixed(1)} (기본 1.5)
          </p>
        </div>

        {/* 자간 조절 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">자간 조절</h2>
          <input
            type="range"
            min="-2"
            max="5"
            step="0.5"
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>좁게</span>
            <span className="font-bold">{letterSpacing.toFixed(1)}px</span>
            <span>넓게</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            현재 자간: {letterSpacing.toFixed(1)}px (기본 0px)
          </p>
        </div>

        {/* 애니메이션 강도 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">애니메이션 강도</h2>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={animationIntensity}
            onChange={(e) => setAnimationIntensity(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>없음</span>
            <span className="font-bold">{(animationIntensity * 100).toFixed(0)}%</span>
            <span>전체</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            애니메이션이 시각적 방해가 되는 경우 줄일 수 있습니다.
          </p>
        </div>

        {/* 색각 대비 체크 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">색각 대비 확인</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded"></div>
              <div className="w-16 h-16 bg-green-500 rounded"></div>
              <div className="w-16 h-16 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">기본 색상</span>
            </div>
            <p className="text-sm text-gray-500">
              색상 구분이 어려우신 경우 다크모드를 사용하거나 설정을 조정해주세요.
            </p>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saved}
            size="lg"
          >
            {saved ? '저장됨!' : '설정 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}

