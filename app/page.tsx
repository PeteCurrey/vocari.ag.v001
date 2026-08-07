import React from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { MetricCard } from '@/components/primitives/MetricCard';
import { InsightCard } from '@/components/primitives/InsightCard';
import { Badge } from '@/components/primitives/Badge';
import { SourceStamp } from '@/components/primitives/SourceStamp';
import { db } from '@/lib/db';

export default function HomePage() {
  // Query seeded published occupations from SQLite database
  const occupations = db.prepare(`
    SELECT o.*, 
           (SELECT COUNT(*) FROM routes r WHERE r.occupation_id = o.id) as route_count,
           (SELECT MIN(typical_duration_months) FROM routes r WHERE r.occupation_id = o.id) as min_duration
    FROM occupations o
    WHERE o.published = 1
    ORDER BY o.title ASC
  `).all() as any[];

  return (
    <SurfaceProvider surface="consumer">
      <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans selection:bg-cobalt selection:text-white">
        
        {/* Navigation Header */}
        <header className="border-b border-silver/40 bg-ivory/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-cobalt flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="font-display text-2xl font-bold text-charcoal tracking-tight">vocari</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-graphite">
              <Link href="/careers" className="hover:text-cobalt transition-colors">Career Pathways</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors">£0 to Qualified Calculator</Link>
              <Link href="/courses" className="hover:text-cobalt transition-colors font-mono text-xs uppercase bg-warm-stone px-2.5 py-1 rounded-full text-graphite">Course Directory</Link>
              <Link href="/partners" className="hover:text-cobalt transition-colors">For Providers</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="secondary" className="hidden sm:inline-flex text-xs font-mono">
                  Admin Gate
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="primary">Explore Careers →</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-stone/80 border border-silver/60 text-graphite font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                <span>Verified UK Government Open Data · October 2025 Standard</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-charcoal tracking-tight leading-[1.08]">
                Clear Pathways from <span className="text-cobalt underline decoration-coral/40 decoration-4">£0 to Qualified</span>.
              </h1>

              <p className="text-lg md:text-xl text-graphite/90 leading-relaxed max-w-2xl">
                Discover genuine UK career routes, exact qualification costs, and funding eligibility. Every route step verified against Ofqual, Skills England, and NHS regulatory standards.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/careers">
                  <Button variant="primary" className="text-base px-8 py-3.5 w-full sm:w-auto justify-center shadow-lg shadow-cobalt/20">
                    Browse All Pathways →
                  </Button>
                </Link>
                <Link href="/cost">
                  <Button variant="secondary" className="text-base px-8 py-3.5 w-full sm:w-auto justify-center">
                    Calculate My Funding Eligibility
                  </Button>
                </Link>
              </div>

              {/* Quick Search Tags */}
              <div className="pt-4 border-t border-silver/40">
                <span className="font-mono text-xs uppercase tracking-wider text-graphite/60 block mb-3">Popular Career Pathways:</span>
                <div className="flex flex-wrap gap-2">
                  {['Electrician', 'Adult Care Worker', 'Registered Nurse', 'Software Engineer', 'Plumber'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/careers?q=${encodeURIComponent(tag)}`}
                      className="text-xs bg-white hover:bg-warm-stone border border-silver/60 px-3 py-1.5 rounded-lg text-graphite transition-colors font-medium shadow-2xs"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Interactive Metric Cards Stack */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative p-2 bg-warm-stone/50 border border-silver/60 rounded-2xl shadow-xl">
                <Card className="space-y-6">
                  <div className="flex items-center justify-between border-b border-silver/40 pb-4">
                    <div>
                      <span className="font-mono text-xs uppercase text-cobalt font-bold tracking-wider">FEATURED PATHWAY</span>
                      <h3 className="text-xl font-bold text-charcoal">Electrotechnical Apprenticeship</h3>
                    </div>
                    <Badge status="confirmed">Tier B Verified</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      label="Starting Salary"
                      value="£26,500"
                      subtext="Average entry wage"
                      sourceStamp={{
                        sourceName: 'ONS ASHE 2025',
                        sourceUrl: 'https://www.jib.org.uk/',
                        verifiedAt: '2025-10-01',
                      }}
                    />
                    <MetricCard
                      label="Time to Qualify"
                      value="48 Months"
                      subtext="Earn while learning"
                      sourceStamp={{
                        sourceName: 'IfATE Standard ST0152',
                        sourceUrl: 'https://www.instituteforapprenticeships.org/',
                        verifiedAt: '2025-10-01',
                      }}
                    />
                  </div>

                  <div className="p-4 bg-ivory rounded-lg border border-silver/40 text-xs space-y-2">
                    <div className="font-mono text-graphite/70 font-semibold uppercase">Step 01 / 03</div>
                    <div className="font-bold text-charcoal text-sm">Level 3 Diploma in Electrotechnical Services</div>
                    <p className="text-graphite">Full 100% funding available via Apprenticeship Levy or Adult Skills Fund.</p>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* Verified Occupations Grid */}
        <section className="bg-warm-stone/40 py-20 px-6 border-y border-silver/40">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-cobalt uppercase tracking-widest font-bold">PROVENANCE-CHECKED DIRECTORY</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal mt-1">
                  Explore Verified Career Pathways
                </h2>
              </div>
              <Link href="/careers" className="text-cobalt font-semibold hover:underline text-sm flex items-center gap-1">
                View all career pathways →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {occupations.map((occ) => (
                <Link key={occ.id} href={`/careers/${occ.id}`} className="group">
                  <Card className="h-full flex flex-col justify-between space-y-6 group-hover:border-cobalt/60 group-hover:shadow-md transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge status={occ.confidence === 'confirmed' ? 'confirmed' : 'provisional'}>
                          Tier {occ.tier} Verified
                        </Badge>
                        <span className="font-mono text-xs text-graphite/60">{occ.route_count} Route{occ.route_count !== 1 ? 's' : ''}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-charcoal group-hover:text-cobalt transition-colors">
                        {occ.title}
                      </h3>

                      <p className="text-sm text-graphite line-clamp-3 leading-relaxed">
                        {occ.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-silver/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-graphite font-mono">Entry Salary:</span>
                        <span className="font-bold text-charcoal font-mono">£{occ.salary_entry?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-graphite font-mono">Experienced Salary:</span>
                        <span className="font-bold text-cobalt font-mono">£{occ.salary_experienced?.toLocaleString()}</span>
                      </div>

                      <SourceStamp
                        sourceName={occ.source_name}
                        sourceUrl={occ.source_url}
                        verifiedAt={occ.verified_at}
                        reviewDue={occ.review_due}
                      />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* How Vocari Works Section */}
        <section className="py-20 px-6 bg-ivory">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-mono text-xs text-cobalt uppercase tracking-widest font-bold">OUR METHODOLOGY</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal">
                How Vocari Eliminates Career Uncertainty
              </h2>
              <p className="text-graphite text-base">
                We combine official government registries with strict human review rules so you get facts, not marketing fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InsightCard
                category="Transparency"
                date="Verified Oct 2025"
                title="Exact Cost & Duration Transparency"
                excerpt="We calculate course fees, exam costs, and wage earnings during training so you know your exact net financial position."
                href="/cost"
              />
              <InsightCard
                category="Government Funding"
                date="Verified Oct 2025"
                title="Dual Scheme Funding Resolution"
                excerpt="Our engine resolves Advanced Learner Loans (ALL) and Lifelong Learning Entitlement (LLE) by course start date."
                href="/cost"
              />
              <InsightCard
                category="Quality Gate"
                date="Verified Oct 2025"
                title="No Unverified Information Policy"
                excerpt="Every salary figure, course aim reference, and regulatory body requirement carries a verified date and source link."
                href="/about"
              />
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="bg-charcoal text-ivory py-16 px-6 border-t border-graphite mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-cobalt flex items-center justify-center text-white font-mono font-bold">
                  V
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-white">vocari</span>
              </div>
              <p className="text-silver/80 max-w-md leading-relaxed text-xs">
                Vocari is the UK’s open career pathway directory. Powered by official Ofqual Register data, Department for Education transparency CSVs, and Skills England Open Data under the Open Government Licence v3.0.
              </p>
              <p className="text-silver/50 font-mono text-[11px]">
                © {new Date().getFullYear()} Vocari Platform. All rights reserved.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs text-silver uppercase tracking-wider font-bold">Consumer Tools</h4>
              <ul className="space-y-2 text-silver/80 font-mono text-xs">
                <li><Link href="/careers" className="hover:text-white transition-colors">Career Pathways</Link></li>
                <li><Link href="/cost" className="hover:text-white transition-colors">£0 to Qualified Calculator</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">Course Directory</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs text-silver uppercase tracking-wider font-bold">Governance & Quality</h4>
              <ul className="space-y-2 text-silver/80 font-mono text-xs">
                <li><Link href="/admin" className="hover:text-white transition-colors">Verification Admin (/admin)</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">Partner Portal</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Open Data Policy</Link></li>
              </ul>
            </div>
          </div>
        </footer>

      </div>
    </SurfaceProvider>
  );
}
