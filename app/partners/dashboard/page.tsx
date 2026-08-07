'use client';

import { SurfaceProvider } from '@/lib/surface/SurfaceContext';

export default function PartnerDashboardPage() {
  return (
    <SurfaceProvider surface="partner">
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-ivory mb-2">Provider Portal</h1>
        <p className="text-silver/80 font-mono text-sm">Route shell stub for /partners/dashboard.</p>
      </main>
    </SurfaceProvider>
  );
}
