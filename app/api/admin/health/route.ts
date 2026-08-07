import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Rows past review_due by tier
    const pastReviewTierA = (db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM occupations WHERE tier = 'A' AND review_due < '${today}'
        UNION ALL
        SELECT r.id FROM routes r JOIN occupations o ON r.occupation_id = o.id WHERE o.tier = 'A' AND r.review_due < '${today}'
        UNION ALL
        SELECT s.id FROM steps s JOIN routes r ON s.route_id = r.id JOIN occupations o ON r.occupation_id = o.id WHERE o.tier = 'A' AND s.review_due < '${today}'
      )
    `).get() as any).count;

    const pastReviewTierB = (db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM occupations WHERE tier = 'B' AND review_due < '${today}'
        UNION ALL
        SELECT r.id FROM routes r JOIN occupations o ON r.occupation_id = o.id WHERE o.tier = 'B' AND r.review_due < '${today}'
      )
    `).get() as any).count;

    const pastReviewTierC = (db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM occupations WHERE tier = 'C' AND review_due < '${today}'
      )
    `).get() as any).count;

    // 2. Ingest freshness per source
    const ingestLogs = db.prepare('SELECT * FROM ingest_logs').all();

    // 3. Published occupations by tier
    const publishedTierA = (db.prepare("SELECT COUNT(*) as count FROM occupations WHERE published = 1 AND tier = 'A'").get() as any).count;
    const publishedTierB = (db.prepare("SELECT COUNT(*) as count FROM occupations WHERE published = 1 AND tier = 'B'").get() as any).count;
    const publishedTierC = (db.prepare("SELECT COUNT(*) as count FROM occupations WHERE published = 1 AND tier = 'C'").get() as any).count;

    // 4. Live routes containing a withdrawn qualification (MUST BE ZERO)
    const liveRoutesWithWithdrawnQuals = (db.prepare(`
      SELECT COUNT(*) as count
      FROM requirements req
      JOIN qualifications q ON req.label LIKE '%' || q.qan || '%' OR req.id = q.id
      JOIN steps s ON req.step_id = s.id
      JOIN routes r ON s.route_id = r.id
      JOIN occupations o ON r.occupation_id = o.id
      WHERE o.published = 1 AND q.status = 'Withdrawn'
    `).get() as any).count;

    return NextResponse.json({
      success: true,
      health: {
        pastReviewDueByTier: {
          tierA: pastReviewTierA,
          tierB: pastReviewTierB,
          tierC: pastReviewTierC,
        },
        ingestFreshness: ingestLogs,
        publishedOccupationsByTier: {
          tierA: publishedTierA,
          tierB: publishedTierB,
          tierC: publishedTierC,
        },
        liveRoutesWithWithdrawnQuals,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
