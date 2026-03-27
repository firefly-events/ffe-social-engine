/**
 * POST /api/export/webhook — Send selected assets to n8n webhook.
 *
 * FIR-1319: Auth-protected endpoint that forwards asset IDs to n8n and records
 * the export in Convex exportHistory.
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import {
  ok,
  badRequest,
  unauthorized,
  serverError,
  generateId,
} from '@/lib/api-helpers'
import { convexClient } from '@/lib/convex-client'
import { api } from '@convex/_generated/api'

interface WebhookBody {
  assetIds: string[]
  workflowId?: string
  platforms?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    let body: WebhookBody
    try {
      body = (await request.json()) as WebhookBody
    } catch {
      return badRequest('Invalid JSON body')
    }

    if (!body.assetIds || body.assetIds.length === 0) {
      return badRequest('assetIds is required and must not be empty')
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    let n8nResponse: unknown = null

    if (n8nWebhookUrl) {
      try {
        const n8nRes = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.userId,
            assetIds: body.assetIds,
            workflowId: body.workflowId,
            platforms: body.platforms ?? [],
            sentAt: new Date().toISOString(),
          }),
        })
        n8nResponse = await n8nRes.json().catch(() => ({ status: n8nRes.status }))
      } catch (err) {
        // n8n unreachable — log but don't fail the request
        console.warn('[POST /api/export/webhook] n8n unreachable:', err)
        n8nResponse = { error: 'n8n unreachable' }
      }
    } else {
      console.warn('[POST /api/export/webhook] N8N_WEBHOOK_URL not set — skipping webhook call')
    }

    // Record export in Convex
    const externalId = generateId('exp')
    await convexClient.mutation(api.exportHistory.create, {
      externalId,
      userId: session.userId,
      assetIds: body.assetIds,
      format: 'webhook',
      platform: body.platforms?.join(',') ?? undefined,
      n8nResponse,
      exportedAt: Date.now(),
    })

    return ok({
      success: true,
      exportId: externalId,
      n8nResponse,
    })
  } catch (err) {
    console.error('[POST /api/export/webhook]', err)
    return serverError()
  }
}
