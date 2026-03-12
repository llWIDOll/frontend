import { createClient } from '@/lib/supabase/server'
import PaymentList from '@/components/payments/PaymentList'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user?.id)
    .single()

  // Fetch orders that have a payment proof or are waiting for payment
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', profile?.restaurant_id)
    .not('payment_proof_url', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Verificación de Pagos</h1>
          <p className="text-slate-500 text-sm">Confirma los comprobantes recibidos por WhatsApp</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {profile?.restaurant_id && <NotificationBell restaurantId={profile.restaurant_id} />}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 w-full">
        <PaymentList initialOrders={orders || []} />
      </main>
    </div>
  )
}
