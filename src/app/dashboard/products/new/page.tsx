import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/products/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, role')
    .eq('id', user?.id)
    .single()

  return (
    <div className="min-h-dvh bg-slate-50 p-6">
      <ProductForm 
        restaurantId={profile?.restaurant_id} 
        userRole={profile?.role} 
      />
    </div>
  )
}
