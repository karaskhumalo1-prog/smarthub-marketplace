import { useState } from 'react'
import { MessageCircle, Phone, MapPin, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'

function buildWhatsAppLink(whatsappNumber, businessName, productTitle) {
  const cleanNumber = (whatsappNumber || '').replace(/[^\d]/g, '')
  const message = `Hi ${businessName}, I saw your ${productTitle} on SmartHub Marketplace and want to buy it`
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}

export default function ProductCard({ product }) {
  const [reported, setReported] = useState(false)
  const [reporting, setReporting] = useState(false)
  const vendor = product.vendors // joined vendor row

  async function handleReport() {
    if (reporting || reported) return
    setReporting(true)
    const { error } = await supabase.from('flagged_products').insert({
      product_id: product.id,
      reason: 'Inappropriate content or pricing',
    })
    setReporting(false)
    if (!error) setReported(true)
  }

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="aspect-square w-full bg-navy/5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-navy/30 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-navy">{product.title}</h3>
          <span className="whitespace-nowrap rounded-full bg-gold/15 px-2 py-0.5 text-sm font-bold text-navy">
            E{Number(product.price).toFixed(2)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-navy/60">{product.description}</p>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-navy/50">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {vendor?.business_name} - {vendor?.address}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={buildWhatsAppLink(vendor?.whatsapp_number, vendor?.business_name, product.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={`tel:${vendor?.phone_number}`} className="btn-navy">
            <Phone className="h-4 w-4" />
            Call
          </a>
        </div>

        <button
          onClick={handleReport}
          disabled={reporting || reported}
          className="mt-1 inline-flex items-center gap-1 self-start text-xs text-navy/40 hover:text-red-600 disabled:hover:text-navy/40"
        >
          <Flag className="h-3.5 w-3.5" />
          {reported ? 'Reported - thank you' : 'Report Listing'}
        </button>
      </div>
    </div>
  )
}
