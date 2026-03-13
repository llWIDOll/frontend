'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import OrderCard from './OrderCard'
import OrderDetailModal from './OrderDetailModal'

const STATUS_COLUMNS = [
  { id: 'received', label: 'Recibido', color: 'bg-yellow-500' },
  { id: 'confirmed', label: 'Confirmado', color: 'bg-blue-500' },
  { id: 'preparing', label: 'En Preparación', color: 'bg-orange-500' },
  { id: 'delivered', label: 'Entregado', color: 'bg-green-500' },
  { id: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
]

export default function OrderKanban({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const supabase = createClient()

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/sounds/notification.mp3')
    audio.play().catch(e => console.log('Audio play failed:', e))
  }, [])

  // Fetch initial active and today's orders
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const now = new Date()
      const localStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const todayStart = localStartOfDay.toISOString()

      // Fetch all orders that are either created today OR are still active (not cancelled/delivered) from previous days
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .or(`created_at.gte.${todayStart},status.in.(received,pending_payment,confirmed,preparing)`)
        .order('created_at', { ascending: true })

      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [restaurantId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.restaurant_id === restaurantId) {
              const newOrder = { ...payload.new, status: payload.new.status || 'received' }
              setOrders(prev => [...prev, newOrder])
              playNotificationSound()
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => {
              const oldOrder = prev.find(o => o.id === payload.new.id)
              if (!oldOrder) return prev // Si no lo teníamos en memoria, ignorarlo

              // Alert for proof of payment received (only if it transitioned to proof_received)
              if (
                payload.new.payment_status === 'proof_received' && 
                oldOrder.payment_status !== 'proof_received'
              ) {
                setTimeout(() => {
                  playNotificationSound()
                }, 0)
              }
              // Merge para evitar perder datos si el UPDATE viene parcial (Replica Identity default)
              return prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
            })
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, restaurantId, playNotificationSound])

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {loading ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 border-t-2"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Cargando pedidos...</p>
          </div>
        ) : (
          STATUS_COLUMNS.map((column) => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-72 md:w-80 flex flex-col bg-slate-100/50 rounded-2xl p-3"
          >
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className={`${column.color} w-3 h-3 rounded-full`}></div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
                {column.label}
              </h3>
              <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.filter(o => {
                  if (column.id === 'received') return o.status === 'received' || o.status === 'pending_payment'
                  return o.status === column.id
                }).length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {orders
                .filter((order) => {
                  if (column.id === 'received') return order.status === 'received' || order.status === 'pending_payment'
                  return order.status === column.id
                })
                .map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onClick={() => setSelectedOrder(order)} 
                  />
                ))}
            </div>
          </div>
        )))}
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  )
}
