'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text-link';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const { isConsumer } = useSurface();

  let base =
    'inline-flex items-center gap-2 font-sans font-medium tracking-tight ' +
    'transition-all duration-250 focus:outline-none focus-visible:ring-1 focus-visible:ring-cobalt';

  if (variant === 'primary') {
    base += isConsumer
      ? ' bg-cobalt text-white text-sm px-5 py-2.5 hover:bg-charcoal'
      : ' bg-cobalt text-white text-xs px-4 py-2 hover:bg-charcoal';
  } else if (variant === 'secondary') {
    base += isConsumer
      ? ' border border-charcoal text-charcoal text-sm px-5 py-2.5 hover:bg-charcoal hover:text-white'
      : ' border border-silver/30 text-ivory text-xs px-4 py-2 hover:border-silver/60';
  } else if (variant === 'text-link') {
    base += ' text-cobalt text-sm hover:text-charcoal underline-offset-4 hover:underline p-0';
  }

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
