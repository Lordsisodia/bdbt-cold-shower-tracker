-- BDBT User Profiles Schema Migration
-- Migration: 005_user_profiles
-- Created: 2025-08-01
-- Purpose: Create user profiles table linked to auth.users with auto-creation trigger

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location VARCHAR(100),
    
    -- User preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- User stats
    tips_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Metadata
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional profile data as JSONB for flexibility
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- Create trigger function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        username,
        display_name,
        avatar_url,
        metadata
    ) VALUES (
        NEW.id,
        -- Extract username from email before @ symbol
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        -- Use email as initial display name
        SPLIT_PART(NEW.email, '@', 1),
        -- Use gravatar as default avatar
        'https://www.gravatar.com/avatar/' || MD5(LOWER(TRIM(NEW.email))) || '?d=identicon&s=200',
        -- Store initial auth metadata
        jsonb_build_object(
            'email', NEW.email,
            'email_confirmed_at', NEW.email_confirmed_at,
            'sign_up_provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
            'sign_up_date', NEW.created_at
        )
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user profile timestamps
CREATE OR REPLACE FUNCTION public.update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamps
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_profile_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Add RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only insert their own profile (handled by trigger mostly)
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users cannot delete profiles (only cascade from auth.users)
CREATE POLICY "Profiles cannot be deleted directly"
    ON public.user_profiles FOR DELETE
    USING (false);