
import { Mail, Phone, MapPin, Share2} from 'lucide-react'
import { getSiteUrl } from '../lib/supabase'

export default function QRFooter() {

  return (
    <footer className="border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold">SmartHub Marketplace</p>
          <p className="mt-1 text-sm text-white/60">
            Your Local Businesses. One Marketplace.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium w-fit">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            Proudly Eswatini
          </div>
        </div>

        <div className="text-sm text-white/70">
          <p className="mb-2 font-semibold text-white">Contact Us</p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold" /> smarthubmarketplace1@gmail.com
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold" /> +268 76794204
          </p>
           <p className="mt-1.5 flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold" /> +268 79419058
          </p>
        </div>
        
<div className="flex flex-row items-center gap-3 sm:justify-end whitespace-nowrap">
  <a
    href="https://www.facebook.com/profile.php?id=61595216067144"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
  >
    <Share2 className="h-4 w-4 text-gold" />
    Follow us on Facebook
  </a>
</div>


      </div>

      <div className="border-t border-white/10 py-3 text-center text-xs text-white/40">
        (c) {new Date().getFullYear()} SmartHub Marketplace. All rights reserved.
      </div>
    </footer>
  )
}
