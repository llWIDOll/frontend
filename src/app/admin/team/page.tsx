import { createClient } from '@/lib/supabase/server'
import UserList from '@/components/admin/UserList'

export default async function AdminTeamPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*, restaurants(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-slate-50 p-6 md:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Equipo y Usuarios</h1>
        <p className="text-slate-500">Gestión de roles y acceso a la plataforma</p>
      </header>

      <UserList initialUsers={users || []} />
    </div>
  )
}
