'use client'

import { MapPin, Phone, ExternalLink } from 'lucide-react'

export default function RestaurantList({ initialRestaurants }: { initialRestaurants: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialRestaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-900">{restaurant.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                restaurant.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {restaurant.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="space-y-2 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address || 'Sin dirección'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone || 'Sin teléfono'}</span>
                </div>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
             <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-xs transition-all">
                Configuración
             </button>
             <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all">
                <ExternalLink className="w-4 h-4" />
             </button>
          </div>
        </div>
      ))}

      {initialRestaurants.length === 0 && (
         <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed text-center">
            <p className="text-slate-400">No hay restaurantes registrados aún</p>
         </div>
      )}
    </div>
  )
}
