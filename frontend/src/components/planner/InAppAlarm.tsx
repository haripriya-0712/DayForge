import { useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AlarmClock } from 'lucide-react';
import { playAlarmSound } from '@/lib/alarms';
import type { Task } from './TaskCard';

export function InAppAlarm({ activeTask, onDismiss, onMarkDone }: { activeTask: Task | null, onDismiss: () => void, onMarkDone: (id: number) => void }) {
  useEffect(() => {
    if (activeTask) {
      playAlarmSound();
    }
  }, [activeTask]);

  if (!activeTask) return null;

  const handleSnooze = async () => {
    // In a real app we would update the backend task alarm_time to +10 mins
    // For now we just dismiss visually
    onDismiss();
  };

  const handleDone = async () => {
    onMarkDone(activeTask.id);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-sm p-6 text-center space-y-6 shadow-2xl shadow-primary/20 animate-in zoom-in-90 duration-300">
        <div className="mx-auto w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center animate-bounce">
          <AlarmClock size={40} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold font-display">{activeTask.title}</h2>
          <p className="text-text-muted mt-2 text-lg">
            {activeTask.start_time} - Time to get started!
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleDone} className="w-full py-6 text-lg bg-success hover:bg-success/90">
            Mark as Done
          </Button>
          <Button variant="secondary" onClick={handleSnooze} className="w-full">
            Snooze (10 min)
          </Button>
        </div>
      </Card>
    </div>
  );
}
