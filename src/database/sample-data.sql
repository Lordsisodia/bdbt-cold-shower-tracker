-- BDBT Sample Data for Testing
-- Run this after creating tables to populate with test data

-- Sample Calendar Events
INSERT INTO calendar_events (title, category, status, date, time, type, priority, assignee, description) VALUES
('Morning Routine Launch', 'health', 'scheduled', CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'campaign', 'high', 'Sarah Chen', 'Launch campaign for new morning routine guide'),
('Financial Planning Workshop', 'wealth', 'scheduled', CURRENT_DATE + INTERVAL '3 days', '14:00:00', 'tip', 'medium', 'Mike Johnson', 'Weekly financial planning tips release'),
('Happiness Habits Review', 'happiness', 'draft', CURRENT_DATE + INTERVAL '5 days', '10:00:00', 'review', 'medium', 'Emma Wilson', 'Review and update happiness category content'),
('Q1 Content Planning', 'health', 'scheduled', CURRENT_DATE + INTERVAL '7 days', '11:00:00', 'campaign', 'high', 'Team', 'Quarterly content planning session'),
('Meditation Guide Release', 'happiness', 'published', CURRENT_DATE - INTERVAL '2 days', '08:00:00', 'tip', 'medium', 'Lisa Brown', 'New meditation guide published');

-- Sample Podcast Episodes
INSERT INTO podcast_episodes (title, description, duration, published_date, category, views_count, thumbnail_url, youtube_url, spotify_url, apple_url, is_featured) VALUES
('How I Built a $1M Business in 12 Months', 'In this powerful episode, we break down the exact blueprint I used to scale from zero to seven figures.', '45:32', CURRENT_DATE - INTERVAL '2 days', 'business', 125000, 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop', 'https://youtube.com/watch?v=example1', 'https://spotify.com/episode/example1', 'https://podcasts.apple.com/episode/example1', true),
('The Morning Routine That Changed Everything', 'Discover the 5AM protocol that top performers use to maximize productivity and mental clarity.', '32:18', CURRENT_DATE - INTERVAL '5 days', 'mindset', 89000, 'https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=400&h=225&fit=crop', 'https://youtube.com/watch?v=example2', 'https://spotify.com/episode/example2', 'https://podcasts.apple.com/episode/example2', false),
('From Broke to Boss: Real Talk on Financial Freedom', 'Raw, unfiltered conversation about overcoming financial struggles and building wealth from scratch.', '41:27', CURRENT_DATE - INTERVAL '7 days', 'business', 102000, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=225&fit=crop', 'https://youtube.com/watch?v=example3', 'https://spotify.com/episode/example3', 'https://podcasts.apple.com/episode/example3', false),
('Optimize Your Body, Optimize Your Life', 'Science-backed strategies for peak physical performance and how it translates to success in all areas.', '38:45', CURRENT_DATE - INTERVAL '10 days', 'health', 76000, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop', 'https://youtube.com/watch?v=example4', 'https://spotify.com/episode/example4', 'https://podcasts.apple.com/episode/example4', false),
('Building Unshakeable Confidence', 'Master the psychology of self-belief and learn practical techniques to boost your confidence daily.', '29:56', CURRENT_DATE - INTERVAL '14 days', 'mindset', 93000, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop', 'https://youtube.com/watch?v=example5', 'https://spotify.com/episode/example5', 'https://podcasts.apple.com/episode/example5', false);

-- Sample Newsletter Subscribers
INSERT INTO newsletter_subscribers (email, name, source) VALUES
('john.doe@example.com', 'John Doe', 'landing_page'),
('sarah.smith@example.com', 'Sarah Smith', 'popup_modal'),
('mike.wilson@example.com', 'Mike Wilson', 'tips_page'),
('emma.brown@example.com', 'Emma Brown', 'podcast_page'),
('alex.jones@example.com', 'Alex Jones', 'partnership_page');

-- Note: Daily wins, user profiles, and other user-specific data should be created through the application
-- after users sign up, as they require auth.users references