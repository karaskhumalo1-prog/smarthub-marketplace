# SmartHub Marketplace

**Your Local Businesses. One Marketplace.**

A low-cost, lightweight directory & vendor marketplace for local businesses in
Eswatini, built with React (Vite), Tailwind CSS, and Supabase.

---

## 1. Local Setup

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see step 2)
npm run dev
```

## 2. Supabase Setup

1. Create a free project at https://supabase.com.
2. Go to **SQL Editor** and run the entire contents of `supabase/migrations.sql`.
   This creates every table, index, the `product-images` storage bucket, and
   all Row-Level Security policies described below.
3. Go to **Project Settings -> API** and copy:
   - `Project URL` -> `VITE_SUPABASE_URL`
   - `anon public` key -> `VITE_SUPABASE_ANON_KEY`

   Never copy the `service_role` key into this project — it is never used
   in frontend code.
4. Go to **Authentication -> Providers** and make sure Email sign-up is
   enabled. For a first pass, you can disable "Confirm email" under
   **Authentication -> Settings** so vendors can log in immediately after
   registering (re-enable it before a public launch).
5. Create your first admin account:
   - Register a normal account through the app's `/register` flow (or
     directly through Supabase Auth).
   - In the SQL Editor, run:
     ```sql
     update public.profiles set role = 'admin' where id = '<their-user-uuid>';
     insert into public.admin_users (id) values ('<their-user-uuid>');
     ```
   - They can now sign in and will be routed to `/admin`.

### How the security model works

- **Public/anon visitors** can only `SELECT` products belonging to vendors
  where `is_active = true`.
- **Vendors** can `INSERT`/`UPDATE`/`DELETE` only rows where
  `vendor_id = auth.uid()`, and are explicitly blocked from changing their
  own `is_active` or `subscription_expires_at` — only an admin can flip
  those.
- **Admins** (rows in `admin_users`) get full access via the `is_admin()`
  policy helper function.
- Product photos live in the `product-images` storage bucket; vendors may
  only write inside their own `vendor_id/` folder, enforced by storage
  policies, not just app logic.

## 3. Deploying to Netlify

1. Push this project to a GitHub/GitLab repository.
2. In Netlify: **Add new site -> Import an existing project**, and connect
   the repository.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Under **Site settings -> Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (optional — e.g. `https://smarthub-eswatini.netlify.app`;
     if you skip this, the QR code footer automatically falls back to
     `window.location.origin`)
5. Deploy. Netlify will give you a free `https://<your-site>.netlify.app`
   subdomain.
6. The `public/_redirects` file (already included, containing
   `/* /index.html 200`) prevents 404s when someone reloads a sub-route
   like `/vendor/dashboard` directly — no extra Netlify config needed.
7. Once live, open the site, scroll to the footer, and confirm the "Scan to
   Shop" QR code points at your live URL.

## 4. Project Structure

```
src/
  components/     Navbar, ProductCard, ProductGrid, CategoryFilter,
                   QRFooter, AddProductModal, ProtectedRoute, RoleRedirect
  pages/          Home, Login, Register, VendorDashboard, AdminPanel
  context/        AuthContext.jsx (session, profile/role, sign-out)
  lib/            supabase.js (client + site URL helper)
supabase/
  migrations.sql  Full schema, indexes, storage bucket, RLS policies
public/
  _redirects      Netlify SPA routing fix
  favicon.svg     Brand mark (no emojis, per branding spec)
```

## 5. Brand Reference

| Token | Value |
|---|---|
| Primary Accent (Gold) | `#F5B800` (bright `#FFC800` also available as `gold-bright`) |
| Secondary Accent (Navy) | `#0B1B3D` (deep `#0B132B` available as `navy-deep`) |
| Icons | `lucide-react` only — no emoji anywhere in the UI |

## 6. Roadmap / Not Yet Implemented

- Product edit flow (delete and add are wired up; edit button is a stub).
- Email confirmation flow for vendor sign-up.
- Payment integration for subscriptions (admin currently activates manually).
