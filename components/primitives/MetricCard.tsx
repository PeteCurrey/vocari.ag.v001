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
    ? 'bg-white border border-silver/50 p-6'
    : 'bg-[#181A1E] border border-white/10 p-6 text-ivory';

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-graphite/60 mb-2">
        {label}
      </div>
      <div className={`text-4xl font-sans font-light tracking-tight ${isConsumer ? 'text-charcoal' : 'text-white'}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-graphite/80 mt-1.5 font-sans">
          {subtext}
        </div>
      )}
      {sourceStamp && (
        <div className="mt-4 pt-3 border-t border-silver/30">
          <SourceStamp {...sourceStamp} />
        </div>
      )}
    </div>
  );
}
