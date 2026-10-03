import { useState, useEffect } from 'react';
import { format, isTomorrow, isToday, addDays } from 'date-fns';
import { Plus, Copy, List, Clock, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Skeleton } from '@/components/ui/Skeleton';
import { WeekStrip } from '@/components/planner/WeekStrip';
import { ListView } from '@/components/planner/ListView';
import { TimelineView } from '@/components/planner/TimelineView';
import { QuickAddSheet } from '@/components/planner/QuickAddSheet';
import type { Task } from '@/components/planner/TaskCard';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { EveningPrompt } from '@/components/planner/EveningPrompt';
import { MissedAlarmsPanel } from '@/components/planner/MissedAlarmsPanel';
import { InAppAlarm } from '@/components/planner/InAppAlarm';
import { sendNotification } from '@/lib/alarms';
import { exportTasksToICS } from '@/lib/icsExport';
import { PageWrapper } from '@/components/layout/PageWrapper';

export function Planner() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [missedTasks, setMissedTasks] = useState<Task[]>([]);

  const loadTasks = async (d: Date) => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`/tasks?date=${format(d, 'yyyy-MM-dd')}`);
      setTasks(data);
    } catch (e) {
      toast('Failed to load tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(date);
  }, [date]);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTime = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;

      const uncompleted = tasks.filter((t) => !t.completed && t.start_time);
      const missed = [];

      for (const t of uncompleted) {
        if (t.start_time === currentTime && t.alarm_enabled !== false) {
          setActiveAlarmTask(t);
          sendNotification(`Task: ${t.title}`, { body: "It's time to start!" });
        } else if (t.start_time && t.start_time < currentTime && t.alarm_enabled !== false) {
          missed.push(t);
        }
      }
      if (missedTasks.length === 0 && missed.length > 0 && isToday(date)) {
        setMissedTasks(missed);
      }
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [tasks, date]);

  const handleToggleComplete = async (id: number, currentCompleted: boolean) => {
    const targetTask = tasks.find((t) => t.id === id);
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t)));
    
    if (!currentCompleted && targetTask) {
      toast(`Completed "${targetTask.title}"`, 'success', () => handleToggleComplete(id, true));
    }

    try {
      await fetchWithAuth(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !currentCompleted })
      });
    } catch (e) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: currentCompleted } : t)));
      toast('Failed to update task', 'error');
    }
  };

  const copyYesterday = async () => {
    try {
      const res = await fetchWithAuth(`/tasks/copy?date=${format(date, 'yyyy-MM-dd')}`, {
        method: 'POST'
      });
      toast(`Copied ${res.copied} tasks from yesterday`, 'success');
      loadTasks(date);
    } catch (e) {
      toast('Failed to copy tasks', 'error');
    }
  };

  const handleICSExport = () => {
    if (tasks.length === 0) {
      toast('No tasks to export for this date', 'error');
      return;
    }
    const dateStr = format(date, 'yyyy-MM-dd');
    exportTasksToICS(tasks, dateStr);
    toast(`.ics calendar file exported!`, 'success');
  };

  const applyPresetTemplate = async () => {
    const defaultTemplateTasks = [
      { title: 'Morning Fitness & Meditation', start_time: '07:30', category: 'Health', priority: 1 },
      { title: 'LeetCode Problem Solving Block', start_time: '09:30', category: 'DSA', priority: 2 },
      { title: 'Core Project Development Sprint', start_time: '14:00', category: 'Project', priority: 2 },
      { title: 'Tech Article & Book Reading', start_time: '21:00', category: 'Study', priority: 0 }
    ];

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      for (const t of defaultTemplateTasks) {
        await fetchWithAuth('/tasks', {
          method: 'POST',
          body: JSON.stringify({ ...t, date: dateStr, completed: false })
        });
      }
      toast('Applied Daily Focus Template!', 'success');
      loadTasks(date);
    } catch (e) {
      toast('Failed to apply template', 'error');
    }
  };

  const progress = tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0;
  const isPlanTomorrow = isTomorrow(date);

  return (
    <PageWrapper
      className={cn(
        'space-y-6 pb-28 transition-colors duration-300 rounded-[24px] p-2 md:p-4',
        isPlanTomorrow && 'bg-[#0F0E17] text-white shadow-2xl border border-primary/20 p-6'
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-extrabold text-text tracking-tight">
          {isPlanTomorrow ? 'Plan Tomorrow ✨' : 'Planner'}
        </h1>
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('list')}
            className={cn('rounded-lg h-8 px-3 text-xs font-semibold', view === 'list' && 'bg-surface text-primary shadow-sm')}
            title="List View"
          >
            <List size={16} className="mr-1" />
            <span>List</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('timeline')}
            className={cn('rounded-lg h-8 px-3 text-xs font-semibold', view === 'timeline' && 'bg-surface text-primary shadow-sm')}
            title="Timeline View"
          >
            <Clock size={16} className="mr-1" />
            <span>Timeline</span>
          </Button>
        </div>
      </div>

      <EveningPrompt date={date} onPlanTomorrow={() => setDate(addDays(new Date(), 1))} />
      <MissedAlarmsPanel missedTasks={missedTasks} onDismiss={() => setMissedTasks([])} />

      <WeekStrip selectedDate={date} onSelectDate={setDate} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-[20px] border border-border/60 shadow-soft gap-4">
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={60} strokeWidth={6} />
          <div>
            <p className="font-bold text-text text-base">Daily Progress</p>
            <p className="text-xs text-text-muted font-medium tabular-nums">
              {tasks.filter((t) => t.completed).length} of {tasks.length} completed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={applyPresetTemplate}
            className="flex items-center gap-1.5 text-xs font-semibold"
            title="Apply preset task template"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Template</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleICSExport}
            className="flex items-center gap-1.5 text-xs font-semibold"
            title="Export tasks to .ics calendar file"
          >
            <Calendar size={14} className="text-primary" />
            <span>Export .ics</span>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={copyYesterday}
            title="Copy uncompleted from yesterday"
          >
            <Copy size={16} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-[20px]" />
          <Skeleton className="h-20 w-full rounded-[20px]" />
          <Skeleton className="h-20 w-full rounded-[20px]" />
        </div>
      ) : view === 'list' ? (
        <ListView tasks={tasks} onToggleComplete={handleToggleComplete} />
      ) : (
        <TimelineView tasks={tasks} onToggleComplete={handleToggleComplete} date={date} />
      )}

      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-30">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 border-2 border-white/20 active:scale-95" onClick={() => setIsAddOpen(true)}>
          <Plus size={26} />
        </Button>
      </div>

      <QuickAddSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        date={date}
        onTaskAdded={(task: Task) =>
          setTasks((ts) => [...ts, task].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')))
        }
      />

      <InAppAlarm
        activeTask={activeAlarmTask}
        onDismiss={() => setActiveAlarmTask(null)}
        onMarkDone={(id) => handleToggleComplete(id, false)}
      />
    </PageWrapper>
  );
}

