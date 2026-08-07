import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <span className="font-mono text-xs text-cobalt uppercase tracking-widest">Vocari — Consumer Surface</span>
        <h1 className="text-4xl font-display font-bold text-charcoal">
          Clear Pathways from £0 to Qualified
        </h1>
        <p className="text-lg text-graphite font-sans">
          Discover genuine UK career routes, exact qualification costs, and funding eligibility.
        </p>
        <div className="pt-4 flex flex-wrap gap-4 font-mono text-sm">
          <Link href="/careers" className="text-cobalt hover:underline">/careers</Link>
          <Link href="/cost" className="text-cobalt hover:underline">/cost</Link>
          <Link href="/courses" className="text-cobalt hover:underline">/courses</Link>
          <Link href="/account" className="text-cobalt hover:underline">/account</Link>
          <Link href="/partners" className="text-cobalt hover:underline">/partners</Link>
          <Link href="/admin" className="text-cobalt hover:underline">/admin</Link>
          <Link href="/token-test" className="text-cobalt font-bold hover:underline">/token-test ( primitives demo )</Link>
        </div>
      </div>
    </main>
  );
}
