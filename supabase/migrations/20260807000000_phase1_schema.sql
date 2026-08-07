-- Migration: 20260807000000_phase1_schema.sql
-- Vocari Pathway Data Layer Schema & RLS Policies

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. LIVE FACTUAL TABLES (With Inline Provenance & Complete DDL)
-- ============================================================================

-- Complete Occupations DDL (soc_2020_code removed per schema correction)
CREATE TABLE IF NOT EXISTS occupations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  summary TEXT NOT NULL,
  tier VARCHAR(1) NOT NULL CHECK (tier IN ('A', 'B', 'C')),
  day_in_life TEXT,
  salary_entry INTEGER,
  salary_experienced INTEGER,
  salary_source TEXT,
  salary_as_at DATE,
  demand_signal INTEGER,
  physical_demands TEXT[] DEFAULT '{}',
  work_pattern TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  occupation_id TEXT NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('apprenticeship', 'college', 'university', 'direct_entry', 'work_based_progression', 'conversion', 'military_transfer')),
  label TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  from_position TEXT,
  entry_requirements TEXT[] DEFAULT '{}',
  typical_duration_months INTEGER,
  typical_cost_gbp_min NUMERIC(10, 2),
  typical_cost_gbp_max NUMERIC(10, 2),
  typical_cost_gross_gbp NUMERIC(10, 2),
  earn_while_learning BOOLEAN DEFAULT FALSE,
  typical_wage_during NUMERIC(10, 2),
  suitability_notes TEXT,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requirements
CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('qualification', 'registration', 'licence', 'check', 'experience_hours', 'medical', 'age_gate')),
  label TEXT NOT NULL,
  rqf_level INTEGER CHECK (rqf_level BETWEEN 1 AND 8),
  mandatory BOOLEAN DEFAULT TRUE,
  awarding_constraint TEXT,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  label TEXT NOT NULL,
  requirement_id TEXT REFERENCES requirements(id),
  duration_months INTEGER,
  can_run_parallel BOOLEAN DEFAULT FALSE,
  blocking BOOLEAN DEFAULT TRUE,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (route_id, sequence)
);

-- Qualifications
CREATE TABLE IF NOT EXISTS qualifications (
  id TEXT PRIMARY KEY,
  qan TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  awarding_org TEXT NOT NULL,
  rqf_level INTEGER CHECK (rqf_level BETWEEN 1 AND 8),
  tqt_hours INTEGER,
  status TEXT NOT NULL CHECK (status IN ('live', 'withdrawn', 'expiring')) DEFAULT 'live',
  operational_end_date DATE,
  standard_ref TEXT,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funding Eligibility
CREATE TABLE IF NOT EXISTS funding_eligibility (
  id TEXT PRIMARY KEY,
  qualification_id TEXT NOT NULL REFERENCES qualifications(id) ON DELETE CASCADE,
  scheme TEXT NOT NULL CHECK (scheme IN ('adult_skills_fund', 'free_courses_for_jobs', 'advanced_learner_loan', 'LLE', 'apprenticeship_levy', 'employer_funded', 'self_funded_only')),
  learner_conditions TEXT[] DEFAULT '{}',
  covers TEXT NOT NULL CHECK (covers IN ('full', 'partial', 'loan_only')),
  learner_contribution_gbp NUMERIC(10, 2) DEFAULT 0.00,
  scheme_valid_from DATE,
  scheme_valid_to DATE,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registration Bodies
CREATE TABLE IF NOT EXISTS registration_bodies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  statutory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registration Requirements
CREATE TABLE IF NOT EXISTS registration_requirements (
  id TEXT PRIMARY KEY,
  occupation_id TEXT NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  registration_body_id TEXT NOT NULL REFERENCES registration_bodies(id),
  title TEXT NOT NULL,
  description TEXT,
  mandatory BOOLEAN DEFAULT TRUE,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  ukprn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  website TEXT,
  is_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Instances
CREATE TABLE IF NOT EXISTS course_instances (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  qan TEXT NOT NULL REFERENCES qualifications(qan) ON DELETE CASCADE,
  title TEXT NOT NULL,
  delivery_mode TEXT,
  study_mode TEXT,
  venue_name TEXT,
  postcode TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  start_date DATE,
  cost_gbp NUMERIC(10, 2),
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Occupation SOC Map (Sole Source of Truth for SOC mappings)
CREATE TABLE IF NOT EXISTS occupation_soc_map (
  id TEXT PRIMARY KEY,
  occupation_id TEXT NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
  soc_2020_code VARCHAR(4) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  -- Inline Provenance columns
  source_name TEXT,
  source_url TEXT,
  retrieved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  review_due DATE,
  confidence TEXT NOT NULL CHECK (confidence IN ('confirmed', 'inferred', 'provisional')) DEFAULT 'provisional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. STAGING TABLES (Ingest Target Layer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staging_qualifications (
  qan TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  awarding_org TEXT NOT NULL,
  rqf_level INTEGER,
  tqt_hours INTEGER,
  status TEXT NOT NULL,
  operational_end_date DATE,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staging_apprenticeship_standards (
  standard_ref TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level INTEGER,
  typical_duration_months INTEGER,
  max_funding_band NUMERIC(10, 2),
  typical_job_titles TEXT[] DEFAULT '{}',
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staging_providers (
  ukprn TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  postcode TEXT,
  region TEXT,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staging_course_instances (
  course_id TEXT PRIMARY KEY,
  provider_ukprn TEXT NOT NULL,
  qan TEXT NOT NULL,
  title TEXT NOT NULL,
  venue_name TEXT,
  postcode TEXT,
  region TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  delivery_mode TEXT,
  cost_gbp NUMERIC(10, 2),
  start_date DATE,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staging_candidate_joins (
  id TEXT PRIMARY KEY,
  occupation_id TEXT NOT NULL,
  standard_ref TEXT NOT NULL,
  match_method TEXT NOT NULL,
  match_confidence NUMERIC(4, 3) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingest_logs (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  last_run_at TIMESTAMPTZ DEFAULT NOW(),
  rows_processed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES AND ENABLING STATEMENTS
-- ============================================================================

ALTER TABLE occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupation_soc_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read confirmed only" ON occupations FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON routes FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON steps FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON requirements FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON qualifications FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON funding_eligibility FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON registration_requirements FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON course_instances FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
CREATE POLICY "Public read confirmed only" ON occupation_soc_map FOR SELECT USING (confidence = 'confirmed' AND verified_at IS NOT NULL);
