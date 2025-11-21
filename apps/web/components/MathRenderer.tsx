'use client';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export interface MathRendererProps {
  content: string;
  inline?: boolean;
}

/**
 * LaTeX 수식을 렌더링하는 컴포넌트
 * 수식이 포함된 텍스트를 자동으로 감지하여 렌더링
 */
export function MathRenderer({ content, inline = false }: MathRendererProps) {
  // LaTeX 수식 패턴 감지 ($$ ... $$ 또는 \( ... \) 또는 \[ ... \])
  const blockMathPattern = /\$\$([^$]+)\$\$/g;
  const inlineMathPattern = /\\?\(([^)]+)\)/g;
  const displayMathPattern = /\\?\[([^\]]+)\]/g;

  // 수식이 포함되어 있는지 확인 (lastIndex 초기화 후)
  blockMathPattern.lastIndex = 0;
  inlineMathPattern.lastIndex = 0;
  displayMathPattern.lastIndex = 0;
  const hasBlockMath = blockMathPattern.test(content);
  const hasInlineMath = inlineMathPattern.test(content) || displayMathPattern.test(content);

  // Reset again
  blockMathPattern.lastIndex = 0;
  inlineMathPattern.lastIndex = 0;
  displayMathPattern.lastIndex = 0;

  if (!hasBlockMath && !hasInlineMath) {
    // 수식이 없으면 일반 텍스트로 반환
    return <span>{content}</span>;
  }

  // 블록 수식 처리
  if (hasBlockMath) {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    blockMathPattern.lastIndex = 0;

    while ((match = blockMathPattern.exec(content)) !== null) {
      // 수식 앞의 텍스트
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      // 수식
      try {
        parts.push(<BlockMath key={match.index} math={match[1]} />);
      } catch (error) {
        // 수식 파싱 오류 시 원본 텍스트 표시
        parts.push(`$$${match[1]}$$`);
      }
      lastIndex = match.index + match[0].length;
    }

    // 남은 텍스트
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return <div>{parts}</div>;
  }

  // 인라인 수식 처리
  if (hasInlineMath) {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    inlineMathPattern.lastIndex = 0;

    // \( ... \) 패턴 처리
    while ((match = inlineMathPattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      try {
        parts.push(<InlineMath key={match.index} math={match[1]} />);
      } catch (error) {
        parts.push(`\\(${match[1]}\\)`);
      }
      lastIndex = match.index + match[0].length;
    }

    // 남은 텍스트에서 \[ ... \] 패턴 처리
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex);
      let remainingLastIndex = 0;
      
      displayMathPattern.lastIndex = 0;

      while ((match = displayMathPattern.exec(remaining)) !== null) {
        if (match.index > remainingLastIndex) {
          parts.push(remaining.slice(remainingLastIndex, match.index));
        }
        try {
          parts.push(<BlockMath key={lastIndex + match.index} math={match[1]} />);
        } catch (error) {
          parts.push(`\\[${match[1]}\\]`);
        }
        remainingLastIndex = match.index + match[0].length;
      }

      if (remainingLastIndex < remaining.length) {
        parts.push(remaining.slice(remainingLastIndex));
      }
    }

    return <span>{parts}</span>;
  }

  return <span>{content}</span>;
}

