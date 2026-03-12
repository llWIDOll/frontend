import { Inter } from 'next/font/google'
import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let restaurantId = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', user.id)
      .single()
    if (profile) restaurantId = profile.restaurant_id
  }

  return (
    <div className={`${inter.className} min-h-dvh bg-slate-50 flex`}>
      <Sidebar />
      <main className="flex-1 min-w-0 w-full transition-all duration-300 flex flex-col">
        {/* Contenido principal inyectado */}
        {children}
      </main>
    </div>
  )
}
