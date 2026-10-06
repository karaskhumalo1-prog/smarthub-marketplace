import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, CheckCircle2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'
import AddProductModal from '../components/AddProductModal.jsx'

export default function VendorDashboard() {
  const { user, vendor, refreshProfile } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  async function loadProducts() {
    setLoading(true)
    // RLS: vendors can only ever see/write rows where vendor_id = auth.uid().
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user) loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleDelete(productId) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', productId)
    loadProducts()
  }

  const isActive = vendor?.is_active
  const expiresAt = vendor?.subscription_expires_at
    ? new Date(vendor.subscription_expires_at).toLocaleDateString()
    : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Vendor Dashboard</h1>
          <p className="text-sm text-navy/50">{vendor?.business_name}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Subscription status banner */}
      <div
        className={
          isActive
            ? 'mb-6 flex items-center gap-2 rounded-xl2 bg-emerald-50 p-4 text-sm text-emerald-800'
            : 'mb-6 flex items-center gap-2 rounded-xl2 bg-red-50 p-4 text-sm text-red-800'
        }
      >
        {isActive ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
        {isActive
          ? `Subscription active${expiresAt ? ` until ${expiresAt}` : ''}. Your listings are visible on SmartHub.`
          : 'Your account is inactive. Contact SmartHub support to activate your subscription - your products are hidden from the public storefront until then.'}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-xs uppercase text-navy/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-navy/40">Loading...</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-navy/40">No products yet - add your first one.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-navy/5">
                <td className="flex items-center gap-3 px-4 py-3">
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  )}
                  <span className="font-medium text-navy">{p.title}</span>
                </td>
                <td className="px-4 py-3 text-navy/60">{p.category}</td>
                <td className="px-4 py-3 font-semibold text-navy">E{Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="text-navy/40 hover:text-navy" title="Edit (coming soon)">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-navy/40 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddProductModal
          vendorId={user.id}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            loadProducts()
            refreshProfile()
          }}
        />
      )}
    </div>
  )
}
