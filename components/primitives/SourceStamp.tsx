'use client';

import React from 'react';

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
      <div className={`inline-flex items-center space-x-1 font-mono text-[10px] uppercase tracking-widest text-coral ${className}`}>
        <span>[!] REVIEW DUE — CONFIRM DIRECTLY WITH REGULATOR</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center flex-wrap gap-1 font-mono text-[10px] uppercase tracking-widest text-graphite/60 ${className}`}>
      <span>SRC:</span>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-cobalt font-medium"
        >
          {sourceName} ↗
        </a>
      ) : (
        <span className="font-medium text-graphite">{sourceName}</span>
      )}
      <span>·</span>
      <span>{formattedDate}</span>
    </div>
  );
}
