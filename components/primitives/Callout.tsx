'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface CalloutProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'info' | 'alert' | 'success';
  className?: string;
}

export function Callout({ children, title, variant = 'info', className = '' }: CalloutProps) {
  const { isConsumer } = useSurface();

  let borderBg = 'border-cobalt/40 bg-cobalt/5 text-cobalt';
  let Icon = Info;

  if (variant === 'alert') {
    borderBg = 'border-coral/40 bg-coral/5 text-coral';
    Icon = AlertTriangle;
  } else if (variant === 'success') {
    borderBg = 'border-cobalt/40 bg-cobalt/5 text-cobalt';
    Icon = CheckCircle2;
  }

  const containerStyles = isConsumer
    ? `border-l-4 rounded-r-lg p-4 shadow-sm ${borderBg} ${variant === 'alert' ? 'bg-coral/5' : 'bg-warm-stone/40'}`
    : `border-l-4 rounded-r-lg p-4 ${borderBg} bg-graphite/60 text-ivory`;

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variant === 'alert' ? 'text-coral' : 'text-cobalt'}`} />
        <div className="flex-1 text-sm">
          {title && <div className={`font-semibold mb-1 ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>{title}</div>}
          <div className={isConsumer ? 'text-graphite' : 'text-silver/90'}>{children}</div>
        </div>
      </div>
    </div>
  );
}
