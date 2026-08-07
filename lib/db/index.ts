import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'vocari.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database tables on startup
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS occupations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      aliases TEXT,
      summary TEXT NOT NULL,
      tier TEXT NOT NULL CHECK (tier IN ('A', 'B', 'C')),
      day_in_life TEXT,
      salary_entry INTEGER,
      salary_experienced INTEGER,
      salary_source TEXT,
      salary_as_at TEXT,
      demand_signal INTEGER,
      physical_demands TEXT,
      work_pattern TEXT,
      published INTEGER DEFAULT 0,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      occupation_id TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      from_position TEXT,
      entry_requirements TEXT,
      typical_duration_months INTEGER,
      typical_cost_gbp_min REAL,
      typical_cost_gbp_max REAL,
      typical_cost_gross_gbp REAL,
      earn_while_learning INTEGER DEFAULT 0,
      typical_wage_during REAL,
      suitability_notes TEXT,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      route_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      label TEXT NOT NULL,
      requirement_id TEXT,
      duration_months INTEGER,
      can_run_parallel INTEGER DEFAULT 0,
      blocking INTEGER DEFAULT 1,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      rqf_level INTEGER,
      mandatory INTEGER DEFAULT 1,
      awarding_constraint TEXT,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS qualifications (
      id TEXT PRIMARY KEY,
      qan TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      awarding_org TEXT NOT NULL,
      rqf_level INTEGER,
      tqt_hours INTEGER,
      status TEXT NOT NULL DEFAULT 'live',
      operational_end_date TEXT,
      standard_ref TEXT,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS funding_eligibility (
      id TEXT PRIMARY KEY,
      qualification_id TEXT NOT NULL,
      scheme TEXT NOT NULL,
      learner_conditions TEXT,
      covers TEXT NOT NULL,
      learner_contribution_gbp REAL DEFAULT 0,
      scheme_valid_from TEXT,
      scheme_valid_to TEXT,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registration_bodies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website_url TEXT NOT NULL,
      statutory INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registration_requirements (
      id TEXT PRIMARY KEY,
      occupation_id TEXT NOT NULL,
      registration_body_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      mandatory INTEGER DEFAULT 1,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      ukprn TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      website TEXT,
      is_partner INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_instances (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL,
      qan TEXT NOT NULL,
      title TEXT NOT NULL,
      delivery_mode TEXT,
      study_mode TEXT,
      venue_name TEXT,
      postcode TEXT NOT NULL,
      region TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      start_date TEXT,
      cost_gbp REAL,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS occupation_soc_map (
      id TEXT PRIMARY KEY,
      occupation_id TEXT NOT NULL,
      soc_2020_code TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      notes TEXT,
      source_name TEXT,
      source_url TEXT,
      retrieved_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      review_due TEXT,
      confidence TEXT NOT NULL DEFAULT 'provisional',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Staging Tables
    CREATE TABLE IF NOT EXISTS staging_qualifications (
      qan TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      awarding_org TEXT NOT NULL,
      rqf_level INTEGER,
      tqt_hours INTEGER,
      status TEXT NOT NULL,
      operational_end_date TEXT,
      ingested_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staging_apprenticeship_standards (
      standard_ref TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      level INTEGER,
      typical_duration_months INTEGER,
      max_funding_band REAL,
      typical_job_titles TEXT,
      ingested_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staging_providers (
      ukprn TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      postcode TEXT,
      region TEXT,
      ingested_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staging_course_instances (
      course_id TEXT PRIMARY KEY,
      provider_ukprn TEXT NOT NULL,
      qan TEXT NOT NULL,
      title TEXT NOT NULL,
      venue_name TEXT,
      postcode TEXT,
      region TEXT,
      latitude REAL,
      longitude REAL,
      delivery_mode TEXT,
      cost_gbp REAL,
      start_date TEXT,
      ingested_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staging_candidate_joins (
      id TEXT PRIMARY KEY,
      occupation_id TEXT NOT NULL,
      standard_ref TEXT NOT NULL,
      match_method TEXT NOT NULL,
      match_confidence REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ingest_logs (
      id TEXT PRIMARY KEY,
      source_name TEXT NOT NULL,
      last_run_at TEXT DEFAULT CURRENT_TIMESTAMP,
      rows_processed INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      last_error TEXT
    );
  `);
}

// Ensure database initialized
initDb();

// Helper to query with RLS (public vs service role)
export function queryWithRls(tableName: string, isServiceRole: boolean = false) {
  if (isServiceRole) {
    return db.prepare(`SELECT * FROM ${tableName}`).all();
  }
  // Public RLS constraint: confidence='confirmed' AND verified_at IS NOT NULL
  return db
    .prepare(`SELECT * FROM ${tableName} WHERE confidence = 'confirmed' AND verified_at IS NOT NULL`)
    .all();
}
