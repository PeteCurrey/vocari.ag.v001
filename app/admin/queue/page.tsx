'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { SourceStamp } from '@/components/primitives/SourceStamp';

export default function AdminReviewQueuePage() {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchQueue = () => {
    fetch('/api/admin/queue')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setQueue(res.queue);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = (table: string, id: string, tier: 'A' | 'B' | 'C' = 'A') => {
    fetch('/api/admin/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', table, id, tier, verifiedBy: 'pete@vocari.co.uk' }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setActionMessage(`Item ${id} APPROVED (Review due: ${res.row?.review_due || '+90 days'})`);
          fetchQueue();
        }
      });
  };

  return (
    <SurfaceProvider surface="partner">
      <div className="min-h-screen bg-charcoal text-ivory p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-graphite pb-6">
            <div>
              <Link href="/admin" className="text-xs font-mono text-silver hover:text-ivory uppercase tracking-wider mb-1 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-ivory">Review Queue Inbox</h1>
            </div>
          </div>

          {actionMessage && (
            <div className="p-4 bg-cobalt/20 border border-cobalt text-ivory rounded-lg text-sm font-mono">
              {actionMessage}
            </div>
          )}

          {/* Staging Qualifications Queue */}
          <Card className="p-6 border border-graphite rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ivory">Provisional Requirements & Staging Queue</h2>
              <Badge status="provisional">{queue?.provisionalRequirements?.length || 0} Pending</Badge>
            </div>

            {loading ? (
              <p className="text-sm text-silver font-mono">Loading queue items...</p>
            ) : queue?.provisionalRequirements?.length === 0 ? (
              <p className="text-sm text-silver">No items currently awaiting promotion.</p>
            ) : (
              <div className="space-y-4">
                {queue?.provisionalRequirements?.map((item: any) => (
                  <div key={item.id} className="p-4 bg-graphite rounded-lg border border-silver/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-coral uppercase font-bold">[{item.kind}]</span>
                        <span className="font-semibold text-ivory text-base">{item.label}</span>
                      </div>

                      <SourceStamp
                        sourceName={item.source_name || 'Ofqual Register API'}
                        sourceUrl={item.source_url || 'https://register-api.ofqual.gov.uk/api/qualifications'}
                        verifiedAt={item.verified_at}
                        reviewDue={item.review_due}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="primary" onClick={() => handleApprove('requirements', item.id, 'A')}>
                        Approve (Tier A +90d)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </SurfaceProvider>
  );
}
