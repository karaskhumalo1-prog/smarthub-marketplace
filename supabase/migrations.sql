-- =========================================================
-- SmartHub Marketplace - Supabase SQL Migration
-- Run this once in the Supabase SQL Editor on a fresh project.
-- =========================================================

-- ---------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'vendor' check (role in ('admin', 'vendor', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null,
  category text not null,
  contact_name text,
  phone_number text,
  whatsapp_number text,
  address text,
  logo_url text,
  is_active boolean not null default false,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  title text not null,
  description text,
  price numeric(10, 2) not null default 0,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.flagged_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  reason text not null default 'Inappropriate content or pricing',
  created_at timestamptz not null default now()
);

-- Optional but recommended: explicit admin allow-list table, referenced by
-- policies below instead of a hardcoded email/UID list.
create table if not exists public.admin_users (
  id uuid primary key references public.profiles (id) on delete cascade
);

-- ---------------------------------------------------------
-- 2. INDEXES
-- ---------------------------------------------------------

create index if not exists idx_vendors_is_active on public.vendors (is_active);
create index if not exists idx_products_vendor_id on public.products (vendor_id);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_flagged_products_product_id on public.flagged_products (product_id);

-- ---------------------------------------------------------
-- 3. STORAGE BUCKET (product images)
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.flagged_products enable row level security;
alter table public.admin_users enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- ---- profiles ----
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own_role_locked"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---- vendors ----
-- Public/anon: can read vendor rows only to join against active products
-- (handled by the products policy + the app's `is_active=true` filter);
-- vendors themselves and admins get full read access.
create policy "vendors_select_public_active_or_owner_or_admin"
  on public.vendors for select
  using (is_active = true or auth.uid() = id or public.is_admin());

create policy "vendors_insert_own"
  on public.vendors for insert
  with check (auth.uid() = id);

-- Vendors can update their own row, EXCEPT is_active and
-- subscription_expires_at: those two columns are locked to admins only.
create policy "vendors_update_own_restricted"
  on public.vendors for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and is_active = (select is_active from public.vendors where id = auth.uid())
      and subscription_expires_at is not distinct from
          (select subscription_expires_at from public.vendors where id = auth.uid())
    )
  );

create policy "vendors_delete_admin_only"
  on public.vendors for delete
  using (public.is_admin());

-- ---- products ----
create policy "products_select_public_active_or_owner_or_admin"
  on public.products for select
  using (
    exists (
      select 1 from public.vendors v
      where v.id = products.vendor_id and v.is_active = true
    )
    or vendor_id = auth.uid()
    or public.is_admin()
  );

create policy "products_insert_own_vendor"
  on public.products for insert
  with check (vendor_id = auth.uid());

create policy "products_update_own_vendor_or_admin"
  on public.products for update
  using (vendor_id = auth.uid() or public.is_admin())
  with check (vendor_id = auth.uid() or public.is_admin());

create policy "products_delete_own_vendor_or_admin"
  on public.products for delete
  using (vendor_id = auth.uid() or public.is_admin());

-- ---- flagged_products ----
-- Anyone (including anonymous shoppers) can file a report; only admins can read/manage them.
create policy "flagged_products_insert_anyone"
  on public.flagged_products for insert
  with check (true);

create policy "flagged_products_select_admin_only"
  on public.flagged_products for select
  using (public.is_admin());

create policy "flagged_products_delete_admin_only"
  on public.flagged_products for delete
  using (public.is_admin());

-- ---- admin_users ----
create policy "admin_users_select_admin_only"
  on public.admin_users for select
  using (public.is_admin());

-- ---------------------------------------------------------
-- 5. STORAGE POLICIES (product-images bucket)
-- Vendors may only upload into a folder named after their own vendor_id,
-- e.g. product-images/<vendor_id>/photo.jpg
-- ---------------------------------------------------------

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_vendor_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_vendor_manage_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_vendor_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------
-- 6. MAKING SOMEONE AN ADMIN (run manually per admin account)
-- ---------------------------------------------------------
-- 1. Have the person sign up normally through /register or Supabase Auth.
-- 2. Then run, replacing the UUID with their auth.users.id:
--
--   update public.profiles set role = 'admin' where id = '<user-uuid>';
--   insert into public.admin_users (id) values ('<user-uuid>');
