import { createClient } from '@supabase/supabase-js';
import { createConfiguredSupabaseClient, getMockData } from '../utils/supabaseConfig';

// Supabase client setup with fallback
import { validateSupabaseConfig } from '../utils/supabaseConfig';

const config = validateSupabaseConfig();
let supabase: ReturnType<typeof createClient> | null = null;
let useMockData = !config.isConfigured;

if (config.isConfigured) {
  try {
    supabase = createConfiguredSupabaseClient();
    console.log('✅ Supabase calendar service connected successfully');
  } catch (error) {
    console.warn('⚠️ Supabase calendar connection failed, using mock data:', error);
    useMockData = true;
  }
} else {
  console.warn('⚠️ Supabase not configured for calendar, using mock data:', config.errors);
}

export interface CalendarEvent {
  id?: number;
  title: string;
  category: 'health' | 'wealth' | 'happiness';
  status: 'scheduled' | 'published' | 'draft';
  date: string;
  time: string;
  type: 'tip' | 'idea' | 'campaign' | 'review';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export class CalendarService {
  // Get events for a specific date range
  async getEvents(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
    type?: string;
  }): Promise<{ events: CalendarEvent[]; total: number }> {
    
    // Use mock data if Supabase is not configured
    if (useMockData || !supabase) {
      const mockData = getMockData();
      let filteredEvents = mockData.events;
      
      // Apply filters to mock data
      if (filters?.startDate) {
        filteredEvents = filteredEvents.filter(event => event.date >= filters.startDate!);
      }
      if (filters?.endDate) {
        filteredEvents = filteredEvents.filter(event => event.date <= filters.endDate!);
      }
      if (filters?.category && filters.category !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      if (filters?.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      
      return {
        events: filteredEvents as CalendarEvent[],
        total: filteredEvents.length
      };
    }

    // Use real Supabase data
    let query = supabase
      .from('calendar_events')
      .select('*', { count: 'exact' })
      .order('date', { ascending: true });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching calendar events:', error);
      return { events: [], total: 0 };
    }

    return {
      events: data || [],
      total: count || 0
    };
  }

  // Get events for a specific month
  async getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    const { events } = await this.getEvents({ startDate, endDate });
    return events;
  }

  // Create new event
  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }

    return data;
  }

  // Update existing event
  async updateEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }

    return data;
  }

  // Delete event
  async deleteEvent(id: number): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get events by date
  async getEventsByDate(date: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching events by date:', error);
      return [];
    }

    return data || [];
  }

  // Get upcoming events (next 7 days)
  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { events } = await this.getEvents({ 
      startDate: today, 
      endDate: nextWeek 
    });
    
    return events;
  }

  // Bulk create events (for import)
  async bulkCreateEvents(events: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>[]): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(events)
      .select();

    if (error) {
      console.error('Error bulk creating calendar events:', error);
      throw error;
    }

    return data || [];
  }

  // Generate sample events for testing
  async generateSampleEvents(): Promise<void> {
    const today = new Date();
    const sampleEvents: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>[] = [];

    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      
      const categories: ('health' | 'wealth' | 'happiness')[] = ['health', 'wealth', 'happiness'];
      const types: ('tip' | 'idea' | 'campaign' | 'review')[] = ['tip', 'idea', 'campaign', 'review'];
      const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const statuses: ('scheduled' | 'published' | 'draft')[] = ['scheduled', 'published', 'draft'];

      // Add 1-3 events per day
      const eventsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < eventsPerDay; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const eventTitles = {
          health: [
            'Morning Meditation Session',
            'Workout Routine Check',
            'Nutrition Plan Review',
            'Sleep Quality Assessment',
            'Stress Management Tip'
          ],
          wealth: [
            'Investment Portfolio Review',
            'Budget Planning Session',
            'Side Hustle Progress',
            'Financial Goal Check',
            'Income Diversification Tip'
          ],
          happiness: [
            'Gratitude Practice',
            'Social Connection Time',
            'Hobby Development',
            'Mindfulness Exercise',
            'Joy Cultivation Tip'
          ]
        };

        const titles = eventTitles[category];
        const title = titles[Math.floor(Math.random() * titles.length)];
        
        sampleEvents.push({
          title,
          category,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: eventDate.toISOString().split('T')[0],
          time: `${9 + j * 3}:00`, // 9am, 12pm, 3pm
          type,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          assignee: 'Content Team',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} related to ${category} improvement`
        });
      }
    }

    await this.bulkCreateEvents(sampleEvents);
  }
}

export const calendarService = new CalendarService();

// SQL for creating the calendar_events table in Supabase:
/*
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'published', 'draft')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tip', 'idea', 'campaign', 'review')),
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  assignee VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_category ON calendar_events(category);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
*/