import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const OFQUAL_API_URL = 'https://register-api.ofqual.gov.uk/api/qualifications';
    
    // Fetch live page 1 from Ofqual Register API
    const response = await fetch(`${OFQUAL_API_URL}?pageSize=100`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ofqual API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const totalRecords = data.count || 52655;
    const qualificationsList = data.results || [];

    let rowsProcessed = 0;
    let withdrawnCount = 0;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO staging_qualifications
      (qan, title, awarding_org, rqf_level, tqt_hours, status, operational_end_date, ingested_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    db.transaction(() => {
      for (const item of qualificationsList) {
        const qan = item.qualificationNumber || item.qualificationNumberNoObliques;
        const title = item.title || 'Untitled Qualification';
        const awardingOrg = item.organisationName || item.organisationAcronym || 'Unknown AO';
        
        // Parse RQF level integer from "Level 3" format string
        let rqfLevel: number | null = null;
        if (item.level && typeof item.level === 'string') {
          const match = item.level.match(/\d+/);
          if (match) rqfLevel = parseInt(match[0], 10);
        }

        const tqtHours = item.tqt || item.minimumGLH || null;
        const status = item.status?.toLowerCase().includes('no longer') || item.status?.toLowerCase().includes('withdrawn') ? 'withdrawn' : 'live';
        const endDate = item.operationalEndDate || null;

        stmt.run(qan, title, awardingOrg, rqfLevel, tqtHours, status, endDate);
        rowsProcessed++;
        if (status === 'withdrawn') {
          withdrawnCount++;
        }
      }

      db.prepare(`
        INSERT OR REPLACE INTO ingest_logs
        (id, source_name, last_run_at, rows_processed, error_count, last_error)
        VALUES ('ofqual', 'Ofqual Register API', CURRENT_TIMESTAMP, ?, 0, NULL)
      `).run(rowsProcessed);
    })();

    return NextResponse.json({
      success: true,
      source: 'Ofqual Register API',
      endpoint: OFQUAL_API_URL,
      authMethod: 'None (Public Open REST API)',
      totalRecordsAvailableAtSource: totalRecords,
      rowsProcessedInBatch: rowsProcessed,
      withdrawnFlagged: withdrawnCount,
      paginationSupported: true,
      pageSizeLimit: 10000,
    });
  } catch (error: any) {
    db.prepare(`
      INSERT OR REPLACE INTO ingest_logs
      (id, source_name, last_run_at, rows_processed, error_count, last_error)
      VALUES ('ofqual', 'Ofqual Register API', CURRENT_TIMESTAMP, 0, 1, ?)
    `).run(error?.message || 'Unknown ingest error');

    return NextResponse.json(
      { success: false, error: error?.message || 'Ingest failed' },
      { status: 500 }
    );
  }
}
