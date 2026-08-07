import fs from 'fs';

const NCS_CSV_URL = 'https://assets.publishing.service.gov.uk/media/6a69d8a516bc92f51e1a4303/LiveCoursesWithRegionsAndVenuesReport-20260727.csv';

async function runJoinKeyProof() {
  console.log('=== ITEM 1: JOIN KEY PROOF (LEARN_AIM_REF == qualificationNumberNoObliques) ===');
  console.log('Fetching July 2026 NCS transparency CSV...');

  const response = await fetch(NCS_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch NCS CSV: ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split('\n');
  
  const distinctLearnAimRefs = new Set<string>();
  
  // Column index 3 is LEARN_AIM_REF
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length > 3) {
      const aimRef = row[3].replace(/^"/, '').replace(/"$/, '').trim();
      if (aimRef && /^\d{8}$/.test(aimRef)) {
        distinctLearnAimRefs.add(aimRef);
        if (distinctLearnAimRefs.size >= 200) break;
      }
    }
  }

  const refs = Array.from(distinctLearnAimRefs);
  console.log(`Extracted ${refs.length} distinct numeric 8-digit LEARN_AIM_REF values from CSV.`);
  console.log('Testing each against Ofqual API in 20-concurrent batches...');

  let matchCount = 0;
  let noMatchCount = 0;
  const nonMatchingExamples: string[] = [];

  const batchSize = 20;
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = refs.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (ref) => {
        try {
          const res = await fetch(`https://register-api.ofqual.gov.uk/api/qualifications?qualificationNumberNoObliques=${ref}`);
          if (res.ok) {
            const data = await res.json();
            const results = data.results || [];
            if (results.length > 0) {
              matchCount++;
              return;
            }
          }
        } catch {}

        noMatchCount++;
        if (nonMatchingExamples.length < 10) nonMatchingExamples.push(ref);
      })
    );

    console.log(`Tested ${Math.min(i + batchSize, refs.length)}/${refs.length} — Matches: ${matchCount}, Non-matches: ${noMatchCount}`);
  }

  const hitRate = (matchCount / refs.length) * 100;
  console.log('\n--- JOIN KEY PROOF RESULTS ---');
  console.log(`Total LEARN_AIM_REF Tested: ${refs.length}`);
  console.log(`Exact Matches Found: ${matchCount}`);
  console.log(`No-Match Count: ${noMatchCount}`);
  console.log(`Hit Rate: ${hitRate.toFixed(2)}%`);
  
  if (nonMatchingExamples.length > 0) {
    console.log('\nVerbatim Examples of Non-Matching LEARN_AIM_REF values:');
    nonMatchingExamples.forEach((ex, idx) => console.log(` ${idx + 1}. "${ex}"`));
  }

  if (hitRate < 90) {
    console.log('\nCRITICAL WARNING: Hit rate is below 90%. STOP AND REPORT.');
  } else {
    console.log('\nPASS: Hit rate exceeds 90%. Hypothesis proven.');
  }
}

runJoinKeyProof();
