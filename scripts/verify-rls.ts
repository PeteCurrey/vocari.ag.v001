import { db, queryWithRls } from '../lib/db';

function runRlsVerification() {
  console.log('--- RLS VERIFICATION TEST ---');

  // Insert test rows into occupations
  db.prepare(`
    INSERT OR REPLACE INTO occupations
    (id, title, soc_2020_code, summary, tier, confidence, verified_at, verified_by)
    VALUES
    ('electrician-confirmed', 'Electrician (Confirmed)', '5224', 'Confirmed occupation summary', 'B', 'confirmed', '2026-08-01 10:00:00', 'PC'),
    ('electrician-provisional', 'Electrician (Provisional)', '5224', 'Provisional draft summary', 'B', 'provisional', NULL, NULL)
  `).run();

  // Service role query (all rows visible)
  const serviceRoleRows = queryWithRls('occupations', true) as any[];
  console.log('\n[SERVICE ROLE ACCESS - Full Access]');
  console.log(`Total rows returned: ${serviceRoleRows.length}`);
  console.log('Rows:', serviceRoleRows.map((r) => ({ id: r.id, title: r.title, confidence: r.confidence, verified_at: r.verified_at })));

  // Public Anon client query (RLS enforced: confidence='confirmed' AND verified_at IS NOT NULL)
  const publicAnonRows = queryWithRls('occupations', false) as any[];
  console.log('\n[PUBLIC ANON CLIENT ACCESS - RLS Policy Enforced]');
  console.log(`Total rows returned: ${publicAnonRows.length}`);
  console.log('Rows:', publicAnonRows.map((r) => ({ id: r.id, title: r.title, confidence: r.confidence, verified_at: r.verified_at })));

  const provisionalReadableByPublic = publicAnonRows.some((r) => r.confidence === 'provisional' || r.verified_at === null);
  console.log('\nPROVISIONAL ROW READABLE BY PUBLIC ANON CLIENT?:', provisionalReadableByPublic ? 'FAIL — EXPOSED' : 'PASS — BLOCKED (0 provisional rows exposed)');
}

runRlsVerification();
