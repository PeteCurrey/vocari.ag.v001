'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { resolveFundingEligibility } from '@/lib/funding';

export default function AdminFundingRulesPage() {
  const [courseDate, setCourseDate] = useState('2027-02-15');
  const [resolvedResult, setResolvedResult] = useState<any>(null);

  const sampleRules = [
    {
      id: 'fe-all-row',
      qualification_id: 'qual-sample',
      scheme: 'advanced_learner_loan' as const,
      covers: 'loan_only' as const,
      learner_contribution_gbp: 0,
      scheme_valid_from: '2021-08-01',
      scheme_valid_to: '2027-12-31',
    },
    {
      id: 'fe-lle-row',
      qualification_id: 'qual-sample',
      scheme: 'lifelong_learning_entitlement' as const,
      covers: 'loan_only' as const,
      learner_contribution_gbp: 0,
      scheme_valid_from: '2027-01-01',
      scheme_valid_to: '2030-12-31',
    },
  ];

  const handleSimulate = () => {
    const res = resolveFundingEligibility(sampleRules, courseDate);
    setResolvedResult(res);
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
              <h1 className="text-3xl font-bold text-ivory">Funding Rules Editor</h1>
            </div>
          </div>

          <Card className="p-6 border border-graphite rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-ivory mb-2">Concurrent Scheme Validity Rules</h2>
              <p className="text-sm text-silver">
                Advanced Learner Loans (ALL) and Lifelong Learning Entitlement (LLE) run concurrently in 2027. ALL is extended to 31 Dec 2027; LLE applies to courses starting on or after 1 Jan 2027.
              </p>
            </div>

            <div className="p-4 bg-graphite rounded-lg border border-silver/10 space-y-4">
              <h3 className="text-sm font-mono uppercase text-silver font-bold">Live Resolver Simulator</h3>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-mono text-silver mb-1">Course Start Date</label>
                  <input
                    type="date"
                    value={courseDate}
                    onChange={(e) => setCourseDate(e.target.value)}
                    className="bg-charcoal border border-silver/20 rounded px-3 py-2 text-ivory text-sm focus:border-cobalt focus:outline-none"
                  />
                </div>
                <Button variant="primary" onClick={handleSimulate} className="mt-5">
                  Test Funding Resolution
                </Button>
              </div>

              {resolvedResult && (
                <div className="p-4 bg-charcoal border border-cobalt rounded text-sm space-y-2">
                  <div className="font-mono text-xs text-cobalt font-bold uppercase">RESOLUTION RESULT</div>
                  <div className="text-base font-bold text-ivory">{resolvedResult.resolvedSchemeName}</div>
                  <div className="text-xs text-silver">{resolvedResult.notes}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </SurfaceProvider>
  );
}
