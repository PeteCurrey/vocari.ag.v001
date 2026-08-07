'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, steps, className = '' }: StepIndicatorProps) {
  const { isConsumer } = useSurface();

  const formattedCurrent = String(currentStep).padStart(2, '0');
  const formattedTotal = String(totalSteps).padStart(2, '0');

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between font-mono text-xs tracking-wider">
        <span className="text-cobalt font-bold">
          {formattedCurrent} <span className="text-silver/60 font-normal">/ {formattedTotal}</span>
        </span>
        {steps && steps[currentStep - 1] && (
          <span className={`font-sans font-medium text-xs ${isConsumer ? 'text-graphite' : 'text-silver'}`}>
            {steps[currentStep - 1]}
          </span>
        )}
      </div>
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isConsumer ? 'bg-warm-stone' : 'bg-graphite'}`}>
        <div
          className={`h-full transition-all duration-300 ${isConsumer ? 'bg-coral' : 'bg-cobalt'}`}
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
