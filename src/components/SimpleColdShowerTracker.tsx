import React, { useState, useEffect } from 'react';
import { Calendar } from './Calendar';
import { ProgressStats } from './ProgressStats';
import { HabitAnalytics } from './features/HabitAnalytics';
import { SocialSharing } from './features/SocialSharing';
import { ChallengeDurations } from './features/ChallengeDurations';
import { HabitStacking } from './features/HabitStacking';
import { TimeTracking } from './features/TimeTracking';
import { MoodTracking } from './features/MoodTracking';
import { Card, ThemeToggle, Button } from './ui';

interface TrackedDay {
  date: string;
  completed: boolean;
  extraCold?: boolean;
  feltAmazing?: boolean;
  duration?: number;
  completedAt?: string;
  beforeMood?: number;
  afterMood?: number;
}

export const SimpleColdShowerTracker: React.FC = () => {
  const [trackedDays, setTrackedDays] = useState<TrackedDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showStacking, setShowStacking] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showMoodTracking, setShowMoodTracking] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('coldShowerTracker');
    if (saved) {
      setTrackedDays(JSON.parse(saved));
    }
    
    // Load selected challenge
    const savedChallenge = localStorage.getItem('selectedChallenge');
    if (savedChallenge) {
      setSelectedChallenge(JSON.parse(savedChallenge));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('coldShowerTracker', JSON.stringify(trackedDays));
  }, [trackedDays]);

  const toggleDay = (date: string) => {
    setTrackedDays(prev => {
      const existingIndex = prev.findIndex(day => day.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          completed: !updated[existingIndex].completed
        };
        return updated;
      } else {
        return [...prev, { date, completed: true }];
      }
    });
  };

  const setDayProperty = (date: string, property: 'extraCold' | 'feltAmazing', value: boolean) => {
    setTrackedDays(prev => {
      const existingIndex = prev.findIndex(day => day.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [property]: value
        };
        return updated;
      } else {
        return [...prev, { date, completed: false, [property]: value }];
      }
    });
  };

  const getCurrentStreak = () => {
    if (trackedDays.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (currentDate >= new Date(Math.min(...trackedDays.map(d => new Date(d.date).getTime())))) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = trackedDays.find(d => d.date === dateStr);
      
      if (dayData?.completed) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const getBestStreak = () => {
    if (trackedDays.length === 0) return 0;
    
    const sortedDays = trackedDays
      .filter(d => d.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let bestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (const day of sortedDays) {
      const currentDate = new Date(day.date);
      
      if (lastDate && currentDate.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      
      bestStreak = Math.max(bestStreak, currentStreak);
      lastDate = currentDate;
    }
    
    return bestStreak;
  };

  const getCompletedThisMonth = () => {
    const monthStr = currentMonth.toISOString().slice(0, 7);
    return trackedDays.filter(d => d.date.startsWith(monthStr) && d.completed).length;
  };

  const getCompletionRate = () => {
    if (trackedDays.length === 0) return 0;
    const completedCount = trackedDays.filter(d => d.completed).length;
    return (completedCount / trackedDays.length) * 100;
  };

  const handleViewChange = (view: 'calendar' | 'analytics' | 'sharing' | 'challenges' | 'stacking' | 'timing' | 'mood') => {
    setShowAnalytics(view === 'analytics');
    setShowSharing(view === 'sharing');
    setShowChallenges(view === 'challenges');
    setShowStacking(view === 'stacking');
    setShowTimeTracking(view === 'timing');
    setShowMoodTracking(view === 'mood');
  };

  const handleChallengeSelect = () => {
    // This will be called when a challenge is selected
    // For now, we just store it in localStorage via the ChallengeDurations component
  };

  const handleDurationUpdate = (date: string, duration: number) => {
    setTrackedDays(prev => {
      const existingIndex = prev.findIndex(day => day.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          duration: duration
        };
        return updated;
      } else {
        return [...prev, { date, completed: false, duration: duration }];
      }
    });
  };

  const handleMoodUpdate = (date: string, beforeMood: number, afterMood: number) => {
    setTrackedDays(prev => {
      const existingIndex = prev.findIndex(day => day.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          beforeMood: beforeMood,
          afterMood: afterMood
        };
        return updated;
      } else {
        return [...prev, { date, completed: false, beforeMood: beforeMood, afterMood: afterMood }];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300" role="main">
      <ThemeToggle />
      
      {/* Desktop Layout - Single Column Centered */}
      <div className="hidden md:block">
        <div className="container mx-auto px-8 py-12 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              COLD SHOWER CHALLENGE
            </h1>
            <p className="text-xl lg:text-2xl text-blue-700 dark:text-blue-300 mb-2">
              30 Days to Better Health, Wealth & Happiness
            </p>
            <p className="text-lg text-teal-600 dark:text-teal-400 italic">
              Small discomfort, massive results
            </p>
          </header>

          {/* Benefits Grid */}
          <section className="mb-12" aria-labelledby="benefits-heading">
            <h2 id="benefits-heading" className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-8 text-center">Why Cold Showers?</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="lg">
                <div className="text-3xl lg:text-4xl mb-3" role="img" aria-label="Brain">🧠</div>
                <div className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Mental Clarity</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Improved focus and decision making</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="lg">
                <div className="text-3xl lg:text-4xl mb-3" role="img" aria-label="Muscle">💪</div>
                <div className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Increased Energy</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Natural energy boost all day</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="lg">
                <div className="text-3xl lg:text-4xl mb-3" role="img" aria-label="Fire">🔥</div>
                <div className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Faster Metabolism</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Burns calories and boosts immunity</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="lg">
                <div className="text-3xl lg:text-4xl mb-3" role="img" aria-label="Shield">🛡️</div>
                <div className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Stronger Immunity</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Better resistance to illness</div>
              </Card>
            </div>
          </section>

          {/* Progress Stats */}
          <section className="mb-8" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="sr-only">Progress Statistics</h2>
            <ProgressStats
              currentStreak={getCurrentStreak()}
              bestStreak={getBestStreak()}
              completedThisMonth={getCompletedThisMonth()}
            />
          </section>

          {/* View Toggle */}
          <div className="text-center mb-8">
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={() => handleViewChange('calendar')}
                variant={!showAnalytics && !showSharing && !showChallenges && !showStacking && !showTimeTracking && !showMoodTracking ? 'primary' : 'secondary'}
                size="md"
              >
                Calendar
              </Button>
              <Button
                onClick={() => handleViewChange('analytics')}
                variant={showAnalytics ? 'primary' : 'secondary'}
                size="md"
              >
                Analytics
              </Button>
              <Button
                onClick={() => handleViewChange('sharing')}
                variant={showSharing ? 'primary' : 'secondary'}
                size="md"
              >
                Share
              </Button>
              <Button
                onClick={() => handleViewChange('challenges')}
                variant={showChallenges ? 'primary' : 'secondary'}
                size="md"
              >
                Challenges
              </Button>
              <Button
                onClick={() => handleViewChange('stacking')}
                variant={showStacking ? 'primary' : 'secondary'}
                size="md"
              >
                Stacking
              </Button>
              <Button
                onClick={() => handleViewChange('timing')}
                variant={showTimeTracking ? 'primary' : 'secondary'}
                size="md"
              >
                Timing
              </Button>
              <Button
                onClick={() => handleViewChange('mood')}
                variant={showMoodTracking ? 'primary' : 'secondary'}
                size="md"
              >
                Mood
              </Button>
            </div>
          </div>

          {/* Main Content Area - Centered */}
          <div className="max-w-2xl mx-auto mb-8">
            {showAnalytics ? (
              <section aria-labelledby="analytics-heading">
                <h2 id="analytics-heading" className="sr-only">Habit Analytics</h2>
                <HabitAnalytics
                  trackedDays={trackedDays}
                  currentStreak={getCurrentStreak()}
                  longestStreak={getBestStreak()}
                />
              </section>
            ) : showSharing ? (
              <section aria-labelledby="sharing-heading">
                <h2 id="sharing-heading" className="sr-only">Social Sharing</h2>
                <SocialSharing
                  currentStreak={getCurrentStreak()}
                  longestStreak={getBestStreak()}
                  totalCompletions={trackedDays.filter(d => d.completed).length}
                  completionRate={getCompletionRate()}
                />
              </section>
            ) : showChallenges ? (
              <section aria-labelledby="challenges-heading">
                <h2 id="challenges-heading" className="sr-only">Challenge Durations</h2>
                <ChallengeDurations
                  trackedDays={trackedDays}
                  currentStreak={getCurrentStreak()}
                  onChallengeSelect={handleChallengeSelect}
                  selectedChallenge={selectedChallenge}
                />
              </section>
            ) : showStacking ? (
              <section aria-labelledby="stacking-heading">
                <h2 id="stacking-heading" className="sr-only">Habit Stacking</h2>
                <HabitStacking
                  trackedDays={trackedDays}
                  currentStreak={getCurrentStreak()}
                />
              </section>
            ) : showTimeTracking ? (
              <section aria-labelledby="timing-heading">
                <h2 id="timing-heading" className="sr-only">Time Tracking</h2>
                <TimeTracking
                  trackedDays={trackedDays}
                  currentStreak={getCurrentStreak()}
                  onDurationUpdate={handleDurationUpdate}
                />
              </section>
            ) : showMoodTracking ? (
              <section aria-labelledby="mood-heading">
                <h2 id="mood-heading" className="sr-only">Mood Tracking</h2>
                <MoodTracking
                  trackedDays={trackedDays}
                  currentStreak={getCurrentStreak()}
                  onMoodUpdate={handleMoodUpdate}
                />
              </section>
            ) : (
              <section aria-labelledby="calendar-heading">
                <h2 id="calendar-heading" className="sr-only">Cold Shower Calendar</h2>
                <Calendar
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  trackedDays={trackedDays}
                  onToggleDay={toggleDay}
                  onSetDayProperty={setDayProperty}
                />
              </section>
            )}
          </div>

          {/* Legend and Instructions - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Legend - Only show for calendar view */}
            {!showAnalytics && !showSharing && !showChallenges && !showStacking && !showTimeTracking && !showMoodTracking && (
              <Card>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">Completed cold shower</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 text-xl">❄️</span>
                    <span className="text-gray-700 dark:text-gray-300">Extra cold day</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 text-xl">🔥</span>
                    <span className="text-gray-700 dark:text-gray-300">Felt amazing after</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">How to Use</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="text-blue-600 text-xl">👆</span>
                  <span>Click any day to mark completed</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-600 text-xl">⏱️</span>
                  <span>Aim for 2-3 minutes under cold water</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-600 text-xl">🚿</span>
                  <span>Finish your regular shower with cold</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-600 text-xl">🖱️</span>
                  <span>Right-click for extra options</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Footer CTA */}
          <footer className="text-center">
            <div className="text-xl text-teal-600 dark:text-teal-400 italic mb-6">
              "Every cold shower is a vote for the person you're becoming"
            </div>
            <p className="text-lg text-blue-700 dark:text-blue-300 mb-2">
              Share your progress with #ColdShowerChallenge
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              @bigdaddysbigtips
            </p>
          </footer>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              COLD SHOWER CHALLENGE
            </h1>
            <p className="text-lg text-blue-700 dark:text-blue-300 mb-1">
              30 Days to Better Health, Wealth & Happiness
            </p>
            <p className="text-sm text-teal-600 dark:text-teal-400 italic">
              Small discomfort, massive results
            </p>
          </header>

          {/* Benefits */}
          <section className="mb-8" aria-labelledby="benefits-heading">
            <h2 id="benefits-heading" className="sr-only">Benefits of Cold Showers</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="sm">
                <div className="text-2xl mb-1" role="img" aria-label="Brain">🧠</div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Mental Clarity</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="sm">
                <div className="text-2xl mb-1" role="img" aria-label="Muscle">💪</div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Increased Energy</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="sm">
                <div className="text-2xl mb-1" role="img" aria-label="Fire">🔥</div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Faster Metabolism</div>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105" padding="sm">
                <div className="text-2xl mb-1" role="img" aria-label="Shield">🛡️</div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Stronger Immunity</div>
              </Card>
            </div>
          </section>

          {/* Progress Stats */}
          <section aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="sr-only">Progress Statistics</h2>
            <ProgressStats
              currentStreak={getCurrentStreak()}
              bestStreak={getBestStreak()}
              completedThisMonth={getCompletedThisMonth()}
            />
          </section>

          {/* View Toggle */}
          <div className="text-center mb-6">
            <div className="flex gap-1 justify-center flex-wrap">
              <Button
                onClick={() => handleViewChange('calendar')}
                variant={!showAnalytics && !showSharing && !showChallenges && !showStacking && !showTimeTracking && !showMoodTracking ? 'primary' : 'secondary'}
                size="sm"
              >
                Calendar
              </Button>
              <Button
                onClick={() => handleViewChange('analytics')}
                variant={showAnalytics ? 'primary' : 'secondary'}
                size="sm"
              >
                Analytics
              </Button>
              <Button
                onClick={() => handleViewChange('sharing')}
                variant={showSharing ? 'primary' : 'secondary'}
                size="sm"
              >
                Share
              </Button>
              <Button
                onClick={() => handleViewChange('challenges')}
                variant={showChallenges ? 'primary' : 'secondary'}
                size="sm"
              >
                Challenges
              </Button>
              <Button
                onClick={() => handleViewChange('stacking')}
                variant={showStacking ? 'primary' : 'secondary'}
                size="sm"
              >
                Stacking
              </Button>
              <Button
                onClick={() => handleViewChange('timing')}
                variant={showTimeTracking ? 'primary' : 'secondary'}
                size="sm"
              >
                Timing
              </Button>
              <Button
                onClick={() => handleViewChange('mood')}
                variant={showMoodTracking ? 'primary' : 'secondary'}
                size="sm"
              >
                Mood
              </Button>
            </div>
          </div>

          {/* Main Content */}
          {showAnalytics ? (
            <section aria-labelledby="analytics-heading">
              <h2 id="analytics-heading" className="sr-only">Habit Analytics</h2>
              <HabitAnalytics
                trackedDays={trackedDays}
                currentStreak={getCurrentStreak()}
                longestStreak={getBestStreak()}
              />
            </section>
          ) : showSharing ? (
            <section aria-labelledby="sharing-heading">
              <h2 id="sharing-heading" className="sr-only">Social Sharing</h2>
              <SocialSharing
                currentStreak={getCurrentStreak()}
                longestStreak={getBestStreak()}
                totalCompletions={trackedDays.filter(d => d.completed).length}
                completionRate={getCompletionRate()}
              />
            </section>
          ) : showChallenges ? (
            <section aria-labelledby="challenges-heading">
              <h2 id="challenges-heading" className="sr-only">Challenge Durations</h2>
              <ChallengeDurations
                trackedDays={trackedDays}
                currentStreak={getCurrentStreak()}
                onChallengeSelect={handleChallengeSelect}
                selectedChallenge={selectedChallenge}
              />
            </section>
          ) : showStacking ? (
            <section aria-labelledby="stacking-heading">
              <h2 id="stacking-heading" className="sr-only">Habit Stacking</h2>
              <HabitStacking
                trackedDays={trackedDays}
                currentStreak={getCurrentStreak()}
              />
            </section>
          ) : showTimeTracking ? (
            <section aria-labelledby="timing-heading">
              <h2 id="timing-heading" className="sr-only">Time Tracking</h2>
              <TimeTracking
                trackedDays={trackedDays}
                currentStreak={getCurrentStreak()}
                onDurationUpdate={handleDurationUpdate}
              />
            </section>
          ) : showMoodTracking ? (
            <section aria-labelledby="mood-heading">
              <h2 id="mood-heading" className="sr-only">Mood Tracking</h2>
              <MoodTracking
                trackedDays={trackedDays}
                currentStreak={getCurrentStreak()}
                onMoodUpdate={handleMoodUpdate}
              />
            </section>
          ) : (
            <section aria-labelledby="calendar-heading">
              <h2 id="calendar-heading" className="sr-only">Cold Shower Calendar</h2>
              <Calendar
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                trackedDays={trackedDays}
                onToggleDay={toggleDay}
                onSetDayProperty={setDayProperty}
              />
            </section>
          )}

          {/* Legend - Only show for calendar view */}
          {!showAnalytics && !showSharing && !showChallenges && !showStacking && !showTimeTracking && !showMoodTracking && (
            <Card className="mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-gray-700 dark:text-gray-300">Completed cold shower</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">❄️</span>
                  <span className="text-gray-700 dark:text-gray-300">Extra cold day</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-gray-700 dark:text-gray-300">Felt amazing after</span>
                </div>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Instructions</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Tap each day to mark completed</li>
              <li>• Aim for 2-3 minutes under cold water</li>
              <li>• Finish your regular shower with cold</li>
              <li>• Long press for extra options</li>
            </ul>
          </Card>

          {/* Motivation */}
          <div className="text-center text-sm text-teal-600 dark:text-teal-400 italic mb-4" role="complementary">
            "Every cold shower is a vote for the person you're becoming"
          </div>

          {/* CTA */}
          <footer className="text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              Share your progress with #ColdShowerChallenge
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              @bigdaddysbigtips
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};