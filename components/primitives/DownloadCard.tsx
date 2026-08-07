'use client';

import React from 'react';
import { useSurface } from '@/lib/surface/SurfaceContext';
import { Download, FileText } from 'lucide-react';

export interface DownloadCardProps {
  title: string;
  fileSize: string;
  fileFormat: string;
  onDownload?: () => void;
  className?: string;
}

export function DownloadCard({
  title,
  fileSize,
  fileFormat,
  onDownload,
  className = '',
}: DownloadCardProps) {
  const { isConsumer } = useSurface();

  const containerStyles = isConsumer
    ? 'flex items-center justify-between bg-warm-stone/50 border border-silver/60 rounded-xl p-4 hover:bg-warm-stone transition-colors'
    : 'flex items-center justify-between bg-graphite border border-silver/10 rounded-lg p-4 text-ivory hover:border-silver/30 transition-colors';

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-lg ${isConsumer ? 'bg-cobalt/10 text-cobalt' : 'bg-cobalt/20 text-cobalt'}`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className={`font-medium text-sm ${isConsumer ? 'text-charcoal' : 'text-ivory'}`}>{title}</div>
          <div className="font-mono text-xs text-silver/80 uppercase">
            {fileFormat} · {fileSize}
          </div>
        </div>
      </div>
      <button
        onClick={onDownload}
        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-cobalt text-ivory hover:opacity-90 transition-opacity"
      >
        <Download className="w-3.5 h-3.5 mr-1" />
        Download
      </button>
    </div>
  );
}
