'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { SourceStamp, SourceStampProps } from './SourceStamp';

export interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  sourceStamp?: SourceStampProps;
  className?: string;
}

export function MetricCard({ label, value, subtext, sourceStamp, className = '' }: MetricCardProps) {
  const { isConsumer } = useSurface();

  const containerStyles = isConsumer
    ? 'bg-white border border-silver/60 rounded-xl p-5 shadow-sm'
    : 'bg-graphite/40 border border-silver/10 rounded-lg p-4 text-ivory';

  const labelStyles = isConsumer ? 'text-xs uppercase tracking-wider text-graphite/70 font-sans' : 'text-xs uppercase tracking-wider text-silver/60 font-mono';
  const valueStyles = isConsumer ? 'text-3xl font-display font-bold text-charcoal mt-1' : 'text-2xl font-mono font-semibold text-ivory mt-1';
  const subtextStyles = isConsumer ? 'text-sm text-graphite mt-1' : 'text-xs text-silver/80 mt-1';

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={labelStyles}>{label}</div>
      <div className={valueStyles}>{value}</div>
      {subtext && <div className={subtextStyles}>{subtext}</div>}
      {sourceStamp && (
        <div className="mt-3 pt-2 border-t border-silver/20">
          <SourceStamp {...sourceStamp} />
        </div>
      )}
    </div>
  );
}
