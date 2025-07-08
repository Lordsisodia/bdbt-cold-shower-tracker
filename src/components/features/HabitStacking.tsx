import React, { useState, useEffect } from 'react';
import { Plus, Link, Target, Clock, CheckCircle, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { Button, Card } from '../ui';

interface HabitStackingProps {
  trackedDays: any[];
  currentStreak: number;
}

interface HabitStack {
  id: string;
  name: string;
  description: string;
  habits: HabitStep[];
  isActive: boolean;
  createdAt: string;
  completedToday: boolean;
}

interface HabitStep {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  order: number;
  type: 'before' | 'during' | 'after';
  isRequired: boolean;
  completed: boolean;
}

const PRESET_STACKS: Omit<HabitStack, 'id' | 'createdAt' | 'completedToday' | 'isActive'>[] = [
  {
    name: 'Morning Warrior',
    description: 'Complete morning routine for peak performance',
    habits: [
      { id: '1', name: 'Gratitude Practice', description: 'Write 3 things you\'re grateful for', duration: 5, order: 1, type: 'before', isRequired: true, completed: false },
      { id: '2', name: 'Deep Breathing', description: '10 deep breaths to prepare mentally', duration: 3, order: 2, type: 'before', isRequired: true, completed: false },
      { id: '3', name: 'Cold Shower', description: 'The main event - cold water therapy', duration: 3, order: 3, type: 'during', isRequired: true, completed: false },
      { id: '4', name: 'Intention Setting', description: 'Set your intention for the day', duration: 5, order: 4, type: 'after', isRequired: true, completed: false },
      { id: '5', name: 'Protein Smoothie', description: 'Fuel your body with nutrition', duration: 5, order: 5, type: 'after', isRequired: false, completed: false }
    ]
  },
  {
    name: 'Athletic Performance',
    description: 'Optimize recovery and performance',
    habits: [
      { id: '1', name: 'Light Stretching', description: 'Prepare your body with gentle movement', duration: 10, order: 1, type: 'before', isRequired: true, completed: false },
      { id: '2', name: 'Contrast Shower', description: 'Alternate hot and cold water', duration: 5, order: 2, type: 'during', isRequired: true, completed: false },
      { id: '3', name: 'Meditation', description: '5-minute mindfulness practice', duration: 5, order: 3, type: 'after', isRequired: true, completed: false },
      { id: '4', name: 'Recovery Drink', description: 'Hydrate with electrolytes', duration: 2, order: 4, type: 'after', isRequired: false, completed: false }
    ]
  },
  {
    name: 'Stress Resilience',
    description: 'Build mental toughness and stress immunity',
    habits: [
      { id: '1', name: 'Box Breathing', description: '4-4-4-4 breathing technique', duration: 5, order: 1, type: 'before', isRequired: true, completed: false },
      { id: '2', name: 'Wim Hof Method', description: 'Breathing technique + cold exposure', duration: 10, order: 2, type: 'during', isRequired: true, completed: false },
      { id: '3', name: 'Journaling', description: 'Write about your experience and feelings', duration: 10, order: 3, type: 'after', isRequired: true, completed: false },
      { id: '4', name: 'Power Pose', description: '2-minute confidence boost', duration: 2, order: 4, type: 'after', isRequired: false, completed: false }
    ]
  }
];

export const HabitStacking: React.FC<HabitStackingProps> = () => {
  const [habitStacks, setHabitStacks] = useState<HabitStack[]>([]);
  const [activeStack, setActiveStack] = useState<HabitStack | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    const savedStacks = localStorage.getItem('habitStacks');
    if (savedStacks) {
      const stacks = JSON.parse(savedStacks);
      setHabitStacks(stacks);
      
      // Set active stack
      const active = stacks.find((stack: HabitStack) => stack.isActive);
      if (active) {
        setActiveStack(active);
      }
    }
  }, []);

  const saveStacks = (stacks: HabitStack[]) => {
    setHabitStacks(stacks);
    localStorage.setItem('habitStacks', JSON.stringify(stacks));
  };

  const createStackFromPreset = (preset: Omit<HabitStack, 'id' | 'createdAt' | 'completedToday' | 'isActive'>) => {
    const newStack: HabitStack = {
      ...preset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedToday: false,
      isActive: false,
      habits: preset.habits.map(habit => ({
        ...habit,
        id: `${Date.now()}-${habit.id}`,
        completed: false
      }))
    };

    const updatedStacks = [...habitStacks, newStack];
    saveStacks(updatedStacks);
    setShowPresets(false);
  };

  const activateStack = (stackId: string) => {
    const updatedStacks = habitStacks.map(stack => ({
      ...stack,
      isActive: stack.id === stackId
    }));
    
    saveStacks(updatedStacks);
    const newActiveStack = updatedStacks.find(stack => stack.id === stackId);
    setActiveStack(newActiveStack || null);
  };

  const completeHabit = (stackId: string, habitId: string) => {
    const updatedStacks = habitStacks.map(stack => {
      if (stack.id === stackId) {
        const updatedHabits = stack.habits.map(habit => 
          habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
        );
        
        // Check if all required habits are completed
        const allRequiredCompleted = updatedHabits
          .filter(h => h.isRequired)
          .every(h => h.completed);
        
        return {
          ...stack,
          habits: updatedHabits,
          completedToday: allRequiredCompleted
        };
      }
      return stack;
    });

    saveStacks(updatedStacks);
    
    // Update active stack
    if (activeStack && activeStack.id === stackId) {
      const updatedActiveStack = updatedStacks.find(s => s.id === stackId);
      setActiveStack(updatedActiveStack || null);
    }
  };

  const deleteStack = (stackId: string) => {
    const updatedStacks = habitStacks.filter(stack => stack.id !== stackId);
    saveStacks(updatedStacks);
    
    if (activeStack && activeStack.id === stackId) {
      setActiveStack(null);
    }
  };

  const resetDailyProgress = () => {
    const updatedStacks = habitStacks.map(stack => ({
      ...stack,
      habits: stack.habits.map(habit => ({ ...habit, completed: false })),
      completedToday: false
    }));
    
    saveStacks(updatedStacks);
    
    if (activeStack) {
      const updatedActiveStack = updatedStacks.find(s => s.id === activeStack.id);
      setActiveStack(updatedActiveStack || null);
    }
  };

  const getTotalDuration = (habits: HabitStep[]): number => {
    return habits.reduce((total, habit) => total + habit.duration, 0);
  };

  const getCompletionRate = (habits: HabitStep[]): number => {
    const completedCount = habits.filter(h => h.completed).length;
    return habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
  };

  const getHabitsByType = (habits: HabitStep[], type: 'before' | 'during' | 'after') => {
    return habits.filter(h => h.type === type).sort((a, b) => a.order - b.order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Habit Stacking</h2>
        <p className="text-gray-600 mb-6">
          Link your cold showers to other positive habits for maximum impact
        </p>
      </div>

      {/* Active Stack Display */}
      {activeStack && (
        <Card padding="lg" className="border-2 border-blue-300 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-blue-900">{activeStack.name}</h3>
              <p className="text-blue-700">{activeStack.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(getCompletionRate(activeStack.habits))}%
              </div>
              <div className="text-sm text-blue-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-3 mb-6">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionRate(activeStack.habits)}%` }}
            />
          </div>

          {/* Habit Flow */}
          <div className="space-y-6">
            {/* Before Habits */}
            {getHabitsByType(activeStack.habits, 'before').length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Before Cold Shower
                </h4>
                <div className="space-y-2">
                  {getHabitsByType(activeStack.habits, 'before').map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <button
                        onClick={() => completeHabit(activeStack.id, habit.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          habit.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {habit.completed && <CheckCircle size={14} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {habit.name}
                          </span>
                          {habit.isRequired && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{habit.description}</p>
                        <p className="text-xs text-gray-500">{habit.duration} minutes</p>
                      </div>
                      
                      {index < getHabitsByType(activeStack.habits, 'before').length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* During Habits (Cold Shower) */}
            {getHabitsByType(activeStack.habits, 'during').length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  During Cold Shower
                </h4>
                <div className="space-y-2">
                  {getHabitsByType(activeStack.habits, 'during').map((habit) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <button
                        onClick={() => completeHabit(activeStack.id, habit.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          habit.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {habit.completed && <CheckCircle size={14} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {habit.name}
                          </span>
                          {habit.isRequired && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{habit.description}</p>
                        <p className="text-xs text-gray-500">{habit.duration} minutes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* After Habits */}
            {getHabitsByType(activeStack.habits, 'after').length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  After Cold Shower
                </h4>
                <div className="space-y-2">
                  {getHabitsByType(activeStack.habits, 'after').map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <button
                        onClick={() => completeHabit(activeStack.id, habit.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          habit.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {habit.completed && <CheckCircle size={14} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {habit.name}
                          </span>
                          {habit.isRequired && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{habit.description}</p>
                        <p className="text-xs text-gray-500">{habit.duration} minutes</p>
                      </div>
                      
                      {index < getHabitsByType(activeStack.habits, 'after').length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stack Actions */}
          <div className="flex gap-2 mt-6">
            <Button
              onClick={resetDailyProgress}
              variant="secondary"
              size="sm"
            >
              Reset Today's Progress
            </Button>
            <Button
              onClick={() => setActiveStack(null)}
              variant="outline"
              size="sm"
            >
              Deactivate Stack
            </Button>
          </div>
        </Card>
      )}

      {/* All Stacks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Habit Stacks</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPresets(true)}
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={16} />}
            >
              Browse Templates
            </Button>
            <Button
              onClick={() => alert('Custom stack creation coming soon!')}
              size="sm"
              leftIcon={<Plus size={16} />}
            >
              Create Custom Stack
            </Button>
          </div>
        </div>

        {habitStacks.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Habit Stacks Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first habit stack to supercharge your cold shower routine
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowPresets(true)} variant="secondary">
                Browse Templates
              </Button>
              <Button onClick={() => alert('Custom stack creation coming soon!')}>
                Create Custom Stack
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habitStacks.map((stack) => (
              <Card key={stack.id} padding="lg" className={stack.isActive ? 'border-2 border-blue-500' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{stack.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{stack.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{stack.habits.length} habits</span>
                      <span>{getTotalDuration(stack.habits)} min total</span>
                      <span>{Math.round(getCompletionRate(stack.habits))}% complete</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => alert('Editing feature coming soon!')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteStack(stack.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionRate(stack.habits)}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  {!stack.isActive ? (
                    <Button
                      onClick={() => activateStack(stack.id)}
                      size="sm"
                      className="flex-1"
                    >
                      Activate Stack
                    </Button>
                  ) : (
                    <div className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded text-center">
                      Active Stack
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preset Templates Modal */}
      {showPresets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choose a Template</h3>
              <Button onClick={() => setShowPresets(false)} variant="ghost" size="sm">
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {PRESET_STACKS.map((preset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                      <p className="text-sm text-gray-600">{preset.description}</p>
                    </div>
                    <Button
                      onClick={() => createStackFromPreset(preset)}
                      size="sm"
                    >
                      Use Template
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {preset.habits.length} habits • {getTotalDuration(preset.habits)} minutes total
                  </div>
                  
                  <div className="space-y-1">
                    {preset.habits.slice(0, 3).map((habit, habitIndex) => (
                      <div key={habitIndex} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {habit.name} ({habit.duration}min)
                      </div>
                    ))}
                    {preset.habits.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{preset.habits.length - 3} more habits...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Stacking Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <Link className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Start Small:</strong> Begin with 2-3 simple habits to build momentum
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Time Wisely:</strong> Keep total routine under 30 minutes for consistency
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Anchor to Cold Shower:</strong> Use it as the keystone habit that triggers others
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <strong>Track Everything:</strong> Mark each habit as complete to build satisfaction
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};