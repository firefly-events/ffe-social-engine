#!/usr/bin/env node
/**
 * PostHog Dashboard Provisioner — FIR-878, FIR-1179
 *
 * Creates PostHog dashboards, cohorts, and session replay config via API.
 *
 * Usage:
 *   node scripts/posthog-provision.js --project 271237
 *   node scripts/posthog-provision.js --project 299909 --dry-run
 *   node scripts/posthog-provision.js --app social-engine --project <SE_PROJECT_ID>
 *   node scripts/posthog-provision.js --app social-engine --dry-run
 *
 * Required env vars:
 *   POSTHOG_API_KEY          — Personal API key (Settings > Personal API Keys)
 *   POSTHOG_HOST             — PostHog instance URL (default: https://app.posthog.com)
 *   POSTHOG_SE_PROJECT_ID    — Social Engine project ID (alternative to --project for --app social-engine)
 *
 * PostHog API docs:
 *   POST /api/projects/:project_id/dashboards/
 *   POST /api/projects/:project_id/cohorts/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Parse args ---
const args = process.argv.slice(2);
const appArg = args.indexOf('--app');
const projectArg = args.indexOf('--project');
const dryRun = args.includes('--dry-run');

const appMode = appArg !== -1 ? args[appArg + 1] : null;
const VALID_APPS = ['social-engine'];

if (appMode && !VALID_APPS.includes(appMode)) {
  console.error(`Error: Unknown --app value "${appMode}". Valid values: ${VALID_APPS.join(', ')}`);
  process.exit(1);
}

// --- Resolve project ID ---
let projectId;
if (projectArg !== -1 && args[projectArg + 1]) {
  projectId = args[projectArg + 1];
} else if (appMode === 'social-engine') {
  projectId = process.env.POSTHOG_SE_PROJECT_ID;
  if (!projectId && !dryRun) {
    console.error('Error: --project <id> or POSTHOG_SE_PROJECT_ID env var is required for --app social-engine');
    process.exit(1);
  }
  projectId = projectId || 'DRY_RUN_PROJECT';
} else {
  console.error('Error: --project <project_id> is required');
  console.error('Examples:');
  console.error('  node scripts/posthog-provision.js --project 271237');
  console.error('  node scripts/posthog-provision.js --app social-engine --project 123456');
  process.exit(1);
}

// --- Env vars ---
const apiKey = process.env.POSTHOG_API_KEY;
const host = (process.env.POSTHOG_HOST || 'https://app.posthog.com').replace(/\/$/, '');

if (!apiKey && !dryRun) {
  console.error('Error: POSTHOG_API_KEY environment variable is not set');
  process.exit(1);
}

// =============================================================================
// --- Helper: build tiles from a tiles array ---
// =============================================================================

function buildTiles(tilesArray) {
  return tilesArray.map((tile) => {
    if (tile.type === 'text') {
      return { type: 'TEXT', body: tile.body, layouts: {} };
    }
    return {
      type: 'INSIGHT',
      insight: {
        name: tile.name,
        filters: {
          insight: (tile.query.insight || tile.type).toUpperCase(),
          ...tile.query
        }
      },
      layouts: {}
    };
  });
}

// =============================================================================
// --- Helper: POST to PostHog API ---
// =============================================================================

async function postToPostHog(endpoint, payload) {
  const url = `${host}${endpoint}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    throw new Error(`Network request failed: ${err.message}`);
  }

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`PostHog API ${response.status} at ${endpoint}: ${body}`);
  }

  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
}

// =============================================================================
// --- Original FFE Event Metrics provisioner (backward compatible) ---
// =============================================================================

function provisionFFEEventMetrics() {
  const configPath = path.resolve(__dirname, '../posthog/event-metrics-dashboard.json');

  if (!fs.existsSync(configPath)) {
    console.error(`Error: Dashboard config not found at ${configPath}`);
    process.exit(1);
  }

  const dashboardConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const tiles = [];
  for (const section of dashboardConfig.sections) {
    for (const tile of section.tiles) {
      if (tile.type === 'text') {
        tiles.push({ type: 'TEXT', body: tile.body, layouts: {} });
      } else {
        tiles.push({
          type: 'INSIGHT',
          insight: {
            name: tile.name,
            filters: { insight: tile.type.toUpperCase(), ...tile.query }
          },
          layouts: {}
        });
      }
    }
  }

  const payload = {
    name: 'FFE Event Metrics',
    description: dashboardConfig._meta.description,
    tiles
  };

  const url = `${host}/api/projects/${projectId}/dashboards/`;

  console.log(`\nPostHog Dashboard Provisioner`);
  console.log(`------------------------------`);
  console.log(`Project:   ${projectId}`);
  console.log(`Host:      ${host}`);
  console.log(`Dashboard: ${payload.name}`);
  console.log(`Tiles:     ${tiles.length}`);
  console.log(`Dry run:   ${dryRun}`);
  console.log('');

  if (dryRun) {
    console.log('[dry-run] Would POST to:', url);
    console.log('[dry-run] Payload preview:');
    console.log(JSON.stringify({ name: payload.name, description: payload.description, tile_count: tiles.length }, null, 2));
    console.log('\n[dry-run] Full tile names:');
    tiles.forEach((t, i) => {
      const label = t.type === 'TEXT' ? '(text tile)' : t.insight.name;
      console.log(`  ${i + 1}. ${label}`);
    });
    console.log('\n[dry-run] No changes made.');
    process.exit(0);
  }

  return (async () => {
    const result = await postToPostHog(`/api/projects/${projectId}/dashboards/`, payload);
    console.log(`Dashboard created successfully.`);
    console.log(`ID:  ${result.id}`);
    console.log(`URL: ${host}/project/${projectId}/dashboard/${result.id}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open the dashboard URL above');
    console.log('  2. Verify all tiles loaded correctly');
    console.log('  3. Enable "Filter out internal and test users" on engagement tiles if not already set');
    console.log('  4. See posthog/event-metrics-dashboard.json setup_instructions for test account filter setup');
  })();
}

// =============================================================================
// --- Social Engine provisioner (FIR-1179) ---
// =============================================================================

/**
 * Provision all Social Engine PostHog config:
 *   1. 5 dashboards (SE Growth, Content Pipeline, Conversion Funnel, Revenue, Feature Adoption)
 *   2. 6 cohorts
 *   3. Dry-run report of session replay config (manual setup required)
 *
 * @param {string} pid - PostHog project ID
 */
async function provisionSocialEngine(pid) {
  const seDir = path.resolve(__dirname, '../posthog/social-engine');

  // --- Load configs ---
  const dashboardsConfig = JSON.parse(
    fs.readFileSync(path.join(seDir, 'dashboards.json'), 'utf8')
  );
  const cohortsConfig = JSON.parse(
    fs.readFileSync(path.join(seDir, 'cohorts.json'), 'utf8')
  );
  const replayConfig = JSON.parse(
    fs.readFileSync(path.join(seDir, 'session-replay-config.json'), 'utf8')
  );

  const dashboards = dashboardsConfig.dashboards;
  const cohorts = cohortsConfig.cohorts;

  // --- Summary header ---
  console.log(`\nPostHog Provisioner — Social Engine (FIR-1179)`);
  console.log(`-----------------------------------------------`);
  console.log(`Project:    ${pid}`);
  console.log(`Host:       ${host}`);
  console.log(`Dashboards: ${Object.keys(dashboards).length}`);
  console.log(`Cohorts:    ${cohorts.length}`);
  console.log(`Dry run:    ${dryRun}`);
  console.log('');

  // --- Dry-run mode ---
  if (dryRun) {
    console.log('[dry-run] DASHBOARDS to create:');
    for (const [key, dashboard] of Object.entries(dashboards)) {
      const tileCount = dashboard.tiles.length;
      console.log(`  • ${dashboard.name} (${tileCount} tiles) [key: ${key}]`);
      dashboard.tiles.forEach((t, i) => {
        const label = t.type === 'text' ? `(text) ${t.body?.slice(0, 50)}...` : t.name;
        console.log(`      ${i + 1}. ${label}`);
      });
    }

    console.log('\n[dry-run] COHORTS to create:');
    cohorts.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} — ${c.description}`);
    });

    console.log('\n[dry-run] SESSION REPLAY patterns (manual setup in PostHog project settings):');
    replayConfig.session_replay.url_patterns.forEach((p) => {
      console.log(`  • ${p.pattern} — sample rate: ${(p.sample_rate * 100).toFixed(0)}% [${p.priority}]`);
    });

    console.log('\n[dry-run] No changes made.');
    return;
  }

  // --- Create dashboards ---
  console.log('Creating dashboards...');
  const createdDashboards = [];
  for (const [key, dashboard] of Object.entries(dashboards)) {
    const tiles = buildTiles(dashboard.tiles);
    const payload = {
      name: dashboard.name,
      description: dashboard.description || '',
      tags: dashboard.tags || [],
      tiles
    };

    try {
      const result = await postToPostHog(`/api/projects/${pid}/dashboards/`, payload);
      console.log(`  ✓ ${dashboard.name} — ID: ${result.id}`);
      createdDashboards.push({ key, name: dashboard.name, id: result.id });
    } catch (err) {
      console.error(`  ✗ ${dashboard.name} — FAILED: ${err.message}`);
    }
  }

  // --- Create cohorts ---
  console.log('\nCreating cohorts...');
  const createdCohorts = [];
  for (const cohort of cohorts) {
    const payload = {
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters
    };

    try {
      const result = await postToPostHog(`/api/projects/${pid}/cohorts/`, payload);
      console.log(`  ✓ ${cohort.name} — ID: ${result.id}`);
      createdCohorts.push({ slug: cohort.slug, name: cohort.name, id: result.id });
    } catch (err) {
      console.error(`  ✗ ${cohort.name} — FAILED: ${err.message}`);
    }
  }

  // --- Session replay (manual step) ---
  console.log('\nSession replay config (manual setup required):');
  replayConfig.session_replay.url_patterns.forEach((p) => {
    console.log(`  • ${p.pattern} — ${(p.sample_rate * 100).toFixed(0)}% sample rate [${p.priority}]`);
  });
  console.log('  → Configure in PostHog: Project Settings > Session Recording > URL Rules');

  // --- Summary ---
  console.log('\n--- Provisioning Summary ---');
  console.log(`Dashboards created: ${createdDashboards.length} / ${Object.keys(dashboards).length}`);
  createdDashboards.forEach((d) => {
    console.log(`  ${d.name}: ${host}/project/${pid}/dashboard/${d.id}`);
  });
  console.log(`Cohorts created:    ${createdCohorts.length} / ${cohorts.length}`);
  createdCohorts.forEach((c) => {
    console.log(`  ${c.name} (ID: ${c.id})`);
  });
  console.log('');
  console.log('Next steps:');
  console.log('  1. Configure session replay URL rules in PostHog project settings');
  console.log('  2. Add test account filters ($email icontains @ff.events / @firefly.events)');
  console.log('  3. Deploy posthog.ts and posthog-events.ts to apps/dashboard/src/lib/');
  console.log('  4. Add NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to .secrets/.env');
  console.log('  5. See posthog/social-engine/event-schema.md for full event instrumentation guide');
}

// =============================================================================
// --- Main entry point ---
// =============================================================================

if (appMode === 'social-engine') {
  provisionSocialEngine(projectId).catch((err) => {
    console.error('Fatal error during social-engine provisioning:', err.message);
    process.exit(1);
  });
} else {
  // Original behavior — backward compatible
  provisionFFEEventMetrics();
}
