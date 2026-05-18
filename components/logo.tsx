import * as React from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Multi-Agent Explorer brand mark — a supervisor pattern in miniature:
 * three sub-agents connected to a central hub. Uses `currentColor`,
 * so it inherits the brand tone wherever it's placed.
 */
export function LogoMark({ size = 20, className, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn('shrink-0', className)}
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5">
        <line x1="16" y1="16" x2="16" y2="6" />
        <line x1="16" y1="16" x2="7"  y2="22" />
        <line x1="16" y1="16" x2="25" y2="22" />
      </g>
      <circle cx="16" cy="6"  r="2.6" fill="currentColor" />
      <circle cx="7"  cy="22" r="2.6" fill="currentColor" />
      <circle cx="25" cy="22" r="2.6" fill="currentColor" />
      <circle cx="16" cy="16" r="3.8" fill="currentColor" />
    </svg>
  );
}
