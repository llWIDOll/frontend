'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { formatCurrency } from '@/utils/format'

export default function SalesChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.06} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          hide 
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            fontWeight: 'bold',
            backgroundColor: 'currentColor',
            color: 'var(--color-slate-50)'
          }}
          itemStyle={{ color: 'var(--color-orange-500)' }}
          formatter={(value: any) => [`$${formatCurrency(value)}`, 'Ventas']}
        />
        <Area 
          type="monotone" 
          dataKey="sales" 
          stroke="#f97316" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSales)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
