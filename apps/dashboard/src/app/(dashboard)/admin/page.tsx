import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminPanel from './AdminPanel'

export default async function AdminPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const claims = sessionClaims as { metadata?: { role?: string } } | null
  const isAdmin = claims?.metadata?.role === 'admin'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const user = await currentUser()

  return <AdminPanel adminEmail={user?.primaryEmailAddress?.emailAddress ?? 'unknown'} />
}
