-- Database Security and Form Updates Migration
-- Adds necessary fields and tables for secure form handling

-- Add email field to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- Create get_started_submissions table for tracking user onboarding
CREATE TABLE IF NOT EXISTS get_started_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    goals TEXT[] NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    agree_to_terms BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'processed', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS form_submission_logs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    form_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_get_started_email ON get_started_submissions(email);
CREATE INDEX IF NOT EXISTS idx_get_started_status ON get_started_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_logs_email_type ON form_submission_logs(email, form_type);
CREATE INDEX IF NOT EXISTS idx_form_logs_submitted_at ON form_submission_logs(submitted_at);

-- Add updated_at trigger for get_started_submissions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_get_started_submissions_updated_at') THEN
        CREATE TRIGGER update_get_started_submissions_updated_at 
        BEFORE UPDATE ON get_started_submissions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create RLS policies for security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE get_started_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submission_logs ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers: Only allow inserts, admin can read all
CREATE POLICY IF NOT EXISTS "Allow public newsletter signup" ON newsletter_subscribers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin can read all newsletter subscribers" ON newsletter_subscribers
    FOR SELECT TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Contact submissions: Only allow inserts, admin can read all
CREATE POLICY IF NOT EXISTS "Allow public contact submissions" ON contact_submissions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin can read all contact submissions" ON contact_submissions
    FOR SELECT TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Get started submissions: Only allow inserts, admin can read all
CREATE POLICY IF NOT EXISTS "Allow public get started submissions" ON get_started_submissions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin can read all get started submissions" ON get_started_submissions
    FOR SELECT TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Form submission logs: Only allow inserts, admin can read all
CREATE POLICY IF NOT EXISTS "Allow form submission logging" ON form_submission_logs
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin can read all form logs" ON form_submission_logs
    FOR SELECT TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create a function to log form submissions for rate limiting
CREATE OR REPLACE FUNCTION log_form_submission(
    p_email VARCHAR(255),
    p_form_type VARCHAR(50),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO form_submission_logs (email, form_type, ip_address, user_agent, success)
    VALUES (p_email, p_form_type, p_ip_address, p_user_agent, p_success);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_email VARCHAR(255),
    p_form_type VARCHAR(50),
    p_time_window_minutes INTEGER DEFAULT 60,
    p_max_attempts INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM form_submission_logs
    WHERE email = p_email
    AND form_type = p_form_type
    AND submitted_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes;
    
    RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;