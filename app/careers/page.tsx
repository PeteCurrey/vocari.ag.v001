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
        <header className="border-b border-silver/40 bg-ivory/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cobalt flex items-center justify-center text-white font-mono font-bold text-lg">
                V
              </div>
              <span className="font-display text-2xl font-bold text-charcoal">vocari</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-graphite">
              <Link href="/careers" className="text-cobalt font-semibold">Career Pathways</Link>
              <Link href="/cost" className="hover:text-cobalt transition-colors">£0 to Qualified Calculator</Link>
              <Link href="/courses" className="hover:text-cobalt transition-colors font-mono text-xs uppercase bg-warm-stone px-2.5 py-1 rounded-full">Course Directory</Link>
            </nav>

            <Link href="/cost">
              <Button variant="primary">Calculator →</Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-10 flex-1">
          
          <div className="space-y-4">
            <span className="font-mono text-xs text-cobalt uppercase tracking-widest font-bold">DIRECTORY INDEX</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal">
              UK Career Pathways
            </h1>
            <p className="text-lg text-graphite/90 max-w-2xl">
              Compare exact qualification requirements, entry salaries, and verified training steps across all regulated UK professions.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-warm-stone/50 border border-silver/60 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <form method="GET" action="/careers" className="flex-1 flex items-center gap-3">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by career title or keyword..."
                className="w-full bg-white border border-silver/60 rounded-lg px-4 py-2 text-sm text-charcoal focus:outline-none focus:border-cobalt"
              />
              <Button type="submit" variant="secondary" className="text-xs">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-graphite">Filter Tier:</span>
              {['all', 'A', 'B', 'C'].map((t) => (
                <Link
                  key={t}
                  href={`/careers?tier=${t}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                  className={`px-3 py-1.5 rounded-md font-bold uppercase transition-colors ${
                    selectedTier === t ? 'bg-cobalt text-white' : 'bg-white text-graphite hover:bg-warm-stone border border-silver/60'
                  }`}
                >
                  {t === 'all' ? 'All Tiers' : `Tier ${t}`}
                </Link>
              ))}
            </div>
          </div>

          {/* Occupation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {occupations.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-white rounded-xl border border-silver/60 space-y-3">
                <p className="text-lg font-bold text-charcoal">No careers matched your search criteria.</p>
                <p className="text-sm text-graphite">Try searching for Electrician, Adult Care Worker, or Registered Nurse.</p>
                <Link href="/careers">
                  <Button variant="secondary" className="mt-4">Reset Filters</Button>
                </Link>
              </div>
            ) : (
              occupations.map((occ) => (
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
              ))
            )}
          </div>

        </main>
      </div>
    </SurfaceProvider>
  );
}
