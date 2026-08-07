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
    ? 'bg-white border border-silver/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'
    : 'bg-graphite/40 border border-silver/10 rounded-lg p-5 hover:border-silver/30 transition-colors text-ivory';

  return <div className={`${styles} ${className}`}>{children}</div>;
}
