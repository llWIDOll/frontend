'use client'

import { Clock, MapPin, MoreHorizontal, CheckCircle2, ChevronRight, Bike, ShoppingBag, Utensils, MessageCircleWarning } from 'lucide-react'
import { formatCurrency, formatLocalTime } from '@/utils/format'


const DELIVERY_ICONS: Record<string, any> = {
  domicilio: Bike,
  recogida: ShoppingBag,
  en_lugar: Utensils,
}

export default function OrderCard({ order, onClick }: { order: any; onClick: () => void }) {
  const Icon = DELIVERY_ICONS[order.delivery_type] || ShoppingBag
  
  // Format items summary
  const itemsText = order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || 'Sin productos'
  
  const isPendingReview = order.status === 'received' && order.payment_status === 'proof_received'

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all active:scale-[0.98] ${
        isPendingReview 
        ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-400 ring-offset-1 hover:bg-yellow-100' 
        : 'bg-white border-slate-200 hover:border-orange-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-900 truncate pr-2">
          {order.customer_name || 'Cliente Anónimo'}
        </h4>
        <div className="flex items-center gap-2 text-slate-400">
          {order.special_instructions && (
            <MessageCircleWarning className="w-4 h-4 text-orange-500 fill-orange-100" />
          )}
          {isPendingReview && (
            <span className="bg-yellow-400 text-yellow-950 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse shadow-sm">
              Verificar
            </span>
          )}
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <p className="text-slate-500 text-sm line-clamp-2 mb-3">
        {itemsText}
      </p>

      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <span className="text-orange-600 font-bold">
          ${formatCurrency(order.total)}
        </span>
        <span className="text-slate-400 text-[10px]">
          {formatLocalTime(order.created_at)}
        </span>
      </div>
    </div>
  )
}
