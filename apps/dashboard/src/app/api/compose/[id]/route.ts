import { auth } from '@clerk/nextjs/server'
import { ok, unauthorized, notFound, serverError } from '@/lib/api-helpers'
import type { ComposeJob } from '@/lib/api-types'

const COMPOSER_URL = process.env.COMPOSER_SERVICE_URL ?? 'http://localhost:8003'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session.userId) return unauthorized()

    const { id } = await params
    if (!id) return notFound('Job')

    let upstream: Response
    try { upstream = await fetch(`${COMPOSER_URL}/compose/${id}`, { cache: 'no-store' }) }
    catch { return serverError('Composer service unreachable') }

    if (upstream.status === 404) return notFound('Job')
    if (!upstream.ok) return serverError('Composer service returned an error')

    const data = await upstream.json()
    const job: ComposeJob = {
      id,
      status: data.status === 'completed' ? 'ready' : data.status,
      resultUrl: data.result_url ?? undefined,
      error: data.error ?? undefined,
    }
    return ok(job)
  } catch (err) {
    console.error('[GET /api/compose/[id]]', err)
    return serverError()
  }
}