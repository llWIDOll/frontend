import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'
import DashboardMetrics from '@/components/dashboard/DashboardMetrics'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Single query with foreign key join using correct PostgREST syntax
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, restaurant_id')
    .eq('id', user?.id)
    .single()

  console.log('[Dashboard] user id:', user?.id)
  console.log('[Dashboard] profile:', JSON.stringify(profile))
  console.log('[Dashboard] profile error:', profileError?.message)

  // Direct query to restaurants table using the restaurant_id from profile
  let restaurantName = 'Mi Restaurante'
  if (profile?.restaurant_id) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', profile.restaurant_id)
      .single()
    
    console.log('[Dashboard] restaurant:', JSON.stringify(restaurant))
    if (restaurant?.name) restaurantName = restaurant.name
  }

  // El bloque de "main" metrics ahora corre enteramente en DashboardMetrics
  // para que las fechas puedan reaccionar desde el lado cliente al Timezone del usuario.

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {restaurantName}
          </h1>
          <p className="text-slate-500 text-sm">Panel de Gestión</p>
        </div>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <ThemeToggle />
          {profile?.restaurant_id && <NotificationBell restaurantId={profile.restaurant_id} />}
        </div>
      </header>

      {profile?.restaurant_id && (
        <DashboardMetrics restaurantId={profile.restaurant_id} />
      )}
    </div>
  )
}
