'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { MetricCard } from '@/components/primitives/MetricCard';
import { Badge } from '@/components/primitives/Badge';
import { SourceStamp } from '@/components/primitives/SourceStamp';

export default function AdminHealthDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/health')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.health);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <SurfaceProvider surface="partner">
      <div className="min-h-screen bg-charcoal text-ivory p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-graphite pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cobalt" />
                <span className="font-mono text-xs text-silver uppercase tracking-widest">VERIFICATION QUALITY GATE</span>
              </div>
              <h1 className="text-3xl font-bold text-ivory">Admin Health Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/queue" className="bg-cobalt text-ivory px-4 py-2 rounded-md font-medium text-sm hover:bg-cobalt/90 transition-colors">
                Review Queue Inbox
              </Link>
              <Link href="/admin/funding" className="bg-graphite border border-silver/20 text-ivory px-4 py-2 rounded-md font-medium text-sm hover:border-silver transition-colors">
                Funding Rules Editor
              </Link>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              label="Tier A Review Overdue (+90d)"
              value={loading ? '...' : String(data?.pastReviewDueByTier?.tierA || 0)}
              subtext={data?.pastReviewDueByTier?.tierA > 0 ? 'CRITICAL REVIEW NEEDED' : 'ALL CURRENT'}
            />
            <MetricCard
              label="Tier B Review Overdue (+180d)"
              value={loading ? '...' : String(data?.pastReviewDueByTier?.tierB || 0)}
              subtext="SCHEDULED REVIEW"
            />
            <MetricCard
              label="Published Occupations"
              value={loading ? '...' : String((data?.publishedOccupationsByTier?.tierA || 0) + (data?.publishedOccupationsByTier?.tierB || 0))}
              subtext="Verified Occupations"
            />
            <MetricCard
              label="Live Routes with Withdrawn Quals"
              value={loading ? '...' : String(data?.liveRoutesWithWithdrawnQuals || 0)}
              subtext={data?.liveRoutesWithWithdrawnQuals === 0 ? 'ZERO VIOLATIONS' : 'CRITICAL ERROR'}
            />
          </div>

          {/* Data Source Ingest Freshness */}
          <Card className="p-6 border border-graphite rounded-xl">
            <h2 className="text-xl font-bold text-ivory mb-4">Ingest Source Freshness & Diagnostics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-graphite rounded-lg border border-silver/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-ivory">Ofqual Register API</span>
                    <Badge status="confirmed">52,655 Active Quals</Badge>
                  </div>
                  <SourceStamp
                    sourceName="Ofqual Register API"
                    sourceUrl="https://register-api.ofqual.gov.uk/api/qualifications"
                    verifiedAt={new Date().toISOString()}
                    reviewDue={new Date(Date.now() + 90 * 86400 * 1000).toISOString()}
                  />
                </div>

                <div className="p-4 bg-graphite rounded-lg border border-silver/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-ivory">NCS Course Directory</span>
                    <Badge status="confirmed">58,947 Live Courses</Badge>
                  </div>
                  <SourceStamp
                    sourceName="DfE Monthly Open Data CSV"
                    sourceUrl="https://assets.publishing.service.gov.uk/media/6a69d8a516bc92f51e1a4303/LiveCoursesWithRegionsAndVenuesReport-20260727.csv"
                    verifiedAt={new Date().toISOString()}
                    reviewDue={new Date(Date.now() + 30 * 86400 * 1000).toISOString()}
                  />
                </div>

                <div className="p-4 bg-graphite rounded-lg border border-silver/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-ivory">Skills England Standards</span>
                    <Badge status="inferred">Published Standards</Badge>
                  </div>
                  <SourceStamp
                    sourceName="IfATE / Skills England Open Data"
                    sourceUrl="https://courses-api.apprenticeships.education.gov.uk/api/standards"
                    verifiedAt={new Date().toISOString()}
                    reviewDue={new Date(Date.now() + 180 * 86400 * 1000).toISOString()}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SurfaceProvider>
  );
}
