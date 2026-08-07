'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  const { isConsumer } = useSurface();

  const styles = isConsumer
    ? 'bg-white border border-silver/50 p-6 transition-all hover:border-graphite'
    : 'bg-[#181A1E] border border-white/10 p-6 transition-all hover:border-white/30 text-ivory';

  return <div className={`${styles} ${className}`}>{children}</div>;
}
