'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface BadgeProps {
  children: React.ReactNode;
  status?: 'confirmed' | 'inferred' | 'provisional' | 'stale';
  className?: string;
}

export function Badge({ children, status = 'confirmed', className = '' }: BadgeProps) {
  const { isConsumer } = useSurface();

  let statusStyles = 'border-cobalt/40 text-cobalt bg-transparent';

  if (status === 'stale' || status === 'provisional') {
    statusStyles = 'border-coral/40 text-coral bg-transparent';
  } else if (status === 'inferred') {
    statusStyles = isConsumer ? 'border-silver text-graphite bg-transparent' : 'border-silver/20 text-silver bg-transparent';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${statusStyles} ${className}`}>
      {children}
    </span>
  );
}
