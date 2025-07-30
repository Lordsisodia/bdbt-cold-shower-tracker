-- Sample Tips Data for BDBT
-- This script inserts sample tips into the database

-- Get category IDs
WITH cat_ids AS (
  SELECT 
    id as health_id,
    (SELECT id FROM categories WHERE slug = 'wealth') as wealth_id,
    (SELECT id FROM categories WHERE slug = 'happiness') as happiness_id
  FROM categories 
  WHERE slug = 'health'
)

-- Insert sample tips
INSERT INTO tips (category_id, title, subtitle, description, difficulty, read_time, whats_included, benefits, tags, featured)
SELECT 
  health_id,
  'Cold Shower Morning Routine',
  'Start your day with an energy boost',
  'Learn how to gradually introduce cold showers into your morning routine for increased alertness, better circulation, and improved mood throughout the day.',
  'Easy',
  5,
  '["Step-by-step transition guide", "Temperature recommendations", "Breathing techniques", "Safety tips"]'::jsonb,
  '{"primary": "Increased energy and alertness", "secondary": "Improved circulation and immunity", "tertiary": "Enhanced mental resilience"}'::jsonb,
  ARRAY['morning-routine', 'cold-therapy', 'energy', 'health'],
  true
FROM cat_ids

UNION ALL

SELECT 
  health_id,
  'The Wim Hof Method Basics',
  'Breathing and cold exposure fundamentals',
  'Master the basic Wim Hof breathing technique combined with cold exposure to boost your immune system and increase mental clarity.',
  'Moderate',
  10,
  '["3 rounds of breathing exercises", "Cold shower progression", "Retention techniques", "Practice schedule"]'::jsonb,
  '{"primary": "Stronger immune system", "secondary": "Better stress management", "tertiary": "Increased focus and energy"}'::jsonb,
  ARRAY['wim-hof', 'breathing', 'cold-therapy', 'immunity'],
  true
FROM cat_ids

UNION ALL

SELECT 
  wealth_id,
  'The 50-30-20 Budget Rule',
  'Simple framework for financial success',
  'Learn how to allocate your income effectively: 50% for needs, 30% for wants, and 20% for savings and debt repayment.',
  'Easy',
  7,
  '["Budget calculator template", "Expense tracking guide", "Savings strategies", "Debt reduction tips"]'::jsonb,
  '{"primary": "Better financial control", "secondary": "Increased savings rate", "tertiary": "Reduced financial stress"}'::jsonb,
  ARRAY['budgeting', 'savings', 'financial-planning', 'money-management'],
  true
FROM cat_ids

UNION ALL

SELECT 
  wealth_id,
  'Building Your Emergency Fund',
  'Financial security in 6 months',
  'Create a solid emergency fund that covers 3-6 months of expenses, providing peace of mind and financial stability.',
  'Moderate',
  8,
  '["Emergency fund calculator", "Automated saving strategies", "High-yield account recommendations", "Progress tracking sheet"]'::jsonb,
  '{"primary": "Financial security", "secondary": "Peace of mind", "tertiary": "Better sleep quality"}'::jsonb,
  ARRAY['emergency-fund', 'savings', 'financial-security', 'planning'],
  false
FROM cat_ids

UNION ALL

SELECT 
  happiness_id,
  'Daily Gratitude Practice',
  'Transform your mindset in 5 minutes',
  'Develop a consistent gratitude practice that rewires your brain for positivity and improves overall life satisfaction.',
  'Easy',
  5,
  '["Gratitude journal template", "Morning prompts", "Evening reflection guide", "30-day challenge"]'::jsonb,
  '{"primary": "Increased happiness levels", "secondary": "Better relationships", "tertiary": "Improved sleep quality"}'::jsonb,
  ARRAY['gratitude', 'mindfulness', 'mental-health', 'daily-practice'],
  true
FROM cat_ids

UNION ALL

SELECT 
  happiness_id,
  'The Power of Mini-Meditations',
  'Find calm in 60 seconds',
  'Learn quick meditation techniques you can use anywhere to reduce stress and increase focus throughout your day.',
  'Easy',
  6,
  '["5 one-minute techniques", "Breathing exercises", "Visualization guides", "Mobile reminders setup"]'::jsonb,
  '{"primary": "Reduced stress levels", "secondary": "Improved focus", "tertiary": "Better emotional regulation"}'::jsonb,
  ARRAY['meditation', 'stress-relief', 'mindfulness', 'quick-tips'],
  false
FROM cat_ids

UNION ALL

SELECT 
  health_id,
  'Progressive Cold Exposure',
  'Build cold resilience safely',
  'A comprehensive 30-day program to gradually increase your cold tolerance through systematic exposure training.',
  'Advanced',
  15,
  '["30-day progression plan", "Temperature tracking chart", "Recovery protocols", "Advanced breathing techniques"]'::jsonb,
  '{"primary": "Maximum cold adaptation", "secondary": "Enhanced metabolism", "tertiary": "Mental toughness development"}'::jsonb,
  ARRAY['cold-therapy', 'advanced', 'training-program', 'resilience'],
  false
FROM cat_ids

UNION ALL

SELECT 
  wealth_id,
  'Passive Income Starter Guide',
  'Create your first income stream',
  'Explore beginner-friendly passive income opportunities and learn how to start building wealth while you sleep.',
  'Moderate',
  12,
  '["10 passive income ideas", "ROI calculations", "Risk assessment guide", "First steps action plan"]'::jsonb,
  '{"primary": "Additional income streams", "secondary": "Financial freedom progress", "tertiary": "Entrepreneurial skills"}'::jsonb,
  ARRAY['passive-income', 'investing', 'side-hustle', 'wealth-building'],
  true
FROM cat_ids

UNION ALL

SELECT 
  happiness_id,
  'Social Connection Habits',
  'Build meaningful relationships',
  'Develop daily habits that strengthen your social connections and create a supportive network for lasting happiness.',
  'Moderate',
  8,
  '["Daily connection checklist", "Conversation starters", "Active listening guide", "Community building tips"]'::jsonb,
  '{"primary": "Stronger relationships", "secondary": "Increased social support", "tertiary": "Greater life satisfaction"}'::jsonb,
  ARRAY['relationships', 'social-skills', 'community', 'connection'],
  false
FROM cat_ids

UNION ALL

SELECT 
  health_id,
  'Morning Cold Shower Challenge',
  '7 days to transform your mornings',
  'Take the 7-day cold shower challenge with daily tasks and progress tracking to establish a powerful morning routine.',
  'Easy',
  5,
  '["7-day challenge calendar", "Daily tasks", "Progress tracker", "Motivation tips"]'::jsonb,
  '{"primary": "New morning routine", "secondary": "Increased willpower", "tertiary": "Better mood throughout the day"}'::jsonb,
  ARRAY['challenge', 'morning-routine', 'cold-therapy', 'habits'],
  true
FROM cat_ids;

-- Insert some related tips relationships
WITH tip_pairs AS (
  SELECT 
    t1.id as tip1_id,
    t2.id as tip2_id
  FROM tips t1
  CROSS JOIN tips t2
  WHERE t1.title = 'Cold Shower Morning Routine'
    AND t2.title IN ('The Wim Hof Method Basics', 'Progressive Cold Exposure', 'Morning Cold Shower Challenge')
)
INSERT INTO related_tips (tip_id, related_tip_id, relation_type)
SELECT tip1_id, tip2_id, 
  CASE 
    WHEN tip2_id IN (SELECT id FROM tips WHERE title = 'The Wim Hof Method Basics') THEN 'advanced'
    WHEN tip2_id IN (SELECT id FROM tips WHERE title = 'Progressive Cold Exposure') THEN 'advanced'
    ELSE 'similar'
  END
FROM tip_pairs;

-- Create a sample collection
INSERT INTO tip_collections (name, slug, description, display_order)
VALUES 
  ('Cold Therapy Fundamentals', 'cold-therapy-fundamentals', 'Everything you need to know to start your cold therapy journey', 1),
  ('Financial Freedom Basics', 'financial-freedom-basics', 'Essential tips for building wealth and financial security', 2),
  ('Daily Happiness Habits', 'daily-happiness-habits', 'Simple practices for a more joyful life', 3);

-- Add tips to collections
WITH collection_mapping AS (
  SELECT 
    c.id as collection_id,
    t.id as tip_id,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY t.created_at) as display_order
  FROM tip_collections c
  CROSS JOIN tips t
  WHERE 
    (c.slug = 'cold-therapy-fundamentals' AND t.tags && ARRAY['cold-therapy'])
    OR (c.slug = 'financial-freedom-basics' AND t.category_id = (SELECT id FROM categories WHERE slug = 'wealth'))
    OR (c.slug = 'daily-happiness-habits' AND t.category_id = (SELECT id FROM categories WHERE slug = 'happiness'))
)
INSERT INTO collection_tips (collection_id, tip_id, display_order)
SELECT collection_id, tip_id, display_order
FROM collection_mapping;