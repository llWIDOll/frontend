'use client'

import { useState } from 'react'
import { CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react'
import { verifyPayment } from '@/actions/payments'
import { formatCurrency } from '@/utils/format'
import Image from 'next/image'

export default function PaymentList({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)

  async function handleVerify(orderId: string) {
    if (!confirm('¿Confirmas que has recibido este pago correctamente?')) return
    
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'verified' } : o))
    
    const result = await verifyPayment(orderId)
    if (result.error) {
      alert('Error al verificar: ' + result.error)
      // Revert if needed
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'pending' } : o))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
        >
          {/* Proof Preview */}
          <div className="relative aspect-[4/5] bg-slate-100 group">
             {order.payment_proof_url ? (
               <>
                 <Image 
                   src={order.payment_proof_url} 
                   alt="Comprobante" 
                   fill 
                   className="object-cover"
                 />
                 <a 
                   href={order.payment_proof_url} 
                   target="_blank" 
                   className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                 >
                   <ExternalLink className="w-8 h-8 text-white" />
                 </a>
               </>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                 <AlertCircle className="w-12 h-12 mb-2" />
                 <p className="text-xs font-medium">Sin comprobante visible</p>
               </div>
             )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">
             <div className="flex justify-between items-start">
               <div>
                 <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{order.customer_name}</h4>
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Orden #{order.id.slice(0, 6)}</p>
               </div>
               <div className="text-right">
                 <p className="font-bold text-slate-900">${formatCurrency(order.total)}</p>
                 <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                   order.payment_status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                 }`}>
                   {order.payment_status === 'verified' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                   {order.payment_status === 'verified' ? 'Verificado' : 'Pendiente'}
                 </span>
               </div>
             </div>

             <button
               onClick={() => handleVerify(order.id)}
               disabled={order.payment_status === 'verified'}
               className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
             >
               {order.payment_status === 'verified' ? 'Pago Confirmado' : 'Confirmar Recepción'}
             </button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <div className="col-span-full bg-white p-20 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hay pagos pendientes</h3>
            <p className="text-slate-500 text-sm mt-1">Los comprobantes que suban tus clientes aparecerán aquí</p>
        </div>
      )}
    </div>
  )
}
