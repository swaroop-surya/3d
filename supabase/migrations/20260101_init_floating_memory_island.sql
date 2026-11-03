-- ====================================================================
-- FLOATING MEMORY ISLAND: PostgreSQL Schema & Row Level Security (RLS)
-- Exclusively for two partners with private authenticated access
-- ====================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('partner_1', 'partner_2')),
  name TEXT NOT NULL,
  avatar_url TEXT,
  favorite_color TEXT DEFAULT '#EBCAD8',
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Relationship Settings
CREATE TABLE IF NOT EXISTS relationship_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name TEXT NOT NULL DEFAULT 'Us',
  partner1_id UUID REFERENCES profiles(id),
  partner2_id UUID REFERENCES profiles(id),
  partner1_name TEXT NOT NULL DEFAULT 'Partner 1',
  partner2_name TEXT NOT NULL DEFAULT 'Partner 2',
  start_date DATE NOT NULL DEFAULT '2023-06-15',
  anniversary_date DATE NOT NULL DEFAULT '2023-06-15',
  tagline TEXT DEFAULT 'A little world, containing our little moments.',
  featured_quote TEXT DEFAULT 'Every love story is beautiful, but ours is my absolute favorite.',
  background_theme TEXT DEFAULT 'sunset',
  weather TEXT DEFAULT 'petal_breeze',
  is_multiplayer_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Memory Albums
CREATE TABLE IF NOT EXISTS memory_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location_name TEXT DEFAULT 'Floating Island',
  uploaded_by TEXT NOT NULL CHECK (uploaded_by IN ('partner_1', 'partner_2')),
  album_id UUID REFERENCES memory_albums(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  assigned_frame_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Memory Placements in 3D scene
CREATE TABLE IF NOT EXISTS memory_placements (
  id TEXT PRIMARY KEY,
  memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  location_id TEXT NOT NULL,
  label TEXT NOT NULL,
  object_type TEXT NOT NULL DEFAULT 'photo_frame',
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  position_z FLOAT NOT NULL,
  rotation_x FLOAT NOT NULL DEFAULT 0,
  rotation_y FLOAT NOT NULL DEFAULT 0,
  rotation_z FLOAT NOT NULL DEFAULT 0,
  scale_x FLOAT NOT NULL DEFAULT 1,
  scale_y FLOAT NOT NULL DEFAULT 1,
  scale_z FLOAT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Shared & Private Diary
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT NOT NULL DEFAULT 'peaceful',
  author TEXT NOT NULL CHECK (author IN ('partner_1', 'partner_2')),
  author_id UUID REFERENCES profiles(id),
  is_private BOOLEAN DEFAULT false,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Love Letters
CREATE TABLE IF NOT EXISTS love_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL CHECK (sender IN ('partner_1', 'partner_2')),
  recipient TEXT NOT NULL CHECK (recipient IN ('partner_1', 'partner_2')),
  sender_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  wax_seal_color TEXT DEFAULT 'rose',
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMPTZ,
  open_when_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reasons Why I Love You
CREATE TABLE IF NOT EXISTS love_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL CHECK (author IN ('partner_1', 'partner_2')),
  reason TEXT NOT NULL,
  color_tag TEXT DEFAULT '#EBCAD8',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Shared Bucket List
CREATE TABLE IF NOT EXISTS bucket_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('places', 'food', 'movies', 'experiences', 'goals')),
  is_completed BOOLEAN DEFAULT false,
  completed_date DATE,
  notes TEXT,
  created_by TEXT NOT NULL CHECK (created_by IN ('partner_1', 'partner_2')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Special Dates & Milestones
CREATE TABLE IF NOT EXISTS special_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('anniversary', 'birthday', 'first_met', 'trip', 'milestone')),
  description TEXT,
  icon TEXT DEFAULT 'Heart',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Soundtrack
CREATE TABLE IF NOT EXISTS soundtrack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  external_url TEXT,
  memory_note TEXT,
  added_by TEXT NOT NULL CHECK (added_by IN ('partner_1', 'partner_2')),
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Time Capsules
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  created_by TEXT NOT NULL CHECK (created_by IN ('partner_1', 'partner_2')),
  unlock_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE soundtrack ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

-- Shared couple helper function: Checks if auth user is one of the 2 authorized partners
CREATE OR REPLACE FUNCTION is_authorized_partner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can read couple profiles, update own
CREATE POLICY "Authorized partners view profiles" ON profiles
  FOR SELECT TO authenticated USING (is_authorized_partner());

CREATE POLICY "Partner updates own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Relationship settings: Both partners read and update
CREATE POLICY "Couple reads relationship settings" ON relationship_settings
  FOR SELECT TO authenticated USING (is_authorized_partner());

CREATE POLICY "Couple updates relationship settings" ON relationship_settings
  FOR UPDATE TO authenticated USING (is_authorized_partner());

-- Memories: Both partners full access
CREATE POLICY "Couple manages memories" ON memories
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());

-- Placements: Both partners full access
CREATE POLICY "Couple manages placements" ON memory_placements
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());

-- Diary: Personal entries only seen by author, shared seen by both
CREATE POLICY "Diary access policy" ON diary_entries
  FOR SELECT TO authenticated
  USING (
    is_authorized_partner() AND (
      is_private = false OR author_id = auth.uid()
    )
  );

CREATE POLICY "Diary insert policy" ON diary_entries
  FOR INSERT TO authenticated
  WITH CHECK (is_authorized_partner());

CREATE POLICY "Diary update policy" ON diary_entries
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Diary delete policy" ON diary_entries
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Love Letters: Delivery schedule enforcement
CREATE POLICY "Love letters view policy" ON love_letters
  FOR SELECT TO authenticated
  USING (
    is_authorized_partner() AND (
      sender_id = auth.uid() OR
      (scheduled_for IS NULL OR scheduled_for <= NOW())
    )
  );

CREATE POLICY "Love letters insert policy" ON love_letters
  FOR INSERT TO authenticated
  WITH CHECK (is_authorized_partner());

CREATE POLICY "Love letters update policy" ON love_letters
  FOR UPDATE TO authenticated
  USING (is_authorized_partner());

-- Time capsules: Cannot be read before unlock_date
CREATE POLICY "Time capsules view policy" ON time_capsules
  FOR SELECT TO authenticated
  USING (
    is_authorized_partner() AND unlock_date <= NOW()
  );

CREATE POLICY "Time capsules insert policy" ON time_capsules
  FOR INSERT TO authenticated
  WITH CHECK (is_authorized_partner());

-- Bucket list, Love reasons, Special dates, Soundtrack
CREATE POLICY "Couple manages bucket list" ON bucket_list
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());

CREATE POLICY "Couple manages love reasons" ON love_reasons
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());

CREATE POLICY "Couple manages special dates" ON special_dates
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());

CREATE POLICY "Couple manages soundtrack" ON soundtrack
  FOR ALL TO authenticated USING (is_authorized_partner()) WITH CHECK (is_authorized_partner());
