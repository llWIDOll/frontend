'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleProductAvailability(productId: string, available: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ available })
    .eq('id', productId)

  if (error) {
    console.error('Error toggling product:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  // First check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { error: 'No tienes permisos para eliminar productos' }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Error deleting product:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  return { success: true }
}
