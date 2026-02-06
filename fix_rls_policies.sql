
-- Run this in your Supabase SQL Editor to fix RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users manage own businesses" ON businesses;
DROP POLICY IF EXISTS "Owners manage own events" ON events;

-- Create new INSERT policies for authenticated users
CREATE POLICY "Authenticated users can insert businesses" ON businesses 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own businesses" ON businesses 
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can delete own businesses" ON businesses 
    FOR DELETE USING (auth.uid() = owner_id);

-- Events policies
CREATE POLICY "Authenticated users can insert events" ON events 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM businesses WHERE businesses.id = events.business_id AND businesses.owner_id = auth.uid())
    );

CREATE POLICY "Authenticated users can update own events" ON events 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM businesses WHERE businesses.id = events.business_id AND businesses.owner_id = auth.uid())
    );

CREATE POLICY "Authenticated users can delete own events" ON events 
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM businesses WHERE businesses.id = events.business_id AND businesses.owner_id = auth.uid())
    );
