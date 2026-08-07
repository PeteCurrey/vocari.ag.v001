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
        <header className="border-b border-silver/40 bg-ivory sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <span className="font-sans text-xl font-bold tracking-widest text-charcoal uppercase">VOCARI</span>
              <span className="hidden sm:inline-block text-silver font-mono text-xs">|</span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                PATHWAY SPECIFICATION
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-graphite">
              <Link href="/careers" className="hover:text-cobalt transition-colors">← INDEX DIRECTORY</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors">FUNDING ENGINE</Link>
            </nav>

            <Link href="/cost">
              <Button variant="primary">CALCULATE COST →</Button>
            </Link>
          </div>
        </header>

        {/* SECTION 1: HERO */}
        <section className="bg-white border-b border-silver/40 py-12 md:py-16 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
                <Badge status={occ.confidence === 'confirmed' ? 'confirmed' : 'provisional'}>
                  TIER {occ.tier} VERIFIED PATHWAY
                </Badge>
                <span className="text-silver/40">•</span>
                <span className="text-graphite/60">SOC CODE 2020 MAPPED</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display text-charcoal tracking-tight">
                {occ.title}
              </h1>

              <p className="text-base md:text-lg text-graphite/90 max-w-3xl leading-relaxed font-sans">
                {occ.summary}
              </p>
            </div>

            {/* Three Key Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <MetricCard
                label="NATIONAL ENTRY SALARY"
                value={`£${occ.salary_entry?.toLocaleString()}`}
                subtext="Average entry benchmark"
                sourceStamp={{
                  sourceName: occ.salary_source || 'ONS ASHE 2025',
                  sourceUrl: occ.source_url,
                  verifiedAt: occ.verified_at,
                  reviewDue: occ.review_due,
                }}
              />

              <MetricCard
                label="TYPICAL DURATION"
                value={`${routesWithSteps[0]?.typical_duration_months || 36} Months`}
                subtext={routesWithSteps[0]?.earn_while_learning ? 'Earn while learning model' : 'Full-time study model'}
                sourceStamp={{
                  sourceName: routesWithSteps[0]?.source_name || 'IfATE Standard',
                  sourceUrl: routesWithSteps[0]?.source_url,
                  verifiedAt: routesWithSteps[0]?.verified_at,
                  reviewDue: routesWithSteps[0]?.review_due,
                }}
              />

              <MetricCard
                label="NET FINANCIAL COST"
                value={`£${routesWithSteps[0]?.typical_cost_gbp_min?.toLocaleString() || '0'}`}
                subtext="After government funding eligibility"
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

        {/* SECTION 2: REALITY AUDIT (Physical Demands & Shifts) */}
        <section className="py-16 px-6 max-w-7xl mx-auto space-y-8 w-full">
          <div>
            <span className="font-mono text-[10px] text-cobalt uppercase tracking-widest font-medium">
              OPERATIONAL REALITY AUDIT
            </span>
            <h2 className="text-3xl font-display text-charcoal mt-1">
              Working Environment & Demands
            </h2>
            <p className="text-graphite text-xs font-mono uppercase tracking-wider mt-1">
              VERIFIED PHYSICAL CONSTRAINTS AND SHIFT SCHEDULE PATTERNS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-charcoal font-semibold border-b border-silver/30 pb-3">
                PHYSICAL DEMANDS & ENVIRONMENT
              </h3>
              <ul className="space-y-2.5 text-xs text-graphite font-sans">
                {physicalDemands.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-cobalt font-mono">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-charcoal font-semibold border-b border-silver/30 pb-3">
                WORK PATTERNS & ROTAS
              </h3>
              <ul className="space-y-2.5 text-xs text-graphite font-sans">
                {workPattern.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-coral font-mono">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* SECTION 3: ROUTES IN (STEPPED PATHWAY SPECIFICATION) */}
        <section className="py-16 px-6 bg-warm-stone/30 border-y border-silver/40">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="font-mono text-[10px] text-cobalt uppercase tracking-widest font-medium">
                PATHWAY TRACK ARCHITECTURE
              </span>
              <h2 className="text-3xl font-display text-charcoal mt-1">
                Verified Qualification Routes
              </h2>
            </div>

            {/* Stepped Route Component */}
            <div className="space-y-8">
              {routesWithSteps.map((route, rIdx) => (
                <Card key={route.id} className="p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-silver/30 pb-4 gap-4">
                    <div>
                      <span className="font-mono text-[10px] text-cobalt font-medium uppercase tracking-widest">
                        ROUTE 0{rIdx + 1} SPECIFICATION
                      </span>
                      <h3 className="text-2xl font-medium text-charcoal">{route.label}</h3>
                      <p className="text-xs text-graphite mt-1">{route.suitability_notes}</p>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="border border-silver/50 px-3 py-1 text-charcoal">
                        DURATION: {route.typical_duration_months} MONTHS
                      </span>
                      <span className="border border-silver/50 px-3 py-1 text-cobalt">
                        {route.earn_while_learning ? `SALARY: £${route.typical_wage_during?.toLocaleString()}/YR` : 'FULL-TIME STUDY'}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Stepped Nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {route.steps.map((step: any, sIdx: number) => (
                      <div key={step.id} className="bg-white p-5 border border-silver/50 space-y-3">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                          <span className="text-cobalt font-medium">STEP 0{sIdx + 1}</span>
                          <span className="text-graphite/60">{step.duration_months} MONTHS</span>
                        </div>

                        <h4 className="font-sans font-medium text-charcoal text-sm">{step.label}</h4>

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
              <span className="font-mono text-[10px] text-coral uppercase tracking-widest font-medium">
                STATUTORY COMPLIANCE
              </span>
              <h2 className="text-3xl font-display text-charcoal mt-1">
                Mandatory Regulatory Requirements
              </h2>
            </div>

            <div className="space-y-4">
              {regReqs.map((rr) => (
                <Card key={rr.id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-charcoal">{rr.title}</h3>
                    <Badge status="confirmed">STATUTORY MANDATE</Badge>
                  </div>

                  <p className="text-xs text-graphite leading-relaxed font-sans">{rr.description}</p>

                  <div className="pt-3 border-t border-silver/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest">
                    <div className="text-coral">
                      NOTICE: ALWAYS CONFIRM REGISTRATION DIRECTLY WITH {rr.body_name}.
                    </div>

                    {rr.body_url && (
                      <a href={rr.body_url} target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">
                        VISIT {rr.body_name} OFFICIAL REGISTER ↗
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
