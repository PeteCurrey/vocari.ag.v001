import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { MetricCard } from '@/components/primitives/MetricCard';
import { Badge } from '@/components/primitives/Badge';
import { SourceStamp } from '@/components/primitives/SourceStamp';
import { Button } from '@/components/primitives/Button';
import { db } from '@/lib/db';

export default async function OccupationDetailPage({
  params,
}: {
  params: Promise<{ occupation: string }>;
}) {
  const { occupation: occId } = await params;

  // Fetch occupation details
  const occ = db.prepare('SELECT * FROM occupations WHERE id = ?').get(occId) as any;
  if (!occ) {
    notFound();
  }

  // Fetch routes for this occupation
  const routes = db.prepare('SELECT * FROM routes WHERE occupation_id = ? ORDER BY is_primary DESC').all(occId) as any[];

  // Fetch steps for each route
  const routesWithSteps = routes.map((r) => {
    const steps = db.prepare('SELECT * FROM steps WHERE route_id = ? ORDER BY sequence ASC').all(r.id) as any[];
    return { ...r, steps };
  });

  // Fetch registration requirements
  const regReqs = db.prepare(`
    SELECT rr.*, rb.name as body_name, rb.website_url as body_url
    FROM registration_requirements rr
    LEFT JOIN registration_bodies rb ON rr.registration_body_id = rb.id
    WHERE rr.occupation_id = ?
  `).all(occId) as any[];

  // Parse JSON fields safely
  const physicalDemands = JSON.parse(occ.physical_demands || '[]');
  const workPattern = JSON.parse(occ.work_pattern || '[]');

  return (
    <SurfaceProvider surface="consumer">
      <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
        
        {/* Navigation */}
        <header className="border-b border-silver/40 bg-ivory/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cobalt flex items-center justify-center text-white font-mono font-bold text-lg">
                V
              </div>
              <span className="font-display text-2xl font-bold text-charcoal">vocari</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-graphite">
              <Link href="/careers" className="hover:text-cobalt transition-colors font-medium">← Back to Index</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors font-medium">£0 to Qualified Calculator</Link>
            </nav>

            <Link href="/cost">
              <Button variant="primary">Calculate My Cost</Button>
            </Link>
          </div>
        </header>

        {/* SECTION 1: HERO */}
        <section className="bg-white border-b border-silver/40 py-12 md:py-16 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge status={occ.confidence === 'confirmed' ? 'confirmed' : 'provisional'}>
                  Tier {occ.tier} Verified Pathway
                </Badge>
                <span className="font-mono text-xs text-graphite/60 uppercase">SOC Code 2020 Mapped</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-bold text-charcoal tracking-tight">
                {occ.title}
              </h1>

              <p className="text-lg md:text-xl text-graphite/90 max-w-3xl leading-relaxed">
                {occ.summary}
              </p>
            </div>

            {/* Three Key Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <MetricCard
                label="Entry Salary"
                value={`£${occ.salary_entry?.toLocaleString()}`}
                subtext="National starting benchmark"
                sourceStamp={{
                  sourceName: occ.salary_source || 'ONS ASHE 2025',
                  sourceUrl: occ.source_url,
                  verifiedAt: occ.verified_at,
                  reviewDue: occ.review_due,
                }}
              />

              <MetricCard
                label="Time to Qualify"
                value={`${routesWithSteps[0]?.typical_duration_months || 36} Months`}
                subtext={routesWithSteps[0]?.earn_while_learning ? 'Earn while learning' : 'Full-time study'}
                sourceStamp={{
                  sourceName: routesWithSteps[0]?.source_name || 'IfATE Standard',
                  sourceUrl: routesWithSteps[0]?.source_url,
                  verifiedAt: routesWithSteps[0]?.verified_at,
                  reviewDue: routesWithSteps[0]?.review_due,
                }}
              />

              <MetricCard
                label="Typical Cost to You"
                value={`£${routesWithSteps[0]?.typical_cost_gbp_min?.toLocaleString() || '0'}`}
                subtext="After government funding"
                sourceStamp={{
                  sourceName: 'ESFA Adult Skills Fund Policy',
                  sourceUrl: 'https://www.gov.uk/government/organisations/education-and-skills-funding-agency',
                  verifiedAt: occ.verified_at,
                  reviewDue: occ.review_due,
                }}
              />
            </div>

          </div>
        </section>

        {/* SECTION 2: IS THIS YOU? (Honest Downsides & Realities) */}
        <section className="py-16 px-6 max-w-7xl mx-auto space-y-8 w-full">
          <div>
            <span className="font-mono text-xs text-cobalt uppercase tracking-widest font-bold">HONEST REALITY CHECK</span>
            <h2 className="text-3xl font-display font-bold text-charcoal mt-1">
              Is This Career Right For You?
            </h2>
            <p className="text-graphite text-sm mt-1">
              We list the physical demands, work patterns, and honest challenges so you can decide with full clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                <span className="text-coral">⚡</span> Physical Demands
              </h3>
              <ul className="space-y-2 text-sm text-graphite">
                {physicalDemands.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cobalt font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                <span className="text-cobalt">⏱</span> Work Patterns & Shifts
              </h3>
              <ul className="space-y-2 text-sm text-graphite">
                {workPattern.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-coral font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* SECTION 3: ROUTES IN (FLAGSHIP PATHWAY VISUALISATION) */}
        <section className="py-16 px-6 bg-warm-stone/30 border-y border-silver/40">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="font-mono text-xs text-cobalt uppercase tracking-widest font-bold">FLAGSHIP PATHWAY TRACK</span>
              <h2 className="text-3xl font-display font-bold text-charcoal mt-1">
                Routes in to Becoming an {occ.title}
              </h2>
            </div>

            {/* Stepped Route Component */}
            <div className="space-y-8">
              {routesWithSteps.map((route, rIdx) => (
                <Card key={route.id} className="p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-silver/40 pb-4 gap-4">
                    <div>
                      <span className="font-mono text-xs text-cobalt font-bold uppercase">Route 0{rIdx + 1}</span>
                      <h3 className="text-2xl font-bold text-charcoal">{route.label}</h3>
                      <p className="text-sm text-graphite mt-1">{route.suitability_notes}</p>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="bg-ivory border border-silver px-3 py-1.5 rounded-md font-semibold text-charcoal">
                        Duration: {route.typical_duration_months} Months
                      </span>
                      <span className="bg-ivory border border-silver px-3 py-1.5 rounded-md font-semibold text-cobalt">
                        {route.earn_while_learning ? `Earn £${route.typical_wage_during?.toLocaleString()}/yr` : 'Full-Time Study'}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Stepped Nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {route.steps.map((step: any, sIdx: number) => (
                      <div key={step.id} className="bg-white p-5 rounded-xl border border-silver/60 space-y-3 relative shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-cobalt font-bold">STEP 0{sIdx + 1}</span>
                          <Badge status={step.confidence === 'confirmed' ? 'confirmed' : 'provisional'}>
                            {step.duration_months} Mths
                          </Badge>
                        </div>

                        <h4 className="font-bold text-charcoal text-base">{step.label}</h4>

                        <SourceStamp
                          sourceName={step.source_name}
                          sourceUrl={step.source_url}
                          verifiedAt={step.verified_at}
                          reviewDue={step.review_due}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 & 5: REGULATION & STATUTORY REGISTRATIONS */}
        {regReqs.length > 0 && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-6 w-full">
            <div>
              <span className="font-mono text-xs text-coral uppercase tracking-widest font-bold">STATUTORY REGULATION</span>
              <h2 className="text-3xl font-display font-bold text-charcoal mt-1">
                Registration & Mandatory Requirements
              </h2>
            </div>

            <div className="space-y-4">
              {regReqs.map((rr) => (
                <Card key={rr.id} className="p-6 border border-silver/60 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-charcoal">{rr.title}</h3>
                    <Badge status="confirmed">Statutory Requirement</Badge>
                  </div>

                  <p className="text-sm text-graphite leading-relaxed">{rr.description}</p>

                  <div className="pt-3 border-t border-silver/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="text-coral font-semibold">
                      ⚠️ NOTICE: Always confirm registration status directly with {rr.body_name}.
                    </div>

                    {rr.body_url && (
                      <a href={rr.body_url} target="_blank" rel="noopener noreferrer" className="text-cobalt font-bold hover:underline">
                        Visit {rr.body_name} Official Register →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

      </div>
    </SurfaceProvider>
  );
}
