
-- Montañita Pulse - Database Schema v2
-- Execute this in your Supabase SQL Editor

-- 1. Enable PostGIS for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    sector_id TEXT NOT NULL, -- 'centro', 'la-punta', 'tigrillo', 'malecon'
    category_id TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    address TEXT,
    is_verified BOOLEAN DEFAULT false,
    image_url TEXT,
    owner_id UUID REFERENCES auth.users(id),
    contact_info JSONB DEFAULT '{}'::jsonb
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id TEXT,
    vibe_tags TEXT[] DEFAULT '{}',
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    rrule TEXT,
    interested_count INTEGER DEFAULT 0,
    sector_id TEXT -- Denormalized for easier filtering
);

-- 4. RLS Policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

-- Allow authenticated users to manage their own business
CREATE POLICY "Users manage own businesses" ON businesses 
    FOR ALL USING (auth.uid() = owner_id);

-- Allow business owners to manage their events
CREATE POLICY "Owners manage own events" ON events 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = events.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- 5. Helper Function for Geospatial Search
CREATE OR REPLACE FUNCTION get_events_near(user_lat DOUBLE PRECISION, user_lng DOUBLE PRECISION, radius_meters INTEGER)
RETURNS SETOF events AS $$
BEGIN
    RETURN QUERY
    SELECT e.*
    FROM events e
    JOIN businesses b ON e.business_id = b.id
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(b.location_lng, b.location_lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_meters
    );
END;
$$ LANGUAGE plpgsql;
