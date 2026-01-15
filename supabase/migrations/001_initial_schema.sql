-- Migration: 001_initial_schema
-- Created at: 2025-01-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    nominee TEXT,
    nid TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_account_number ON public.customers(account_number);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);

-- Customers policies
CREATE POLICY "Public customers are viewable by everyone" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Anyone can create customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customers" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete customers" ON public.customers FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
