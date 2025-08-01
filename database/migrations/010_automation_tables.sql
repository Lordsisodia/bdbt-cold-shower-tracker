-- Automation tables for tip generation and email campaigns

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email campaigns table
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  segment VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email tracking table
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Automation logs table
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled jobs table
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add email preferences to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_preferences BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_frequency VARCHAR(50) DEFAULT 'weekly';

-- Add quality score to tips
ALTER TABLE tips 
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'manual';

-- Create indexes for performance
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);
CREATE INDEX idx_email_tracking_campaign ON email_tracking(campaign_id);
CREATE INDEX idx_email_tracking_recipient ON email_tracking(recipient_email);
CREATE INDEX idx_automation_logs_process ON automation_logs(process);
CREATE INDEX idx_automation_logs_timestamp ON automation_logs(timestamp);
CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run);
CREATE INDEX idx_tips_quality_score ON tips(quality_score);

-- RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Admin-only access for automation tables
CREATE POLICY admin_email_templates ON email_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY admin_email_campaigns ON email_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY admin_automation_logs ON automation_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert default scheduled jobs
INSERT INTO scheduled_jobs (job_name, job_type, schedule, next_run, config) VALUES
('Daily Tip Generation', 'tip_generation', '0 6 * * *', CURRENT_TIMESTAMP + INTERVAL '1 day', '{"targetCount": 100, "qualityThreshold": 0.8}'),
('Weekly Email Digest', 'email_campaign', '0 9 * * 1', CURRENT_TIMESTAMP + INTERVAL '1 week', '{"template": "weekly_digest", "segment": "active"}'),
('Database Cleanup', 'maintenance', '0 2 * * *', CURRENT_TIMESTAMP + INTERVAL '1 day', '{"retention_days": 90}');

-- Insert default email templates
INSERT INTO email_templates (name, subject, content, variables) VALUES
('Welcome Email', 'Welcome to BDBT - Your Daily Business Tips Journey Begins!', 
'Hi {{name}},\n\nWelcome to Business Daily Best Tips!...', 
'["name", "subscription", "unsubscribe_link"]'::jsonb),
('Weekly Digest', 'Your Weekly Business Tips Digest',
'Hi {{name}},\n\nHere are this week''s top business tips...', 
'["name", "tips_list", "unsubscribe_link"]'::jsonb);