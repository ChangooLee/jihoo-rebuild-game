declare module 'react-katex' {
  import { ReactNode } from 'react';

  export interface MathProps {
    children: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
  }

  export const BlockMath: React.FC<MathProps>;
  export const InlineMath: React.FC<MathProps>;
}

