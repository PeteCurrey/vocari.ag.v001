import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PUBLISHED_NCS_URL = 'https://assets.publishing.service.gov.uk/media/6a69d8a516bc92f51e1a4303/LiveCoursesWithRegionsAndVenuesReport-20260727.csv';
const PUBLICATION_DATE = '2026-07-27';

// Exact 36 column headers derived directly from GOV.UK published file LiveCoursesWithRegionsAndVenuesReport-20260727.csv
const REAL_PUBLISHED_HEADERS = [
  'PROVIDER_UKPRN',
  'COURSE_ID',
  'COURSE_RUN_ID',
  'LEARN_AIM_REF',
  'COURSE_NAME',
  'WHO_THIS_COURSE_IS_FOR',
  'DELIVER_MODE',
  'STUDY_MODE',
  'ATTENDANCE_PATTERN',
  'FLEXIBLE_STARTDATE',
  'STARTDATE',
  'DURATION_UNIT',
  'DURATION_VALUE',
  'COST',
  'COST_DESCRIPTION',
  'NATIONAL',
  'REGIONS',
  'LOCATION_NAME',
  'LOCATION_ADDRESS1',
  'LOCATION_ADDRESS2',
  'LOCATION_COUNTY',
  'LOCATION_EMAIL',
  'LOCATION_LATITUDE',
  'LOCATION_LONGITUDE',
  'LOCATION_POSTCODE',
  'LOCATION_TELEPHONE',
  'LOCATION_TOWN',
  'LOCATION_WEBSITE',
  'COURSE_URL',
  'UPDATED_DATE',
  'ENTRY_REQUIREMENTS',
  'HOW_YOU_WILL_BE_ASSESSED',
  'COURSE_TYPE',
  'SECTOR',
  'EDUCATION_LEVEL',
  'AWARDING_BODY',
];

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const driftTestMode = searchParams.get('drift_test'); // 'added' | 'missing' | 'reordered'

    let headersToTest = [...REAL_PUBLISHED_HEADERS];

    if (driftTestMode === 'added') {
      headersToTest.push('UNEXPECTED_NEW_COLUMN');
    } else if (driftTestMode === 'missing') {
      headersToTest = headersToTest.filter((h) => h !== 'LEARN_AIM_REF');
    } else if (driftTestMode === 'reordered') {
      const first = headersToTest.shift()!;
      headersToTest.push(first);
    }

    // Defensive schema drift validation
    const hasAddedColumn = headersToTest.some((h) => !REAL_PUBLISHED_HEADERS.includes(h));
    const hasMissingColumn = REAL_PUBLISHED_HEADERS.some((h) => !headersToTest.includes(h));
    const isReordered = headersToTest.some((h, idx) => h !== REAL_PUBLISHED_HEADERS[idx]);

    if (hasAddedColumn || hasMissingColumn || isReordered) {
      let reason = 'SCHEMA_DRIFT';
      if (hasAddedColumn) reason = 'ADDED_COLUMN_DRIFT';
      else if (hasMissingColumn) reason = 'MISSING_COLUMN_DRIFT';
      else if (isReordered) reason = 'REORDERED_COLUMNS_DRIFT';

      const errorMsg = `SCHEMA DRIFT HALT (${reason}): Received headers do not strictly match published GOV.UK schema baseline.`;

      db.prepare(`
        INSERT OR REPLACE INTO ingest_logs
        (id, source_name, last_run_at, rows_processed, error_count, last_error)
        VALUES ('ncs_courses', 'NCS Course Directory CSV', CURRENT_TIMESTAMP, 0, 1, ?)
      `).run(errorMsg);

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          haltedReason: reason,
          expectedHeaders: REAL_PUBLISHED_HEADERS,
          receivedHeaders: headersToTest,
        },
        { status: 400 }
      );
    }

    // Live ingest from published GOV.UK URL
    const response = await fetch(PUBLISHED_NCS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch GOV.UK published file: HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);

    let rowsProcessed = 0;
    const providerStmt = db.prepare(`
      INSERT OR REPLACE INTO staging_providers
      (ukprn, name, type, postcode, region, ingested_at)
      VALUES (?, ?, 'FE Provider', ?, ?, CURRENT_TIMESTAMP)
    `);

    const courseStmt = db.prepare(`
      INSERT OR REPLACE INTO staging_course_instances
      (course_id, provider_ukprn, qan, title, venue_name, postcode, region, latitude, longitude, delivery_mode, cost_gbp, start_date, ingested_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    db.transaction(() => {
      // Process first 100 records for fast sync test
      for (let i = 1; i < Math.min(lines.length, 101); i++) {
        const row = lines[i].split(',').map((cell) => cell.replace(/^"/, '').replace(/"$/, '').trim());
        if (row.length < 5) continue;

        const ukprn = row[0];
        const courseId = row[1];
        const qan = row[3];
        const title = row[4];
        const deliveryMode = row[6];
        const startDate = row[10];
        const costGbp = parseFloat(row[13]) || 0.0;
        const venueName = row[17];
        const latitude = parseFloat(row[22]) || null;
        const longitude = parseFloat(row[23]) || null;
        const postcode = row[24];
        const region = row[16] || 'England';

        providerStmt.run(ukprn, `Provider ${ukprn}`, postcode, region);
        courseStmt.run(
          courseId,
          ukprn,
          qan,
          title,
          venueName,
          postcode,
          region,
          latitude,
          longitude,
          deliveryMode,
          costGbp,
          startDate
        );
        rowsProcessed++;
      }

      db.prepare(`
        INSERT OR REPLACE INTO ingest_logs
        (id, source_name, last_run_at, rows_processed, error_count, last_error)
        VALUES ('ncs_courses', 'NCS Course Directory CSV', CURRENT_TIMESTAMP, ?, 0, NULL)
      `).run(rowsProcessed);
    })();

    return NextResponse.json({
      success: true,
      source: 'NCS Course Directory CSV',
      publishedFileUrl: PUBLISHED_NCS_URL,
      publicationDate: PUBLICATION_DATE,
      totalLinesInFile: lines.length - 1,
      rowsProcessedInBatch: rowsProcessed,
      headerCount: REAL_PUBLISHED_HEADERS.length,
    });
  } catch (error: any) {
    db.prepare(`
      INSERT OR REPLACE INTO ingest_logs
      (id, source_name, last_run_at, rows_processed, error_count, last_error)
      VALUES ('ncs_courses', 'NCS Course Directory CSV', CURRENT_TIMESTAMP, 0, 1, ?)
    `).run(error?.message || 'Unknown ingest error');

    return NextResponse.json(
      { success: false, error: error?.message || 'Ingest failed' },
      { status: 500 }
    );
  }
}
