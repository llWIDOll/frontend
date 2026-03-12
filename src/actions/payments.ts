'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyPayment(orderId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ 
        payment_status: 'verified',
        updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    console.error('Error verifying payment:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard/orders')
  return { success: true }
}
