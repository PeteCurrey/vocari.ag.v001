import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <header className="border-b border-silver/40 bg-ivory sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <span className="font-sans text-xl font-bold tracking-widest text-charcoal uppercase">VOCARI</span>
              <span className="hidden sm:inline-block text-silver font-mono text-xs">|</span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-graphite/60">
                PRECISION · PATHWAYS · IMPACT
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-graphite">
              <Link href="/careers" className="hover:text-cobalt transition-colors">Pathways Index</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors">Funding Engine</Link>
              <Link href="/courses" className="hover:text-cobalt transition-colors">Course Directory</Link>
              <Link href="/partners" className="hover:text-cobalt transition-colors">Enterprise</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/admin">
                <span className="font-mono text-[11px] uppercase tracking-wider text-graphite/70 border border-silver/60 px-3 py-1.5 hover:border-charcoal transition-colors">
                  VERIFICATION GATE
                </span>
              </Link>
              <Link href="/careers">
                <Button variant="primary">EXPLORE PATHWAYS →</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* HERO SECTION — Avorria Precision Luxe Style */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-6 border-b border-silver/40">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-8">
              
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-graphite/70">
                <span className="w-1.5 h-1.5 bg-cobalt inline-block" />
                <span>PRECISION · QUALIFICATIONS · GOVERNANCE</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-charcoal tracking-tight leading-[1.02]">
                Clear Pathways from £0 to Qualified.
              </h1>

              <p className="text-base md:text-lg text-graphite/90 leading-relaxed font-sans max-w-xl">
                Vocari architects transparent UK career routes, exact qualification costs, and government funding eligibility. Every route step is verified directly against Ofqual, Skills England, and statutory regulatory bodies.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/careers">
                  <Button variant="primary" className="w-full sm:w-auto justify-center">
                    EXPLORE PATHWAYS →
                  </Button>
                </Link>
                <Link href="/cost">
                  <Button variant="secondary" className="w-full sm:w-auto justify-center">
                    CALCULATE FUNDING ELIGIBILITY
                  </Button>
                </Link>
              </div>

              {/* Minimal Search Tags */}
              <div className="pt-6 border-t border-silver/40">
                <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60 block mb-3">
                  VERIFIED UK CAREER DIRECTORY:
                </span>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {['Electrician', 'Adult Care Worker', 'Registered Nurse', 'Software Engineer', 'Plumber'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/careers?q=${encodeURIComponent(tag)}`}
                      className="border border-silver/60 px-3 py-1 text-graphite hover:border-charcoal hover:text-charcoal transition-colors uppercase tracking-wider"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Architectural Image Frame */}
            <div className="lg:col-span-6">
              <div className="relative border border-silver/50 p-2 bg-white">
                <div className="relative aspect-[16/10] overflow-hidden bg-warm-stone">
                  <Image
                    src="/images/architecture_facade.jpg"
                    alt="Institutional Precision Architecture"
                    fill
                    className="object-cover grayscale contrast-[1.05]"
                    priority
                  />
                  <div className="absolute inset-0 bg-charcoal/10" />
                  
                  {/* Overlay Badge */}
                  <div className="absolute bottom-4 left-4 bg-charcoal text-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest border border-white/20">
                    INSTITUTIONAL OPEN DATA · OFQUAL REGISTER 2026
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TRUSTED REGULATORS STRIP (Dark Band) */}
        <section className="bg-charcoal text-ivory py-8 px-6 border-b border-graphite">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-silver/60">
              TRUSTED DATA PROVENANCE & REGULATORY SOURCES
            </span>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 font-mono text-xs uppercase tracking-wider text-silver/80">
              <span className="hover:text-white transition-colors">OFQUAL REGISTER</span>
              <span className="text-silver/30">•</span>
              <span className="hover:text-white transition-colors">SKILLS ENGLAND</span>
              <span className="text-silver/30">•</span>
              <span className="hover:text-white transition-colors">NHS ENGLAND</span>
              <span className="text-silver/30">•</span>
              <span className="hover:text-white transition-colors">INSTITUTE FOR APPRENTICESHIPS</span>
              <span className="text-silver/30">•</span>
              <span className="hover:text-white transition-colors">ONS ASHE</span>
            </div>
          </div>
        </section>

        {/* METHODOLOGY / OUR APPROACH SECTION */}
        <section className="py-20 px-6 bg-ivory border-b border-silver/40">
          <div className="max-w-7xl mx-auto space-y-16">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-cobalt font-medium">
                  OUR METHODOLOGY
                </span>
                <h2 className="text-3xl md:text-5xl font-display text-charcoal">
                  Precision at Every Level.
                </h2>
                <p className="text-graphite text-base max-w-2xl">
                  Our integrated framework combines official government API feeds with strict three-tier verification rules to deliver undisputed accuracy.
                </p>
              </div>

              <div className="md:col-span-4 md:text-right font-mono text-xs text-graphite/60">
                <span>01  —  03 STEPS</span>
              </div>
            </div>

            {/* 3 Precision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InsightCard
                category="DATA INTEGRITY"
                date="VERIFIED OCT 2025"
                title="Exact Cost & Duration Transparency"
                excerpt="We calculate mandatory course fees, exam costs, and wage earnings during training so you know your net financial position down to the pound."
                href="/cost"
              />
              <InsightCard
                category="GOVERNANCE"
                date="VERIFIED OCT 2025"
                title="Dual Scheme Funding Resolution"
                excerpt="Our deterministic engine resolves Advanced Learner Loans (ALL) and Lifelong Learning Entitlement (LLE) rules by exact course start date."
                href="/cost"
              />
              <InsightCard
                category="QUALITY GATE"
                date="VERIFIED OCT 2025"
                title="Strict Tier-A Verification Gate"
                excerpt="Statutory professions like Registered Nursing require explicit human sign-off before publication. No unverified or synthetic placeholders permitted."
                href="/about"
              />
            </div>

          </div>
        </section>

        {/* FEATURED CASE STUDY (Dark Architectural Band) */}
        <section className="bg-charcoal text-ivory py-20 px-6 border-b border-graphite">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-silver/60">
                FEATURED VERIFIED PATHWAY
              </span>

              <h2 className="text-3xl md:text-5xl font-display text-white">
                Electrotechnical Apprenticeship Standard
              </h2>

              <p className="text-silver/80 text-base leading-relaxed font-sans">
                Full 48-month pathway to becoming a qualified Electrician in England. Combines Level 3 Electrotechnical Diploma with practical site portfolio and AM2 end-point assessment.
              </p>

              {/* Corporate Stat Rows */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-3xl font-sans font-light text-white">£26,500</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-silver/60 mt-1">STARTING SALARY</div>
                </div>
                <div>
                  <div className="text-3xl font-sans font-light text-white">48 Mths</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-silver/60 mt-1">DURATION</div>
                </div>
                <div>
                  <div className="text-3xl font-sans font-light text-cobalt">100%</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-silver/60 mt-1">FUNDED ELIGIBLE</div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/careers/electrician">
                  <Button variant="primary">VIEW PATHWAY SPECIFICATION →</Button>
                </Link>
              </div>
            </div>

            {/* Right Architectural Image Frame */}
            <div className="lg:col-span-6">
              <div className="relative border border-white/10 p-2 bg-[#181A1E]">
                <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
                  <Image
                    src="/images/corporate_infrastructure.jpg"
                    alt="Corporate Infrastructure"
                    fill
                    className="object-cover grayscale contrast-[1.1]"
                  />
                  <div className="absolute inset-0 bg-charcoal/30" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* VERIFIED OCCUPATIONS DIRECTORY GRID */}
        <section className="py-20 px-6 bg-warm-stone/30 border-b border-silver/40">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-cobalt font-medium">
                  DIRECTORY INDEX
                </span>
                <h2 className="text-3xl md:text-4xl font-display text-charcoal mt-1">
                  Explore Verified UK Pathways
                </h2>
              </div>
              <Link href="/careers" className="font-mono text-xs uppercase tracking-wider text-cobalt hover:underline">
                VIEW ALL CAREERS (INDEX) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {occupations.map((occ) => (
                <Link key={occ.id} href={`/careers/${occ.id}`} className="group">
                  <Card className="h-full flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge status={occ.confidence === 'confirmed' ? 'confirmed' : 'provisional'}>
                          TIER {occ.tier} VERIFIED
                        </Badge>
                        <span className="font-mono text-[11px] text-graphite/60">{occ.route_count} ROUTE{occ.route_count !== 1 ? 'S' : ''}</span>
                      </div>

                      <h3 className="text-xl font-medium text-charcoal group-hover:text-cobalt transition-colors">
                        {occ.title}
                      </h3>

                      <p className="text-xs text-graphite line-clamp-3 leading-relaxed">
                        {occ.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-silver/30 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-graphite/60">ENTRY SALARY:</span>
                        <span className="font-medium text-charcoal">£{occ.salary_entry?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-graphite/60">EXPERIENCED SALARY:</span>
                        <span className="font-medium text-cobalt">£{occ.salary_experienced?.toLocaleString()}</span>
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

        {/* FOOTER */}
        <footer className="bg-charcoal text-ivory py-16 px-6 border-t border-graphite mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs font-mono">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold tracking-widest text-white uppercase font-sans">VOCARI</span>
                <span className="text-silver/40">|</span>
                <span className="text-[10px] text-silver/60 uppercase tracking-widest">CAREER PATHWAY PLATFORM</span>
              </div>
              <p className="text-silver/70 max-w-md leading-relaxed text-[11px] font-sans">
                Vocari is the UK’s open career pathway directory. Powered by official Ofqual Register data, Department for Education transparency CSVs, and Skills England Open Data under the Open Government Licence v3.0.
              </p>
              <p className="text-silver/40 text-[10px]">
                © {new Date().getFullYear()} VOCARI PLATFORM. ALL RIGHTS RESERVED.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-silver uppercase tracking-widest">PLATFORM TOOLS</h4>
              <ul className="space-y-2 text-silver/70">
                <li><Link href="/careers" className="hover:text-white transition-colors">CAREER PATHWAYS</Link></li>
                <li><Link href="/cost" className="hover:text-white transition-colors">FUNDING CALCULATOR</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">COURSE DIRECTORY</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-silver uppercase tracking-widest">GOVERNANCE & AUDIT</h4>
              <ul className="space-y-2 text-silver/70">
                <li><Link href="/admin" className="hover:text-white transition-colors">VERIFICATION GATE (/admin)</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">ENTERPRISE PORTAL</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">OPEN DATA POLICY</Link></li>
              </ul>
            </div>
          </div>
        </footer>

      </div>
    </SurfaceProvider>
  );
}
