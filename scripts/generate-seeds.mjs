import fs from 'fs';
import path from 'path';

const dataContent = fs.readFileSync('src/lib/data/destinations-data.ts', 'utf8');

// Parse ALL_DESTINATIONS
const destMatches = [...dataContent.matchAll(/id:\s*'(GJ\d+|RJ\d+)',\s*state:\s*'(Gujarat|Rajasthan)',\s*district:\s*'([^']+)',\s*place_name:\s*'([^']+)'/g)];
console.log('Parsed destinations:', destMatches.length);

// Parse ALL_HIDDEN_GEMS
const gemMatches = [...dataContent.matchAll(/id:\s*'(HG\d+)',\s*parent_destination_id:\s*'[^']+',\s*state:\s*'(Gujarat|Rajasthan)',\s*district:\s*'([^']+)',\s*spot_name:\s*'([^']+)'/g)];
console.log('Parsed hidden gems:', gemMatches.length);

fs.mkdirSync('seeds', { recursive: true });

function toCsvField(val) {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

// Write destinations.csv
let destCsv = 'id,place_name,district,state\n';
for (const m of destMatches) {
  destCsv += [m[1], toCsvField(m[4]), toCsvField(m[3]), m[2]].join(',') + '\n';
}
fs.writeFileSync('seeds/destinations.csv', destCsv);

// Write hidden_gem_spots.csv
let gemCsv = 'id,spot_name,district,state\n';
for (const m of gemMatches) {
  gemCsv += [m[1], toCsvField(m[4]), toCsvField(m[3]), m[2]].join(',') + '\n';
}
fs.writeFileSync('seeds/hidden_gem_spots.csv', gemCsv);

console.log('Wrote seeds/destinations.csv and seeds/hidden_gem_spots.csv successfully.');
