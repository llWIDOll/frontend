'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  let updatePayload: any = {
    status,
    updated_at: new Date().toISOString()
  }

  // Only auto-verify if transitioning to 'confirmed' FROM 'pending_payment'
  if (status === 'confirmed') {
    const { data: oldOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (oldOrder && oldOrder.status === 'pending_payment') {
      updatePayload.payment_status = 'verified'
    }
  }

  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/orders')
  return { success: true }
}
