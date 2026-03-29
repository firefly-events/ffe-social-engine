#!/usr/bin/env node
/**
 * validate-posthog-config.js
 *
 * Validates the PostHog provisioning config (dashboards + cohorts) and checks
 * that all required Social Engine events are present in the event registry.
 *
 * Usage: node scripts/validate-posthog-config.js
 */

'use strict'

const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Required events — must stay in sync with posthog-events.ts
// ---------------------------------------------------------------------------
const REQUIRED_EVENTS = [
  'se_user_signed_up',
  'se_content_created',
  'se_workflow_created',
]

const CONFIG_DIR = path.resolve(__dirname, '../posthog/social-engine/config')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load and parse a JSON file. Returns { ok: true, data } on success or
 * { ok: false, error } on failure. Callers must check `ok` before using `data`.
 *
 * @param {string} filePath
 * @returns {{ ok: true, data: unknown } | { ok: false, error: string }}
 */
function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return { ok: true, data: JSON.parse(raw) }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Collect every string value found anywhere in `obj` (recursively).
 *
 * @param {unknown} obj
 * @returns {string[]}
 */
function collectStrings(obj) {
  if (typeof obj === 'string') return [obj]
  if (Array.isArray(obj)) return obj.flatMap(collectStrings)
  if (obj && typeof obj === 'object') return Object.values(obj).flatMap(collectStrings)
  return []
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateEvents(dashboardsData, cohortsData) {
  const allStrings = [
    ...collectStrings(dashboardsData),
    ...collectStrings(cohortsData),
  ]

  const missing = REQUIRED_EVENTS.filter(
    (event) => !allStrings.includes(event),
  )

  return missing
}

// ---------------------------------------------------------------------------
// Provisioning plan printer
// ---------------------------------------------------------------------------

/**
 * Print a human-readable provisioning plan.
 *
 * FIR-1179 fix: accepts already-parsed data objects instead of re-reading and
 * re-parsing the JSON files a second time.
 *
 * @param {{ data: unknown } | { ok: false, error: string }} dashboardsResult
 * @param {{ data: unknown } | { ok: false, error: string }} cohortsResult
 */
function printProvisioningPlan(dashboardsResult, cohortsResult) {
  console.log('\n=== PostHog Provisioning Plan ===\n')

  if (!dashboardsResult.ok) {
    console.log(`  dashboards.json: ERROR — ${dashboardsResult.error}`)
  } else {
    const dashboardsRaw =
      dashboardsResult.data &&
      typeof dashboardsResult.data === 'object' &&
      dashboardsResult.data.dashboards
        ? dashboardsResult.data.dashboards
        : []
    
    const dashboards = Array.isArray(dashboardsRaw)
      ? dashboardsRaw
      : Object.values(dashboardsRaw)
      
    console.log(`  Dashboards to provision: ${dashboards.length}`)
    dashboards.forEach((d, i) => {
      console.log(`    ${i + 1}. ${d.name || '(unnamed)'}`)
    })
  }

  if (!cohortsResult.ok) {
    console.log(`  cohorts.json: ERROR — ${cohortsResult.error}`)
  } else {
    const cohorts =
      cohortsResult.data &&
      typeof cohortsResult.data === 'object' &&
      Array.isArray(cohortsResult.data.cohorts)
        ? cohortsResult.data.cohorts
        : []
    console.log(`  Cohorts to provision: ${cohorts.length}`)
    cohorts.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.name || '(unnamed)'}`)
    })
  }

  console.log('\n  Required events:')
  REQUIRED_EVENTS.forEach((e) => console.log(`    - ${e}`))
  console.log()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Validating PostHog config...')

  const dashboardsPath = path.join(CONFIG_DIR, 'dashboards.json')
  const cohortsPath = path.join(CONFIG_DIR, 'cohorts.json')

  // Load once — results are reused for both validation and the plan printer.
  const dashboardsResult = loadJson(dashboardsPath)
  const cohortsResult = loadJson(cohortsPath)

  let hasError = false

  if (!dashboardsResult.ok) {
    console.error(`ERROR: Could not load dashboards.json — ${dashboardsResult.error}`)
    hasError = true
  }

  if (!cohortsResult.ok) {
    console.error(`ERROR: Could not load cohorts.json — ${cohortsResult.error}`)
    hasError = true
  }

  // Print the plan using already-parsed data (no second JSON.parse call).
  printProvisioningPlan(dashboardsResult, cohortsResult)

  if (!hasError) {
    const missing = validateEvents(dashboardsResult.data, cohortsResult.data)
    if (missing.length > 0) {
      console.error('ERROR: The following required events are missing from the config:')
      missing.forEach((e) => console.error(`  - ${e}`))
      hasError = true
    } else {
      console.log('All required events are present.')
    }
  }

  if (hasError) {
    process.exit(1)
  } else {
    console.log('PostHog config validation passed.')
  }
}

main()
