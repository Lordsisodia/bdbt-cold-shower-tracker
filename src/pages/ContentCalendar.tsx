import {
    AlertCircle, Calendar as CalendarIcon, CheckCircle, ChevronLeft,
    ChevronRight, Clock, Download, Edit, Eye, Loader, Plus, RefreshCw, Star, Target, TrendingUp, Upload
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Footer from '../components/landing/Footer';
import Navigation from '../components/landing/Navigation';
import { CalendarEvent, calendarService } from '../services/calendarService';

const ContentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'published' | 'draft'>('all');
  
  // Live data from Supabase
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load events from Supabase
  useEffect(() => {
    loadEvents();
  }, [currentDate, filterCategory, filterStatus]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current month's events
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const monthEvents = await calendarService.getMonthEvents(year, month);
      
      // Apply filters
      let filteredEvents = monthEvents;
      if (filterCategory !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === filterCategory);
      }
      if (filterStatus !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === filterStatus);
      }
      
      setEvents(filteredEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Create sample events if none exist
  const generateSampleData = async () => {
    try {
      setLoading(true);
      await calendarService.generateSampleEvents();
      await loadEvents();
    } catch (err) {
      console.error('Error generating sample events:', err);
      setError('Failed to generate sample events.');
    }
  };

  const categoryColors = {
    health: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
    wealth: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    happiness: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' }
  };

  const statusColors = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    published: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit }
  };

  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-yellow-400',
    high: 'border-l-red-400'
  };

  const typeIcons = {
    tip: Star,
    idea: Target,
    campaign: TrendingUp,
    review: Eye
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar grid
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days to fill grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = event.date;
      const matchesDate = eventDate === dateStr;
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      return matchesDate && matchesCategory && matchesStatus;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const EventCard = ({ event }: { event: CalendarEvent }) => {
    const StatusIcon = statusColors[event.status].icon;
    const TypeIcon = typeIcons[event.type];
    
    return (
      <div 
        className={`p-2 mb-1 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${priorityColors[event.priority]}`}
        onClick={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TypeIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[event.category].bg} ${categoryColors[event.category].text}`}>
                <div className={`w-2 h-2 rounded-full ${categoryColors[event.category].dot}`}></div>
                {event.category}
              </span>
              <span className="text-xs text-gray-500">{event.time}</span>
            </div>
          </div>
          <StatusIcon className={`w-4 h-4 ${statusColors[event.status].text} flex-shrink-0`} />
        </div>
      </div>
    );
  };

  const MonthView = () => {
    const calendarDays = getCalendarDays();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center font-medium text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 h-[600px]">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            
            return (
              <div
                key={index}
                className={`border-r border-b border-gray-200 last:border-r-0 p-2 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday(day.date) ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday(day.date) ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1 max-h-20 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const UpcomingEvents = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event) => {
            const StatusIcon = statusColors[event.status].icon;
            const TypeIcon = typeIcons[event.type];
            
            return (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${categoryColors[event.category].dot}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                    <span>•</span>
                    <span className="capitalize">{event.category}</span>
                  </div>
                </div>
                <StatusIcon className={`w-5 h-5 ${statusColors[event.status].text}`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
                <p className="mt-2 text-gray-600">Plan, schedule, and manage your content</p>
              </div>
              
              <div className="flex items-center gap-3">
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <button 
                  onClick={refreshEvents}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                {events.length === 0 && !loading && (
                  <button 
                    onClick={generateSampleData}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Generate Sample Data
                  </button>
                )}
                
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={navigateToToday}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="health">Health</option>
                  <option value="wealth">Wealth</option>
                  <option value="happiness">Happiness</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                
                <div className="flex items-center border border-gray-300 rounded-lg">
                  {(['month', 'week', 'day'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg transition-colors ${
                        viewMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Loader className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Calendar</h3>
                <p className="text-gray-600">Fetching your events...</p>
              </div>
            ) : viewMode === 'month' ? (
              <MonthView />
            ) : null}
            {viewMode === 'week' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Week View Coming Soon</h3>
                <p className="text-gray-600">Advanced week view with time slots</p>
              </div>
            )}
            {viewMode === 'day' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Day View Coming Soon</h3>
                <p className="text-gray-600">Detailed daily schedule view</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UpcomingEvents />
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="font-semibold text-green-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Scheduled</span>
                  <span className="font-semibold text-blue-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Drafts</span>
                  <span className="font-semibold text-gray-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ideas</span>
                  <span className="font-semibold text-purple-600">15</span>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Mix</h3>
              <div className="space-y-3">
                {Object.entries(categoryColors).map(([category, colors]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colors.dot}`}></div>
                    <span className="flex-1 capitalize text-gray-700">{category}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {events.filter(e => e.category === category).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContentCalendar;