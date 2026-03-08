import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has vendor record
  const { data: vendorRecord } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Redirect based on role
  const role = vendorRecord ? 'vendor' : 'planner'
  redirect(`/${role}`)
}
