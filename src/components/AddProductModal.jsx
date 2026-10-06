import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { X, UploadCloud } from 'lucide-react'
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

export default function AddProductModal({ vendorId, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const raw = e.target.files?.[0]
    if (!raw) return

    // Compress to max 1024px / ~300KB before it ever touches Supabase Storage.
    const compressed = await imageCompression(raw, {
      maxWidthOrHeight: 1024,
      maxSizeMB: 0.3,
      useWebWorker: true,
    })

    setFile(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      let imageUrl = null

      if (file) {
        // Vendors can only write inside their own vendor_id/ folder (storage policy).
        const filePath = `${vendorId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { upsert: false })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        imageUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('products').insert({
        vendor_id: vendorId,
        title,
        description,
        price: Number(price),
        category,
        image_url: imageUrl,
      })

      if (insertError) throw insertError

      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-white p-6 sm:rounded-xl2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Add Product</h2>
          <button onClick={onClose} className="text-navy/40 hover:text-navy">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Product Photo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl2 border border-dashed border-navy/20 py-6 text-navy/50 hover:border-gold">
              {preview ? (
                <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              ) : (
                <>
                  <UploadCloud className="h-6 w-6" />
                  <span className="mt-1 text-xs">Tap to upload (auto-compressed)</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Title</label>
            <input required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Description</label>
            <textarea className="input-field" rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Price (E)</label>
              <input required type="number" min="0" step="0.01" className="input-field" value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
