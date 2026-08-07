'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'cobalt' | 'coral';
  className?: string;
}

export function Tag({ children, variant = 'default', className = '' }: TagProps) {
  const { isConsumer } = useSurface();

  let styles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono tracking-wide font-medium';

  if (variant === 'cobalt') {
    styles += ' bg-cobalt/10 text-cobalt border border-cobalt/20';
  } else if (variant === 'coral') {
    styles += ' bg-coral/10 text-coral border border-coral/20';
  } else {
    styles += isConsumer
      ? ' bg-warm-stone text-charcoal border border-silver/40'
      : ' bg-graphite text-ivory border border-silver/10';
  }

  return <span className={`${styles} ${className}`}>{children}</span>;
}
