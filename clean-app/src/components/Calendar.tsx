import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card } from './ui';

interface TrackedDay {
  date: string;
  completed: boolean;
  extraCold?: boolean;
  feltAmazing?: boolean;
}

interface CalendarProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  trackedDays: TrackedDay[];
  onToggleDay: (date: string) => void;
  onSetDayProperty: (date: string, property: 'extraCold' | 'feltAmazing', value: boolean) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  setCurrentMonth,
  trackedDays,
  onToggleDay,
  onSetDayProperty
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayData = (date: Date) => {
    const dateStr = formatDate(date);
    return trackedDays.find(d => d.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    onToggleDay(dateStr);
  };

  const handleDayLongPress = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const toggleDayProperty = (property: 'extraCold' | 'feltAmazing') => {
    if (selectedDate) {
      const dayData = trackedDays.find(d => d.date === selectedDate);
      const currentValue = dayData?.[property] || false;
      onSetDayProperty(selectedDate, property, !currentValue);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDayData = selectedDate ? trackedDays.find(d => d.date === selectedDate) : null;

  return (
    <div className="mb-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="rounded-full p-2 w-10 h-10"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} className="text-blue-700" />
        </Button>
        
        <h2 className="text-xl font-semibold text-blue-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="rounded-full p-2 w-10 h-10"
          aria-label="Next month"
        >
          <ChevronRight size={16} className="text-blue-700" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-blue-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <button
                  onClick={() => handleDayClick(date)}
                  onTouchStart={(e) => {
                    const touchTimer = setTimeout(() => handleDayLongPress(date), 500);
                    e.currentTarget.addEventListener('touchend', () => clearTimeout(touchTimer), { once: true });
                  }}
                  className={`w-full h-full rounded-lg border-2 transition-all duration-200 relative transform hover:scale-105 active:scale-95 focus:outline-none ${
                    getDayData(date)?.completed
                      ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800 shadow-md'
                      : 'bg-white/90 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                  }`}
                  aria-label={`Toggle cold shower for ${date.toLocaleDateString()}`}
                  aria-pressed={getDayData(date)?.completed || false}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    <div className="flex gap-1 mt-1">
                      {getDayData(date)?.completed && (
                        <span className="text-xs text-green-600">✅</span>
                      )}
                      {getDayData(date)?.extraCold && (
                        <span className="text-xs text-blue-600">❄️</span>
                      )}
                      {getDayData(date)?.feltAmazing && (
                        <span className="text-xs text-orange-500">🔥</span>
                      )}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Modal for Day Options */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="max-w-sm w-full animate-in zoom-in-95 duration-200" variant="solid" padding="lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedDayData?.completed || false}
                  onChange={() => onToggleDay(selectedDate)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-gray-700">Completed cold shower</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedDayData?.extraCold || false}
                  onChange={() => toggleDayProperty('extraCold')}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Extra cold day ❄️</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedDayData?.feltAmazing || false}
                  onChange={() => toggleDayProperty('feltAmazing')}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-gray-700">Felt amazing after 🔥</span>
              </label>
            </div>
            
            <Button
              onClick={closeModal}
              variant="primary"
              fullWidth
              className="mt-2"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};