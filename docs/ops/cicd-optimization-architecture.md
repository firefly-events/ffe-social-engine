# FFE CI/CD Optimization: Swarm-Driven Multi-Repo Architecture

**Date:** 2026-03-26

## Executive Summary

The $195/month GHA burn was caused by: (1) dostal-claude-flow running 13 cron workflows (~244 runs/day, all failing), and (2) shindig running 11 build/test workflows on every PR push. Fix: two-phase CI, event-driven triggers, hive handles all builds.

## Two-Phase CI Architecture

```
Phase 1: PR gate (cheap, fast — 2-4 min)
  Runs on: GitHub-hosted ubuntu (or Blacksmith)
  Content: lint + type-check + security scan
  Purpose: Block clearly broken code

Phase 2: Post-merge promotion gate (thorough, hive-triggered)
  Runs on: hive self-hosted or hive-triggered
  Content: full test suite + Playwright/Maestro + build verify
  Purpose: Gate dev → main promotion
  Cost: $0 GHA minutes for hive-native jobs
```

## Dev → Main Auto-Promotion

### Feature PR → Dev (requires quorum)
ALL merges to dev require QA + Product Owner + Tech Lead sign-off. This is the quality gate.

### Dev → Main/Master (scheduled, full test suite)
Trigger: on a regular schedule (not per-merge, not cron — director-managed cadence).
When progress is being made and nothing is broken, dev promotes to main:

1. Director creates promotion PR: dev → main/master
2. Promotion PR runs FULL test suite (unit + integration + E2E)
   - This catches environment-specific issues (local box != CI runner)
   - Runs on GHA or cheaper alternative (Blacksmith, self-hosted)
   - This is the ONE place we spend real CI minutes
3. If ALL tests pass → merge to main → auto-deploy to prod
4. If tests fail → Pipeline Blocked ticket + Slack alert, NO merge

The promotion cadence is consistent improvement — as long as we're making progress and not breaking things, dev flows to prod regularly. Not gated on individual PRs, gated on the full suite passing.

## Per-Repo Workflow Config

| Repo | PR Gate (Phase 1) | Promotion (Phase 2) | Deploy |
|---|---|---|---|
| social-engine | lint + type-check (Blacksmith) | N/A (PR→main direct) | Vercel auto |
| event-api | lint + unit tests | smoke against dev Fly.io → auto-merge to master | Fly.io on master push |
| shindig | PR Check lint only (GHA) + Maestro on hive | director creates dev→main PR, QA agent verifies | hive git-watcher |
| website | lint | N/A (PR→main direct) | Vercel auto |
| game-library | lint + type-check | N/A (PR→main direct) | Vercel + Convex auto |
| venues | security scan only | N/A | Vercel auto |

## Test Attestation (Prove Local Tests Ran)

Every PR body must include:

```markdown
## Test Attestation
- [x] `pnpm lint` — 0 violations
- [x] `pnpm test` — X suites, Y tests, 0 failures
- Runner: hive / desktop
- Timestamp: 2026-03-26T14:23:00Z
- SHA: abc1234
```

30-second GHA job validates this block exists. Does NOT re-run tests.

## Cost Projection

| State | Min/month | Cost |
|---|---|---|
| Before (crons + redundant builds) | ~113,000 | ~$884 |
| After (two-phase, event-driven) | ~7,500 | Free tier (2,000 free) + ~$44 overage |
| Savings | 105,000 min | ~$840/month |

## Key Rules

1. NO crons on GHA — all scheduling via Podman containers or Convex scheduled functions
2. NO builds on GHA for shindig — hive self-hosted runner handles all mobile CI
3. NO duplicate workflows — one check per purpose per PR
4. NO upload-artifact except Playwright failures at retention-days: 1
5. Promotion is scheduled cadence — director manages dev→main on a regular basis, not per-merge
6. Promotion PR runs FULL test suite (unit + integration + E2E) — this is the ONE expensive CI run
7. ALL merges to dev require quorum: QA + PO + Tech Lead sign-off
8. Attestation required — PR body must prove local tests passed
9. Concurrency groups — cancel-in-progress for PRs, never cancel deploys
10. paths-ignore — skip CI for docs-only changes (**.md, .github/**, docs/**)
11. NO local crons/daemons — use Podman container scheduling or cloud schedulers
12. Consider cheaper CI alternatives for the promotion suite (Blacksmith, self-hosted runner in Podman)

## Release Automation

- Auto-tag via release-please on main/master push (conventional commits)
- Changelog generated from commit messages
- Slack notification on deploy success/failure
- Per-repo deploy: Vercel (web), Fly.io (API), hive (mobile)
