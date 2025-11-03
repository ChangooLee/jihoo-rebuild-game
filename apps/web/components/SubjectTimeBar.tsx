'use client';

interface SubjectTimeBarProps {
  mathSeconds: number;
  englishSeconds: number;
  scienceSeconds: number;
  socialSeconds: number;
}

export function SubjectTimeBar({ mathSeconds, englishSeconds, scienceSeconds, socialSeconds }: SubjectTimeBarProps) {
  const total = mathSeconds + englishSeconds + scienceSeconds + socialSeconds;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calcPercent = (seconds: number) => {
    return total > 0 ? (seconds / total) * 100 : 0;
  };

  const subjects = [
    { name: '수학', seconds: mathSeconds, color: 'bg-blue-500', percent: calcPercent(mathSeconds) },
    { name: '영어', seconds: englishSeconds, color: 'bg-purple-500', percent: calcPercent(englishSeconds) },
    { name: '과학', seconds: scienceSeconds, color: 'bg-red-500', percent: calcPercent(scienceSeconds) },
    { name: '사회', seconds: socialSeconds, color: 'bg-green-500', percent: calcPercent(socialSeconds) },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">오늘의 학습 시간</span>
          <span className="text-sm text-gray-600">{formatTime(total)}</span>
        </div>

        {/* 누적 바 */}
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 mb-2">
          {subjects.map((subject) =>
            subject.seconds > 0 ? (
              <div
                key={subject.name}
                className={`${subject.color} transition-all duration-500`}
                style={{ width: `${subject.percent}%` }}
                title={`${subject.name}: ${formatTime(subject.seconds)}`}
              />
            ) : null
          )}
        </div>

        {/* 과목별 시간 */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {subjects.map((subject) => (
            <div key={subject.name} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${subject.color}`} />
              <span className="text-gray-600">
                {subject.name} {formatTime(subject.seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

