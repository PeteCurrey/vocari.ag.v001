import React from 'react';
import Link from 'next/link';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { SourceStamp } from '@/components/primitives/SourceStamp';
import { Button } from '@/components/primitives/Button';
import { db } from '@/lib/db';

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const selectedTier = params.tier || 'all';

  let sql = `
    SELECT o.*, 
           (SELECT COUNT(*) FROM routes r WHERE r.occupation_id = o.id) as route_count,
           (SELECT MIN(typical_duration_months) FROM routes r WHERE r.occupation_id = o.id) as min_duration
    FROM occupations o
    WHERE o.published = 1
  `;
  const sqlArgs: any[] = [];

  if (searchQuery) {
    sql += ` AND (o.title LIKE ? OR o.summary LIKE ?)`;
    sqlArgs.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }

  if (selectedTier !== 'all') {
    sql += ` AND o.tier = ?`;
    sqlArgs.push(selectedTier);
  }

  sql += ` ORDER BY o.title ASC`;

  const occupations = db.prepare(sql).all(...sqlArgs) as any[];

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
                DIRECTORY INDEX
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-graphite">
              <Link href="/careers" className="text-cobalt font-medium">Pathways Index</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors">Funding Engine</Link>
              <Link href="/courses" className="hover:text-cobalt transition-colors">Course Directory</Link>
            </nav>

            <Link href="/cost">
              <Button variant="primary">FUNDING CALCULATOR →</Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-10 flex-1 w-full">
          
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-cobalt uppercase tracking-widest font-medium">
              VERIFIED UK CAREER DIRECTORY
            </span>
            <h1 className="text-4xl md:text-5xl font-display text-charcoal">
              UK Career Pathways Index
            </h1>
            <p className="text-base text-graphite/90 max-w-2xl">
              Compare exact qualification requirements, entry salaries, and verified training steps across all regulated UK professions.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white border border-silver/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <form method="GET" action="/careers" className="flex-1 flex items-center gap-3">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by career title or keyword..."
                className="w-full bg-ivory border border-silver/50 px-4 py-2 text-xs font-sans text-charcoal focus:outline-none focus:border-cobalt"
              />
              <Button type="submit" variant="secondary" className="text-xs">
                SEARCH
              </Button>
            </form>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-graphite/60 text-[10px] uppercase tracking-wider">FILTER TIER:</span>
              {['all', 'A', 'B', 'C'].map((t) => (
                <Link
                  key={t}
                  href={`/careers?tier=${t}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                  className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                    selectedTier === t ? 'bg-cobalt text-white' : 'bg-ivory text-graphite border border-silver/50 hover:border-charcoal'
                  }`}
                >
                  {t === 'all' ? 'ALL TIERS' : `TIER ${t}`}
                </Link>
              ))}
            </div>
          </div>

          {/* Occupation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {occupations.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-white border border-silver/50 space-y-3">
                <p className="text-lg font-medium text-charcoal">No careers matched your search criteria.</p>
                <p className="text-xs text-graphite font-mono">TRY SEARCHING FOR ELECTRICIAN, ADULT CARE WORKER, OR REGISTERED NURSE.</p>
                <Link href="/careers">
                  <Button variant="secondary" className="mt-4">RESET FILTERS</Button>
                </Link>
              </div>
            ) : (
              occupations.map((occ) => (
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
              ))
            )}
          </div>

        </main>
      </div>
    </SurfaceProvider>
  );
}
