'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/actions/auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/dashboard/orders', icon: ClipboardList },
  { name: 'Productos', href: '/dashboard/products', icon: Package },
  { name: 'Métricas', href: '/dashboard/metrics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Active check: exact for /dashboard, prefix for others
  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside 
      className={`sticky left-0 top-0 h-dvh bg-white border-r border-slate-100 transition-all duration-300 z-50 flex flex-col shadow-xl shadow-slate-100/50 flex-shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-50">
        {!isCollapsed && (
          <span className="font-black text-lg tracking-tighter text-slate-900">
            Bite<span className="text-orange-500">Bord</span>
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                active 
                ? 'bg-orange-50 text-orange-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon 
                size={20}
                className={`flex-shrink-0 transition-colors ${active ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
              />
              {!isCollapsed && (
                <span className="font-semibold text-sm flex-1">{item.name}</span>
              )}
              {active && !isCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
              {active && isCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-l-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-50 space-y-1">
        <Link
          href="/dashboard/settings"
          title={isCollapsed ? 'Configuración' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group"
        >
          <Settings size={20} className="flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
          {!isCollapsed && <span className="font-semibold text-sm">Configuración</span>}
        </Link>

        <form action={logout}>
          <button
            type="submit"
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut size={20} className="flex-shrink-0 text-slate-400 group-hover:text-red-500" />
            {!isCollapsed && <span className="font-semibold text-sm">Cerrar Sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
