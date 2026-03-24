import { redirect } from 'next/navigation'

// /dashboard → redirect to root (/) which is the actual dashboard page
export default function DashboardRedirect() {
  redirect('/')
}
