import { db } from '@/lib/db';

export interface FuzzyMatchCandidate {
  occupation_id: string;
  standard_ref: string;
  standard_title: string;
  match_method: string;
  match_confidence: number;
}

/**
 * Join Layer Module for Vocari Pathway Graph
 */

// 1. Occupation ↔ SOC 2020 code (Manual seed table, human-authored)
export function getOccupationSocMap(occupationId: string) {
  return db
    .prepare('SELECT * FROM occupation_soc_map WHERE occupation_id = ?')
    .all(occupationId);
}

// 2. Occupation ↔ Apprenticeship Standard
// Generates fuzzy candidate matches from typical job titles and writes to staging_candidate_joins (review queue).
// NEVER auto-confirming.
export function generateApprenticeshipStandardCandidates(occupationId: string, occupationTitle: string, aliases: string[] = []): FuzzyMatchCandidate[] {
  const standards = db.prepare('SELECT * FROM staging_apprenticeship_standards').all() as any[];
  const candidates: FuzzyMatchCandidate[] = [];

  const searchTerms = [occupationTitle, ...aliases].map((t) => t.toLowerCase());

  for (const std of standards) {
    const jobTitles: string[] = JSON.parse(std.typical_job_titles || '[]');
    let maxConfidence = 0;
    let matchMethod = 'none';

    for (const title of jobTitles) {
      const lowerTitle = title.toLowerCase();
      for (const term of searchTerms) {
        if (lowerTitle === term) {
          maxConfidence = 0.95;
          matchMethod = 'exact_title_match';
        } else if (lowerTitle.includes(term) || term.includes(lowerTitle)) {
          if (maxConfidence < 0.75) {
            maxConfidence = 0.75;
            matchMethod = 'fuzzy_title_substring';
          }
        }
      }
    }

    if (maxConfidence > 0.5) {
      const candidate: FuzzyMatchCandidate = {
        occupation_id: occupationId,
        standard_ref: std.standard_ref,
        standard_title: std.title,
        match_method: matchMethod,
        match_confidence: maxConfidence,
      };
      candidates.push(candidate);

      // Write to review queue (staging_candidate_joins)
      db.prepare(`
        INSERT OR REPLACE INTO staging_candidate_joins
        (id, occupation_id, standard_ref, match_method, match_confidence, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `).run(
        `${occupationId}_${std.standard_ref}`,
        occupationId,
        std.standard_ref,
        matchMethod,
        maxConfidence
      );
    }
  }

  return candidates;
}

// 3. Qualification ↔ Course Instance (Joined on QAN - Reliable Join Key)
export function getCoursesForQualification(qan: string) {
  return db
    .prepare(`
      SELECT ci.*, p.name as provider_name, p.ukprn, p.is_partner
      FROM course_instances ci
      JOIN providers p ON ci.provider_id = p.id
      WHERE ci.qan = ?
    `)
    .all(qan);
}

// 4. Occupation ↔ Registration Body (Manual seed table)
export function getOccupationRegistrationRequirements(occupationId: string) {
  return db
    .prepare(`
      SELECT rr.*, rb.name as body_name, rb.website_url, rb.statutory
      FROM registration_requirements rr
      JOIN registration_bodies rb ON rr.registration_body_id = rb.id
      WHERE rr.occupation_id = ?
    `)
    .all(occupationId);
}
