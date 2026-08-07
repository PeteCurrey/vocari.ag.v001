import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ingestLogs = db.prepare('SELECT * FROM ingest_logs').all();

    const tableCounts = {
      occupations: (db.prepare('SELECT COUNT(*) as count FROM occupations').get() as any)?.count || 0,
      routes: (db.prepare('SELECT COUNT(*) as count FROM routes').get() as any)?.count || 0,
      steps: (db.prepare('SELECT COUNT(*) as count FROM steps').get() as any)?.count || 0,
      requirements: (db.prepare('SELECT COUNT(*) as count FROM requirements').get() as any)?.count || 0,
      qualifications: (db.prepare('SELECT COUNT(*) as count FROM qualifications').get() as any)?.count || 0,
      funding_eligibility: (db.prepare('SELECT COUNT(*) as count FROM funding_eligibility').get() as any)?.count || 0,
      registration_bodies: (db.prepare('SELECT COUNT(*) as count FROM registration_bodies').get() as any)?.count || 0,
      registration_requirements: (db.prepare('SELECT COUNT(*) as count FROM registration_requirements').get() as any)?.count || 0,
      providers: (db.prepare('SELECT COUNT(*) as count FROM providers').get() as any)?.count || 0,
      course_instances: (db.prepare('SELECT COUNT(*) as count FROM course_instances').get() as any)?.count || 0,
      occupation_soc_map: (db.prepare('SELECT COUNT(*) as count FROM occupation_soc_map').get() as any)?.count || 0,

      // Staging table counts
      staging_qualifications: (db.prepare('SELECT COUNT(*) as count FROM staging_qualifications').get() as any)?.count || 0,
      staging_apprenticeship_standards: (db.prepare('SELECT COUNT(*) as count FROM staging_apprenticeship_standards').get() as any)?.count || 0,
      staging_providers: (db.prepare('SELECT COUNT(*) as count FROM staging_providers').get() as any)?.count || 0,
      staging_course_instances: (db.prepare('SELECT COUNT(*) as count FROM staging_course_instances').get() as any)?.count || 0,
      staging_candidate_joins: (db.prepare('SELECT COUNT(*) as count FROM staging_candidate_joins').get() as any)?.count || 0,
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      tableCounts,
      ingestSources: ingestLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error?.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
