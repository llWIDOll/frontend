import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/products/ProductForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, role')
    .eq('id', user?.id)
    .single()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product || error) notFound()

  // Security: product must belong to same restaurant (or super_admin)
  if (product.restaurant_id !== profile?.restaurant_id && profile?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-full p-12 text-slate-500">
        No tienes permiso para editar este producto.
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-50 p-6">
      <ProductForm 
        product={product} 
        restaurantId={profile?.restaurant_id} 
        userRole={profile?.role} 
      />
    </div>
  )
}
