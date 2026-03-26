/**
 * PostHog Idempotent Provisioning Script
 * 
 * Sets up dashboards, cohorts, and feature flags in PostHog.
 * Supports updating existing resources (PATCH) if they already exist.
 * 
 * Usage:
 *   POSTHOG_PERSONAL_API_KEY=... node scripts/posthog-provision.js --project <project_id>
 */

const https = require('https');

const PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'app.posthog.com';

if (!PERSONAL_API_KEY) {
  console.error('Error: POSTHOG_PERSONAL_API_KEY is required');
  process.exit(1);
}

const args = process.argv.slice(2);
const projectId = args[args.indexOf('--project') + 1];

if (!projectId) {
  console.error('Error: --project <id> is required');
  process.exit(1);
}

async function posthogRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: POSTHOG_HOST,
      path: `/api/projects/${projectId}${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${PERSONAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`PostHog API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function provisionDashboard(name, description) {
  console.log(`Provisioning dashboard: ${name}`);
  
  // 1. Check if it exists
  const dashboards = await posthogRequest('/dashboards/');
  const existing = dashboards.results.find(d => d.name === name);

  if (existing) {
    console.log(`  Updating existing dashboard (ID: ${existing.id})`);
    return posthogRequest(`/dashboards/${existing.id}/`, 'PATCH', {
      description: description
    });
  } else {
    console.log(`  Creating new dashboard`);
    return posthogRequest('/dashboards/', 'POST', {
      name: name,
      description: description
    });
  }
}

async function provisionFeatureFlag(key, name) {
  console.log(`Provisioning feature flag: ${key}`);
  
  const flags = await posthogRequest('/feature_flags/');
  const existing = flags.results.find(f => f.key === key);

  if (existing) {
    console.log(`  Flag already exists (ID: ${existing.id})`);
    return existing;
  } else {
    console.log(`  Creating new feature flag`);
    return posthogRequest('/feature_flags/', 'POST', {
      key: key,
      name: name,
      active: true,
      filters: {
        groups: [{ rollout_percentage: 100 }]
      }
    });
  }
}

async function main() {
  try {
    console.log(`Starting PostHog provisioning for project ${projectId}...`);
    
    // Dashboards
    await provisionDashboard('Social Engine: Growth', 'User growth and retention metrics');
    await provisionDashboard('Social Engine: Pipeline', 'Content generation pipeline health');
    await provisionDashboard('Social Engine: Funnel', 'Onboarding and conversion funnels');
    await provisionDashboard('Social Engine: Revenue', 'Subscription and credit usage metrics');
    await provisionDashboard('Social Engine: Adoption', 'Feature adoption and usage frequency');

    // Feature Flags
    await provisionFeatureFlag('se-ai-composer-v2', 'New AI Composer UI');
    await provisionFeatureFlag('se-multi-tenant-orgs', 'Enable multi-tenant organizations');

    console.log('PostHog provisioning completed successfully.');
  } catch (error) {
    console.error('Provisioning failed:', error.message);
    process.exit(1);
  }
}

main();
