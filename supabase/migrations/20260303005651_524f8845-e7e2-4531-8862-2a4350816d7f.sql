
-- Create Nobel category enum
CREATE TYPE public.nobel_category AS ENUM ('Physics', 'Chemistry', 'Medicine', 'Literature', 'Peace', 'Economics');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

-- Laureates table
CREATE TABLE public.laureates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_year INT NOT NULL,
  death_year INT,
  nationality TEXT NOT NULL,
  category nobel_category NOT NULL,
  year INT NOT NULL,
  motivation TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  photo TEXT DEFAULT '',
  biography TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.laureates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Laureates are public" ON public.laureates FOR SELECT USING (true);

-- Lectures table
CREATE TABLE public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  category nobel_category NOT NULL,
  year INT NOT NULL,
  duration TEXT NOT NULL DEFAULT '00:00',
  views INT NOT NULL DEFAULT 0,
  thumbnail TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectures are public" ON public.lectures FOR SELECT USING (true);

-- Research papers table
CREATE TABLE public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  category nobel_category NOT NULL,
  year INT NOT NULL,
  citations INT NOT NULL DEFAULT 0,
  abstract TEXT DEFAULT '',
  doi TEXT DEFAULT '',
  journal TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Papers are public" ON public.research_papers FOR SELECT USING (true);

-- Bookmarks table (user saves)
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('laureate', 'lecture', 'paper')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- User activity log
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  item_type TEXT,
  item_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
