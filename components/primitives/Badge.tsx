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

  let statusStyles = 'bg-cobalt/10 text-cobalt border-cobalt/20';

  if (status === 'stale' || status === 'provisional') {
    statusStyles = 'bg-coral/10 text-coral border-coral/30';
  } else if (status === 'inferred') {
    statusStyles = isConsumer ? 'bg-warm-stone text-graphite border-silver' : 'bg-graphite text-silver border-silver/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold border ${statusStyles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'stale' || status === 'provisional' ? 'bg-coral' : status === 'inferred' ? 'bg-silver' : 'bg-cobalt'}`} />
      {children}
    </span>
  );
}
