import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Calendar, Clock, Target, Flame, Award } from 'lucide-react';
import { Card, Button } from '../ui';

interface LocalTrackedDay {
  date: string;
  completed: boolean;
  extraCold?: boolean;
  feltAmazing?: boolean;
  duration?: number;
  completedAt?: string;
}

interface HabitAnalyticsProps {
  trackedDays: LocalTrackedDay[];
  currentStreak: number;
  longestStreak: number;
}

interface AnalyticsData {
  totalCompletions: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageDuration: number;
  weeklyTrend: number[];
  monthlyTrend: number[];
  bestTimeOfDay: string;
  weekdayCompletion: { [key: string]: number };
  monthlyCompletion: { [key: string]: number };
  streakDistribution: { [key: string]: number };
  insights: string[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({
  trackedDays,
  currentStreak,
  longestStreak
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (trackedDays.length > 0) {
      const data = calculateAnalytics(trackedDays, currentStreak, longestStreak, timeRange);
      setAnalyticsData(data);
    }
  }, [trackedDays, currentStreak, longestStreak, timeRange]);

  const calculateAnalytics = (
    days: LocalTrackedDay[], 
    streak: number, 
    maxStreak: number,
    range: 'week' | 'month' | 'all'
  ): AnalyticsData => {
    const now = new Date();
    const filteredDays = filterByTimeRange(days, range, now);
    
    const completedDays = filteredDays.filter(day => day.completed);
    const totalCompletions = completedDays.length;
    const totalDays = getDaysInRange(range);
    const completionRate = totalDays > 0 ? (totalCompletions / totalDays) * 100 : 0;

    // Calculate average duration (if duration data exists)
    const durationsWithData = completedDays.filter(day => day.duration && day.duration > 0);
    const averageDuration = durationsWithData.length > 0 
      ? durationsWithData.reduce((sum, day) => sum + (day.duration || 0), 0) / durationsWithData.length
      : 0;

    // Calculate weekly trend (last 7 days)
    const weeklyTrend = calculateWeeklyTrend(days, now);
    
    // Calculate monthly trend (last 12 weeks)
    const monthlyTrend = calculateMonthlyTrend(days, now);

    // Find best time of day
    const bestTimeOfDay = findBestTimeOfDay(completedDays);

    // Calculate weekday completion rates
    const weekdayCompletion = calculateWeekdayCompletion(completedDays);

    // Calculate monthly completion rates
    const monthlyCompletion = calculateMonthlyCompletion(completedDays);

    // Calculate streak distribution
    const streakDistribution = calculateStreakDistribution(days);

    // Generate insights
    const insights = generateInsights({
      completionRate,
      currentStreak: streak,
      longestStreak: maxStreak,
      totalCompletions,
      bestTimeOfDay,
      weekdayCompletion,
      averageDuration
    });

    return {
      totalCompletions,
      totalDays,
      completionRate,
      currentStreak: streak,
      longestStreak: maxStreak,
      averageDuration,
      weeklyTrend,
      monthlyTrend,
      bestTimeOfDay,
      weekdayCompletion,
      monthlyCompletion,
      streakDistribution,
      insights
    };
  };

  const filterByTimeRange = (days: LocalTrackedDay[], range: 'week' | 'month' | 'all', now: Date): LocalTrackedDay[] => {
    if (range === 'all') return days;
    
    const cutoffDate = new Date(now);
    if (range === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }
    
    return days.filter(day => new Date(day.date) >= cutoffDate);
  };

  const getDaysInRange = (range: 'week' | 'month' | 'all'): number => {
    if (range === 'week') return 7;
    if (range === 'month') return 30;
    return trackedDays.length;
  };

  const calculateWeeklyTrend = (days: LocalTrackedDay[], now: Date): number[] => {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const completed = days.find(day => day.date === dayStr)?.completed || false;
      trend.push(completed ? 1 : 0);
    }
    return trend;
  };

  const calculateMonthlyTrend = (days: LocalTrackedDay[], now: Date): number[] => {
    const trend = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      
      const weekDays = days.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= weekStart && dayDate <= weekEnd;
      });
      
      const completions = weekDays.filter(day => day.completed).length;
      trend.push(completions);
    }
    return trend;
  };

  const findBestTimeOfDay = (days: LocalTrackedDay[]): string => {
    const timeSlots = {
      'Early Morning (5-8 AM)': 0,
      'Morning (8-11 AM)': 0,
      'Midday (11 AM-2 PM)': 0,
      'Afternoon (2-5 PM)': 0,
      'Evening (5-8 PM)': 0,
      'Night (8-11 PM)': 0
    };

    days.forEach(day => {
      if (day.completedAt) {
        const hour = new Date(day.completedAt).getHours();
        if (hour >= 5 && hour < 8) timeSlots['Early Morning (5-8 AM)']++;
        else if (hour >= 8 && hour < 11) timeSlots['Morning (8-11 AM)']++;
        else if (hour >= 11 && hour < 14) timeSlots['Midday (11 AM-2 PM)']++;
        else if (hour >= 14 && hour < 17) timeSlots['Afternoon (2-5 PM)']++;
        else if (hour >= 17 && hour < 20) timeSlots['Evening (5-8 PM)']++;
        else if (hour >= 20 && hour < 23) timeSlots['Night (8-11 PM)']++;
      }
    });

    return Object.entries(timeSlots).reduce((best, [time, count]) => 
      count > (timeSlots as any)[best] ? time : best
    , 'Morning (8-11 AM)');
  };

  const calculateWeekdayCompletion = (days: LocalTrackedDay[]): { [key: string]: number } => {
    const weekdayCount: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const weekdayTotal: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    days.forEach(day => {
      const dayOfWeek = WEEKDAYS[new Date(day.date).getDay()];
      weekdayTotal[dayOfWeek]++;
      if (day.completed) {
        weekdayCount[dayOfWeek]++;
      }
    });

    const weekdayCompletion: { [key: string]: number } = {};
    WEEKDAYS.forEach(day => {
      weekdayCompletion[day] = weekdayTotal[day] > 0 ? (weekdayCount[day] / weekdayTotal[day]) * 100 : 0;
    });

    return weekdayCompletion;
  };

  const calculateMonthlyCompletion = (days: LocalTrackedDay[]): { [key: string]: number } => {
    const monthlyCount: { [key: string]: number } = {};
    const monthlyTotal: { [key: string]: number } = {};

    days.forEach(day => {
      const month = MONTHS[new Date(day.date).getMonth()];
      monthlyTotal[month] = (monthlyTotal[month] || 0) + 1;
      if (day.completed) {
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      }
    });

    const monthlyCompletion: { [key: string]: number } = {};
    Object.keys(monthlyTotal).forEach(month => {
      monthlyCompletion[month] = (monthlyCount[month] || 0) / monthlyTotal[month] * 100;
    });

    return monthlyCompletion;
  };

  const calculateStreakDistribution = (days: LocalTrackedDay[]): { [key: string]: number } => {
    const distribution = { '1-3': 0, '4-7': 0, '8-14': 0, '15-30': 0, '30+': 0 };
    
    let currentStreak = 0;
    const streaks: number[] = [];
    
    days.forEach(day => {
      if (day.completed) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
      }
    });
    
    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    streaks.forEach(streak => {
      if (streak <= 3) distribution['1-3']++;
      else if (streak <= 7) distribution['4-7']++;
      else if (streak <= 14) distribution['8-14']++;
      else if (streak <= 30) distribution['15-30']++;
      else distribution['30+']++;
    });

    return distribution;
  };

  const generateInsights = (data: any): string[] => {
    const insights: string[] = [];

    if (data.completionRate >= 80) {
      insights.push("🎉 Excellent consistency! You're maintaining an amazing habit.");
    } else if (data.completionRate >= 60) {
      insights.push("👍 Good progress! Try to identify patterns for missed days.");
    } else if (data.completionRate >= 40) {
      insights.push("📈 You're building momentum. Focus on small wins each day.");
    } else {
      insights.push("🌱 Every journey starts with a single step. Keep going!");
    }

    if (data.currentStreak >= 7) {
      insights.push(`🔥 ${data.currentStreak}-day streak! You're building serious mental toughness.`);
    }

    if (data.bestTimeOfDay) {
      insights.push(`⏰ Your most successful time is ${data.bestTimeOfDay}.`);
    }

    const bestWeekday = Object.entries(data.weekdayCompletion).reduce((best, [day, rate]) => 
      (rate as number) > (data.weekdayCompletion[best[0]] as number) ? [day, rate] : best
    , ['Monday', 0]);

    if ((bestWeekday[1] as number) > 80) {
      insights.push(`📅 ${bestWeekday[0]}s are your strongest day (${Math.round(bestWeekday[1] as number)}% success rate).`);
    }

    if (data.averageDuration > 0) {
      const minutes = Math.floor(data.averageDuration / 60);
      const seconds = data.averageDuration % 60;
      insights.push(`⏱️ Average shower duration: ${minutes}:${seconds.toString().padStart(2, '0')}.`);
    }

    return insights;
  };

  if (!analyticsData) {
    return (
      <Card padding="lg">
        <div className="text-center text-gray-500">
          <BarChart size={48} className="mx-auto mb-4 opacity-50" />
          <p>Start tracking to see your analytics!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <Button
            key={range}
            onClick={() => setTimeRange(range)}
            variant={timeRange === range ? 'primary' : 'secondary'}
            size="sm"
          >
            {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(analyticsData.completionRate)}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </Card>

        <Card padding="md" className="text-center">
          <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analyticsData.currentStreak}
          </div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </Card>

        <Card padding="md" className="text-center">
          <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analyticsData.longestStreak}
          </div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </Card>

        <Card padding="md" className="text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analyticsData.totalCompletions}
          </div>
          <div className="text-sm text-gray-600">Total Completed</div>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Weekly Progress
        </h3>
        <div className="flex justify-between items-end h-32 gap-2">
          {analyticsData.weeklyTrend.map((completed, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const dayName = WEEKDAYS[date.getDay()];
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    completed ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  style={{ height: completed ? '100%' : '4px' }}
                />
                <div className="text-xs text-gray-600 mt-2">{dayName}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekday Performance */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Day of Week Performance</h3>
        <div className="space-y-3">
          {WEEKDAYS.map(day => {
            const rate = analyticsData.weekdayCompletion[day] || 0;
            return (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{day}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {Math.round(rate)}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Patterns</h3>
        <div className="space-y-3">
          {analyticsData.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-medium text-sm flex-1">
                {insight}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="lg">
          <h4 className="font-semibold text-gray-900 mb-3">Best Time of Day</h4>
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-medium text-gray-900">
              {analyticsData.bestTimeOfDay}
            </div>
            <div className="text-sm text-gray-600">
              Your most successful completion time
            </div>
          </div>
        </Card>

        {analyticsData.averageDuration > 0 && (
          <Card padding="lg">
            <h4 className="font-semibold text-gray-900 mb-3">Average Duration</h4>
            <div className="text-center">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-medium text-gray-900">
                {Math.floor(analyticsData.averageDuration / 60)}:
                {(analyticsData.averageDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">
                Minutes per cold shower
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};