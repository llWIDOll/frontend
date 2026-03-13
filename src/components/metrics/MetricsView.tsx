'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsSummary from '@/components/metrics/StatsSummary'
import SalesChart from '@/components/metrics/SalesChart'
import { Clock } from 'lucide-react'

export default function MetricsView({ restaurantId, initialRange = '7d' }: { restaurantId: string, initialRange?: string }) {
  const [range, setRange] = useState(initialRange)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    orderCount: 0,
    avgTicket: 0,
    chartData: [] as {name: string, sales: number}[]
  })
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      const now = new Date()
      
      // Calculate start date based on client's local time (00:00:00)
      const daysToSubtract = range === '30d' ? 30 : 7
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract, 0, 0, 0)
      
      const startBoundary = startDate.toISOString()

      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startBoundary)
        .neq('status', 'cancelled')

      if (orders) {
        // Aggregate daily sales locally (in user's timezone)
        const dailyData: Record<string, number> = {}
        const dayFormatter = new Intl.DateTimeFormat('es-CO', { month: 'short', day: '2-digit' })
        
        orders.forEach(order => {
          // Parse UTC timestamp and format it in local timezone
          let dateStr = order.created_at
          if (!dateStr.includes('Z') && !dateStr.includes('+')) {
            dateStr += 'Z'
          }
          const orderDate = new Date(dateStr)
          const day = dayFormatter.format(orderDate).replace('.', '') // eg "mar 10" or "10 mar"
          const total = Number(order.total) || 0
          
          dailyData[day] = (dailyData[day] || 0) + total
        })

        const chartData = Object.entries(dailyData).map(([name, sales]) => ({ name, sales }))

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
        const orderCount = orders.length
        const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0

        setMetrics({ totalRevenue, orderCount, avgTicket, chartData })
      } else {
        setMetrics({ totalRevenue: 0, orderCount: 0, avgTicket: 0, chartData: [] })
      }
      setLoading(false)
    }

    fetchMetrics()
  }, [restaurantId, range, supabase])

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Selector and Header actions are conceptually outside, but we put range toggles here or lift them up. 
          Actually, since they modify the URL in the old version, we can just use local state here to avoid reloading the page. */}
      
      <div className="w-full flex justify-end px-6 mt-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === '7d' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
          >
            7 Días
          </button>
          <button 
            onClick={() => setRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === '30d' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
          >
            30 Días
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 w-full space-y-6">
        {loading ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 flex flex-col items-center text-center mt-8">
            <Clock className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
            <p className="text-slate-400 text-sm">Calculando métricas locales...</p>
          </div>
        ) : (
          <>
            <StatsSummary 
              totalRevenue={metrics.totalRevenue} 
              orderCount={metrics.orderCount} 
              avgTicket={metrics.avgTicket} 
            />
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Ventas Diarias ($)</h3>
               <div className="h-80 w-full text-slate-900">
                 <SalesChart data={metrics.chartData} />
               </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
