'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';

export default function PathwayEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(null);

    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupationId: id }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setPublishError(data.error);
    } else {
      setPublishSuccess(`Occupation ${id} published successfully!`);
    }
  };

  return (
    <SurfaceProvider surface="partner">
      <div className="min-h-screen bg-charcoal text-ivory p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-graphite pb-6">
            <div>
              <Link href="/admin" className="text-xs font-mono text-silver hover:text-ivory uppercase tracking-wider mb-1 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-ivory">Visual Pathway & Provenance Editor</h1>
              <p className="text-sm text-silver">Occupation ID: {id}</p>
            </div>

            <Button variant="primary" onClick={handlePublish}>
              Publish Occupation (Tier-A Gate Enforced)
            </Button>
          </div>

          {publishError && (
            <div className="p-4 bg-coral/20 border border-coral text-ivory rounded-lg text-sm font-mono">
              <span className="font-bold">PUBLISH GATE BLOCKED:</span> {publishError}
            </div>
          )}

          {publishSuccess && (
            <div className="p-4 bg-cobalt/20 border border-cobalt text-ivory rounded-lg text-sm font-mono">
              {publishSuccess}
            </div>
          )}

          <Card className="p-6 border border-graphite rounded-xl space-y-6">
            <h2 className="text-xl font-bold text-ivory">Mandatory Provenance Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-silver mb-1">Source Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Ofqual Register / Institute for Apprenticeships"
                  className="w-full bg-graphite border border-silver/20 rounded px-3 py-2 text-ivory text-sm focus:border-cobalt focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-silver mb-1">Source URL (Mandatory for Save)</label>
                <input
                  type="url"
                  required
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://register-api.ofqual.gov.uk/api/qualifications/..."
                  className="w-full bg-graphite border border-silver/20 rounded px-3 py-2 text-ivory text-sm focus:border-cobalt focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SurfaceProvider>
  );
}
