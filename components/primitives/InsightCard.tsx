'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';

export interface InsightCardProps {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  href?: string;
  className?: string;
}

export function InsightCard({
  title,
  category,
  date,
  excerpt,
  href = '#',
  className = '',
}: InsightCardProps) {
  const { isConsumer } = useSurface();

  const containerStyles = isConsumer
    ? 'group block bg-white border border-silver/50 p-6 transition-all hover:border-graphite'
    : 'group block bg-[#181A1E] border border-white/10 p-6 transition-all hover:border-white/30 text-ivory';

  return (
    <a href={href} className={`${containerStyles} ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono mb-4">
        <span className="uppercase tracking-widest text-cobalt font-medium">
          {category}
        </span>
        <span className={isConsumer ? 'text-graphite/60' : 'text-silver/60'}>{date}</span>
      </div>
      <h3 className={`font-sans font-medium text-lg mb-2 group-hover:text-cobalt transition-colors ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>
        {title}
      </h3>
      <p className={`text-xs line-clamp-3 leading-relaxed ${isConsumer ? 'text-graphite' : 'text-silver/80'}`}>{excerpt}</p>
      <div className="mt-6 pt-4 border-t border-silver/30 inline-flex items-center text-[11px] font-mono uppercase tracking-widest text-cobalt group-hover:translate-x-1 transition-transform">
        READ INSIGHT →
      </div>
    </a>
  );
}
