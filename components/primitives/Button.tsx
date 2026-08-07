'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { ArrowRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text-link';
  children: React.ReactNode;
  showArrow?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  showArrow = true,
  className = '',
  ...props
}: ButtonProps) {
  const { isConsumer } = useSurface();

  let baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-2';
  
  if (variant === 'primary') {
    if (isConsumer) {
      baseStyles += ' bg-cobalt text-ivory hover:opacity-90 px-6 py-3 rounded-md shadow-sm';
    } else {
      baseStyles += ' bg-cobalt text-ivory hover:bg-opacity-90 px-4 py-2 rounded text-sm';
    }
  } else if (variant === 'secondary') {
    if (isConsumer) {
      baseStyles += ' bg-warm-stone text-charcoal hover:bg-silver px-6 py-3 rounded-md border border-silver';
    } else {
      baseStyles += ' bg-graphite text-ivory hover:bg-opacity-80 px-4 py-2 rounded text-sm border border-silver/20';
    }
  } else if (variant === 'text-link') {
    if (isConsumer) {
      baseStyles += ' text-cobalt hover:underline p-0 underline-offset-4';
    } else {
      baseStyles += ' text-cobalt hover:text-ivory p-0 underline-offset-4 text-sm';
    }
  }

  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className={`ml-2 transition-transform group-hover:translate-x-1 ${variant === 'text-link' ? 'w-4 h-4' : 'w-4 h-4'}`} />
      )}
    </button>
  );
}
