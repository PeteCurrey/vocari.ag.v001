'use client';

import React from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

export interface SourceStampProps {
  sourceName: string;
  sourceUrl?: string;
  verifiedAt?: string;
  reviewDue?: string;
  className?: string;
}

export function SourceStamp({
  sourceName,
  sourceUrl,
  verifiedAt,
  reviewDue,
  className = '',
}: SourceStampProps) {
  // Check if review due date has passed
  const isStale = React.useMemo(() => {
    if (!reviewDue) return false;
    const due = new Date(reviewDue).getTime();
    return due < Date.now();
  }, [reviewDue]);

  const formattedDate = verifiedAt ? new Date(verifiedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : 'UNVERIFIED';

  if (isStale) {
    return (
      <div className={`inline-flex items-center space-x-1.5 font-mono text-xs text-coral font-semibold ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>UNVERIFIED — confirm before acting</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 font-mono text-[11px] uppercase tracking-wider text-silver/80 ${className}`}>
      <span>SOURCE:</span>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:underline text-cobalt font-medium"
        >
          <span>{sourceName}</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>
      ) : (
        <span className="font-medium text-graphite">{sourceName}</span>
      )}
      <span className="text-silver/40">·</span>
      <span>{formattedDate}</span>
    </div>
  );
}
