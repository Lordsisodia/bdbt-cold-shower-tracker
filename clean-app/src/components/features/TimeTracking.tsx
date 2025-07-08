import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Timer, TrendingUp, Target, Award } from 'lucide-react';
import { Button, Card } from '../ui';

interface TimeTrackingProps {
  trackedDays: any[];
  currentStreak: number;
  onDurationUpdate: (date: string, duration: number) => void;
}

interface DurationGoal {
  id: string;
  name: string;
  targetSeconds: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  badge?: string;
}

interface TimeSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  goalId?: string;
  notes?: string;
}

const DURATION_GOALS: DurationGoal[] = [
  {
    id: 'beginner-30',
    name: 'First Steps',
    targetSeconds: 30,
    description: 'Take your first cold shower step - 30 seconds',
    difficulty: 'Beginner',
    badge: '🥶'
  },
  {
    id: 'beginner-60',
    name: 'One Minute Wonder',
    targetSeconds: 60,
    description: 'Build your foundation with 1 minute',
    difficulty: 'Beginner',
    badge: '❄️'
  },
  {
    id: 'intermediate-90',
    name: 'Comfort Zone Breaker',
    targetSeconds: 90,
    description: 'Push beyond comfort with 90 seconds',
    difficulty: 'Intermediate',
    badge: '🧊'
  },
  {
    id: 'intermediate-120',
    name: 'Two Minute Warrior',
    targetSeconds: 120,
    description: 'Standard practice duration - 2 minutes',
    difficulty: 'Intermediate',
    badge: '🛡️'
  },
  {
    id: 'advanced-180',
    name: 'Three Minute Master',
    targetSeconds: 180,
    description: 'Advanced practice - 3 minutes of mastery',
    difficulty: 'Advanced',
    badge: '⚔️'
  },
  {
    id: 'advanced-300',
    name: 'Five Minute Legend',
    targetSeconds: 300,
    description: 'Elite endurance - 5 minutes of pure will',
    difficulty: 'Advanced',
    badge: '🏆'
  },
  {
    id: 'expert-600',
    name: 'Ten Minute Titan',
    targetSeconds: 600,
    description: 'Superhuman resilience - 10 minutes',
    difficulty: 'Expert',
    badge: '👑'
  }
];

export const TimeTracking: React.FC<TimeTrackingProps> = ({
  onDurationUpdate
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<DurationGoal>(DURATION_GOALS[1]); // Default to 1 minute
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [todaySession, setTodaySession] = useState<TimeSession | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('timeSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      // Check if there's a session for today
      const today = new Date().toISOString().split('T')[0];
      const todaySessionData = parsedSessions.find((s: TimeSession) => s.date === today);
      if (todaySessionData) {
        setTodaySession(todaySessionData);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const saveSessions = (newSessions: TimeSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('timeSessions', JSON.stringify(newSessions));
  };

  const startTracking = () => {
    const now = new Date();
    setStartTime(now);
    setElapsedTime(0);
    setIsTracking(true);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const resumeTracking = () => {
    if (startTime) {
      const now = new Date();
      const newStartTime = new Date(now.getTime() - (elapsedTime * 1000));
      setStartTime(newStartTime);
      setIsTracking(true);
    }
  };

  const stopTracking = () => {
    if (startTime && elapsedTime > 0) {
      const now = new Date();
      const today = new Date().toISOString().split('T')[0];
      
      const newSession: TimeSession = {
        id: Date.now().toString(),
        date: today,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        duration: elapsedTime,
        goalId: selectedGoal.id,
        notes: ''
      };

      // Remove any existing session for today and add the new one
      const updatedSessions = sessions.filter(s => s.date !== today);
      updatedSessions.push(newSession);
      saveSessions(updatedSessions);
      
      setTodaySession(newSession);
      onDurationUpdate(today, elapsedTime);
    }
    
    resetTracking();
  };

  const resetTracking = () => {
    setIsTracking(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressTowardsGoal = (): number => {
    if (!todaySession) return 0;
    return Math.min((todaySession.duration / selectedGoal.targetSeconds) * 100, 100);
  };

  const hasAchievedGoal = (): boolean => {
    if (!todaySession) return false;
    return todaySession.duration >= selectedGoal.targetSeconds;
  };

  const getWeeklyAverage = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(session => 
      new Date(session.date) >= oneWeekAgo
    );
    
    if (recentSessions.length === 0) return 0;
    
    const totalDuration = recentSessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalDuration / recentSessions.length);
  };

  const getBestTime = (): number => {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.duration));
  };

  const getTotalTime = (): number => {
    return sessions.reduce((sum, session) => sum + session.duration, 0);
  };

  const getGoalAchievements = (): { [key: string]: number } => {
    const achievements: { [key: string]: number } = {};
    
    DURATION_GOALS.forEach(goal => {
      achievements[goal.id] = sessions.filter(session => 
        session.duration >= goal.targetSeconds
      ).length;
    });
    
    return achievements;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Advanced': return 'text-orange-600 bg-orange-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const achievements = getGoalAchievements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Duration Tracking</h2>
        <p className="text-gray-600">
          Track your cold shower sessions and build duration progressively
        </p>
      </div>

      {/* Current Goal */}
      <Card padding="lg" className="border-2 border-blue-300 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-blue-900">{selectedGoal.name}</h3>
            <p className="text-blue-700">{selectedGoal.description}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">{selectedGoal.badge}</div>
            <div className="text-sm text-blue-600">{formatDuration(selectedGoal.targetSeconds)}</div>
          </div>
        </div>

        <Button
          onClick={() => setShowGoalSelector(true)}
          variant="secondary"
          size="sm"
          className="mb-4"
        >
          Change Goal
        </Button>

        {/* Today's Progress */}
        {todaySession && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Today's Progress</span>
              <span>{Math.round(getProgressTowardsGoal())}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  hasAchievedGoal() ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${getProgressTowardsGoal()}%` }}
              />
            </div>
            {hasAchievedGoal() && (
              <div className="text-green-700 font-medium text-center mt-2">
                🎉 Goal Achieved! Duration: {formatDuration(todaySession.duration)}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Timer */}
      <Card padding="lg">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Session Timer</h3>
          
          {/* Time Display */}
          <div className="text-6xl font-mono font-bold text-gray-900 mb-6">
            {formatDuration(elapsedTime)}
          </div>

          {/* Goal Progress Ring */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={elapsedTime >= selectedGoal.targetSeconds ? "#10B981" : "#3B82F6"}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={314}
                strokeDashoffset={314 - (elapsedTime / selectedGoal.targetSeconds) * 314}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">
                {Math.round((elapsedTime / selectedGoal.targetSeconds) * 100)}%
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3 mb-4">
            {!isTracking && elapsedTime === 0 ? (
              <Button
                onClick={startTracking}
                leftIcon={<Play size={20} />}
                size="lg"
                className="px-8"
              >
                Start Session
              </Button>
            ) : !isTracking ? (
              <>
                <Button
                  onClick={resumeTracking}
                  leftIcon={<Play size={16} />}
                  variant="secondary"
                >
                  Resume
                </Button>
                <Button
                  onClick={stopTracking}
                  leftIcon={<Square size={16} />}
                  variant="primary"
                >
                  Complete Session
                </Button>
                <Button
                  onClick={resetTracking}
                  variant="outline"
                >
                  Reset
                </Button>
              </>
            ) : (
              <Button
                onClick={pauseTracking}
                leftIcon={<Pause size={16} />}
                variant="secondary"
                className="px-8"
              >
                Pause
              </Button>
            )}
          </div>

          {/* Current Session Info */}
          {elapsedTime > 0 && (
            <div className="text-sm text-gray-600">
              {elapsedTime >= selectedGoal.targetSeconds ? (
                <span className="text-green-600 font-medium">
                  🎯 You've reached your goal! Keep going for extra credit.
                </span>
              ) : (
                <span>
                  {formatDuration(selectedGoal.targetSeconds - elapsedTime)} remaining to reach goal
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(getWeeklyAverage())}
          </div>
          <div className="text-sm text-gray-600">Weekly Average</div>
        </Card>

        <Card padding="md" className="text-center">
          <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(getBestTime())}
          </div>
          <div className="text-sm text-gray-600">Personal Best</div>
        </Card>

        <Card padding="md" className="text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </Card>

        <Card padding="md" className="text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(getTotalTime())}
          </div>
          <div className="text-sm text-gray-600">Total Time</div>
        </Card>
      </div>

      {/* Goal Achievements */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DURATION_GOALS.map((goal) => {
            const achievementCount = achievements[goal.id] || 0;
            const isCurrentGoal = selectedGoal.id === goal.id;
            
            return (
              <div
                key={goal.id}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  isCurrentGoal ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedGoal(goal)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{goal.badge}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(goal.difficulty)}`}>
                    {goal.difficulty}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-1">{goal.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {formatDuration(goal.targetSeconds)}
                  </span>
                  <span className="text-gray-600">
                    {achievementCount > 0 ? `✓ ${achievementCount}x` : 'Not achieved'}
                  </span>
                </div>

                {isCurrentGoal && (
                  <div className="mt-2 text-center">
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                      Current Goal
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions
              .slice(-7)
              .reverse()
              .map((session) => {
                const goalAchieved = DURATION_GOALS.find(g => g.id === session.goalId);
                const metGoal = goalAchieved && session.duration >= goalAchieved.targetSeconds;
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDuration(session.duration)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {goalAchieved && (
                        <div className="text-sm text-gray-600 mb-1">
                          Goal: {goalAchieved.name}
                        </div>
                      )}
                      {metGoal ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          ✓ Goal Met
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Goal Selector Modal */}
      {showGoalSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choose Your Duration Goal</h3>
              <Button onClick={() => setShowGoalSelector(false)} variant="ghost" size="sm">
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DURATION_GOALS.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowGoalSelector(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">{goal.badge}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{goal.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                  
                  <div className="text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatDuration(goal.targetSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Progressive Overload:</strong> Gradually increase duration by 15-30 seconds each week
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Consistency Over Duration:</strong> Better to do 1 minute daily than 5 minutes occasionally
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Timer className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Focus on Breathing:</strong> Deep, controlled breathing helps you stay longer
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Celebrate Milestones:</strong> Acknowledge every achievement, no matter how small
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};