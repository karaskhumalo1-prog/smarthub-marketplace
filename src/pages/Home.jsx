import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CategoryFilter from '../components/CategoryFilter.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setLoading(true)
      // RLS restricts this to active products belonging to active vendors -
      // this query works for anonymous, unauthenticated visitors.
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors!inner(business_name, address, phone_number, whatsapp_number, is_active)')
        .eq('vendors.is_active', true)
        .order('created_at', { ascending: false })

      if (isMounted) {
        if (!error) setProducts(data || [])
        setLoading(false)
      }
    }

    loadProducts()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.vendors?.business_name?.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  return (
    <div>
      {/* Hero banner */}
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Your Local Businesses.
            <span className="block text-gold">One Marketplace.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Discover. Shop. Support Local. Browse products from vendors across
            Eswatini and connect directly on WhatsApp or by phone.
          </p>

          <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-xl2 bg-white p-1.5 shadow-lg">
            <Search className="ml-2 h-5 w-5 shrink-0 text-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search products or businesses..."
              className="w-full bg-transparent px-1 py-2 text-sm text-navy outline-none placeholder:text-navy/40"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <CategoryFilter active={category} onChange={setCategory} />
        <div className="mt-6">
          <ProductGrid products={filtered} loading={loading} />
        </div>
      </section>
    </div>
  )
}
