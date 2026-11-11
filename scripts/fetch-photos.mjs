import fs from 'fs';
import path from 'path';
import dns from 'dns';

// Ensure IPv4 first in Node 18+ to avoid Windows dual-stack IPv6 socket timeouts
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * scripts/fetch-photos.mjs
 * Harvests real, verified CC/Public Domain photographs from Wikimedia Commons API.
 * Adheres strictly to ILAHI Step 1 directive: real photos only, never generated.
 * Rate-limited to 1 req/sec with automatic 429 backoff retry.
 */

const USER_AGENT = 'ILAHI-SIH/1.0 (https://github.com/Neel-Nogia/ILAHI-FINAL-SIH2026; contact@ilahi-travel.org)';
const RATE_LIMIT_MS = 1100; // slightly > 1 sec to respect Wikimedia API policy
const MAX_RETRIES = 3;

// Find seed files in standard locations
function findSeedFile(fileName) {
  const candidates = [
    path.join('seeds', fileName),
    path.join('data', fileName),
    path.join('scripts', fileName),
    path.join('supabase', fileName),
    fileName
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// Simple CSV parser for seed files
function parseSeedCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1];
      if (val === undefined) continue;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      values.push(val.trim());
      if (regex.lastIndex >= line.length) break;
    }

    if (values.length >= header.length) {
      const row = {};
      header.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
  }
  return rows;
}

// Strip HTML tags and entities
function cleanHtml(text) {
  if (!text) return 'Unknown';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Format CSV field with quotation if necessary
function toCsvField(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Native fetch with timeout and 429 exponential backoff
async function fetchJsonWithRetry(url, retryCount = 0) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(18000)
    });

    if (res.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const backoff = Math.pow(2, retryCount + 1) * 2000;
        console.warn(`[429 Rate Limit] Backing off for ${backoff}ms (retry ${retryCount + 1}/${MAX_RETRIES})...`);
        await sleep(backoff);
        return fetchJsonWithRetry(url, retryCount + 1);
      }
      throw new Error('Rate limit exceeded 429 after retries');
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from Commons API`);
    }

    return await res.json();
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`[Network/Timeout: ${err.message}] Retrying in 2500ms...`);
      await sleep(2500);
      return fetchJsonWithRetry(url, retryCount + 1);
    }
    throw err;
  }
}

// License validator according to Part 2 directive
function isLicenseAllowed(licenseStr) {
  if (!licenseStr) return false;
  const l = licenseStr.trim().toLowerCase();
  if (l.includes('cc0') || l.includes('zero')) return true;
  if (l.includes('public domain') || l.startsWith('pd') || l === 'no known copyright restrictions') return true;
  if (l.includes('cc by-sa') || l.includes('cc-by-sa')) return true;
  if (l.includes('cc by') || l.includes('cc-by')) return true;
  return false;
}

// Title filter: reject maps, logos, flags, posters, paintings
function isTitleAllowed(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  const prohibited = ['map', 'logo', 'flag', 'poster', 'painting', 'diagram', 'icon', 'coat of arms'];
  return !prohibited.some(word => t.includes(word));
}

// Normalize Wikimedia thumbnail URL to canonical upload.wikimedia.org
function canonicalizeWikimediaThumb(url) {
  if (!url) return '';
  let clean = url.replace(/^https:\/\/thumb\.wikimedia\.org\//, 'https://upload.wikimedia.org/');
  clean = clean.replace(/\?.*$/, '');
  return clean;
}

// Search Commons API for a given query string
async function queryCommons(searchQuery) {
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1200&format=json`;
  
  const res = await fetchJsonWithRetry(endpoint);
  const pages = res?.query?.pages || {};
  const candidates = [];

  for (const page of Object.values(pages)) {
    const title = page.title || '';
    if (!isTitleAllowed(title)) continue;

    const info = page.imageinfo?.[0];
    if (!info) continue;

    const mime = info.mime || '';
    if (mime !== 'image/jpeg' && mime !== 'image/png') continue;

    const width = info.width || 0;
    const height = info.height || 0;
    if (width < 1000) continue;

    const meta = info.extmetadata || {};
    const licenseShort = meta.LicenseShortName?.value || meta.UsageTerms?.value || meta.License?.value || '';
    if (!isLicenseAllowed(licenseShort)) continue;

    const thumbUrl = canonicalizeWikimediaThumb(info.thumburl || info.url);
    const filePageUrl = info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const author = cleanHtml(meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons contributor');

    candidates.push({
      thumb_url: thumbUrl,
      file_page_url: filePageUrl,
      license: licenseShort.trim(),
      author: author,
      width: width,
      height: height
    });
  }

  return candidates;
}

async function main() {
  console.log('===============================================================');
  console.log('   ILAHI REAL PHOTOGRAPHY HARVESTER (Wikimedia Commons API)');
  console.log('   Step 1 Directive: Real Photos Only, Never Generated');
  console.log('===============================================================\n');

  const destFile = findSeedFile('destinations.csv');
  const gemsFile = findSeedFile('hidden_gem_spots.csv');

  if (!destFile || !gemsFile) {
    console.error('ERROR: Seed CSV files not found. Looked for seeds/destinations.csv and seeds/hidden_gem_spots.csv');
    process.exit(1);
  }

  console.log(`Found destinations seed: ${destFile}`);
  console.log(`Found hidden gems seed:  ${gemsFile}`);

  const destinations = parseSeedCsv(destFile);
  const hiddenGems = parseSeedCsv(gemsFile);

  console.log(`Loaded ${destinations.length} destinations and ${hiddenGems.length} hidden gem spots.\n`);

  const items = [
    ...destinations.map(d => ({
      id: d.id,
      table: 'destinations',
      name: d.place_name,
      district: d.district,
      state: d.state
    })),
    ...hiddenGems.map(g => ({
      id: g.id,
      table: 'hidden_gem_spots',
      name: g.spot_name,
      district: g.district,
      state: g.state
    }))
  ];

  const candidatesCsvHeader = 'id,table,name,candidate_rank,thumb_url,file_page_url,license,author,width,height\n';
  const missesCsvHeader = 'id,table,name,district,state\n';

  let candidatesOutput = candidatesCsvHeader;
  let missesOutput = missesCsvHeader;

  let totalCandidates = 0;
  let totalMisses = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = `[${i + 1}/${items.length}]`;
    console.log(`${progress} Harvesting: ${item.id} - "${item.name}" (${item.district}, ${item.state})...`);

    // Query 1: "<place name> <district>"
    const primaryQuery = `${item.name} ${item.district}`;
    let matches = [];

    try {
      matches = await queryCommons(primaryQuery);
      await sleep(RATE_LIMIT_MS);

      // Query 2 fallback: "<place name>" only if no candidates found
      if (matches.length === 0) {
        console.log(`   └─ No matches with district, trying fallback: "${item.name}"...`);
        matches = await queryCommons(item.name);
        await sleep(RATE_LIMIT_MS);
      }
    } catch (err) {
      console.warn(`   └─ Error querying Commons: ${err.message}`);
    }

    if (matches.length > 0) {
      const top3 = matches.slice(0, 3);
      top3.forEach((cand, rank) => {
        candidatesOutput += [
          item.id,
          item.table,
          toCsvField(item.name),
          rank + 1,
          toCsvField(cand.thumb_url),
          toCsvField(cand.file_page_url),
          toCsvField(cand.license),
          toCsvField(cand.author),
          cand.width,
          cand.height
        ].join(',') + '\n';
      });
      totalCandidates += top3.length;
      console.log(`   ✓ Found ${top3.length} qualified candidate(s)`);
    } else {
      missesOutput += [
        item.id,
        item.table,
        toCsvField(item.name),
        toCsvField(item.district),
        toCsvField(item.state)
      ].join(',') + '\n';
      totalMisses += 1;
      console.log(`   ⚠️ Zero candidates found -> added to photo_misses.csv`);
    }

    // Flush periodically so partial progress is saved
    if ((i + 1) % 10 === 0 || i === items.length - 1) {
      fs.writeFileSync('photo_candidates.csv', candidatesOutput, 'utf8');
      fs.writeFileSync('photo_misses.csv', missesOutput, 'utf8');
    }
  }

  console.log('\n===============================================================');
  console.log('   HARVEST COMPLETE!');
  console.log(`   Total Candidates Written: ${totalCandidates} -> photo_candidates.csv`);
  console.log(`   Total Misses Written:     ${totalMisses} -> photo_misses.csv`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal harvest error:', err);
  process.exit(1);
});
