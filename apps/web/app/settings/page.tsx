'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { dataManager } from '@/lib/data-management';

export default function SettingsPage() {
  const handleExportData = async () => {
    try {
      const data = await dataManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jihoo-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('데이터가 내보내졌습니다.');
    } catch (error) {
      console.error('Export error:', error);
      alert('데이터 내보내기에 실패했습니다.');
    }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await dataManager.importData(text);
        alert('데이터가 가져와졌습니다.');
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert('데이터 가져오기에 실패했습니다.');
      }
    };
    input.click();
  };

  const handleDeleteData = async () => {
    if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await dataManager.deleteAllData();
        alert('모든 데이터가 삭제되었습니다.');
        window.location.href = '/';
      } catch (error) {
        console.error('Delete error:', error);
        alert('데이터 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">설정</h1>

      <div className="max-w-2xl space-y-6">
        {/* 접근성 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">접근성</h2>
          <p className="text-gray-600 mb-4">
            폰트, 행간, 자간, 애니메이션 강도 등을 조정할 수 있습니다.
          </p>
          <Link href="/settings/accessibility">
            <Button variant="outline">접근성 설정 열기</Button>
          </Link>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">알림</h2>
          <p className="text-gray-600 mb-4">
            데일리 리마인더 및 알림 설정을 관리할 수 있습니다.
          </p>
          <Link href="/settings/notification">
            <Button variant="outline">알림 설정 열기</Button>
          </Link>
        </div>

        {/* 데이터 관리 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">데이터 관리</h2>
          <div className="space-y-4">
            <div>
              <Button onClick={handleExportData} variant="outline" className="mr-2">
                데이터 내보내기
              </Button>
              <Button onClick={handleImportData} variant="outline" className="mr-2">
                데이터 가져오기
              </Button>
            </div>
            <div>
              <Button 
                onClick={handleDeleteData} 
                variant="destructive"
              >
                모든 데이터 삭제
              </Button>
            </div>
          </div>
        </div>

        {/* 정보 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">정보</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>버전: 0.1.0</p>
            <p>Jihoo Quest - 집중력 향상 학습 게임</p>
            <p className="text-xs text-gray-500 mt-4">
              본 앱은 의료기기가 아니며, 상담이나 치료를 대체하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

