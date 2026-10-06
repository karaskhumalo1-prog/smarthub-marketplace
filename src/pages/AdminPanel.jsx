import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldOff, CalendarPlus, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const [vendors, setVendors] = useState([])
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('vendors') // 'vendors' | 'flags'

  async function loadData() {
    setLoading(true)
    const [{ data: vendorData }, { data: flagData }] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at', { ascending: false }),
      supabase
        .from('flagged_products')
        .select('*, products(title, vendor_id, vendors(business_name))')
        .order('created_at', { ascending: false }),
    ])
    setVendors(vendorData || [])
    setFlags(flagData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function toggleActive(vendorId, current) {
    await supabase.from('vendors').update({ is_active: !current }).eq('id', vendorId)
    loadData()
  }

  async function extendSubscription(vendorId, currentExpiry, days) {
    const base = currentExpiry && new Date(currentExpiry) > new Date() ? new Date(currentExpiry) : new Date()
    base.setDate(base.getDate() + days)
    await supabase
      .from('vendors')
      .update({ subscription_expires_at: base.toISOString() })
      .eq('id', vendorId)
    loadData()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-navy">Admin Panel</h1>
      <p className="mb-6 text-sm text-navy/50">
        Business directory, subscription management, and content moderation.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('vendors')}
          className={tab === 'vendors' ? 'btn-navy' : 'btn-outline'}
        >
          Business Directory
        </button>
        <button
          onClick={() => setTab('flags')}
          className={tab === 'flags' ? 'btn-navy' : 'btn-outline'}
        >
          <Flag className="h-4 w-4" />
          Flagged Listings ({flags.length})
        </button>
      </div>

      {loading && <p className="text-sm text-navy/40">Loading...</p>}

      {!loading && tab === 'vendors' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-xs uppercase text-navy/50">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-navy/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{v.business_name}</p>
                    <p className="text-xs text-navy/40">{v.contact_name} - {v.phone_number}</p>
                  </td>
                  <td className="px-4 py-3 text-navy/60">{v.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        v.is_active
                          ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                          : 'rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'
                      }
                    >
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/60">
                    {v.subscription_expires_at
                      ? new Date(v.subscription_expires_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => toggleActive(v.id, v.is_active)}
                        className={v.is_active ? 'btn-outline' : 'btn-primary'}
                      >
                        {v.is_active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        {v.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => extendSubscription(v.id, v.subscription_expires_at, 7)}
                        className="btn-outline"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        +7d
                      </button>
                      <button
                        onClick={() => extendSubscription(v.id, v.subscription_expires_at, 30)}
                        className="btn-outline"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        +30d
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'flags' && (
        <div className="card divide-y divide-navy/5">
          {flags.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-navy/40">No flagged listings.</p>
          )}
          {flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-navy">{f.products?.title}</p>
                <p className="text-xs text-navy/40">
                  {f.products?.vendors?.business_name} - {f.reason}
                </p>
              </div>
              <span className="text-xs text-navy/40">
                {new Date(f.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
