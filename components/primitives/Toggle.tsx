'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, className = '' }: ToggleProps) {
  const { isConsumer } = useSurface();

  return (
    <label className={`inline-flex items-center space-x-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cobalt ${
          checked
            ? 'bg-cobalt'
            : isConsumer
            ? 'bg-warm-stone border-silver/40'
            : 'bg-graphite border-silver/20'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className={`text-sm font-sans select-none ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>{label}</span>}
    </label>
  );
}
