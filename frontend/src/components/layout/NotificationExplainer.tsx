import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BellRing, X } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/alarms';

export function NotificationExplainer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasPrompted = localStorage.getItem('has_prompted_notifications');
    if (!hasPrompted && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    await requestNotificationPermission();
    localStorage.setItem('has_prompted_notifications', 'true');
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('has_prompted_notifications', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-sm p-6 space-y-4 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center text-primary">
            <BellRing size={24} />
          </div>
          <button onClick={handleDismiss} className="text-text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-bold font-display">Never Miss a Task</h2>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            DayForge can send you a notification when it's time to start your planned tasks. We'll only notify you for tasks with alarms enabled.
          </p>
        </div>
        
        <div className="pt-2 flex flex-col gap-2">
          <Button onClick={handleAllow} className="w-full">
            Enable Notifications
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full">
            Maybe Later
          </Button>
        </div>
      </Card>
    </div>
  );
}
