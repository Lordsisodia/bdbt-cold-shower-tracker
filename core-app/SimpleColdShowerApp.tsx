import React, { useState, useEffect } from 'react';
import { ActivityCard, Goal, Metric } from './ui/activity-card';
import { Calendar } from './ui/mini-calendar';
import { Plus, Snowflake, Sun, Moon, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

interface ColdShowerEntry {
  date: string;
  completed: boolean;
  duration?: number;
  temperature?: number;
}

interface ReadingEntry {
  date: string;
  minutes: number;
}

const getDefaultGoals = (): Goal[] => [
  { id: "1", title: "Take cold shower", isCompleted: false },
  { id: "2", title: "Stay for 2+ minutes", isCompleted: false },
  { id: "3", title: "Focus on breathing", isCompleted: false },
];

export const SimpleColdShowerApp: React.FC = () => {
  const [entries, setEntries] = useState<ColdShowerEntry[]>([]);
  const [allGoals, setAllGoals] = useState<Record<string, Goal[]>>({});
  const [readingEntries, setReadingEntries] = useState<ReadingEntry[]>([]);
  const [showAddButton] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Debug when selectedDate changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    console.log('Selected date changed to:', dateString);
    console.log('Goals for this date:', allGoals[dateString] || 'No goals saved yet');
  }, [selectedDate, allGoals]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const stored = localStorage.getItem('cold-shower-entries');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored entries:', error);
      }
    }
    
    const storedGoals = localStorage.getItem('cold-shower-daily-goals');
    if (storedGoals) {
      try {
        setAllGoals(JSON.parse(storedGoals));
      } catch (error) {
        console.error('Failed to parse stored goals:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cold-shower-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('cold-shower-daily-goals', JSON.stringify(allGoals));
  }, [allGoals]);

  useEffect(() => {
    const storedReading = localStorage.getItem('reading-entries');
    if (storedReading) {
      try {
        setReadingEntries(JSON.parse(storedReading));
      } catch (error) {
        console.error('Failed to parse stored reading entries:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reading-entries', JSON.stringify(readingEntries));
  }, [readingEntries]);


  const addEntryForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const existingEntry = entries.find(entry => entry.date === dateString);
    
    if (!existingEntry) {
      const newEntry: ColdShowerEntry = {
        date: dateString,
        completed: true,
        duration: 5,
        temperature: 15 // Default temperature in Celsius
      };
      setEntries([...entries, newEntry]);
    }
  };

  const addReadingMinutes = (date: Date, minutes: number) => {
    const dateString = date.toISOString().split('T')[0];
    const existingEntry = readingEntries.find(entry => entry.date === dateString);
    
    if (existingEntry) {
      setReadingEntries(prev => prev.map(entry => 
        entry.date === dateString 
          ? { ...entry, minutes: entry.minutes + minutes }
          : entry
      ));
    } else {
      const newEntry: ReadingEntry = {
        date: dateString,
        minutes: minutes
      };
      setReadingEntries([...readingEntries, newEntry]);
    }
  };

  const calculateStats = () => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weekEntries = entries.filter(entry => 
      new Date(entry.date) >= thisWeek && entry.completed
    );
    
    const currentStreak = calculateStreak();
    const weeklyTarget = 7;
    const weeklyProgress = (weekEntries.length / weeklyTarget) * 100;
    
    const totalDuration = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const avgDuration = weekEntries.length > 0 ? totalDuration / weekEntries.length : 0;
    
    return {
      currentValue: weekEntries.length,
      targetValue: weeklyTarget,
      progress: weeklyProgress,
      streak: currentStreak,
      totalDuration,
      avgDuration,
      trend: weekEntries.length >= 5 ? 'up' : weekEntries.length >= 3 ? 'stable' : 'down'
    };
  };

  const calculateStreak = () => {
    const sortedEntries = entries
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleToggleGoal = (goalId: string) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    console.log('Toggling goal:', goalId, 'for date:', dateString);
    console.log('Current allGoals state:', allGoals);
    
    const currentGoals = allGoals[dateString] || getDefaultGoals();
    console.log('Current goals for date:', currentGoals);
    
    const updatedGoals = currentGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, isCompleted: !goal.isCompleted }
        : goal
    );
    console.log('Updated goals:', updatedGoals);
    
    setAllGoals(prev => {
      const newState = {
        ...prev,
        [dateString]: updatedGoals
      };
      console.log('New allGoals state will be:', newState);
      return newState;
    });
  };

  const handleAddGoal = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const currentGoals = allGoals[dateString] || getDefaultGoals();
    const newGoal: Goal = {
      id: `goal-${Date.now()}`, // Use timestamp for unique IDs
      title: `New Goal ${currentGoals.length + 1}`,
      isCompleted: false,
    };
    
    setAllGoals(prev => ({
      ...prev,
      [dateString]: [...currentGoals, newGoal]
    }));
  };

  const handleViewDetails = () => {
    console.log("Viewing cold shower details");
  };


  const selectedDateCompleted = entries.some(entry => 
    entry.date === selectedDate.toISOString().split('T')[0] && entry.completed
  );

  const stats = calculateStats();

  // Get goals for the currently selected date
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const currentGoals = allGoals[selectedDateString] || getDefaultGoals();
  const completedGoals = currentGoals.filter(g => g.isCompleted).length;
  const totalGoals = currentGoals.length;
  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Calculate reading stats
  const todayReading = readingEntries.find(entry => entry.date === selectedDateString);
  const readingMinutes = todayReading ? todayReading.minutes : 0;
  const readingProgress = Math.min((readingMinutes / 30) * 100, 100); // Assuming 30 min daily goal

  // Fix cold shower percentage calculation - if selected date has cold shower completed, show 100%
  const selectedDateColdShowerCompleted = entries.some(entry => 
    entry.date === selectedDateString && entry.completed
  );
  const coldShowerProgress = selectedDateColdShowerCompleted ? 100 : 0;

  const metrics: Metric[] = [
    { label: "Cold Shower", value: selectedDateColdShowerCompleted ? "✓" : "✗", trend: coldShowerProgress, unit: "", onClick: () => addEntryForDate(selectedDate) },
    { label: "Tasks Today", value: `${completedGoals}/${totalGoals}`, trend: Math.min(goalProgress, 100), unit: "" },
    { label: "Reading", value: readingMinutes.toFixed(1), trend: readingProgress, unit: "min" },
  ];

  // Get all completed dates for calendar marking
  const markedDates = entries
    .filter(entry => entry.completed)
    .map(entry => entry.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700">
      <div className="max-w-md mx-auto p-6 pt-12">
        {/* Header with Controls */}
        <div className="text-center mb-8 relative">
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center mb-6">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-black/20 backdrop-blur-lg border border-white/20 hover:bg-black/30 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="p-2 rounded-full bg-black/20 backdrop-blur-lg border border-white/20 hover:bg-black/30 transition-colors"
            >
              {showDashboard ? <CalendarIcon className="w-5 h-5 text-blue-500" /> : <BarChart3 className="w-5 h-5 text-blue-500" />}
            </button>
          </div>

          <div className="flex items-center justify-center mb-4 mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{stats.streak}</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-1">
              BDBT'S
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              COLD SHOWER TRACKER
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {showDashboard ? 'Dashboard Statistics' : 'STREAK'}
          </p>
        </div>

        {!showDashboard ? (
          <>
            {/* Mini Calendar */}
            <div className="mb-6">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                markedDates={markedDates}
              />
            </div>

            {/* Activity Card */}
            <div className="mb-8">
              <ActivityCard
                category="Wellness"
                title={`Cold Shower Progress - ${selectedDate.toLocaleDateString()}`}
                metrics={metrics}
                dailyGoals={currentGoals}
                onAddGoal={handleAddGoal}
                onToggleGoal={handleToggleGoal}
                onViewDetails={handleViewDetails}
              />
            </div>
          </>
        ) : (
          <>
            {/* Dashboard View */}
            <div className="space-y-6">
              {/* Overall Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-lg">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Total Showers</h3>
                  <div className="text-2xl font-bold text-green-400">
                    {entries.filter(e => e.completed).length}
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-lg">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Current Streak</h3>
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.streak} days
                  </div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">This Week's Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Weekly Goal Progress</span>
                    <span className="font-semibold">{Math.round(stats.progress)}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.progress, 100)}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {stats.currentValue}
                      </div>
                      <div className="text-xs text-white/60">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {Math.round(stats.avgDuration)}min
                      </div>
                      <div className="text-xs text-white/60">Avg Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {Object.keys(allGoals).length}
                      </div>
                      <div className="text-xs text-white/60">Days Tracked</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {entries
                    .filter(e => e.completed)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(entry => (
                      <div key={entry.date} className="flex justify-between items-center py-2 border-b border-white/20 last:border-b-0">
                        <span className="text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white/60">{entry.duration}min</span>
                          <span className="text-sm text-white/60">{entry.temperature}°C</span>
                          <span className="text-green-400">✓</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Controls only for calendar view */}
        {!showDashboard && (
          <>
            {/* Add Entry Button */}
            {!selectedDateCompleted && (
              <div className="text-center">
                <button
                  onClick={() => addEntryForDate(selectedDate)}
                  className={`
                    inline-flex items-center px-6 py-3 rounded-full font-semibold
                    transition-all duration-200 transform
                    ${showAddButton 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                      : 'bg-green-500 text-white scale-95'
                    }
                  `}
                  disabled={!showAddButton}
                >
                  {showAddButton ? (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Shower for {selectedDate.toLocaleDateString()}
                    </>
                  ) : (
                    <>
                      <Snowflake className="w-5 h-5 mr-2" />
                      Added!
                    </>
                  )}
                </button>
              </div>
            )}

            {selectedDateCompleted && (
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-green-400/20 backdrop-blur-lg border border-green-400/30 text-green-300 font-semibold">
                  <Snowflake className="w-5 h-5 mr-2" />
                  Shower completed on {selectedDate.toLocaleDateString()}!
                </div>
              </div>
            )}

            {/* Cold Shower Details */}
            {selectedDateCompleted && (
              <div className="mt-6 p-4 bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-2">Cold Shower Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-400">Duration:</span>
                    <span className="ml-2 font-medium text-white">
                      {entries.find(e => e.date === selectedDateString)?.duration || 5} min
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Temperature:</span>
                    <span className="ml-2 font-medium text-white">
                      {entries.find(e => e.date === selectedDateString)?.temperature || 15}°C
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reading Timer */}
            <div className="mt-6 text-center">
              <button
                onClick={() => addReadingMinutes(selectedDate, 15)}
                className="inline-flex items-center px-4 py-2 mx-2 rounded-full bg-black/20 backdrop-blur-lg border border-white/20 text-white font-semibold hover:bg-black/30 transition-colors"
              >
                +15 min reading
              </button>
              <button
                onClick={() => addReadingMinutes(selectedDate, 30)}
                className="inline-flex items-center px-4 py-2 mx-2 rounded-full bg-black/20 backdrop-blur-lg border border-white/20 text-white font-semibold hover:bg-black/30 transition-colors"
              >
                +30 min reading
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleColdShowerApp;