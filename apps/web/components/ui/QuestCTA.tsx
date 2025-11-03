'use client';

import { Button } from './button';
import { Keyboard } from 'lucide-react';

interface QuestCTAProps {
  title: string;
  description?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  className?: string;
}

export function QuestCTA({
  title,
  description,
  onClick,
  variant = 'primary',
  icon,
  shortcut,
  disabled = false,
  className = '',
}: QuestCTAProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-analytics={`cta_${title.toLowerCase().replace(/\s+/g, '_')}`}
      className={`
        group relative touch-target w-full
        flex flex-col items-center justify-center gap-3
        px-8 py-6 rounded-2xl
        transition-all duration-300
        ${
          variant === 'primary'
            ? 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-2xl shadow-primary/50'
            : 'bg-card border-2 border-primary/30 text-foreground hover:border-primary hover:shadow-xl'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label={description ? `${title} - ${description}` : title}
    >
      {/* 아이콘 */}
      {icon && (
        <div className="text-4xl transition-transform group-hover:scale-110">
          {icon}
        </div>
      )}

      {/* 제목 */}
      <span className="text-title-md font-bold">
        {title}
      </span>

      {/* 설명 */}
      {description && (
        <span className="text-label-sm opacity-80 text-center max-w-md">
          {description}
        </span>
      )}

      {/* 키보드 단축키 안내 */}
      {shortcut && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded bg-background/20 text-xs opacity-60">
          <Keyboard size={12} />
          <span>{shortcut}</span>
        </div>
      )}

      {/* 호버 효과 */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

