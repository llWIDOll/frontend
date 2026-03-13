import { createClient } from '@/lib/supabase/server'
import OrderKanban from '@/components/orders/OrderKanban'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user?.id)
    .single()

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestión de Pedidos</h1>
          <p className="text-slate-500 text-sm">Órdenes en tiempo real</p>
        </div>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <ThemeToggle />
          {profile?.restaurant_id && <NotificationBell restaurantId={profile.restaurant_id} />}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        {profile?.restaurant_id && (
          <OrderKanban restaurantId={profile.restaurant_id} />
        )}
      </main>
    </div>
  )
}
