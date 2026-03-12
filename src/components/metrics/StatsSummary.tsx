'use client'

import { DollarSign, ShoppingBag, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default function StatsSummary({ totalRevenue, orderCount, avgTicket }: { totalRevenue: number; orderCount: number; avgTicket: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="bg-green-50 p-4 rounded-2xl text-green-600">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ingresos Totales</p>
          <p className="text-2xl font-black text-slate-900">${formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
          <p className="text-2xl font-black text-slate-900">{orderCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ticket Promedio</p>
          <p className="text-2xl font-black text-slate-900">${formatCurrency(avgTicket)}</p>
        </div>
      </div>
    </div>
  )
}
