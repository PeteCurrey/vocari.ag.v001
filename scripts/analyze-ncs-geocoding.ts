import fs from 'fs';

const NCS_CSV_URL = 'https://assets.publishing.service.gov.uk/media/6a69d8a516bc92f51e1a4303/LiveCoursesWithRegionsAndVenuesReport-20260727.csv';

async function analyzeNcsGeocoding() {
  console.log('=== ITEM 5: NCS GEOCODING ANALYSIS ===');
  console.log('Downloading July 2026 NCS CSV dataset...');
  
  const response = await fetch(NCS_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch NCS CSV: ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split('\n');
  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"/, '').replace(/"$/, ''));

  console.log(`Total lines in CSV: ${lines.length}`);
  console.log('Header Count:', headers.length);

  const idxLat = headers.indexOf('LOCATION_LATITUDE');
  const idxLng = headers.indexOf('LOCATION_LONGITUDE');
  const idxPostcode = headers.indexOf('LOCATION_POSTCODE');
  const idxNational = headers.indexOf('NATIONAL');

  let totalCourses = 0;
  let countNoLatLng = 0;
  let countNoLatLngWithPostcode = 0;
  let countNationalTrue = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV cells
    const cells = line.split(',').map((c) => c.replace(/^"/, '').replace(/"$/, '').trim());
    if (cells.length < headers.length) continue;

    totalCourses++;
    const lat = cells[idxLat];
    const lng = cells[idxLng];
    const postcode = cells[idxPostcode];
    const national = cells[idxNational];

    const hasLat = lat && lat.length > 0 && !isNaN(parseFloat(lat));
    const hasLng = lng && lng.length > 0 && !isNaN(parseFloat(lng));
    const hasPostcode = postcode && postcode.length > 0;
    const isNational = national && national.toUpperCase() === 'TRUE';

    if (!hasLat || !hasLng) {
      countNoLatLng++;
      if (hasPostcode) {
        countNoLatLngWithPostcode++;
      }
    }

    if (isNational) {
      countNationalTrue++;
    }
  }

  console.log('\n--- GEOCODING ANALYSIS RESULTS ---');
  console.log(`Total Valid Course Records: ${totalCourses}`);
  console.log(`(a) No Lat/Lng Count: ${countNoLatLng} (${((countNoLatLng / totalCourses) * 100).toFixed(2)}%)`);
  console.log(`(b) No Lat/Lng BUT Postcode Present: ${countNoLatLngWithPostcode} (${((countNoLatLngWithPostcode / totalCourses) * 100).toFixed(2)}%)`);
  console.log(`(c) NATIONAL=TRUE Count: ${countNationalTrue} (${((countNationalTrue / totalCourses) * 100).toFixed(2)}%)`);
}

analyzeNcsGeocoding();
