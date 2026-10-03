import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell, Plus, CheckCircle2, CalendarPlus, Clock } from 'lucide-react';
import { getReminders, type Reminder, fetchWithAuth } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { toast } from '@/components/ui/Toast';
import { differenceInDays, parseISO, isToday as checkIsToday } from 'date-fns';

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
      toast('Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const getUrgencyChip = (dueDateStr: string) => {
    try {
      const dueDate = parseISO(dueDateStr);
      const daysDiff = differenceInDays(dueDate, new Date());

      if (checkIsToday(dueDate) || daysDiff === 0) {
        return <Chip variant="danger" className="animate-pulse">Due Today</Chip>;
      } else if (daysDiff === 1) {
        return <Chip variant="warning">In 1 day</Chip>;
      } else if (daysDiff < 0) {
        return <Chip variant="danger">Overdue ({Math.abs(daysDiff)}d ago)</Chip>;
      } else if (daysDiff <= 3) {
        return <Chip variant="warning">In {daysDiff} days</Chip>;
      } else {
        return <Chip variant="default">In {daysDiff} days</Chip>;
      }
    } catch (e) {
      return <Chip variant="default">Scheduled</Chip>;
    }
  };

  const handleConvertToTask = async (reminder: Reminder) => {
    try {
      await fetchWithAuth('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: reminder.title,
          date: reminder.due_date,
          start_time: reminder.due_time || '09:00',
          category: reminder.category || 'Personal',
          priority: reminder.priority || 1,
          completed: false
        })
      });
      toast(`Converted "${reminder.title}" to a timetable task!`, 'success');
    } catch (err) {
      toast('Failed to convert reminder to task', 'error');
    }
  };

  const handleCompleteReminder = async (id: number) => {
    try {
      await fetchWithAuth(`/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: true })
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast('Reminder marked complete!', 'success');
    } catch (err) {
      toast('Failed to update reminder', 'error');
    }
  };

  // Grouping
  const todayReminders = reminders.filter((r) => {
    try { return checkIsToday(parseISO(r.due_date)); } catch { return false; }
  });
  
  const weekReminders = reminders.filter((r) => {
    try {
      const days = differenceInDays(parseISO(r.due_date), new Date());
      return !checkIsToday(parseISO(r.due_date)) && days >= 0 && days <= 7;
    } catch { return false; }
  });

  const laterReminders = reminders.filter((r) => {
    try {
      const days = differenceInDays(parseISO(r.due_date), new Date());
      return days > 7 || days < 0;
    } catch { return true; }
  });

  return (
    <PageWrapper className="space-y-6 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-extrabold text-text tracking-tight">Reminders</h1>
        <Button size="sm" className="gap-1.5 shadow-sm">
          <Plus size={16} />
          <span>New Reminder</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No upcoming reminders"
          description="Never miss an important exam, prep session, or deadline. Add your first reminder."
        />
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {todayReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-rose-500" />
                <span>Due Today</span>
              </h2>
              <div className="space-y-3">
                {todayReminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    urgencyChip={getUrgencyChip(r.due_date)}
                    onConvert={() => handleConvertToTask(r)}
                    onComplete={() => handleCompleteReminder(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week Group */}
          {weekReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">This Week</h2>
              <div className="space-y-3">
                {weekReminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    urgencyChip={getUrgencyChip(r.due_date)}
                    onConvert={() => handleConvertToTask(r)}
                    onComplete={() => handleCompleteReminder(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Later Group */}
          {laterReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Later</h2>
              <div className="space-y-3">
                {laterReminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    urgencyChip={getUrgencyChip(r.due_date)}
                    onConvert={() => handleConvertToTask(r)}
                    onComplete={() => handleCompleteReminder(r.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

function ReminderCard({
  reminder,
  urgencyChip,
  onConvert,
  onComplete
}: {
  reminder: Reminder;
  urgencyChip: React.ReactNode;
  onConvert: () => void;
  onComplete: () => void;
}) {
  return (
    <Card className="p-5 flex items-start gap-4 shadow-soft hover:shadow-md transition-all border-l-4 border-l-amber-500">
      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Bell size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base md:text-lg text-text truncate">{reminder.title}</h3>
          {urgencyChip}
        </div>
        <p className="text-xs font-medium text-text-muted mt-0.5 tabular-nums">
          {reminder.due_date} {reminder.due_time ? `at ${reminder.due_time}` : ''}
        </p>

        {reminder.description && (
          <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{reminder.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border/40">
          <Button size="sm" variant="secondary" onClick={onConvert} className="text-xs gap-1.5">
            <CalendarPlus size={14} />
            <span>Add to Timetable</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={onComplete} className="text-xs text-success hover:bg-success/10 gap-1.5">
            <CheckCircle2 size={14} />
            <span>Dismiss</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

