import React, { useState, useEffect } from 'react';
import { Calendar, Target, Trophy, Clock, CheckCircle, Star } from 'lucide-react';
import { Button, Card } from '../ui';

interface ChallengeDurationsProps {
  trackedDays: any[];
  currentStreak: number;
  onChallengeSelect: () => void;
  selectedChallenge?: ChallengeType;
}

interface ChallengeType {
  id: string;
  name: string;
  duration: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  icon: React.ReactNode;
  benefits: string[];
  milestones: number[];
  color: string;
  recommended?: boolean;
}

interface UserProgress {
  challengeId: string;
  startDate: string;
  targetDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

const CHALLENGE_TYPES: ChallengeType[] = [
  {
    id: 'week-warrior',
    name: '7-Day Warrior',
    duration: 7,
    description: 'Perfect for beginners - build the habit foundation',
    difficulty: 'Beginner',
    icon: <Target className="w-6 h-6" />,
    benefits: [
      'Establish morning routine',
      'Build initial mental toughness', 
      'Experience energy boost',
      'Quick wins for motivation'
    ],
    milestones: [3, 5, 7],
    color: 'bg-green-500',
    recommended: true
  },
  {
    id: 'fortitude-builder',
    name: '14-Day Fortitude',
    duration: 14,
    description: 'Strengthen your discipline and see real changes',
    difficulty: 'Beginner',
    icon: <CheckCircle className="w-6 h-6" />,
    benefits: [
      'Noticeable energy improvements',
      'Better stress tolerance',
      'Improved sleep quality',
      'Stronger willpower'
    ],
    milestones: [7, 10, 14],
    color: 'bg-blue-500'
  },
  {
    id: 'commitment-master',
    name: '21-Day Commitment',
    duration: 21,
    description: 'The classic habit formation challenge',
    difficulty: 'Intermediate',
    icon: <Calendar className="w-6 h-6" />,
    benefits: [
      'Habit becomes automatic',
      'Significant mood improvements',
      'Increased metabolism',
      'Mental clarity enhancement'
    ],
    milestones: [7, 14, 21],
    color: 'bg-purple-500'
  },
  {
    id: 'transformation-month',
    name: '30-Day Transformation',
    duration: 30,
    description: 'Complete lifestyle transformation',
    difficulty: 'Intermediate',
    icon: <Star className="w-6 h-6" />,
    benefits: [
      'Complete mental transformation',
      'Maximum health benefits',
      'Unshakeable discipline',
      'Life-changing experience'
    ],
    milestones: [7, 14, 21, 30],
    color: 'bg-orange-500',
    recommended: true
  },
  {
    id: 'elite-performer',
    name: '60-Day Elite',
    duration: 60,
    description: 'For serious practitioners seeking mastery',
    difficulty: 'Advanced',
    icon: <Trophy className="w-6 h-6" />,
    benefits: [
      'Elite mental toughness',
      'Advanced stress immunity',
      'Peak physical conditioning',
      'Leadership mindset'
    ],
    milestones: [14, 30, 45, 60],
    color: 'bg-red-500'
  },
  {
    id: 'legend-status',
    name: '90-Day Legend',
    duration: 90,
    description: 'The ultimate cold shower mastery challenge',
    difficulty: 'Expert',
    icon: <Clock className="w-6 h-6" />,
    benefits: [
      'Legendary discipline',
      'Complete life mastery',
      'Inspirational to others',
      'Permanent lifestyle change'
    ],
    milestones: [21, 45, 60, 75, 90],
    color: 'bg-gray-800'
  }
];

export const ChallengeDurations: React.FC<ChallengeDurationsProps> = ({
  trackedDays,
  currentStreak,
  onChallengeSelect,
  selectedChallenge
}) => {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [showChallengeDetails, setShowChallengeDetails] = useState<string | null>(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem('challengeProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  const saveProgress = (progress: UserProgress[]) => {
    setUserProgress(progress);
    localStorage.setItem('challengeProgress', JSON.stringify(progress));
  };

  const startChallenge = (challenge: ChallengeType) => {
    const startDate = new Date().toISOString().split('T')[0];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + challenge.duration);
    
    const newProgress: UserProgress = {
      challengeId: challenge.id,
      startDate,
      targetDate: targetDate.toISOString().split('T')[0],
      progress: 0,
      completed: false
    };

    const updatedProgress = [...userProgress.filter(p => p.challengeId !== challenge.id), newProgress];
    saveProgress(updatedProgress);
    onChallengeSelect();
  };

  const getCurrentProgress = (challengeId: string): UserProgress | null => {
    return userProgress.find(p => p.challengeId === challengeId && !p.completed) || null;
  };

  const getCompletedChallenges = (): UserProgress[] => {
    return userProgress.filter(p => p.completed);
  };

  const calculateProgress = (progress: UserProgress, challenge: ChallengeType): number => {
    const startDate = new Date(progress.startDate);
    const currentDate = new Date();
    
    // Count actual completions within the challenge period
    const challengeCompletions = trackedDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= currentDate && day.completed;
    }).length;

    return Math.min((challengeCompletions / challenge.duration) * 100, 100);
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

  const getRecommendedChallenge = (): ChallengeType => {
    if (currentStreak === 0) {
      return CHALLENGE_TYPES[0]; // 7-day for complete beginners
    } else if (currentStreak < 7) {
      return CHALLENGE_TYPES[1]; // 14-day for those with some experience
    } else if (currentStreak < 21) {
      return CHALLENGE_TYPES[2]; // 21-day for building consistency
    } else if (currentStreak < 30) {
      return CHALLENGE_TYPES[3]; // 30-day for committed users
    } else if (currentStreak < 60) {
      return CHALLENGE_TYPES[4]; // 60-day for advanced users
    } else {
      return CHALLENGE_TYPES[5]; // 90-day for experts
    }
  };

  const recommendedChallenge = getRecommendedChallenge();
  const completedChallenges = getCompletedChallenges();

  return (
    <div className="space-y-6">
      {/* Current Challenge Status */}
      {selectedChallenge && (
        <Card padding="lg" className="border-2 border-blue-300 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-900">Current Challenge</h3>
            <div className={`px-3 py-1 rounded-full text-white ${selectedChallenge.color}`}>
              {selectedChallenge.name}
            </div>
          </div>
          
          {(() => {
            const progress = getCurrentProgress(selectedChallenge.id);
            if (progress) {
              const progressPercent = calculateProgress(progress, selectedChallenge);
              const daysRemaining = Math.max(0, selectedChallenge.duration - 
                Math.floor((new Date().getTime() - new Date(progress.startDate).getTime()) / (1000 * 60 * 60 * 24)));
              
              return (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {Math.round(progressPercent)}%</span>
                    <span>{daysRemaining} days remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedChallenge.milestones.map((milestone) => (
                      <div 
                        key={milestone}
                        className={`text-center p-2 rounded ${
                          progressPercent >= (milestone / selectedChallenge.duration) * 100
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="text-xs">Day {milestone}</div>
                        {progressPercent >= (milestone / selectedChallenge.duration) * 100 && (
                          <CheckCircle size={16} className="mx-auto mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </Card>
      )}

      {/* Recommended Challenge */}
      {!selectedChallenge && (
        <Card padding="lg" className="border-2 border-yellow-300 bg-yellow-50">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-900">Recommended for You</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{recommendedChallenge.name}</h4>
              <p className="text-gray-600 mb-2">{recommendedChallenge.description}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendedChallenge.difficulty)}`}>
                {recommendedChallenge.difficulty}
              </span>
            </div>
            <Button
              onClick={() => startChallenge(recommendedChallenge)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Start Challenge
            </Button>
          </div>
        </Card>
      )}

      {/* All Challenges */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Your Challenge</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHALLENGE_TYPES.map((challenge) => {
            const progress = getCurrentProgress(challenge.id);
            const isCompleted = completedChallenges.some(c => c.challengeId === challenge.id);
            const isActive = selectedChallenge?.id === challenge.id;
            
            return (
              <Card 
                key={challenge.id}
                padding="lg"
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? 'border-2 border-blue-500 bg-blue-50' : 
                  isCompleted ? 'border-2 border-green-500 bg-green-50' : 
                  challenge.recommended ? 'border-2 border-yellow-300' : ''
                }`}
                onClick={() => setShowChallengeDetails(showChallengeDetails === challenge.id ? null : challenge.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full text-white ${challenge.color}`}>
                      {challenge.icon}
                    </div>
                    {challenge.recommended && !isActive && !isCompleted && (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">{challenge.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{challenge.duration} days</span>
                  <span>{challenge.milestones.length} milestones</span>
                </div>

                {progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(calculateProgress(progress, challenge))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(progress, challenge)}%` }}
                      />
                    </div>
                  </div>
                )}

                {showChallengeDetails === challenge.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Benefits:</h5>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      {challenge.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    
                    <h5 className="font-semibold text-gray-900 mb-2">Milestones:</h5>
                    <div className="flex gap-2 mb-4">
                      {challenge.milestones.map((milestone) => (
                        <span key={milestone} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Day {milestone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!isActive && !progress && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      startChallenge(challenge);
                    }}
                    variant={challenge.recommended ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    Start {challenge.duration}-Day Challenge
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card padding="lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Completed Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedChallenges.map((completed) => {
              const challenge = CHALLENGE_TYPES.find(c => c.id === completed.challengeId);
              if (!challenge) return null;
              
              return (
                <div key={completed.challengeId} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-full text-white ${challenge.color}`}>
                      {challenge.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                      <p className="text-sm text-gray-600">Completed on {completed.completedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">✓ Challenge Complete</span>
                    <Button
                      onClick={() => startChallenge(challenge)}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tips for Success */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Challenge Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Start Small:</strong> Begin with shorter challenges to build confidence and consistency
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Track Daily:</strong> Mark each day immediately after completing your cold shower
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Same Time:</strong> Do cold showers at the same time each day to build routine
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Celebrate Milestones:</strong> Acknowledge your progress at each milestone
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};