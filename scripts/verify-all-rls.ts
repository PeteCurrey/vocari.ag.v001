import { db, queryWithRls } from '../lib/db';

const TABLES_TO_TEST = [
  'occupations',
  'routes',
  'steps',
  'requirements',
  'qualifications',
  'funding_eligibility',
  'registration_requirements',
  'course_instances',
  'occupation_soc_map',
];

function seedTableTestData(table: string) {
  if (table === 'occupations') {
    db.exec(`
      INSERT OR REPLACE INTO occupations
      (id, title, summary, tier, confidence, verified_at, verified_by)
      VALUES
      ('occ-confirmed', 'Electrician Confirmed', 'Summary', 'B', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('occ-provisional', 'Electrician Provisional', 'Summary', 'B', 'provisional', NULL, NULL);
    `);
  } else if (table === 'routes') {
    db.exec(`
      INSERT OR REPLACE INTO routes
      (id, occupation_id, type, label, confidence, verified_at, verified_by)
      VALUES
      ('route-confirmed', 'occ-confirmed', 'college', 'College Route', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('route-provisional', 'occ-provisional', 'college', 'College Draft', 'provisional', NULL, NULL);
    `);
  } else if (table === 'steps') {
    db.exec(`
      INSERT OR REPLACE INTO steps
      (id, route_id, sequence, label, confidence, verified_at, verified_by)
      VALUES
      ('step-confirmed', 'route-confirmed', 1, 'Step 1 Confirmed', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('step-provisional', 'route-provisional', 1, 'Step 1 Provisional', 'provisional', NULL, NULL);
    `);
  } else if (table === 'requirements') {
    db.exec(`
      INSERT OR REPLACE INTO requirements
      (id, kind, label, confidence, verified_at, verified_by)
      VALUES
      ('req-confirmed', 'qualification', 'L3 Diploma', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('req-provisional', 'qualification', 'L3 Draft', 'provisional', NULL, NULL);
    `);
  } else if (table === 'qualifications') {
    db.exec(`
      INSERT OR REPLACE INTO qualifications
      (id, qan, title, awarding_org, confidence, verified_at, verified_by)
      VALUES
      ('qual-confirmed', '601/4699/5', 'L3 NVQ Electrical', 'City & Guilds', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('qual-provisional', '601/9999/9', 'L3 Draft Qual', 'Pearson', 'provisional', NULL, NULL);
    `);
  } else if (table === 'funding_eligibility') {
    db.exec(`
      INSERT OR REPLACE INTO funding_eligibility
      (id, qualification_id, scheme, covers, confidence, verified_at, verified_by)
      VALUES
      ('fe-confirmed', 'qual-confirmed', 'adult_skills_fund', 'full', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('fe-provisional', 'qual-provisional', 'advanced_learner_loan', 'loan_only', 'provisional', NULL, NULL);
    `);
  } else if (table === 'registration_requirements') {
    db.exec(`
      INSERT OR REPLACE INTO registration_bodies (id, name, website_url) VALUES ('rb-1', 'JIB', 'https://jib.org.uk');
      INSERT OR REPLACE INTO registration_requirements
      (id, occupation_id, registration_body_id, title, confidence, verified_at, verified_by)
      VALUES
      ('rr-confirmed', 'occ-confirmed', 'rb-1', 'JIB Gold Card', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('rr-provisional', 'occ-provisional', 'rb-1', 'JIB Draft Card', 'provisional', NULL, NULL);
    `);
  } else if (table === 'course_instances') {
    db.exec(`
      INSERT OR REPLACE INTO providers (id, ukprn, name) VALUES ('prov-1', '10001234', 'Chesterfield College');
      INSERT OR REPLACE INTO course_instances
      (id, provider_id, qan, title, postcode, region, confidence, verified_at, verified_by)
      VALUES
      ('ci-confirmed', 'prov-1', '601/4699/5', 'L3 Electrical Installation', 'S41 7NG', 'East Midlands', 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('ci-provisional', 'prov-1', '601/9999/9', 'L3 Draft Course', 'S41 7NG', 'East Midlands', 'provisional', NULL, NULL);
    `);
  } else if (table === 'occupation_soc_map') {
    db.exec(`
      INSERT OR REPLACE INTO occupation_soc_map
      (id, occupation_id, soc_2020_code, is_primary, confidence, verified_at, verified_by)
      VALUES
      ('osm-confirmed', 'occ-confirmed', '5224', 1, 'confirmed', '2026-08-01 10:00:00', 'PC'),
      ('osm-provisional', 'occ-provisional', '5224', 0, 'provisional', NULL, NULL);
    `);
  }
}

function runComprehensiveRlsTest() {
  console.log('================================================================');
  console.log('      VOCARI COMPREHENSIVE RLS POLICY VERIFICATION Across All Tables');
  console.log('================================================================\n');

  for (const table of TABLES_TO_TEST) {
    seedTableTestData(table);

    const serviceRoleRows = queryWithRls(table, true) as any[];
    const publicAnonRows = queryWithRls(table, false) as any[];

    console.log(`>>> TABLE: [ ${table.toUpperCase()} ] <<<`);
    console.log(`    - Service Role total rows visible: ${serviceRoleRows.length}`);
    console.log(`    - Public Anon client rows visible:  ${publicAnonRows.length}`);

    const exposedProvisional = publicAnonRows.some(
      (r) => r.confidence === 'provisional' || r.verified_at === null
    );

    if (exposedProvisional) {
      console.log(`    - STATUS: ❌ FAIL — Provisional row exposed!`);
    } else {
      console.log(`    - STATUS: ✅ PASS — 0 provisional rows exposed (RLS Policy Enforced)\n`);
    }
  }
}

runComprehensiveRlsTest();
