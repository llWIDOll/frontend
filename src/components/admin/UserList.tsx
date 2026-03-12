'use client'

import { Mail, Shield, User, Store } from 'lucide-react'
import { useState } from 'react'

export default function UserList({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Sede</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.full_name || 'Sin nombre'}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'super_admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {user.role === 'super_admin' ? <Shield className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                    {user.role === 'super_admin' ? 'Admin' : 'Restaurante'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600 text-sm font-medium">
                    {user.restaurants?.name || '-'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="p-20 text-center">
            <p className="text-slate-400">No hay usuarios registrados</p>
        </div>
      )}
    </div>
  )
}
