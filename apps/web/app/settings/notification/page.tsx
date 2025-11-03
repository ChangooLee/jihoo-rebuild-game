'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reminderManager, type ReminderConfig } from '@/modules/notification/reminder';

export default function NotificationPage() {
  const [enabled, setEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState('09:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkPermission();
    loadSettings();
  }, []);

  const checkPermission = async () => {
    const perm = await reminderManager.checkPermission();
    setPermission(perm);
  };

  const loadSettings = () => {
    const config = reminderManager.loadConfig();
    setEnabled(config.enabled || false);
    setDailyTime(config.dailyTime || '09:00');
    setDaysOfWeek(config.daysOfWeek || [1, 2, 3, 4, 5]);
  };

  const handleSave = () => {
    const config: ReminderConfig = {
      enabled,
      dailyTime,
      daysOfWeek,
    };
    reminderManager.setReminder(config);
    alert('리마인더가 설정되었습니다.');
  };

  const handleTestNotification = async () => {
    // 최신 권한 상태 확인
    const currentPermission = await reminderManager.checkPermission();
    setPermission(currentPermission);
    
    if (currentPermission === 'granted') {
      new Notification('Jihoo Quest', {
        body: '테스트 알림입니다.',
        icon: '/icon-192x192.png',
      });
    } else {
      alert('알림 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.');
    }
  };

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">알림 설정</h1>

      <div className="max-w-2xl space-y-6">
        {/* 알림 권한 상태 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">알림 권한</h2>
          <div className="flex items-center justify-between">
            <p>
              현재 상태: <span className="font-bold">{permission === 'granted' ? '허용됨' : '거부됨'}</span>
            </p>
            <Button
              onClick={checkPermission}
              variant="outline"
            >
              권한 확인
            </Button>
          </div>
          {permission !== 'granted' && (
            <p className="text-sm text-red-600 mt-2">
              알림을 받으려면 브라우저에서 알림 권한을 허용해야 합니다.
            </p>
          )}
        </div>

        {/* 데일리 루틴 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">데일리 루틴</h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>데일리 리마인더 활성화</span>
            </label>

            {enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    알림 시간
                  </label>
                  <input
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    요일 선택
                  </label>
                  <div className="flex gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDay(index)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          daysOfWeek.includes(index)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 테스트 알림 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">테스트 알림</h2>
          <Button
            onClick={handleTestNotification}
            variant="outline"
            disabled={permission !== 'granted'}
          >
            테스트 알림 보내기
          </Button>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}

