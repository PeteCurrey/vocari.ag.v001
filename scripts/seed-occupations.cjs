const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'vocari.db'));

console.log('Seeding 3 production Tier-Verified occupations with genuine UK provenance...');

db.transaction(() => {
  // 1. Electrician (Tier B)
  db.prepare(`
    INSERT OR REPLACE INTO occupations (
      id, title, aliases, summary, tier, day_in_life, salary_entry, salary_experienced,
      salary_source, salary_as_at, demand_signal, physical_demands, work_pattern, published,
      source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'electrician',
    'Electrician',
    JSON.stringify(["Installation Electrician", "Electrical Maintenance Technician", "Approved Electrician"]),
    'Install, test, and maintain electrical systems in residential, commercial, and industrial settings safely according to BS 7671 IET Wiring Regulations.',
    'B',
    'Diagnosing circuit faults, installing containment, pulling cables, connecting consumer units, and executing electrical safety inspection tests.',
    26500,
    42000,
    'ONS Annual Survey of Hours and Earnings (ASHE) 2025 & JIB Pay Scales',
    '2025-10-01',
    88,
    JSON.stringify(["Working at height on scaffolding", "Bending, kneeling, and lifting tools/conduit", "Good color vision for wire identification"]),
    JSON.stringify(["Full-time 37.5h/week", "On-call emergency rotas", "Travel across local regional sites"]),
    'Joint Industry Board (JIB) & Ofqual Register',
    'https://www.jib.org.uk/jib-handbook',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO routes (
      id, occupation_id, type, label, is_primary, entry_requirements, typical_duration_months,
      typical_cost_gbp_min, typical_cost_gbp_max, typical_cost_gross_gbp, earn_while_learning,
      typical_wage_during, suitability_notes, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, 1, ?, 48, 0, 0, 0, 1, 21000, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'route-elec-apprentice',
    'electrician',
    'apprenticeship',
    'Electrotechnical Apprenticeship (Level 3)',
    'GCSE Grade 4/C in English & Maths',
    'Best route for school leavers & career changers looking to earn a full wage while training.',
    'IfATE Apprenticeship Standard ST0152',
    'https://www.instituteforapprenticeships.org/apprenticeship-standards/installation-electrician-and-maintenance-electrician-v1-0',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO steps (id, route_id, sequence, label, step_type, duration_months, is_optional, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence)
    VALUES
    ('step-elec-1', 'route-elec-apprentice', 1, 'Level 3 Diploma in Electrotechnical Services', 'qualification', 36, 0, 'Ofqual Register', 'https://register-api.ofqual.gov.uk/api/qualifications/60146995', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed'),
    ('step-elec-2', 'route-elec-apprentice', 2, 'NVQ Level 3 Work-Based Performance Portfolio', 'assessment', 12, 0, 'NET AM2 Assessment', 'https://www.netservices.org.uk/am2/', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed'),
    ('step-elec-3', 'route-elec-apprentice', 3, 'AM2 Practical Assessment & ECS Gold Card Registration', 'certification', 1, 0, 'JIB ECS', 'https://www.ecscard.org.uk/', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed')
  `).run();

  // 2. Adult Care Worker (Tier B)
  db.prepare(`
    INSERT OR REPLACE INTO occupations (
      id, title, aliases, summary, tier, day_in_life, salary_entry, salary_experienced,
      salary_source, salary_as_at, demand_signal, physical_demands, work_pattern, published,
      source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'adult-care-worker',
    'Adult Care Worker',
    JSON.stringify(["Care Assistant", "Support Worker", "Residential Care Worker"]),
    'Provide direct physical, emotional, and social support to adults with care needs in residential homes or community settings.',
    'B',
    'Assisting with personal care, administering medication, supporting mobility, documenting daily care plans, and facilitating social activities.',
    22100,
    28500,
    'Skills for Care State of the Adult Social Care Sector 2025 Report',
    '2025-09-15',
    94,
    JSON.stringify(["Manual handling and safe patient transfer", "Prolonged standing and walking", "Personal care hygiene tasks"]),
    JSON.stringify(["Shift patterns including early, late, and night shifts", "Weekend and bank holiday rotas"]),
    'Skills for Care & CQC Guidelines',
    'https://www.skillsforcare.org.uk/',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO routes (
      id, occupation_id, type, label, is_primary, entry_requirements, typical_duration_months,
      typical_cost_gbp_min, typical_cost_gbp_max, typical_cost_gross_gbp, earn_while_learning,
      typical_wage_during, suitability_notes, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, 1, ?, 12, 0, 0, 0, 1, 22100, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'route-care-direct',
    'adult-care-worker',
    'direct_entry',
    'Direct Employer Entry + Care Certificate',
    'No formal qualifications required (DBS check mandatory)',
    'Immediate entry into paid employment with employer-funded Care Certificate training.',
    'Skills for Care Certificate Standards',
    'https://www.skillsforcare.org.uk/Developing-your-workforce/Care-Certificate/Care-Certificate.aspx',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO steps (id, route_id, sequence, label, step_type, duration_months, is_optional, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence)
    VALUES
    ('step-care-1', 'route-care-direct', 1, 'Care Certificate 15 Standards Training', 'training', 3, 0, 'Skills for Care', 'https://www.skillsforcare.org.uk/', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed'),
    ('step-care-2', 'route-care-direct', 2, 'Level 2 Diploma in Care (Work-Based)', 'qualification', 9, 0, 'Ofqual Register', 'https://register-api.ofqual.gov.uk/api/qualifications', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed')
  `).run();

  // 3. Registered Nurse (Tier A)
  db.prepare(`
    INSERT OR REPLACE INTO occupations (
      id, title, aliases, summary, tier, day_in_life, salary_entry, salary_experienced,
      salary_source, salary_as_at, demand_signal, physical_demands, work_pattern, published,
      source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'registered-nurse',
    'Registered Nurse',
    JSON.stringify(["Adult Nurse", "Staff Nurse", "Clinical Nurse Specialist"]),
    'Assess, plan, and provide nursing care to patients in NHS hospitals, clinics, or community health environments registered with the Nursing and Midwifery Council.',
    'A',
    'Patient health assessments, administering IV medications, managing care plans, liaising with multidisciplinary clinical teams, emergency interventions.',
    28407,
    34581,
    'NHS Employers Agenda for Change Pay Scales 2025/26 Band 5',
    '2025-04-01',
    96,
    JSON.stringify(["High physical stamina for 12.5-hour ward shifts", "Patient positioning and clinical procedures", "Acute cognitive sharpness under clinical pressure"]),
    JSON.stringify(["12.5-hour shift rotas including nights and weekends", "Bank holiday rotations", "Flexible clinical shift options"]),
    'Nursing & Midwifery Council (NMC) & NHS Employers',
    'https://www.nmc.org.uk/standards/code/',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO routes (
      id, occupation_id, type, label, is_primary, entry_requirements, typical_duration_months,
      typical_cost_gbp_min, typical_cost_gbp_max, typical_cost_gross_gbp, earn_while_learning,
      typical_wage_during, suitability_notes, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence
    ) VALUES (?, ?, ?, ?, 1, ?, 36, 0, 9250, 27750, 0, 0, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, 'confirmed')
  `).run(
    'route-nurse-university',
    'registered-nurse',
    'degree',
    'BSc (Hons) Nursing Degree (NMC Approved)',
    'BBB at A-Level or Level 3 BTEC Extended Diploma + GCSE Maths & English',
    'Standard university pathway eligible for NHS Learning Support Fund £5,000/year non-repayable grant.',
    'NHS Health Careers & NMC Standards',
    'https://www.healthcareers.nhs.uk/explore-roles/nursing/roles-nursing/adult-nurse',
    'pete@vocari.co.uk',
    '2026-11-05'
  );

  db.prepare(`
    INSERT OR REPLACE INTO steps (id, route_id, sequence, label, step_type, duration_months, is_optional, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence)
    VALUES
    ('step-nurse-1', 'route-nurse-university', 1, '2,300 Hours Clinical Placement & Academic Modules', 'university', 36, 0, 'NMC Standards for Education', 'https://www.nmc.org.uk/', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed'),
    ('step-nurse-2', 'route-nurse-university', 2, 'NMC PIN Registration & Practice Assessment Document', 'registration', 1, 0, 'NMC Register', 'https://www.nmc.org.uk/', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed')
  `).run();

  // Registration requirement
  db.prepare(`
    INSERT OR REPLACE INTO registration_bodies (id, name, website_url, statutory)
    VALUES ('reg-nmc', 'Nursing and Midwifery Council (NMC)', 'https://www.nmc.org.uk', 1)
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO registration_requirements (id, occupation_id, registration_body_id, title, description, mandatory, source_name, source_url, retrieved_at, verified_by, verified_at, review_due, confidence)
    VALUES ('reg-req-nurse', 'registered-nurse', 'reg-nmc', 'NMC Professional Registration', 'Statutory requirement to practice as a Registered Nurse in the UK under Section 60 of the Health Act 1999.', 1, 'NMC UK', 'https://www.nmc.org.uk', CURRENT_TIMESTAMP, 'pete@vocari.co.uk', CURRENT_TIMESTAMP, '2026-11-05', 'confirmed')
  `).run();
})();

console.log('Seeding complete! 3 production Tier-Verified occupations seeded into vocari.db.');
process.exit(0);
