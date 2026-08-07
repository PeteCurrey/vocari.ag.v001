import { NextResponse } from 'next/server';
import { db, approveQueueItem } from '../../../../lib/db';

export async function GET() {
  try {
    // 1. New staging qualifications awaiting review
    const stagingQuals = db.prepare("SELECT * FROM staging_qualifications ORDER BY ingested_at DESC LIMIT 25").all();

    // 2. Provisional requirements awaiting human confirmation
    const provisionalReqs = db.prepare("SELECT * FROM requirements WHERE confidence = 'provisional' OR verified_at IS NULL LIMIT 25").all();

    // 3. Past review due items
    const today = new Date().toISOString().split('T')[0];
    const pastReviewDue = db.prepare(`SELECT * FROM occupations WHERE review_due < '${today}' LIMIT 25`).all();

    // 4. Withdrawn qualifications on pathways
    const withdrawnQuals = db.prepare("SELECT * FROM qualifications WHERE status = 'Withdrawn' LIMIT 25").all();

    return NextResponse.json({
      success: true,
      queue: {
        stagingQualifications: stagingQuals,
        provisionalRequirements: provisionalReqs,
        pastReviewDue,
        withdrawnQualifications: withdrawnQuals,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, table, id, verifiedBy, tier, sourceName, sourceUrl } = body;

    if (action === 'approve') {
      const updatedRow = approveQueueItem({
        table,
        id,
        verifiedBy: verifiedBy || 'admin@vocari.co.uk',
        tier: tier || 'B',
        sourceName,
        sourceUrl,
      });

      return NextResponse.json({ success: true, action: 'approved', row: updatedRow });
    }

    if (action === 'reject') {
      db.prepare(`UPDATE ${table} SET confidence = 'provisional', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
      return NextResponse.json({ success: true, action: 'rejected', id });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
