import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  'Food & Groceries',
  'Fashion & Apparel',
  'Electronics',
  'Home & Garden',
  'Beauty & Health',
  'Services',
  'Crafts & Art',
]

const initialForm = {
  businessName: '',
  category: CATEGORIES[0],
  contactName: '',
  phoneNumber: '',
  whatsappNumber: '',
  address: '',
  email: '',
  password: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // 1. Create the auth user.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !signUpData.user) {
      setSubmitting(false)
      setError(signUpError?.message || 'Could not create account.')
      return
    }

    const userId = signUpData.user.id

    // 2. Create the profile row (role defaults to 'vendor' per schema).
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'vendor',
    })

    // 3. Create the vendor business record. is_active defaults to FALSE -
    // an admin activates the account once the subscription is paid.
    const { error: vendorError } = await supabase.from('vendors').insert({
      id: userId,
      business_name: form.businessName,
      category: form.category,
      contact_name: form.contactName,
      phone_number: form.phoneNumber,
      whatsapp_number: form.whatsappNumber,
      address: form.address,
    })

    setSubmitting(false)

    if (profileError || vendorError) {
      setError((profileError || vendorError).message)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold" />
        <h1 className="mt-4 text-xl font-bold text-navy">Registration Received</h1>
        <p className="mt-2 text-sm text-navy/60">
          Account pending approval upon subscription payment. Our team will
          activate your listing shortly - you can sign in once approved.
        </p>
        <button onClick={() => navigate('/login')} className="btn-primary mt-6">
          Go to Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-navy">List Your Business</h1>
        <p className="mt-1 text-sm text-navy/50">
          Join SmartHub Marketplace and reach customers across Eswatini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Business Name</label>
          <input required className="input-field" value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Category</label>
          <select className="input-field" value={form.category}
            onChange={(e) => update('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Contact Person</label>
            <input required className="input-field" value={form.contactName}
              onChange={(e) => update('contactName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Address</label>
            <input required className="input-field" value={form.address}
              onChange={(e) => update('address', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Phone Number</label>
            <input required className="input-field" placeholder="+268..." value={form.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">WhatsApp Number</label>
            <input required className="input-field" placeholder="+268..." value={form.whatsappNumber}
              onChange={(e) => update('whatsappNumber', e.target.value)} />
          </div>
        </div>

        <hr className="border-navy/10" />

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Login Email</label>
          <input required type="email" className="input-field" value={form.email}
            onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Password</label>
          <input required type="password" minLength={6} className="input-field" value={form.password}
            onChange={(e) => update('password', e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="rounded-xl2 bg-gold/10 p-3 text-xs text-navy/70">
          Account pending approval upon subscription payment.
        </p>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting...' : 'Register Business'}
        </button>
      </form>
    </div>
  )
}
