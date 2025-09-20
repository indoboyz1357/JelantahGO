-- Create Customers Table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  kecamatan TEXT,
  kota TEXT,
  bank_account TEXT
);

-- Create Users Table (references auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id)
);

-- Create Order Status Enum Type
CREATE TYPE public.order_status AS ENUM (
    'Pending',
    'Assigned',
    'InProgress',
    'Completed',
    'Verified',
    'Paid'
);

-- Create Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_kecamatan TEXT,
  customer_kota TEXT,
  estimated_liters INT,
  actual_liters INT,
  status public.order_status DEFAULT 'Pending',
  courier_id UUID REFERENCES public.users(id),
  pickup_photo_url TEXT,
  payment_proof_url TEXT
);

-- Enable RLS for all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Orders
CREATE POLICY "Allow all access to admin" ON public.orders FOR SELECT USING ((get_my_claim('role') ->> 0) = 'admin');
CREATE POLICY "Allow customer to see their own orders" ON public.orders FOR SELECT USING ((get_my_claim('role') ->> 0) = 'customer' AND customer_id = (SELECT customer_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Allow courier to see assigned orders" ON public.orders FOR SELECT USING ((get_my_claim('role') ->> 0) = 'kurir' AND courier_id = auth.uid());
CREATE POLICY "Allow customer to create their own orders" ON public.orders FOR INSERT WITH CHECK ((get_my_claim('role') ->> 0) = 'customer');
CREATE POLICY "Allow admin to create orders" ON public.orders FOR INSERT WITH CHECK ((get_my_claim('role') ->> 0) = 'admin');
CREATE POLICY "Allow courier to update assigned orders" ON public.orders FOR UPDATE USING ((get_my_claim('role') ->> 0) = 'kurir' AND courier_id = auth.uid());
CREATE POLICY "Allow admin to update orders" ON public.orders FOR UPDATE USING ((get_my_claim('role') ->> 0) = 'admin');

-- RLS Policies for Customers
CREATE POLICY "Allow admin to see all customers" ON public.customers FOR SELECT USING ((get_my_claim('role') ->> 0) = 'admin');
CREATE POLICY "Allow customer to see their own profile" ON public.customers FOR SELECT USING (id = (SELECT customer_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Allow admin to create customers" ON public.customers FOR INSERT WITH CHECK ((get_my_claim('role') ->> 0) = 'admin');
CREATE POLICY "Allow customer to update their own profile" ON public.customers FOR UPDATE USING (id = (SELECT customer_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for Users
CREATE POLICY "Allow admin to see all users" ON public.users FOR SELECT USING ((get_my_claim('role') ->> 0) = 'admin');
CREATE POLICY "Allow users to see their own data" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Allow admin to create users" ON public.users FOR INSERT WITH CHECK ((get_my_claim('role') ->> 0) = 'admin');