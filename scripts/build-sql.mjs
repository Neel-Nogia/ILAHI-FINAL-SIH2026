import fs from 'fs';
import path from 'path';

/**
 * scripts/build-sql.mjs
 * Reads a reviewed photo_approved.csv and emits parameter-safe, properly escaped UPDATE statements.
 * Adheres strictly to Part 3 directive:
 * - Validates every URL starts with https://upload.wikimedia.org/
 * - Escapes single quotes with ''
 * - Formats attribution: Photo: <author>, <license>, via Wikimedia Commons
 * - Does NOT execute against Supabase; outputs photos_update.sql for human review.
 */

// Simple CSV parser for photo_approved.csv
function parseApprovedCsv(filePath) {
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

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function main() {
  console.log('===============================================================');
  console.log('   ILAHI SQL GENERATOR (scripts/build-sql.mjs)');
  console.log('   Part 3 Directive: Generate Parameter-Safe Update Statements');
  console.log('===============================================================\n');

  const approvedFile = path.resolve('photo_approved.csv');

  if (!fs.existsSync(approvedFile)) {
    console.error(`ERROR: ${approvedFile} not found.`);
    console.log('Please create or review photo_approved.csv with columns:');
    console.log('id, table, thumb_url, author, license, file_page_url');
    process.exit(1);
  }

  const rows = parseApprovedCsv(approvedFile);
  console.log(`Read ${rows.length} rows from photo_approved.csv.\n`);

  let sqlStatements = [];
  sqlStatements.push('-- ===============================================================');
  sqlStatements.push('-- ILAHI REAL ATTRIBUTED PHOTOGRAPHY UPDATES');
  sqlStatements.push('-- Generated via scripts/build-sql.mjs');
  sqlStatements.push('-- Rule: Real photographs only, never AI-generated.');
  sqlStatements.push('-- Review and execute manually in the Supabase SQL Editor.');
  sqlStatements.push('-- ===============================================================\n');

  let validCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = row.id?.trim();
    const table = row.table?.trim() || 'destinations';
    const thumbUrl = row.thumb_url?.trim();
    const author = row.author?.trim() || 'Wikimedia Commons contributor';
    const license = row.license?.trim() || 'CC BY-SA';

    if (!id || !thumbUrl) {
      console.warn(`[Row ${i + 1}] Skipping empty id or thumb_url: ${JSON.stringify(row)}`);
      errorCount++;
      continue;
    }

    // Security Validation: Must start with https://upload.wikimedia.org/
    if (!thumbUrl.startsWith('https://upload.wikimedia.org/')) {
      console.error(`[SECURITY ERROR on ${id}] URL does not start with https://upload.wikimedia.org/: ${thumbUrl}`);
      errorCount++;
      continue;
    }

    // Determine target table
    const targetTable = table === 'hidden_gem_spots' ? 'hidden_gem_spots' : 'destinations';

    // Format attribution text
    const attribution = `Photo: ${author}, ${license}, via Wikimedia Commons`;

    // Escaped SQL statement
    const safeUrl = escapeSql(thumbUrl);
    const safeAttribution = escapeSql(attribution);
    const safeId = escapeSql(id);

    const stmt = `update ${targetTable} set image_url = '${safeUrl}', image_attribution = '${safeAttribution}' where id = '${safeId}';`;
    sqlStatements.push(stmt);
    validCount++;
  }

  const outputPath = path.resolve('photos_update.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n') + '\n', 'utf8');

  console.log('===============================================================');
  console.log(`   SQL Generation Complete!`);
  console.log(`   Valid Statements:  ${validCount}`);
  console.log(`   Errors / Skipped:  ${errorCount}`);
  console.log(`   Output File:       ${outputPath}`);
  console.log('   DO NOT EXECUTE AUTOMATICALLY. Review and run in Supabase SQL Editor.');
  console.log('===============================================================\n');
}

main();
