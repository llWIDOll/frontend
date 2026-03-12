import { createClient } from '@/lib/supabase/server'
import RestaurantList from '@/components/admin/RestaurantList'
import { Plus } from 'lucide-react'

export default async function AdminRestaurantsPage() {
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('name')

  return (
    <div className="min-h-dvh bg-slate-50 p-6 md:p-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Restaurantes</h1>
          <p className="text-slate-500">Manejo de inquilinos (tenants)</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Nuevo Restaurante</span>
        </button>
      </header>

      <RestaurantList initialRestaurants={restaurants || []} />
    </div>
  )
}
