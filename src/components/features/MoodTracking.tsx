import React, { useState, useEffect } from 'react';
import { Smile, Meh, TrendingUp, BarChart3, Calendar, Brain } from 'lucide-react';
import { Button, Card } from '../ui';

interface MoodTrackingProps {
  trackedDays: any[];
  currentStreak: number;
  onMoodUpdate: (date: string, beforeMood: number, afterMood: number) => void;
}

interface MoodEntry {
  id: string;
  date: string;
  beforeMood: number; // 1-5 scale
  afterMood: number; // 1-5 scale
  notes?: string;
  timestamp: string;
}

interface MoodScale {
  value: number;
  emoji: string;
  label: string;
  color: string;
  description: string;
}

const MOOD_SCALE: MoodScale[] = [
  { value: 1, emoji: '😫', label: 'Terrible', color: 'text-red-600 bg-red-100', description: 'Feeling awful' },
  { value: 2, emoji: '😔', label: 'Poor', color: 'text-orange-600 bg-orange-100', description: 'Not feeling great' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-600 bg-yellow-100', description: 'Feeling okay' },
  { value: 4, emoji: '😊', label: 'Good', color: 'text-green-600 bg-green-100', description: 'Feeling positive' },
  { value: 5, emoji: '😁', label: 'Excellent', color: 'text-blue-600 bg-blue-100', description: 'Feeling amazing' }
];

export const MoodTracking: React.FC<MoodTrackingProps> = ({
  onMoodUpdate
}) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [selectedBeforeMood, setSelectedBeforeMood] = useState<number | null>(null);
  const [selectedAfterMood, setSelectedAfterMood] = useState<number | null>(null);
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const savedMoods = localStorage.getItem('moodEntries');
    if (savedMoods) {
      const parsedMoods = JSON.parse(savedMoods);
      setMoodEntries(parsedMoods);
      
      // Check if there's an entry for today
      const today = new Date().toISOString().split('T')[0];
      const todayMoodEntry = parsedMoods.find((entry: MoodEntry) => entry.date === today);
      if (todayMoodEntry) {
        setTodayEntry(todayMoodEntry);
        setSelectedBeforeMood(todayMoodEntry.beforeMood);
        setSelectedAfterMood(todayMoodEntry.afterMood);
        setNotes(todayMoodEntry.notes || '');
      }
    }
  }, []);

  const saveMoodEntries = (newEntries: MoodEntry[]) => {
    setMoodEntries(newEntries);
    localStorage.setItem('moodEntries', JSON.stringify(newEntries));
  };

  const logMood = () => {
    if (selectedBeforeMood === null || selectedAfterMood === null) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: today,
      beforeMood: selectedBeforeMood,
      afterMood: selectedAfterMood,
      notes: notes.trim() || undefined,
      timestamp: now
    };

    // Remove any existing entry for today and add the new one
    const updatedEntries = moodEntries.filter(entry => entry.date !== today);
    updatedEntries.push(newEntry);
    saveMoodEntries(updatedEntries);
    
    setTodayEntry(newEntry);
    onMoodUpdate(today, selectedBeforeMood, selectedAfterMood);
    setShowMoodLogger(false);
  };

  const getMoodScale = (value: number): MoodScale => {
    return MOOD_SCALE.find(scale => scale.value === value) || MOOD_SCALE[2];
  };

  const getAverageMoodImprovement = (): number => {
    if (moodEntries.length === 0) return 0;
    const improvements = moodEntries.map(entry => entry.afterMood - entry.beforeMood);
    return improvements.reduce((sum, improvement) => sum + improvement, 0) / improvements.length;
  };

  const getWeeklyMoodTrend = (): { before: number; after: number } => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= oneWeekAgo
    );
    
    if (recentEntries.length === 0) return { before: 0, after: 0 };
    
    const avgBefore = recentEntries.reduce((sum, entry) => sum + entry.beforeMood, 0) / recentEntries.length;
    const avgAfter = recentEntries.reduce((sum, entry) => sum + entry.afterMood, 0) / recentEntries.length;
    
    return { before: avgBefore, after: avgAfter };
  };

  const getBestMoodDay = (): MoodEntry | null => {
    if (moodEntries.length === 0) return null;
    return moodEntries.reduce((best, entry) => 
      entry.afterMood > best.afterMood ? entry : best
    );
  };


  const weeklyTrend = getWeeklyMoodTrend();
  const avgImprovement = getAverageMoodImprovement();
  const bestDay = getBestMoodDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mood Tracking</h2>
        <p className="text-gray-600">
          Track how cold showers impact your mood and emotional well-being
        </p>
      </div>

      {/* Today's Mood Entry */}
      <Card padding="lg" className="border-2 border-blue-300 bg-blue-50">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Today's Mood Check-in</h3>
          
          {todayEntry ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-blue-700 mb-2">Before Cold Shower</div>
                  <div className="text-4xl mb-2">{getMoodScale(todayEntry.beforeMood).emoji}</div>
                  <div className="text-sm font-medium text-blue-900">
                    {getMoodScale(todayEntry.beforeMood).label}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-blue-700 mb-2">After Cold Shower</div>
                  <div className="text-4xl mb-2">{getMoodScale(todayEntry.afterMood).emoji}</div>
                  <div className="text-sm font-medium text-blue-900">
                    {getMoodScale(todayEntry.afterMood).label}
                  </div>
                </div>
              </div>
              
              {/* Mood Improvement Indicator */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                  todayEntry.afterMood > todayEntry.beforeMood ? 'bg-green-100 text-green-800' :
                  todayEntry.afterMood < todayEntry.beforeMood ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {todayEntry.afterMood > todayEntry.beforeMood ? (
                    <>
                      <TrendingUp size={16} />
                      Mood improved by {todayEntry.afterMood - todayEntry.beforeMood} points!
                    </>
                  ) : todayEntry.afterMood < todayEntry.beforeMood ? (
                    <>
                      <TrendingUp size={16} className="rotate-180" />
                      Mood decreased by {todayEntry.beforeMood - todayEntry.afterMood} points
                    </>
                  ) : (
                    <>
                      <Meh size={16} />
                      No mood change
                    </>
                  )}
                </div>
              </div>

              {todayEntry.notes && (
                <div className="bg-white bg-opacity-50 rounded-lg p-3 text-left">
                  <div className="text-sm text-blue-700 mb-1">Notes:</div>
                  <div className="text-sm text-blue-900">{todayEntry.notes}</div>
                </div>
              )}

              <Button
                onClick={() => setShowMoodLogger(true)}
                variant="secondary"
                size="sm"
              >
                Update Today's Mood
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Brain className="w-16 h-16 text-blue-600 mx-auto" />
              <p className="text-blue-700">
                Ready to track your mood before and after your cold shower?
              </p>
              <Button
                onClick={() => setShowMoodLogger(true)}
                size="lg"
                leftIcon={<Smile size={20} />}
              >
                Log Today's Mood
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Mood Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {avgImprovement > 0 ? '+' : ''}{avgImprovement.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Improvement</div>
        </Card>

        <Card padding="md" className="text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {weeklyTrend.after.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Weekly Avg (After)</div>
        </Card>

        <Card padding="md" className="text-center">
          <Smile className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {bestDay ? getMoodScale(bestDay.afterMood).emoji : '—'}
          </div>
          <div className="text-sm text-gray-600">Best Mood Day</div>
        </Card>

        <Card padding="md" className="text-center">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {moodEntries.length}
          </div>
          <div className="text-sm text-gray-600">Days Tracked</div>
        </Card>
      </div>

      {/* Mood History */}
      {moodEntries.length > 0 && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood History</h3>
          <div className="space-y-3">
            {moodEntries
              .slice(-10)
              .reverse()
              .map((entry) => {
                const improvement = entry.afterMood - entry.beforeMood;
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl">{getMoodScale(entry.beforeMood).emoji}</div>
                        <div className="text-xs text-gray-600">Before</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-sm font-medium ${
                          improvement > 0 ? 'text-green-600' : 
                          improvement < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {improvement > 0 ? '+' : ''}{improvement}
                        </div>
                        <div className="text-xs text-gray-600">Change</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl">{getMoodScale(entry.afterMood).emoji}</div>
                        <div className="text-xs text-gray-600">After</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Mood Logger Modal */}
      {showMoodLogger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Log Your Mood
            </h3>

            {/* Before Mood */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                How did you feel BEFORE your cold shower?
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_SCALE.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedBeforeMood(mood.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedBeforeMood === mood.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-gray-600">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* After Mood */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                How do you feel AFTER your cold shower?
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_SCALE.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedAfterMood(mood.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedAfterMood === mood.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-gray-600">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel? Any insights or observations?"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowMoodLogger(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={logMood}
                disabled={selectedBeforeMood === null || selectedAfterMood === null}
                className="flex-1"
              >
                Save Mood
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Insights */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Track Patterns:</strong> Notice which days bring the biggest mood improvements
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Mood Boost:</strong> Cold showers often improve mood through endorphin release
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Smile className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Be Honest:</strong> Accurate mood tracking helps identify real benefits
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Long-term View:</strong> Look for weekly and monthly mood improvement trends
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};