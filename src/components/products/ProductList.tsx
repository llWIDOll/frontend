'use client'

import { useState, useMemo } from 'react'
import { Eye, EyeOff, Trash2, Package, ChevronRight, Search, ArrowUpAZ, ArrowDownAZ, ArrowUp01, ArrowDown01, X } from 'lucide-react'
import { toggleProductAvailability, deleteProduct } from '@/actions/products'
import { formatCurrency } from '@/utils/format'
import Link from 'next/link'
import Image from 'next/image'

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'name_asc', label: 'A → Z', icon: ArrowUpAZ },
  { value: 'name_desc', label: 'Z → A', icon: ArrowDownAZ },
  { value: 'price_asc', label: 'Precio ↑', icon: ArrowUp01 },
  { value: 'price_desc', label: 'Precio ↓', icon: ArrowDown01 },
]

export default function ProductList({ initialProducts, userRole }: { initialProducts: any[], userRole: string }) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name_asc')

  // Derived: filtered + sorted products
  const displayProducts = useMemo(() => {
    let list = [...products]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'name_asc': return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'price_asc': return Number(a.price) - Number(b.price)
        case 'price_desc': return Number(b.price) - Number(a.price)
      }
    })

    return list
  }, [products, search, sort])

  async function handleToggle(e: React.MouseEvent, productId: string, currentStatus: boolean) {
    e.preventDefault()
    e.stopPropagation()
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, available: !currentStatus } : p))
    const result = await toggleProductAvailability(productId, !currentStatus)
    if (result?.error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, available: currentStatus } : p))
    }
  }

  async function handleDelete(e: React.MouseEvent, productId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return
    const result = await deleteProduct(productId)
    if (!result.error) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  return (
    <div className="space-y-5">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, descripción o categoría..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 flex-shrink-0">
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon
            const isActive = sort === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-xs text-slate-400">
          {displayProducts.length} resultado{displayProducts.length !== 1 ? 's' : ''} para &quot;{search}&quot;
        </p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((product) => (
          <Link
            key={product.id}
            href={`/dashboard/products/edit/${product.id}`}
            className={`group bg-white rounded-3xl shadow-sm border transition-all hover:shadow-md hover:-translate-y-0.5 ${
              product.available ? 'border-slate-100' : 'border-red-100 bg-red-50/10'
            }`}
          >
            {/* Image */}
            <div className="relative w-full aspect-video rounded-t-3xl overflow-hidden bg-slate-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform group-hover:scale-105 ${!product.available ? 'grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <Package className="w-12 h-12" />
                </div>
              )}
              {!product.available && (
                <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">AGOTADO</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1 group-hover:text-orange-400 transition-colors" />
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-orange-600 font-bold">${formatCurrency(product.price)}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggle(e, product.id, product.available)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      product.available
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {product.available ? <><Eye className="w-3.5 h-3.5" /> Disponible</> : <><EyeOff className="w-3.5 h-3.5" /> Agotado</>}
                  </button>

                  {userRole === 'super_admin' && (
                    <button
                      onClick={(e) => handleDelete(e, product.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {displayProducts.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              {search ? 'Sin resultados' : 'No hay productos'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {search ? `No se encontraron productos para "${search}"` : 'Empieza agregando tu primer plato o bebida'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
