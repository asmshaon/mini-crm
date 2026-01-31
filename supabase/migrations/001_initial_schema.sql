-- Migration: 001_initial_schema
-- Description: Complete schema for CRM application
-- Created at: 2025-01-31

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    nominee TEXT,
    nid TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
    notes TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- crm_admins profile table (references Supabase Auth)
CREATE TABLE IF NOT EXISTS public.crm_admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_account_number ON public.customers(account_number);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers RLS policies (restrictive - users can only access their own data)
DROP POLICY IF EXISTS "Public customers are viewable by everyone" ON public.customers;
DROP POLICY IF EXISTS "Anyone can create customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can update customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can delete customers" ON public.customers;

CREATE POLICY "Users can view their own customers"
ON public.customers FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own customers"
ON public.customers FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers"
ON public.customers FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers"
ON public.customers FOR DELETE
USING (auth.uid() = created_by);

-- Enable RLS on crm_admins
ALTER TABLE public.crm_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.crm_admins FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.crm_admins FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.crm_admins FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STORAGE POLICIES (for customer-photos bucket)
-- ============================================================================
-- Manual setup required: Create bucket named "customer-photos" in Supabase Dashboard

CREATE POLICY IF NOT EXISTS "Public photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'customer-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can update photos"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'customer-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'customer-photos' AND
  auth.role() = 'authenticated'
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create crm_admins profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.crm_admins (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on crm_admins
DROP TRIGGER IF EXISTS update_crm_admins_updated_at ON public.crm_admins;
CREATE TRIGGER update_crm_admins_updated_at
  BEFORE UPDATE ON public.crm_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create crm_admins profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
