-- =====================================================
-- SUPABASE SCHEMA FOR TODO APP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TODOS TABLE
-- =====================================================

CREATE TABLE public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status todo_status DEFAULT 'pending' NOT NULL,
    priority todo_priority DEFAULT 'medium' NOT NULL,
    image_url TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_status ON public.todos(status);
CREATE INDEX idx_todos_created_at ON public.todos(created_at DESC);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Todos Policies
CREATE POLICY "Users can view own todos"
    ON public.todos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own todos"
    ON public.todos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
    ON public.todos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
    ON public.todos FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all todos"
    ON public.todos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all todos"
    ON public.todos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete all todos"
    ON public.todos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION public.handle_todo_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for todos updated_at
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for todo completion
CREATE TRIGGER handle_todo_completion_trigger
    BEFORE UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION public.handle_todo_completion();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for todo images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'todo-images',
    'todo-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Todo Images Policies
CREATE POLICY "Users can upload todo images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'todo-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view todo images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'todo-images');

CREATE POLICY "Users can update own todo images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'todo-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own todo images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'todo-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Avatars Policies
CREATE POLICY "Users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- To create an admin user, run this after the user signs up:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
