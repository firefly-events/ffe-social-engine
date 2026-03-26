#!/usr/bin/env node
/**
 * PostHog Config Validator — FIR-1179
 *
 * Validates all PostHog dashboard JSON files and event schemas.
 * Runs structural checks without hitting the PostHog API.
 *
 * Usage:
 *   node scripts/validate-posthog-config.js --dry-run
 *   node scripts/validate-posthog-config.js --app social-engine --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Parse args ---
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const appArg = args.indexOf('--app');
const appFilter = appArg !== -1 ? args[appArg + 1] : null;

const POSTHOG_DIR = path.resolve(__dirname, '../posthog');
const SE_DIR = path.join(POSTHOG_DIR, 'social-engine');

let errors = 0;
let warnings = 0;
let passed = 0;

// =============================================================================
// --- Reporter helpers ---
// =============================================================================

function pass(msg) {
  console.log(`  ✓ ${msg}`);
  passed++;
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function section(title) {
  console.log(`\n── ${title}`);
}

// =============================================================================
// --- Generic JSON file validator ---
// =============================================================================

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`File not found: ${filePath}`);
    return null;
  }
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    pass(`Parsed JSON: ${path.relative(POSTHOG_DIR, filePath)}`);
    return content;
  } catch (err) {
    fail(`Invalid JSON in ${path.relative(POSTHOG_DIR, filePath)}: ${err.message}`);
    return null;
  }
}

// =============================================================================
// --- Validate a single tile object ---
// =============================================================================

function validateTile(tile, dashboardName, tileIndex) {
  const prefix = `${dashboardName} tile[${tileIndex}]`;

  if (!tile.name && tile.type !== 'text') {
    fail(`${prefix}: missing "name" field`);
    return;
  }

  if (!tile.type) {
    fail(`${prefix} "${tile.name || '(unnamed)'}": missing "type" field`);
    return;
  }

  if (tile.type === 'text') {
    if (!tile.body || typeof tile.body !== 'string' || tile.body.trim().length === 0) {
      fail(`${prefix} (text tile): "body" is empty or missing`);
    } else {
      pass(`${prefix} (text tile): valid`);
    }
    return;
  }

  const validTypes = ['trends', 'funnel', 'retention', 'stickiness', 'lifecycle'];
  if (!validTypes.includes(tile.type)) {
    warn(`${prefix} "${tile.name}": unexpected type "${tile.type}" (expected one of: ${validTypes.join(', ')})`);
  }

  if (!tile.query || typeof tile.query !== 'object') {
    fail(`${prefix} "${tile.name}": missing or invalid "query" field`);
    return;
  }

  if (!Array.isArray(tile.query.events) || tile.query.events.length === 0) {
    if (tile.type !== 'retention') {
      fail(`${prefix} "${tile.name}": query.events must be a non-empty array`);
      return;
    }
  }

  if (tile.type === 'funnel') {
    if (Array.isArray(tile.query.events) && tile.query.events.length < 2) {
      warn(`${prefix} "${tile.name}": funnel has fewer than 2 steps`);
    }
  }

  pass(`${prefix} "${tile.name}": valid`);
}

// =============================================================================
// --- Validate original dashboards.json ---
// =============================================================================

function validateOriginalDashboards() {
  section('posthog/dashboards.json (original FFE dashboards)');
  const config = loadJson(path.join(POSTHOG_DIR, 'dashboards.json'));
  if (!config) return;

  if (!config.dashboards || typeof config.dashboards !== 'object') {
    fail('Missing "dashboards" top-level key');
    return;
  }

  const dashboardKeys = Object.keys(config.dashboards);
  pass(`Found ${dashboardKeys.length} dashboards: ${dashboardKeys.join(', ')}`);

  for (const [key, dashboard] of Object.entries(config.dashboards)) {
    if (!dashboard.name) {
      fail(`Dashboard "${key}": missing "name"`);
      continue;
    }
    if (!Array.isArray(dashboard.metrics) || dashboard.metrics.length === 0) {
      warn(`Dashboard "${key}": no metrics defined`);
    } else {
      pass(`Dashboard "${key}" (${dashboard.name}): ${dashboard.metrics.length} metrics defined`);
    }
  }
}

// =============================================================================
// --- Validate event-metrics-dashboard.json ---
// =============================================================================

function validateEventMetricsDashboard() {
  section('posthog/event-metrics-dashboard.json');
  const config = loadJson(path.join(POSTHOG_DIR, 'event-metrics-dashboard.json'));
  if (!config) return;

  if (!config._meta) warn('Missing _meta block');
  if (!config.sections || !Array.isArray(config.sections)) {
    fail('Missing "sections" array');
    return;
  }

  let totalTiles = 0;
  for (const sect of config.sections) {
    if (!sect.name) {
      warn('Section missing "name"');
    }
    if (!Array.isArray(sect.tiles)) {
      fail(`Section "${sect.name || '(unnamed)'}": missing tiles array`);
      continue;
    }
    sect.tiles.forEach((tile, i) => validateTile(tile, sect.name || '(unnamed)', i));
    totalTiles += sect.tiles.length;
  }
  pass(`Total tiles across ${config.sections.length} sections: ${totalTiles}`);
}

// =============================================================================
// --- Validate Social Engine dashboards.json ---
// =============================================================================

function validateSEDashboards() {
  section('posthog/social-engine/dashboards.json');
  const config = loadJson(path.join(SE_DIR, 'dashboards.json'));
  if (!config) return;

  if (!config._meta) warn('Missing _meta block');

  if (!config.dashboards || typeof config.dashboards !== 'object') {
    fail('Missing "dashboards" top-level key');
    return;
  }

  const dashboardKeys = Object.keys(config.dashboards);
  const REQUIRED_DASHBOARDS = [
    'se-growth',
    'se-content-pipeline',
    'se-conversion-funnel',
    'se-revenue',
    'se-feature-adoption'
  ];

  for (const required of REQUIRED_DASHBOARDS) {
    if (dashboardKeys.includes(required)) {
      pass(`Required dashboard present: ${required}`);
    } else {
      fail(`Missing required dashboard: ${required}`);
    }
  }

  let totalTiles = 0;
  for (const [key, dashboard] of Object.entries(config.dashboards)) {
    if (!dashboard.name) {
      fail(`Dashboard "${key}": missing "name"`);
      continue;
    }
    if (!Array.isArray(dashboard.tiles) || dashboard.tiles.length === 0) {
      fail(`Dashboard "${key}": missing or empty "tiles" array`);
      continue;
    }
    dashboard.tiles.forEach((tile, i) => validateTile(tile, dashboard.name, i));
    totalTiles += dashboard.tiles.length;
  }
  pass(`Total tiles across ${dashboardKeys.length} SE dashboards: ${totalTiles}`);
}

// =============================================================================
// --- Validate Social Engine cohorts.json ---
// =============================================================================

function validateSECohorts() {
  section('posthog/social-engine/cohorts.json');
  const config = loadJson(path.join(SE_DIR, 'cohorts.json'));
  if (!config) return;

  if (!Array.isArray(config.cohorts)) {
    fail('Missing "cohorts" array');
    return;
  }

  const REQUIRED_COHORTS = [
    'SE Active Users',
    'SE Power Users',
    'SE At-Risk Users',
    'SE Trial Users',
    'SE Converted Users',
    'SE Churned Users'
  ];

  const cohortNames = config.cohorts.map((c) => c.name);
  for (const required of REQUIRED_COHORTS) {
    if (cohortNames.includes(required)) {
      pass(`Required cohort present: ${required}`);
    } else {
      fail(`Missing required cohort: ${required}`);
    }
  }

  config.cohorts.forEach((cohort, i) => {
    if (!cohort.name) fail(`cohort[${i}]: missing "name"`);
    if (!cohort.filters) fail(`cohort "${cohort.name || i}": missing "filters"`);
    if (!cohort.slug) warn(`cohort "${cohort.name || i}": missing "slug" (recommended)`);
  });
}

// =============================================================================
// --- Validate Social Engine session-replay-config.json ---
// =============================================================================

function validateSESessionReplay() {
  section('posthog/social-engine/session-replay-config.json');
  const config = loadJson(path.join(SE_DIR, 'session-replay-config.json'));
  if (!config) return;

  if (!config.session_replay) {
    fail('Missing "session_replay" top-level key');
    return;
  }

  const { url_patterns, masking } = config.session_replay;

  if (!Array.isArray(url_patterns) || url_patterns.length === 0) {
    fail('"url_patterns" is missing or empty');
    return;
  }

  const HIGH_VALUE_PATTERNS = ['/onboard*', '/checkout*', '/pricing*'];
  for (const required of HIGH_VALUE_PATTERNS) {
    const found = url_patterns.find((p) => p.pattern === required);
    if (found) {
      if (found.sample_rate !== 1.0) {
        warn(`URL pattern "${required}": sample_rate is ${found.sample_rate}, expected 1.0 for high-value flow`);
      } else {
        pass(`High-value URL pattern "${required}": 100% sample rate`);
      }
    } else {
      fail(`Missing required high-value URL pattern: "${required}"`);
    }
  }

  if (!masking) {
    warn('"masking" config is missing');
  } else {
    const hasCreditCard = masking.mask_inputs?.some(
      (m) => m.description && m.description.toLowerCase().includes('credit card')
    );
    const hasPassword = masking.mask_inputs?.some(
      (m) => m.selector && m.selector.includes('password')
    );
    if (hasPassword) pass('Password field masking configured');
    else fail('Missing password field masking rule');
    if (hasCreditCard) pass('Credit card field masking configured');
    else fail('Missing credit card field masking rule');
  }
}

// =============================================================================
// --- Validate Social Engine retention-config.json ---
// =============================================================================

function validateSERetention() {
  section('posthog/social-engine/retention-config.json');
  const config = loadJson(path.join(SE_DIR, 'retention-config.json'));
  if (!config) return;

  if (!Array.isArray(config.retention_analyses)) {
    fail('Missing "retention_analyses" array');
    return;
  }

  const REQUIRED_RETENTION = [
    'Weekly Content Creation Retention',
    'Monthly Post Retention',
    'D1 / D7 / D30 Activation Retention'
  ];

  const names = config.retention_analyses.map((r) => r.name);
  for (const required of REQUIRED_RETENTION) {
    if (names.includes(required)) {
      pass(`Required retention analysis present: ${required}`);
    } else {
      fail(`Missing required retention analysis: "${required}"`);
    }
  }

  config.retention_analyses.forEach((r, i) => {
    if (!r.targets) warn(`retention_analyses[${i}] "${r.name}": no targets defined`);
    if (!r.interpretation) warn(`retention_analyses[${i}] "${r.name}": no interpretation text`);
  });
}

// =============================================================================
// --- Validate Social Engine event-schema.md ---
// =============================================================================

function validateSEEventSchema() {
  section('posthog/social-engine/event-schema.md');
  const schemaPath = path.join(SE_DIR, 'event-schema.md');
  if (!fs.existsSync(schemaPath)) {
    fail('event-schema.md not found');
    return;
  }

  const content = fs.readFileSync(schemaPath, 'utf8');
  pass(`File found (${content.length} chars)`);

  const REQUIRED_EVENTS = [
    'se_user_signed_up',
    'se_onboarding_started',
    'se_onboarding_step_completed',
    'se_onboarding_completed',
    'se_content_created',
    'se_content_exported',
    'se_content_scheduled',
    'se_content_posted',
    'se_content_failed',
    'se_ai_content_generated',
    'se_voice_clone_started',
    'se_voice_clone_completed',
    'se_workflow_created',
    'se_workflow_executed',
    'se_plan_upgraded',
    'se_plan_downgraded',
    'se_subscription_cancelled',
    'se_trial_started',
    'se_trial_converted',
    'se_checkout_started',
    'se_checkout_completed'
  ];

  for (const event of REQUIRED_EVENTS) {
    if (content.includes(event)) {
      pass(`Event documented: ${event}`);
    } else {
      fail(`Missing event documentation: ${event}`);
    }
  }
}

// =============================================================================
// --- Dry-run provisioning report ---
// =============================================================================

function printProvisioningPlan() {
  section('Provisioning Plan (dry-run summary)');
  console.log('');
  console.log('  What posthog-provision.js --app social-engine would create:');
  console.log('');

  const dashFile = path.join(SE_DIR, 'dashboards.json');
  const cohortFile = path.join(SE_DIR, 'cohorts.json');

  if (fs.existsSync(dashFile)) {
    const d = JSON.parse(fs.readFileSync(dashFile, 'utf8'));
    const keys = Object.keys(d.dashboards || {});
    console.log(`  Dashboards (${keys.length}):`);
    keys.forEach((k) => {
      const db = d.dashboards[k];
      console.log(`    • ${db.name} — ${(db.tiles || []).length} tiles`);
    });
  }

  if (fs.existsSync(cohortFile)) {
    const c = JSON.parse(fs.readFileSync(cohortFile, 'utf8'));
    console.log(`\n  Cohorts (${c.cohorts.length}):`);
    c.cohorts.forEach((co) => console.log(`    • ${co.name}`));
  }

  console.log('\n  To run live provisioning:');
  console.log('    POSTHOG_API_KEY=<key> node scripts/posthog-provision.js --app social-engine --project <ID>');
}

// =============================================================================
// --- Main ---
// =============================================================================

console.log('PostHog Config Validator');
console.log('========================');
if (appFilter) console.log(`App filter: ${appFilter}`);
if (dryRun) console.log('Mode: dry-run (validation only, no API calls)');
console.log('');

if (!appFilter || appFilter !== 'social-engine') {
  validateOriginalDashboards();
  validateEventMetricsDashboard();
}

if (!appFilter || appFilter === 'social-engine') {
  validateSEDashboards();
  validateSECohorts();
  validateSESessionReplay();
  validateSERetention();
  validateSEEventSchema();
}

if (dryRun) {
  printProvisioningPlan();
}

// --- Final report ---
console.log('\n════════════════════════════════');
console.log(`Validation complete`);
console.log(`  Passed:   ${passed}`);
console.log(`  Warnings: ${warnings}`);
console.log(`  Errors:   ${errors}`);
console.log('════════════════════════════════');

if (errors > 0) {
  console.error(`\n${errors} error(s) found. Fix before provisioning.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n${warnings} warning(s). Review before provisioning.`);
  process.exit(0);
} else {
  console.log('\nAll checks passed.');
  process.exit(0);
}
