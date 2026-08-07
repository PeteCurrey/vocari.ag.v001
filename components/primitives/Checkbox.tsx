'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, checked, onChange, className = '', disabled, id, ...props }: CheckboxProps) {
  const { isConsumer } = useSurface();
  const inputId = id || React.useId();

  return (
    <label htmlFor={inputId} className={`inline-flex items-center space-x-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${
            isConsumer
              ? 'border-silver bg-white peer-checked:bg-cobalt peer-checked:border-cobalt'
              : 'border-silver/30 bg-graphite peer-checked:bg-cobalt peer-checked:border-cobalt'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-ivory opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {label && <span className={`text-sm font-sans select-none ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>{label}</span>}
    </label>
  );
}
