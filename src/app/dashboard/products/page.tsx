import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import ProductList from '@/components/products/ProductList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/layout/NotificationBell'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, role')
    .eq('id', user?.id)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', profile?.restaurant_id)
    .order('name')

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center w-full min-h-[76px]">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Menú de Productos</h1>
          <p className="text-slate-500 text-sm">Gestiona lo que vendes hoy</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/products/new" 
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl shadow-sm shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline text-sm">Nuevo</span>
          </Link>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <ThemeToggle />
            {profile?.restaurant_id && <NotificationBell restaurantId={profile.restaurant_id} />}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 w-full">
        <ProductList 
          initialProducts={products || []} 
          userRole={profile?.role}
        />
      </main>
    </div>
  )
}
