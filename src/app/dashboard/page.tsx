import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { 
  ShoppingBag, 
  BarChart3, 
  Package, 
  CreditCard,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'

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

      <main className="p-6 space-y-8 w-full max-w-7xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pedidos hoy</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">0</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ingresos hoy</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">$0</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Productos</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-end gap-1">
              — <Package className="w-4 h-4 text-slate-300 mb-0.5" />
            </h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Satisfacción</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-end gap-1">
              — <TrendingUp className="w-4 h-4 text-slate-300 mb-0.5" />
            </h3>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Accesos rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/dashboard/orders"
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600">
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
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600">
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
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
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
              className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-orange-200 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-600">
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

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Actividad reciente</h2>
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Los pedidos recientes aparecerán aquí</p>
          </div>
        </div>
      </main>
    </div>
  )
}
