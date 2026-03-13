'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, BarChart3, Package, CreditCard, ChevronRight, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatLocalTime } from '@/utils/format'

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  received: { label: 'Recibido', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  pending_payment: { label: 'Pago Pendiente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  confirmed: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  preparing: { label: 'En Preparación', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  delivered: { label: 'Entregado', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
}

export default function DashboardMetrics({ restaurantId }: { restaurantId: string }) {
  const [ordersCount, setOrdersCount] = useState<number | null>(null)
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null)
  const [productsCount, setProductsCount] = useState<number | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMetrics() {
      // Calculamos "Hoy" usando expresamente la zona horaria DEL DISPOSITIVO DEL USUARIO
      const now = new Date()
      // Día de hoy a la media noche local
      const localStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      // Día de mañana a la media noche local
      const localStartOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)

      // toISOString() envía la hora convertida a UTC, lo cual calza matemáticamente con los UTC "timestamp sin tz" de Supabase
      const todayStart = localStartOfDay.toISOString()
      const tomorrowStart = localStartOfTomorrow.toISOString()

      // Fetch today's orders (filtrando estricto en el rango dinámico local)
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total, status, created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', todayStart)
        .lt('created_at', tomorrowStart)

      if (todayOrders) {
        setOrdersCount(todayOrders.length)
        const revenue = todayOrders.reduce((sum, order) => {
          if (order.status !== 'cancelled') {
            return sum + (Number(order.total) || 0)
          }
          return sum
        }, 0)
        setTodayRevenue(revenue)
      } else {
        setOrdersCount(0)
        setTodayRevenue(0)
      }

      // Fetch products count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
      setProductsCount(count || 0)

      // Fetch recent limit 5
      const { data: recent } = await supabase
        .from('orders')
        .select('id, customer_name, total, status, created_at')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      setRecentOrders(recent || [])
    }
    fetchMetrics()
  }, [restaurantId, supabase])

  return (
    <main className="p-6 space-y-8 w-full max-w-7xl mx-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pedidos hoy</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {ordersCount === null ? '...' : ordersCount}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ingresos hoy</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {todayRevenue === null ? '...' : formatCurrency(todayRevenue)}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Productos</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-end gap-2">
            {productsCount === null ? '...' : productsCount} <Package className="w-5 h-5 text-slate-300 mb-0.5" />
          </h3>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Satisfacción</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-end gap-2">
            98% <TrendingUp className="w-5 h-5 text-emerald-400 mb-0.5" />
          </h3>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/orders"
            className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 dark:hover:border-orange-500 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600 dark:text-orange-500">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pedidos</h3>
                <p className="text-slate-500 text-sm">Gestiona pedidos en tiempo real</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-colors" />
          </Link>

          <Link 
            href="/dashboard/products"
            className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-500 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600 dark:text-blue-500">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Productos</h3>
                <p className="text-slate-500 text-sm">Menú y disponibilidad</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Link>

          <Link 
            href="/dashboard/payments"
            className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-emerald-200 dark:hover:border-emerald-500 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600 dark:text-emerald-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pagos</h3>
                <p className="text-slate-500 text-sm">Comprobantes por verificar</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </Link>

          <Link 
            href="/dashboard/metrics"
            className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-purple-200 dark:hover:border-purple-500 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-600 dark:text-purple-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Métricas</h3>
                <p className="text-slate-500 text-sm">Ventas y rendimiento</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-purple-500 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Actividad reciente</h2>
        
        {!recentOrders ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
            <p className="text-slate-400 text-sm">Cargando actividad...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">Los pedidos recientes aparecerán aquí</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'text-slate-600 bg-slate-50' }
              
              return (
                <div key={order.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl text-orange-600 dark:text-orange-500 hidden sm:block">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {/* 
                          Ya no usa SSR para formatear; corre localmente con formatLocalTime
                          que se apoya de la zona horaria del dispositivo porque es ClientComponent
                        */}
                        {formatLocalTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden md:block">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(Number(order.total))}
                    </p>
                  </div>
                </div>
              )
            })}
            
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <Link href="/dashboard/orders" className="text-sm font-bold text-orange-500 hover:text-orange-600">
                Ver todos los pedidos
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
