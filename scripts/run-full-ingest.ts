import { db } from '../lib/db';

const OFQUAL_API_URL = 'https://register-api.ofqual.gov.uk/api/qualifications';
const NCS_CSV_URL = 'https://assets.publishing.service.gov.uk/media/6a69d8a516bc92f51e1a4303/LiveCoursesWithRegionsAndVenuesReport-20260727.csv';

async function runFullIngest() {
  console.log('================================================================');
  console.log('       VOCARI FULL-SCALE PRODUCTION INGEST & AUDIT RUNNER');
  console.log('================================================================\n');

  // --- PART 1: OFQUAL REGISTER FULL INGEST ---
  console.log('>>> 1. STARTING OFQUAL REGISTER FULL INGEST (~52,655 records) <<<');
  const ofqualStartTime = Date.now();
  let ofqualPage = 1;
  let totalOfqualFetched = 0;
  let ofqualRequestsMade = 0;
  let countNullTqt = 0;
  let countWithOperationalEndDate = 0;
  let ofqualRejections = 0;

  const insertQualStmt = db.prepare(`
    INSERT OR REPLACE INTO staging_qualifications
    (qan, title, awarding_org, level, type, ssa, status, total_credits, tqt, minimum_glh, maximum_glh, operational_start_date, operational_end_date, ingested_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  while (true) {
    ofqualRequestsMade++;
    console.log(`Fetching Ofqual page ${ofqualPage} (pageSize=10000)...`);
    const pageStart = Date.now();
    const res = await fetch(`${OFQUAL_API_URL}?page=${ofqualPage}&pageSize=10000`);
    if (!res.ok) {
      throw new Error(`Ofqual API error on page ${ofqualPage}: HTTP ${res.status}`);
    }

    const data = await res.json();
    const results = data.results || [];
    console.log(`Received ${results.length} records in ${((Date.now() - pageStart) / 1000).toFixed(2)}s`);

    if (results.length === 0) break;

    db.transaction(() => {
      for (const q of results) {
        const qan = q.qualificationNumberNoObliques || q.qualificationNumber?.replace(/\//g, '');
        if (!qan) {
          ofqualRejections++;
          continue;
        }

        if (q.tqt === null || q.tqt === undefined) {
          countNullTqt++;
        }

        if (q.operationalEndDate) {
          countWithOperationalEndDate++;
        }

        insertQualStmt.run(
          qan,
          q.title || 'Untitled Qualification',
          q.organisationName || 'Unknown Awarding Body',
          q.level || 'Unknown Level',
          q.type || 'Other',
          q.ssa || null,
          q.status || 'Active',
          q.totalCredits || 0,
          q.tqt || null,
          q.minimumGLH || null,
          q.maximumGLH || null,
          q.operationalStartDate || null,
          q.operationalEndDate || null
        );
        totalOfqualFetched++;
      }
    })();

    if (results.length < 10000) break;
    ofqualPage++;
  }

  const ofqualElapsedTime = ((Date.now() - ofqualStartTime) / 1000).toFixed(2);
  const stagingQualCount = (db.prepare('SELECT COUNT(*) as count FROM staging_qualifications').get() as any).count;

  console.log(`\nOfqual Ingest Complete!`);
  console.log(`- Final Staging Qualifications Row Count: ${stagingQualCount}`);
  console.log(`- Total Requests Made to Ofqual API: ${ofqualRequestsMade}`);
  console.log(`- Total Elapsed Time: ${ofqualElapsedTime} seconds`);
  console.log(`- Count of Qualifications with NULL TQT: ${countNullTqt}`);
  console.log(`- Count of Qualifications with operationalEndDate: ${countWithOperationalEndDate}`);
  console.log(`- Rejections Count: ${ofqualRejections} (Reason: Missing QAN key)\n`);

  // --- PART 2: NCS COURSE DIRECTORY FULL INGEST ---
  console.log('>>> 2. STARTING NCS COURSE DIRECTORY FULL INGEST (283,744 lines) <<<');
  const ncsStartTime = Date.now();

  const ncsRes = await fetch(NCS_CSV_URL);
  if (!ncsRes.ok) {
    throw new Error(`Failed to fetch NCS CSV: ${ncsRes.statusText}`);
  }

  const csvText = await ncsRes.text();
  const lines = csvText.split('\n');
  const headerLine = lines[0].split(',').map((h) => h.trim().replace(/^"/, '').replace(/"$/, ''));

  const headerMap: { [key: string]: number } = {};
  headerLine.forEach((h, idx) => (headerMap[h] = idx));

  let ncsProcessed = 0;
  let ncsRejections = 0;

  const insertProviderStmt = db.prepare(`
    INSERT OR REPLACE INTO staging_providers
    (ukprn, name, type, postcode, region, ingested_at)
    VALUES (?, ?, 'FE Provider', ?, ?, CURRENT_TIMESTAMP)
  `);

  const insertCourseStmt = db.prepare(`
    INSERT OR REPLACE INTO staging_course_instances
    (course_id, provider_ukprn, qan, title, venue_name, postcode, region, latitude, longitude, delivery_mode, cost_gbp, start_date, ingested_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row = line.split(',').map((cell) => cell.replace(/^"/, '').replace(/"$/, '').trim());
      if (row.length < headerLine.length) {
        ncsRejections++;
        continue;
      }

      const ukprn = row[headerMap['PROVIDER_UKPRN'] ?? 0];
      const courseId = row[headerMap['COURSE_ID'] ?? 1];
      const qan = row[headerMap['LEARN_AIM_REF'] ?? 3];
      const title = row[headerMap['COURSE_NAME'] ?? 4];
      const deliveryMode = row[headerMap['DELIVER_MODE'] ?? 6];
      const startDate = row[headerMap['STARTDATE'] ?? 10];
      const costGbp = parseFloat(row[headerMap['COST'] ?? 13]) || 0.0;
      const venueName = row[headerMap['LOCATION_NAME'] ?? 17];
      const latitude = parseFloat(row[headerMap['LOCATION_LATITUDE'] ?? 22]) || null;
      const longitude = parseFloat(row[headerMap['LOCATION_LONGITUDE'] ?? 23]) || null;
      const postcode = row[headerMap['LOCATION_POSTCODE'] ?? 24];
      const region = row[headerMap['REGIONS'] ?? 16] || 'England';

      if (!courseId || !ukprn) {
        ncsRejections++;
        continue;
      }

      insertProviderStmt.run(ukprn, `Provider ${ukprn}`, postcode, region);
      insertCourseStmt.run(
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
      ncsProcessed++;
    }
  })();

  const ncsElapsedTime = ((Date.now() - ncsStartTime) / 1000).toFixed(2);
  const stagingCourseCount = (db.prepare('SELECT COUNT(*) as count FROM staging_course_instances').get() as any).count;
  const stagingProviderCount = (db.prepare('SELECT COUNT(*) as count FROM staging_providers').get() as any).count;

  console.log(`NCS Ingest Complete!`);
  console.log(`- Final Staging Course Instances Row Count: ${stagingCourseCount}`);
  console.log(`- Final Staging Providers Row Count: ${stagingProviderCount}`);
  console.log(`- Total Elapsed Time: ${ncsElapsedTime} seconds`);
  console.log(`- Rejections Count: ${ncsRejections} (Reason: Truncated CSV row or missing course_id/ukprn)`);
}

runFullIngest();
