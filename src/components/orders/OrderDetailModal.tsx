'use client'

import { useState } from 'react'
import { X, Phone, MapPin, Clock, Table, CreditCard, ChevronRight, Ban } from 'lucide-react'
import { updateOrderStatus } from '@/actions/orders'
import { formatCurrency } from '@/utils/format'

const STATUS_FLOW: Record<string, string> = {
  received: 'confirmed',
  pending_payment: 'confirmed',
  confirmed: 'preparing',
  preparing: 'delivered',
}

const STATUS_LABELS: Record<string, string> = {
  received: 'Recibido',
  confirmed: 'Confirmado',
  preparing: 'En Preparación',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const nextStatus = STATUS_FLOW[order.status]

  async function handleStatusChange(status: string) {
    setLoading(true)
    await updateOrderStatus(order.id, status)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Detalle del Pedido</h2>
            <p className="text-slate-500 text-xs">ID: {order.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70dvh] overflow-y-auto custom-scrollbar">
          {/* Cliente */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente</h4>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <p className="font-bold text-slate-900 text-lg">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${order.customer_phone}`} className="text-blue-600 underline">
                  {order.customer_phone}
                </a>
              </div>
            </div>
          </section>

          {/* Entrega */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entrega</h4>
            <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <div className="bg-orange-500 text-white p-2 rounded-xl">
                {order.delivery_type === 'domicilio' && <MapPin className="w-5 h-5" />}
                {order.delivery_type === 'recogida' && <Clock className="w-5 h-5" />}
                {order.delivery_type === 'en_lugar' && <Table className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-orange-950 capitalize">{order.delivery_type.replace('_', ' ')}</p>
                <p className="text-orange-700 text-sm">
                  {order.delivery_address || order.pickup_time || `Mesa ${order.table_number}`}
                </p>
              </div>
            </div>
          </section>

          {/* Instrucciones Especiales */}
          {order.special_instructions && (
            <section className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instrucciones Especiales</h4>
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 text-yellow-900 text-sm">
                <p>{order.special_instructions}</p>
              </div>
            </section>
          )}

          {/* Productos */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Productos</h4>
            <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl overflow-hidden">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">{item.quantity}</span>
                    <span className="text-slate-800 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-500 font-medium">${formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="p-4 bg-slate-50 flex justify-between items-center font-bold text-slate-900 border-t border-slate-200">
                <span>Total</span>
                <span className="text-lg">${formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Pago */}
          {(order.payment_method || order.payment_proof_url) && (
            <section className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pago</h4>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col gap-3">
                {order.payment_method && (
                  <div className="flex items-center gap-3 text-blue-900">
                    <CreditCard className="w-5 h-5 opacity-70" />
                    <span className="font-medium text-sm">Método de pago: <strong className="capitalize">{order.payment_method.replace('_', ' ')}</strong></span>
                  </div>
                )}
                {order.payment_proof_url && (
                  <Link 
                    href={order.payment_proof_url} 
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-blue-700 bg-white p-3 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-bold text-sm">Ver comprobante adjunto</span>
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={loading || order.status === 'cancelled' || order.status === 'delivered'}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold py-4 rounded-2xl transition-all disabled:opacity-30"
          >
            <Ban className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70"
            >
              <span>Avanzar a {STATUS_LABELS[nextStatus]}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Sub-component Link handling
import Link from 'next/link'
