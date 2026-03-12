import { redirect } from 'next/navigation'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/products/edit/${params.id}`)
}
