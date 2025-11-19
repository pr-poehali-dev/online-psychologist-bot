import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface BreathingTimerProps {
  technique: {
    title: string;
    inhale: number;
    hold: number;
    exhale: number;
  };
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

const BreathingTimer = ({ technique, onClose }: BreathingTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(technique.inhale);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          switch (phase) {
            case 'inhale':
              setPhase('hold');
              return technique.hold;
            case 'hold':
              setPhase('exhale');
              return technique.exhale;
            case 'exhale':
              setPhase('pause');
              setCompletedCycles((c) => c + 1);
              return 2;
            case 'pause':
              setPhase('inhale');
              return technique.inhale;
            default:
              return prev;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, technique]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(technique.inhale);
    setCompletedCycles(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(technique.inhale);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Вдох';
      case 'hold':
        return 'Задержка';
      case 'exhale':
        return 'Выдох';
      case 'pause':
        return 'Пауза';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600';
      case 'hold':
        return 'from-purple-400 to-purple-600';
      case 'exhale':
        return 'from-green-400 to-green-600';
      case 'pause':
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-150';
      case 'hold':
        return 'scale-150';
      case 'exhale':
        return 'scale-75';
      case 'pause':
        return 'scale-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg animate-scale-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{technique.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000 ${
                  isActive ? getCircleScale() : 'scale-100'
                } opacity-20`}
              />
              <div
                className={`absolute inset-8 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000 ${
                  isActive ? getCircleScale() : 'scale-100'
                } opacity-40`}
              />
              <div
                className={`absolute inset-16 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000 ${
                  isActive ? getCircleScale() : 'scale-100'
                }`}
              />
              
              <div className="relative z-10 text-center">
                <div className="text-6xl font-bold text-white mb-2">{countdown}</div>
                <div className="text-xl text-white/90">{getPhaseText()}</div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-lg font-medium">Циклов завершено: {completedCycles}</div>
              <div className="text-sm text-muted-foreground">
                {technique.inhale}с вдох • {technique.hold}с задержка • {technique.exhale}с выдох
              </div>
            </div>

            <div className="flex gap-3">
              {!isActive ? (
                <Button size="lg" onClick={handleStart} className="gap-2">
                  <Icon name="Play" size={20} />
                  Начать
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" onClick={() => setIsActive(false)} className="gap-2">
                    <Icon name="Pause" size={20} />
                    Пауза
                  </Button>
                  <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2">
                    <Icon name="Square" size={20} />
                    Стоп
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreathingTimer;
