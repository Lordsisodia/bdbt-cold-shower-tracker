import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button, Card } from '../ui';

interface ColdShowerTimerProps {
  onComplete?: (duration: number) => void;
}

interface TimerPhase {
  name: string;
  duration: number; // in seconds
  message: string;
  color: string;
  audioFile?: string;
}

const TIMER_PHASES: TimerPhase[] = [
  {
    name: 'Prepare',
    duration: 10,
    message: 'Get ready! Take deep breaths and prepare mentally.',
    color: 'text-blue-600',
  },
  {
    name: 'Initial Shock',
    duration: 30,
    message: 'Stay calm! Focus on your breathing. This is the hardest part.',
    color: 'text-red-600',
  },
  {
    name: 'Adjustment',
    duration: 60,
    message: 'Your body is adapting. Keep breathing steadily.',
    color: 'text-orange-600',
  },
  {
    name: 'Flow State',
    duration: 90,
    message: 'You\'re in the zone! Feel your mental strength building.',
    color: 'text-green-600',
  },
  {
    name: 'Master Mode',
    duration: 300, // 5+ minutes total
    message: 'Amazing! You\'re now in master territory. Pure mental toughness!',
    color: 'text-purple-600',
  }
];

const AUDIO_CUES = {
  start: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEf'),
  halfTime: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEf'),
  complete: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEf')
};

export const ColdShowerTimer: React.FC<ColdShowerTimerProps> = ({ onComplete }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [customDuration, setCustomDuration] = useState(180); // 3 minutes default
  const [mode, setMode] = useState<'guided' | 'custom'>('guided');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPhaseRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          
          // Check for phase transitions
          if (mode === 'guided') {
            let cumulativeTime = 0;
            let newPhase = 0;
            
            for (let i = 0; i < TIMER_PHASES.length; i++) {
              cumulativeTime += TIMER_PHASES[i].duration;
              if (newTime <= cumulativeTime) {
                newPhase = i;
                break;
              }
            }
            
            if (newPhase !== lastPhaseRef.current) {
              setCurrentPhase(newPhase);
              lastPhaseRef.current = newPhase;
              
              // Play audio cue for phase transition
              if (isSoundEnabled && newPhase > 0) {
                playSound('halfTime');
              }
            }
          } else {
            // Custom mode - play halfway sound
            if (isSoundEnabled && newTime === Math.floor(customDuration / 2)) {
              playSound('halfTime');
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, customDuration, isSoundEnabled]);

  const playSound = (type: keyof typeof AUDIO_CUES) => {
    if (isSoundEnabled && AUDIO_CUES[type]) {
      AUDIO_CUES[type].play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    if (timeElapsed === 0 && isSoundEnabled) {
      playSound('start');
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    const finalDuration = timeElapsed;
    
    if (finalDuration > 0) {
      onComplete?.(finalDuration);
      if (isSoundEnabled) {
        playSound('complete');
      }
    }
    
    resetTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setCurrentPhase(0);
    lastPhaseRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (mode === 'guided') {
      const totalGuidedTime = TIMER_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
      return Math.min((timeElapsed / totalGuidedTime) * 100, 100);
    } else {
      return Math.min((timeElapsed / customDuration) * 100, 100);
    }
  };

  const getCurrentMessage = () => {
    if (mode === 'guided' && currentPhase < TIMER_PHASES.length) {
      return TIMER_PHASES[currentPhase].message;
    } else if (mode === 'custom') {
      const progress = (timeElapsed / customDuration) * 100;
      if (progress < 25) return 'Stay strong! You\'ve got this!';
      if (progress < 50) return 'Great job! You\'re building mental toughness.';
      if (progress < 75) return 'Excellent! Feel your resilience growing.';
      return 'Almost there! You\'re doing amazing!';
    }
    return 'Keep going! Every second counts.';
  };

  const getCurrentPhaseColor = () => {
    if (mode === 'guided' && currentPhase < TIMER_PHASES.length) {
      return TIMER_PHASES[currentPhase].color;
    }
    return 'text-blue-600';
  };

  return (
    <Card padding="lg">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Cold Shower Timer</h3>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setMode('guided')}
            variant={mode === 'guided' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
          >
            Guided
          </Button>
          <Button
            onClick={() => setMode('custom')}
            variant={mode === 'custom' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
          >
            Custom
          </Button>
        </div>

        {/* Custom Duration Input */}
        {mode === 'custom' && !isRunning && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Duration (seconds)
            </label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(Math.max(30, parseInt(e.target.value) || 30))}
              className="w-24 px-3 py-1 border border-gray-300 rounded text-center"
              min="30"
              max="600"
            />
          </div>
        )}

        {/* Timer Display */}
        <div className="mb-6">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(timeElapsed)}
          </div>
          
          {mode === 'guided' && (
            <div className={`text-lg font-semibold mb-2 ${getCurrentPhaseColor()}`}>
              {currentPhase < TIMER_PHASES.length ? TIMER_PHASES[currentPhase].name : 'Complete!'}
            </div>
          )}
          
          <div className="text-sm text-gray-600 italic mb-4">
            {getCurrentMessage()}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              variant="primary"
              leftIcon={<Play size={16} />}
            >
              {timeElapsed > 0 ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="secondary"
              leftIcon={<Pause size={16} />}
            >
              Pause
            </Button>
          )}
          
          <Button
            onClick={stopTimer}
            variant="outline"
            leftIcon={<Square size={16} />}
            disabled={timeElapsed === 0}
          >
            Stop
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="ghost"
            leftIcon={<RotateCcw size={16} />}
            disabled={isRunning}
          >
            Reset
          </Button>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="text-sm">Audio Cues</span>
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p><strong>Guided Mode:</strong> Progressive phases with coaching messages</p>
          <p><strong>Custom Mode:</strong> Set your own target duration</p>
          <p>Audio cues help you stay focused during the challenge</p>
        </div>
      </div>
    </Card>
  );
};