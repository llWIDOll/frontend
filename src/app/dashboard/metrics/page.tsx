import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'
import MetricsView from '@/components/metrics/MetricsView'

export default async function MetricsPage({ searchParams }: { searchParams: { range?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const initialRange = searchParams.range || '7d'

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user?.id)
    .single()

  const restaurantId = profile?.restaurant_id

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col pb-24">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Métricas y Ventas</h1>
          <p className="text-slate-500 text-sm">Rendimiento de tu restaurante</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {/* Navigational range buttons have been moved into MetricsView to run client-side without full reload */}
          </div>
          <div className="flex items-center gap-3 pl-4">
            <ThemeToggle />
            {restaurantId && <NotificationBell restaurantId={restaurantId} />}
          </div>
        </div>
      </header>

      {restaurantId && (
        <MetricsView restaurantId={restaurantId} initialRange={initialRange} />
      )}
    </div>
  )
}
