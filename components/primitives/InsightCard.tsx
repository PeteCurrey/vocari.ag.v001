'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { ArrowRight, BookOpen } from 'lucide-react';

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
    ? 'group block bg-white border border-silver/60 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cobalt/40 transition-all'
    : 'group block bg-graphite/40 border border-silver/10 rounded-lg p-5 hover:border-silver/30 transition-all text-ivory';

  return (
    <a href={href} className={`${containerStyles} ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-3">
        <span className="uppercase tracking-wider text-cobalt font-semibold flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {category}
        </span>
        <span className={isConsumer ? 'text-graphite/60' : 'text-silver/60'}>{date}</span>
      </div>
      <h3 className={`font-display font-semibold text-lg mb-2 group-hover:text-cobalt transition-colors ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>
        {title}
      </h3>
      <p className={`text-sm line-clamp-2 ${isConsumer ? 'text-graphite' : 'text-silver/80'}`}>{excerpt}</p>
      <div className="mt-4 inline-flex items-center text-xs font-semibold text-cobalt group-hover:translate-x-1 transition-transform">
        Read Insight <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </div>
    </a>
  );
}
