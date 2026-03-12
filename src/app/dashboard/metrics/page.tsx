import { createClient } from '@/lib/supabase/server'
import StatsSummary from '@/components/metrics/StatsSummary'
import SalesChart from '@/components/metrics/SalesChart'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'

export default async function MetricsPage({ searchParams }: { searchParams: { range?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const range = searchParams.range || '7d'

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user?.id)
    .single()

  const restaurantId = profile?.restaurant_id

  // Calculate dates
  const now = new Date()
  const startDate = range === '30d' ? subDays(now, 30) : subDays(now, 7)

  // Fetch orders for metrics
  const { data: orders } = await supabase
    .from('orders')
    .select('total, created_at, status')
    .eq('restaurant_id', restaurantId)
    .gte('created_at', startDate.toISOString())
    .neq('status', 'cancelled')

  // Aggregate daily sales for chart
  const dailyData: Record<string, number> = {}
  orders?.forEach(order => {
    const day = format(new Date(order.created_at), 'MMM dd')
    dailyData[day] = (dailyData[day] || 0) + Number(order.total)
  })

  const chartData = Object.entries(dailyData).map(([name, sales]) => ({ name, sales }))

  // Summary stats
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
  const orderCount = orders?.length || 0
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col pb-24">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Métricas y Ventas</h1>
          <p className="text-slate-500 text-sm">Rendimiento de tu restaurante</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <a 
              href="?range=7d" 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === '7d' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
            >
              7 Días
            </a>
            <a 
              href="?range=30d" 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === '30d' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
            >
              30 Días
            </a>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <ThemeToggle />
            {restaurantId && <NotificationBell restaurantId={restaurantId} />}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 w-full space-y-6">
        <StatsSummary 
          totalRevenue={totalRevenue} 
          orderCount={orderCount} 
          avgTicket={avgTicket} 
        />
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Ventas Diarias ($)</h3>
           <div className="h-80 w-full">
             <SalesChart data={chartData} />
           </div>
        </div>
      </main>
    </div>
  )
}
