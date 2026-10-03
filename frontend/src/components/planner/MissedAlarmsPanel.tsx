import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Clock } from 'lucide-react';
import type { Task } from './TaskCard';

export function MissedAlarmsPanel({ missedTasks, onDismiss }: { missedTasks: Task[], onDismiss: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (missedTasks.length > 0) {
      setShow(true);
    }
  }, [missedTasks]);

  if (!show || missedTasks.length === 0) return null;

  return (
    <Card className="mb-6 border-warning/50 bg-warning/10 relative overflow-hidden animate-in slide-in-from-top-4">
      <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-warning">
            <Clock size={20} />
            <h3 className="font-bold">You missed some alarms</h3>
          </div>
          <button onClick={() => { setShow(false); onDismiss(); }} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {missedTasks.map(t => (
            <div key={t.id} className="text-sm font-medium">
              {t.start_time} - {t.title}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => { setShow(false); onDismiss(); }}>
            Dismiss All
          </Button>
        </div>
      </div>
    </Card>
  );
}
