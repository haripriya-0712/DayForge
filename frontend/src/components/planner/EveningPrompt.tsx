import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Moon } from 'lucide-react';
import { isToday } from 'date-fns';

export function EveningPrompt({ date, onPlanTomorrow }: { date: Date, onPlanTomorrow: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if we are looking at today's planner
    if (!isToday(date)) {
      setShow(false);
      return;
    }

    const checkTime = () => {
      const now = new Date();
      // Show if it's past 9 PM (21:00)
      if (now.getHours() >= 21) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    checkTime();
    const timer = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [date]);

  if (!show) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary-soft to-surface-2 border-primary/20 animate-in slide-in-from-bottom-4">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Moon size={20} />
          </div>
          <div>
            <h3 className="font-bold font-display">Ready for tomorrow?</h3>
            <p className="text-sm text-text-muted">Set up your schedule now.</p>
          </div>
        </div>
        <Button onClick={onPlanTomorrow} size="sm">
          Plan Tomorrow
        </Button>
      </div>
    </Card>
  );
}
