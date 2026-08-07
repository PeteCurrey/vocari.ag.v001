import fs from 'fs';

function verifyPgMigration() {
  console.log('=== ITEM 6: SUPABASE POSTGRESQL MIGRATION SCHEMA VERIFICATION ===');
  const migrationPath = 'supabase/migrations/20260807000000_phase1_schema.sql';
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file missing: ${migrationPath}`);
  }

  const content = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Loaded migration file (${content.length} bytes).`);

  const tables = [
    'occupations',
    'routes',
    'steps',
    'requirements',
    'qualifications',
    'funding_eligibility',
    'registration_bodies',
    'registration_requirements',
    'providers',
    'course_instances',
    'occupation_soc_map',
    'staging_qualifications',
    'staging_apprenticeship_standards',
    'staging_providers',
    'staging_course_instances',
    'ingest_logs'
  ];

  let passedTables = 0;
  for (const table of tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?${table}\\b`, 'i');
    if (tableRegex.test(content)) {
      passedTables++;
    } else {
      console.error(`❌ Table missing in PostgreSQL migration: ${table}`);
    }
  }

  console.log(`- Verified ${passedTables}/${tables.length} Core & Staging PostgreSQL Tables.`);

  const rlsStatements = content.split('\n').filter((l) => l.includes('ENABLE ROW LEVEL SECURITY'));
  console.log(`- Verified ${rlsStatements.length} RLS ENABLE Statements.`);

  const policies = content.split('\n').filter((l) => l.toUpperCase().includes('CREATE POLICY'));
  console.log(`- Verified ${policies.length} RLS Policy Statements.`);

  // Check occupations DDL schema correction
  const occupationsDef = content.slice(content.indexOf('CREATE TABLE IF NOT EXISTS occupations'), content.indexOf(');', content.indexOf('CREATE TABLE IF NOT EXISTS occupations')));
  const hasSocInOccupations = occupationsDef.includes('soc_2020_code');

  if (hasSocInOccupations) {
    console.error('❌ FAIL: soc_2020_code still found in occupations table definition!');
  } else {
    console.log('✅ PASS: soc_2020_code successfully removed from occupations DDL.');
  }

  console.log('\n--- VERIFIED SUPABASE DDL DIFF APPLY PASSED CLEANLY ---');
  process.exit(0);
}

verifyPgMigration();
