'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, parseCurrency } from '@/utils/format'


export default function ProductForm({ product, restaurantId, userRole }: { product?: any; restaurantId: string; userRole?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || null)
  const [displayPrice, setDisplayPrice] = useState(product?.price ? formatCurrency(product.price) : '')
  const supabase = createClient()

  const isEditing = !!product

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value
    const numberValue = parseCurrency(rawValue)
    if (numberValue === 0 && rawValue.trim() === '') {
      setDisplayPrice('')
    } else {
      setDisplayPrice(formatCurrency(numberValue))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = Number(formData.get('price'))

    // Confirmation for price change
    if (isEditing && price !== Number(product.price)) {
      if (!confirm(`¿Confirmas el cambio de precio de $${product.price} a $${price}?`)) {
        setLoading(false)
        return
      }
    }

    try {
      let image_url = product?.image_url || null

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${restaurantId}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile)

        if (uploadError) throw new Error('Error al subir imagen: ' + uploadError.message)
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)
        
        image_url = publicUrl
      }

      const productData = {
        name,
        description,
        category,
        price,
        image_url,
        restaurant_id: restaurantId,
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData])
        
        if (insertError) throw insertError
      }

      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Imagen del Producto</h4>
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group cursor-pointer">
              {imagePreview ? (
                <>
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Subir foto (horizontal recomendada)</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
            <input
              name="name"
              defaultValue={product?.name}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 placeholder:text-slate-400"
              placeholder="Ej: Hamburguesa Especial"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
            <textarea
              name="description"
              defaultValue={product?.description}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-slate-900 placeholder:text-slate-400"
              placeholder="Describe los ingredientes, tamaño, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
              <select
                name="category"
                defaultValue={product?.category}
                disabled={isEditing && userRole !== 'super_admin'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="Entradas">Entradas</option>
                <option value="Platos Fuertes">Platos Fuertes</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Postres">Postres</option>
              </select>
              {isEditing && userRole !== 'super_admin' && (
                <p className="text-[10px] text-slate-400 mt-1">Solo administradores pueden cambiar la categoría</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Precio ($)</label>
              <input
                type="text"
                inputMode="numeric"
                value={displayPrice}
                onChange={handlePriceChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-900 placeholder:text-slate-400"
                placeholder="5.000"
              />
              <input type="hidden" name="price" value={displayPrice ? parseCurrency(displayPrice) : ''} />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
             <>
               <Save className="w-5 h-5" />
               <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
             </>
          )}
        </button>
      </form>
    </div>
  )
}
