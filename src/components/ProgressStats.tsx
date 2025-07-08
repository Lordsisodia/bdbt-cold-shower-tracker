import React from 'react';
import { Card } from './ui';

interface ProgressStatsProps {
  currentStreak: number;
  bestStreak: number;
  completedThisMonth: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  currentStreak,
  bestStreak,
  completedThisMonth
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-8">
      {/* Current Streak - Main Feature */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center transform hover:scale-105 transition-all duration-300 shadow-lg" padding="lg">
        <div className="text-4xl font-bold mb-2 animate-pulse">{currentStreak}</div>
        <div className="text-lg font-medium">Current Streak</div>
        <div className="text-sm opacity-90 mt-1">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </div>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center hover:shadow-lg transition-all duration-200">
          <div className="text-2xl font-bold text-amber-600 mb-1 hover:scale-110 transition-transform duration-200">{bestStreak}</div>
          <div className="text-sm font-medium text-blue-800">Best Streak</div>
          <div className="text-xs text-gray-600 mt-1">
            {bestStreak === 1 ? 'day' : 'days'} total
          </div>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-all duration-200">
          <div className="text-2xl font-bold text-green-600 mb-1 hover:scale-110 transition-transform duration-200">{completedThisMonth}</div>
          <div className="text-sm font-medium text-blue-800">This Month</div>
          <div className="text-xs text-gray-600 mt-1">
            {completedThisMonth === 1 ? 'shower' : 'showers'} completed
          </div>
        </Card>
      </div>

      {/* Progress Milestones */}
      <Card>
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Progress Milestones</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Week 1 Complete</span>
            <span className={`text-sm transition-all duration-200 ${currentStreak >= 7 ? 'text-green-600 scale-110' : 'text-gray-400'}`}>
              {currentStreak >= 7 ? '✅' : '⭕'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Week 2 Complete</span>
            <span className={`text-sm transition-all duration-200 ${currentStreak >= 14 ? 'text-green-600 scale-110' : 'text-gray-400'}`}>
              {currentStreak >= 14 ? '✅' : '⭕'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">21 Day Habit</span>
            <span className={`text-sm transition-all duration-200 ${currentStreak >= 21 ? 'text-green-600 scale-110' : 'text-gray-400'}`}>
              {currentStreak >= 21 ? '✅' : '⭕'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">30 Day Challenge</span>
            <span className={`text-sm transition-all duration-200 ${currentStreak >= 30 ? 'text-green-600 scale-110' : 'text-gray-400'}`}>
              {currentStreak >= 30 ? '✅' : '⭕'}
            </span>
          </div>
        </div>
      </Card>

      {/* Motivational Messages */}
      <div className="text-center">
        {currentStreak === 0 && (
          <p className="text-sm text-blue-700 italic">
            "Every expert was once a beginner. Start today! 💪"
          </p>
        )}
        {currentStreak >= 1 && currentStreak < 7 && (
          <p className="text-sm text-blue-700 italic">
            "Great start! Keep the momentum going! 🚀"
          </p>
        )}
        {currentStreak >= 7 && currentStreak < 14 && (
          <p className="text-sm text-green-700 italic">
            "One week down! You're building real discipline! 🔥"
          </p>
        )}
        {currentStreak >= 14 && currentStreak < 21 && (
          <p className="text-sm text-green-700 italic">
            "Two weeks strong! This is becoming a habit! ⚡"
          </p>
        )}
        {currentStreak >= 21 && currentStreak < 30 && (
          <p className="text-sm text-green-700 italic">
            "21 days! The habit is formed. You're unstoppable! 🌟"
          </p>
        )}
        {currentStreak >= 30 && (
          <p className="text-sm text-green-700 italic">
            "30+ days! You're a cold shower champion! 🏆"
          </p>
        )}
      </div>
    </div>
  );
};