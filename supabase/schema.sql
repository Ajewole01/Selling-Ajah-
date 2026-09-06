-- Selling Ajah Production Supabase PostgreSQL Schema
-- Idempotent schema definition with table constraints, indexes, and Row Level Security (RLS)

-- 1. PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  ref_number TEXT,
  short_description TEXT,
  full_description TEXT,
  property_type TEXT,
  listing_type TEXT DEFAULT 'sale',
  price NUMERIC NOT NULL,
  previous_price NUMERIC,
  price_period TEXT,
  location TEXT,
  area TEXT,
  address TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  toilets INTEGER DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  property_size TEXT,
  land_size TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  google_maps_url TEXT,
  video_url TEXT,
  main_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available',
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- 2. APARTMENTS / SHORTLETS
CREATE TABLE IF NOT EXISTS apartments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  area TEXT,
  address TEXT,
  price_per_night NUMERIC NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  max_guests INTEGER DEFAULT 1,
  amenities JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  check_in_time TEXT,
  check_out_time TEXT,
  is_available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available',
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  main_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apartments_slug ON apartments(slug);
CREATE INDEX IF NOT EXISTS idx_apartments_featured ON apartments(is_featured);
CREATE INDEX IF NOT EXISTS idx_apartments_area ON apartments(area);

-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  category TEXT,
  daily_rate NUMERIC NOT NULL,
  hourly_rate NUMERIC,
  transmission TEXT,
  seats INTEGER DEFAULT 4,
  fuel_type TEXT,
  color TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  main_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  short_description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON vehicles(is_featured);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);

-- 4. ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  service TEXT,
  property_id TEXT,
  property_title TEXT,
  listing_type TEXT,
  listing_id TEXT,
  listing_title TEXT,
  budget TEXT,
  preferred_location TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_date ON enquiries(date DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

-- 5. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  avatar TEXT,
  rating NUMERIC DEFAULT 5,
  text TEXT NOT NULL,
  service_or_property TEXT,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  category TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- 7. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  office_address TEXT,
  business_hours TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  default_seo_title TEXT,
  default_seo_description TEXT,
  hero_headline TEXT,
  hero_subheadline TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= ROW LEVEL SECURITY (RLS) =================
-- Selling Ajah accesses Supabase through secure server-side API routes.
-- The browser should not access these database tables directly.
-- The server-side Supabase service role key performs the required database
-- operations while Row Level Security remains enabled.

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Remove any public policies that may have been created previously.
-- DROP POLICY IF EXISTS also makes this section safe to run again.

DROP POLICY IF EXISTS "Allow public read on properties" ON properties;
DROP POLICY IF EXISTS "Allow public read on apartments" ON apartments;
DROP POLICY IF EXISTS "Allow public read on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow public read on testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow public read on faqs" ON faqs;
DROP POLICY IF EXISTS "Allow public read on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public insert on enquiries" ON enquiries;

-- No public anon/authenticated database policies are intentionally created.
--
-- Public visitors access listings through the Selling Ajah server API:
--
-- /api/properties
-- /api/apartments
-- /api/vehicles
--
-- Customer enquiries are also submitted through the Selling Ajah API.
--
-- Administrative CREATE / UPDATE / DELETE operations are performed through
-- protected server-side API routes using the server-only Supabase service role.
--
-- admin_users is intentionally not publicly readable.