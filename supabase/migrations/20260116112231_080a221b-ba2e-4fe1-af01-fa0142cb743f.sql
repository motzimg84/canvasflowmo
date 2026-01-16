-- CanvasFlow Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table with unique color per user
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, color)
);

-- Activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'finished')) DEFAULT 'todo',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_days INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table for branding
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  brand_color TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'de', 'fr', 'it')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view their own activities" 
ON public.activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.activities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" 
ON public.activities FOR DELETE 
USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" 
ON public.user_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;