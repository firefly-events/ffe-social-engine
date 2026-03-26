/**
 * PostHog Config Validation Script
 * 
 * Ensures that tracking events in the codebase follow the se_* pattern
 * and match the defined event schema in ANALYTICS_EVENTS.
 * 
 * Usage:
 *   node scripts/validate-posthog-config.js --app social-engine [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_PATH = path.resolve(__dirname, '../apps/dashboard');
const SCHEMA_FILE = path.join(APP_PATH, 'src/lib/analytics.ts');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getDefinedEvents() {
  const content = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const matches = content.matchAll(/([A-Z_]+):\s*'([^']+)'/g);
  const events = {};
  for (const match of matches) {
    events[match[1]] = match[2];
  }
  return events;
}

function scanForEvents() {
  console.log(`Scanning ${APP_PATH} for tracking events...`);
  
  // Search for se_ strings in JS/TS/TSX files, exclude the schema file itself
  // Using \b to match word boundaries, which ensures se_ is at the start of a word
  const cmd = `grep -r "\\bse_[a-zA-Z0-9_]\\+" ${APP_PATH}/src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude="${path.basename(SCHEMA_FILE)}" -o`;
  let output = '';
  try {
    output = execSync(cmd).toString();
  } catch (e) {
    // Grep returns 1 if no matches found
    return [];
  }

  return output.split('\n')
    .map(line => {
      const parts = line.split(':');
      // If there's a filename, take everything after the first colon
      if (parts.length > 1) {
        return parts.slice(1).join(':').trim();
      }
      return line.trim();
    })
    .filter(event => event.length > 3 && event.startsWith('se_'))
    .map(event => event.replace(/['",]/g, ''));
}

function main() {
  const definedEvents = getDefinedEvents();
  const allowedEventNames = Object.values(definedEvents);
  
  console.log(`Found ${allowedEventNames.length} events defined in schema.`);
  
  const foundEvents = scanForEvents();
  const uniqueFound = [...new Set(foundEvents)];
  
  let errors = 0;
  let checks = allowedEventNames.length; // Count definitions as checks

  console.log(`\nValidating ${uniqueFound.length} unique hardcoded events against schema...`);

  uniqueFound.forEach(event => {
    checks++;
    if (!allowedEventNames.includes(event)) {
      console.error(`❌ Error: Found hardcoded event "${event}" not defined in ANALYTICS_EVENTS schema.`);
      errors++;
    } else {
      console.log(`✅ Passed: ${event}`);
    }
  });

  // Additional checks: ensure all defined events follow se_ prefix
  allowedEventNames.forEach(event => {
    checks++;
    if (!event.startsWith('se_')) {
      console.error(`❌ Error: Defined event "${event}" does not follow the "se_" prefix convention.`);
      errors++;
    }
  });

  console.log(`\nResults: ${checks} checks, ${errors} errors.`);
  
  if (errors > 0 && !isDryRun) {
    process.exit(1);
  }
}

main();
