'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ReminderBannerProps {
  message: string;
  onClose: () => void;
}

/**
 * 인앱 리마인더 배너 컴포넌트
 */
export function ReminderBanner({ message, onClose }: ReminderBannerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 5초 후 자동으로 사라짐
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 제거
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg
        flex items-center gap-4 max-w-md w-full
        transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="p-1 hover:bg-blue-600 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X size={20} />
      </button>
    </div>
  );
}

/**
 * 인앱 리마인더 훅
 */
export function useInAppReminder() {
  const [banners, setBanners] = useState<{ id: string; message: string }[]>([]);

  const showReminder = (message: string) => {
    const id = Date.now().toString();
    setBanners(prev => [...prev, { id, message }]);
  };

  const closeReminder = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  return {
    banners,
    showReminder,
    closeReminder,
  };
}

