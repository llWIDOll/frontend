import { createClient } from '@/lib/supabase/server'
import { Building2, ShoppingBag, DollarSign, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: restaurantCount } = await supabase
    .from('restaurants')
    .select('*', { count: 'exact', head: true })

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .neq('status', 'cancelled')

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  const stats = [
    { label: 'Restaurantes', value: restaurantCount || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pedidos Totales', value: orderCount || 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Facturación Global', value: `$${formatCurrency(totalRevenue)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="min-h-dvh bg-slate-50 p-6 md:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
        <p className="text-slate-500">Vista global de la plataforma SaaS</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Acciones Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/restaurants"
            className="group p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Gestionar Restaurantes</p>
                <p className="text-slate-500 text-xs">Ver lista, crear y editar sedes</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/team"
            className="group p-6 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Administrar Equipo</p>
                <p className="text-slate-500 text-xs">Roles y permisos de usuarios</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
