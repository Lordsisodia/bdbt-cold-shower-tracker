import React, { useState, useEffect } from 'react';
import { Calendar } from './Calendar';
import { ProgressStats } from './ProgressStats';
import { Card, ThemeToggle } from './ui';

interface TrackedDay {
  date: string;
  completed: boolean;
  extraCold?: boolean;
  feltAmazing?: boolean;
}

export const BasicColdShowerTracker: React.FC = () => {
  const [trackedDays, setTrackedDays] = useState<TrackedDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('coldShowerTracker');
    if (saved) {
      setTrackedDays(JSON.parse(saved));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900 p-4 lg:p-8">
      <ThemeToggle />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 lg:mb-12">
          <div className="mb-4">
            <p className="text-lg lg:text-xl text-teal-600 dark:text-teal-400 font-semibold mb-2">
              BDBT's
            </p>
            <h1 className="text-3xl lg:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              COLD SHOWER TRACKER
            </h1>
          </div>
          <p className="text-lg lg:text-2xl text-blue-700 dark:text-blue-300 mb-2">
            30 Days to Better Health, Wealth & Happiness
          </p>
          <p className="text-base lg:text-lg text-teal-600 dark:text-teal-400 italic">
            Small discomfort, massive results
          </p>
        </header>

        {/* Benefits Grid */}
        <section className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 text-center">
            Why Cold Showers?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="text-center p-4 lg:p-6">
              <div className="text-3xl lg:text-4xl mb-2">🧠</div>
              <div className="text-sm lg:text-base font-medium text-blue-800 dark:text-blue-200 mb-1">
                Mental Clarity
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                Improved focus
              </div>
            </Card>
            <Card className="text-center p-4 lg:p-6">
              <div className="text-3xl lg:text-4xl mb-2">💪</div>
              <div className="text-sm lg:text-base font-medium text-blue-800 dark:text-blue-200 mb-1">
                More Energy
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                Natural boost
              </div>
            </Card>
            <Card className="text-center p-4 lg:p-6">
              <div className="text-3xl lg:text-4xl mb-2">🔥</div>
              <div className="text-sm lg:text-base font-medium text-blue-800 dark:text-blue-200 mb-1">
                Faster Metabolism
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                Burns calories
              </div>
            </Card>
            <Card className="text-center p-4 lg:p-6">
              <div className="text-3xl lg:text-4xl mb-2">🛡️</div>
              <div className="text-sm lg:text-base font-medium text-blue-800 dark:text-blue-200 mb-1">
                Strong Immunity
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                Better health
              </div>
            </Card>
          </div>
        </section>

        {/* Progress Stats */}
        <section className="mb-8">
          <ProgressStats
            currentStreak={getCurrentStreak()}
            bestStreak={getBestStreak()}
            completedThisMonth={getCompletedThisMonth()}
          />
        </section>

        {/* Calendar */}
        <section className="mb-8">
          <div className="max-w-2xl mx-auto">
            <Calendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              trackedDays={trackedDays}
              onToggleDay={toggleDay}
              onSetDayProperty={setDayProperty}
            />
          </div>
        </section>

        {/* Legend and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-4 lg:p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">
              Legend
            </h3>
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

          <Card className="p-4 lg:p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">
              How to Use
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-lg mt-0.5">👆</span>
                <span>Click any day to mark completed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-lg mt-0.5">⏱️</span>
                <span>Aim for 2-3 minutes under cold water</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-lg mt-0.5">🚿</span>
                <span>Finish your regular shower with cold</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-lg mt-0.5">🖱️</span>
                <span>Right-click for extra options</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <div className="text-lg lg:text-xl text-teal-600 dark:text-teal-400 italic mb-4">
            "Every cold shower is a vote for the person you're becoming"
          </div>
          <p className="text-base lg:text-lg text-blue-700 dark:text-blue-300 mb-2">
            Share your progress with #ColdShowerChallenge
          </p>
          <div className="mb-4">
            <p className="text-lg lg:text-xl text-blue-800 dark:text-blue-200 font-bold mb-1">
              BDBT
            </p>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
              @bigdaddysbigtips
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};