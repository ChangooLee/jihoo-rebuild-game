'use client';

import { ReactNode } from 'react';

export interface GameCardProps {
  title: string;
  description: string;
  subject: 'math' | 'english' | 'science' | 'social' | 'warmup';
  gameType: string;
  icon?: ReactNode;
  onClick: () => void;
}

export function GameCard({ title, description, subject, icon, onClick }: GameCardProps) {
  const subjectColors: Record<string, { bg: string; hoverBg: string; border: string; text: string }> = {
    math: { bg: 'bg-blue-500/10', hoverBg: 'hover:bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-500' },
    english: { bg: 'bg-purple-500/10', hoverBg: 'hover:bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-500' },
    science: { bg: 'bg-green-500/10', hoverBg: 'hover:bg-green-500/20', border: 'border-green-500/30', text: 'text-green-500' },
    social: { bg: 'bg-orange-500/10', hoverBg: 'hover:bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-500' },
    warmup: { bg: 'bg-yellow-500/10', hoverBg: 'hover:bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-500' },
  };

  const colors = subjectColors[subject] || subjectColors.warmup;

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hoverBg} transition-all text-left group`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={`${colors.text} flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-title-md font-semibold mb-2 group-hover:underline">{title}</h3>
          <p className="text-label-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

