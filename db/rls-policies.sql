-- ============================================================
-- Heali — Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── Enable RLS on all tables ───
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: Check if user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- USERS
-- ============================================================
-- Users can read their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own row
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Service role can insert (registration)
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (true);

-- Admin can read all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (is_admin());

-- Admin can update all users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PATIENT PROFILES
-- ============================================================
-- Patient can read/update own profile
CREATE POLICY "patient_profiles_select_own" ON patient_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "patient_profiles_update_own" ON patient_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "patient_profiles_insert_own" ON patient_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can read all
CREATE POLICY "patient_profiles_select_admin" ON patient_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "patient_profiles_update_admin" ON patient_profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PRACTITIONER PROFILES
-- ============================================================
-- Public: anyone can read approved, visible practitioners
CREATE POLICY "practitioner_profiles_select_public" ON practitioner_profiles
  FOR SELECT USING (
    is_publicly_visible = true AND verification_status = 'approved'
  );

-- Practitioner can read/update own profile
CREATE POLICY "practitioner_profiles_select_own" ON practitioner_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "practitioner_profiles_update_own" ON practitioner_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "practitioner_profiles_insert_own" ON practitioner_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can read/update all
CREATE POLICY "practitioner_profiles_select_admin" ON practitioner_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "practitioner_profiles_update_admin" ON practitioner_profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PRACTITIONER DOCUMENTS
-- ============================================================
-- Practitioner can manage own documents
CREATE POLICY "practitioner_docs_select_own" ON practitioner_documents
  FOR SELECT USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "practitioner_docs_insert_own" ON practitioner_documents
  FOR INSERT WITH CHECK (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "practitioner_docs_delete_own" ON practitioner_documents
  FOR DELETE USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

-- Admin can read all
CREATE POLICY "practitioner_docs_select_admin" ON practitioner_documents
  FOR SELECT USING (is_admin());

CREATE POLICY "practitioner_docs_update_admin" ON practitioner_documents
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PRACTITIONER AVAILABILITY
-- ============================================================
-- Public: anyone can read (for booking UI)
CREATE POLICY "availability_select_public" ON practitioner_availability
  FOR SELECT USING (true);

-- Practitioner can manage own availability
CREATE POLICY "availability_insert_own" ON practitioner_availability
  FOR INSERT WITH CHECK (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "availability_update_own" ON practitioner_availability
  FOR UPDATE USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "availability_delete_own" ON practitioner_availability
  FOR DELETE USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

-- ============================================================
-- AVAILABILITY BLOCKS
-- ============================================================
-- Public can read (booking UI needs this)
CREATE POLICY "blocks_select_public" ON availability_blocks
  FOR SELECT USING (true);

-- Practitioner can manage own blocks
CREATE POLICY "blocks_insert_own" ON availability_blocks
  FOR INSERT WITH CHECK (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "blocks_delete_own" ON availability_blocks
  FOR DELETE USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

-- ============================================================
-- AREAS & CITIES (public read-only)
-- ============================================================
CREATE POLICY "areas_select_all" ON areas
  FOR SELECT USING (true);

CREATE POLICY "areas_admin_all" ON areas
  FOR ALL USING (is_admin());

CREATE POLICY "cities_select_all" ON cities
  FOR SELECT USING (true);

CREATE POLICY "cities_admin_all" ON cities
  FOR ALL USING (is_admin());

-- ============================================================
-- TREATMENT DOMAINS & SPECIALTIES (public read-only)
-- ============================================================
CREATE POLICY "domains_select_all" ON treatment_domains
  FOR SELECT USING (true);

CREATE POLICY "domains_admin_all" ON treatment_domains
  FOR ALL USING (is_admin());

CREATE POLICY "specialties_select_all" ON specialties
  FOR SELECT USING (true);

CREATE POLICY "specialties_admin_all" ON specialties
  FOR ALL USING (is_admin());

-- ============================================================
-- CATEGORIES (public read-only)
-- ============================================================
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_admin_all" ON categories
  FOR ALL USING (is_admin());

-- ============================================================
-- BOOKINGS
-- ============================================================
-- Patient can read own bookings
CREATE POLICY "bookings_select_patient" ON bookings
  FOR SELECT USING (patient_id = auth.uid());

-- Patient can create bookings
CREATE POLICY "bookings_insert_patient" ON bookings
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Patient can update own bookings (cancel)
CREATE POLICY "bookings_update_patient" ON bookings
  FOR UPDATE USING (patient_id = auth.uid());

-- Practitioner can read bookings assigned to them
CREATE POLICY "bookings_select_practitioner" ON bookings
  FOR SELECT USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

-- Practitioner can update bookings assigned to them (approve/decline)
CREATE POLICY "bookings_update_practitioner" ON bookings
  FOR UPDATE USING (
    practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())
  );

-- Admin can do everything
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (is_admin());

-- ============================================================
-- REVIEWS
-- ============================================================
-- Public: anyone can read approved reviews
CREATE POLICY "reviews_select_approved" ON reviews
  FOR SELECT USING (status = 'approved');

-- Authenticated users can insert reviews (for their own bookings)
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    booking_id IN (SELECT id FROM bookings WHERE patient_id = auth.uid())
  );

-- Admin can manage all reviews
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (is_admin());

-- ============================================================
-- ARTICLES
-- ============================================================
-- Public: anyone can read approved articles
CREATE POLICY "articles_select_approved" ON articles
  FOR SELECT USING (status = 'approved');

-- Author can read own articles (any status)
CREATE POLICY "articles_select_own" ON articles
  FOR SELECT USING (author_id = auth.uid());

-- Author can create articles
CREATE POLICY "articles_insert_own" ON articles
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Author can update own draft/submitted articles
CREATE POLICY "articles_update_own" ON articles
  FOR UPDATE USING (author_id = auth.uid() AND status IN ('draft', 'submitted'));

-- Admin can manage all articles
CREATE POLICY "articles_admin_all" ON articles
  FOR ALL USING (is_admin());

-- ============================================================
-- TREATMENT PACKAGES (public read-only)
-- ============================================================
CREATE POLICY "packages_select_all" ON treatment_packages
  FOR SELECT USING (true);

CREATE POLICY "packages_admin_all" ON treatment_packages
  FOR ALL USING (is_admin());

-- ============================================================
-- FAVORITES
-- ============================================================
-- User can manage own favorites
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (patient_id = auth.uid());

-- Admin can read all
CREATE POLICY "favorites_admin_all" ON favorites
  FOR ALL USING (is_admin());

-- ============================================================
-- CREDITS
-- ============================================================
-- Patient can read own credits
CREATE POLICY "credits_select_own" ON credits
  FOR SELECT USING (patient_id = auth.uid());

-- Admin can manage all credits
CREATE POLICY "credits_admin_all" ON credits
  FOR ALL USING (is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
-- User can read own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- User can update own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Service/system can insert notifications
CREATE POLICY "notifications_insert_service" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admin can read all
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin());
