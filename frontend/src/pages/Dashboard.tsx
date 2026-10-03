import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bell, Flame, CheckCircle2, Circle, Target, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { AvatarMascot } from '@/components/avatar/AvatarMascot';
import { useAvatarTrigger } from '@/components/avatar/useAvatarTrigger';
import { MilestoneModal } from '@/components/avatar/MilestoneModal';
import { AvatarWidget } from '@/components/avatar/AvatarWidget';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  getTasks,
  updateTask,
  getStatsOverview,
  getGoals,
  getReminders
} from '@/lib/api';
import type { Task, StatsOverview, Goal, Reminder } from '@/lib/api';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Milestone Celebration Modal State
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneInfo, setMilestoneInfo] = useState({ title: '', subtitle: '', streakCount: undefined as number | undefined });

  // Avatar Trigger Engine
  const { mood, message, refreshAvatarMessage, triggerTaskComplete, triggerAllCompleted } = useAvatarTrigger();



  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  const isAfter6PM = new Date().getHours() >= 18;

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tData, sData, gData, rData] = await Promise.all([
        getTasks(todayStr),
        getStatsOverview(),
        getGoals(),
        getReminders()
      ]);
      setTasks(tData);
      setStats(sData);
      setGoals(gData);
      setReminders(rData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute Task Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const nextUpTask = tasks.find((t) => !t.completed);
  const mainGoal = goals.find((g) => !g.completed) || goals[0];

  // Toggle Task Completion directly from Dashboard
  const handleToggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    try {
      const updated = await updateTask(task.id, { completed: updatedStatus });
      const newTasks = tasks.map((t) => (t.id === task.id ? updated : t));
      setTasks(newTasks);

      if (updatedStatus) {
        triggerTaskComplete(task.title);

        const newCompletedCount = newTasks.filter((t) => t.completed).length;
        if (newCompletedCount === newTasks.length && newTasks.length > 0) {
          triggerAllCompleted();
          setMilestoneInfo({
            title: '100% Day Completed! 🌟',
            subtitle: 'You completed all planned tasks for today. Outstanding consistency, Haripriya!',
            streakCount: stats?.login_current_streak || 1
          });
          setMilestoneOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper className="space-y-6 pb-12">
        <Skeleton className="h-44 w-full rounded-[24px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-2 rounded-[20px]" />
          <Skeleton className="h-48 rounded-[20px]" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-6 pb-12">
      {/* Floating Global Avatar Widget */}
      <AvatarWidget
        mood={mood}
        message={message}
        onRefreshMessage={refreshAvatarMessage}
      />

      {/* Streak / All Completed Celebration Modal */}
      <MilestoneModal
        isOpen={milestoneOpen}
        onClose={() => setMilestoneOpen(false)}
        title={milestoneInfo.title}
        subtitle={milestoneInfo.subtitle}
        streakCount={milestoneInfo.streakCount}
      />

      {/* Hero Welcome Banner with Mascot */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="bg-gradient-to-br from-[#6C5CE7] via-[#7B61FF] to-[#9B8CFF] text-white p-6 md:p-8 border-none shadow-xl shadow-primary/20 relative overflow-hidden rounded-[24px]">
            {/* Background sparkle accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-2 max-w-lg">
                <p className="text-white/80 font-semibold text-xs md:text-sm tracking-wide uppercase">{dateFormatted}</p>
                <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-tight">
                  Ready to forge, Haripriya?
                </h1>
                <p className="text-white/95 text-sm md:text-base italic font-light pt-1">
                  "{message}"
                </p>
              </div>

              {/* Animated Interactive Avatar */}
              <div className="hidden sm:block flex-shrink-0 bg-white/15 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                <AvatarMascot
                  mood={mood}
                  size={80}
                  onClick={refreshAvatarMessage}
                />
              </div>
            </div>
          </Card>


          {/* Plan Tomorrow Banner (Visible after 6 PM) */}
          {isAfter6PM && (
            <Card className="p-5 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-surface border border-primary/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text">Plan Tomorrow while it's fresh ✨</h3>
                  <p className="text-xs text-text-muted">Set up your priority timetable before unwinding for the night.</p>
                </div>
              </div>
              <Button asChild size="sm" variant="primary">
                <a href="/planner">Plan Tomorrow</a>
              </Button>
            </Card>
          )}

          {/* Today's Progress Section */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-display font-bold text-text">Today's Progress</h2>
            <span className="text-xs font-semibold text-text-muted tabular-nums">
              {completedTasks} of {totalTasks} tasks done
            </span>
          </div>

          <Card className="flex flex-col sm:flex-row items-center p-6 gap-6 bg-surface border border-border/80 shadow-soft">
            <ProgressRing progress={progressPct} size={110} strokeWidth={9} />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-lg text-text">
                  {progressPct === 100
                    ? 'All Done for Today! 🎉'
                    : progressPct >= 50
                    ? "You're on track!"
                    : totalTasks === 0
                    ? 'No tasks scheduled'
                    : 'Get the momentum started!'}
                </h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                {progressPct === 100
                  ? 'Fantastic work completing every planned task. Enjoy your evening!'
                  : `${totalTasks - completedTasks} task${totalTasks - completedTasks === 1 ? '' : 's'} remaining today.`}
              </p>
              {nextUpTask && (
                <Button
                  size="sm"
                  className="mt-2 font-medium"
                  onClick={() => handleToggleTask(nextUpTask)}
                >
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Complete Next: {nextUpTask.title}
                </Button>
              )}
            </div>
          </Card>

          {/* Next Up Task Card */}
          <h2 className="text-xl font-display font-bold mt-6 text-text">Next Up</h2>
          {nextUpTask ? (
            <Card className="p-5 flex items-center justify-between gap-4 border-l-4 border-l-primary hover:border-l-primary/80 transition-all shadow-soft">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full tabular-nums">
                    {nextUpTask.start_time || 'Scheduled'}
                  </span>
                  <Chip variant="dsa">{nextUpTask.category}</Chip>
                </div>
                <h3 className="font-bold text-lg text-text pt-1">{nextUpTask.title}</h3>
                {nextUpTask.notes && (
                  <p className="text-xs text-text-muted line-clamp-1">{nextUpTask.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleToggleTask(nextUpTask)}
                className="w-10 h-10 rounded-full border-2 border-primary/40 hover:border-primary flex items-center justify-center text-primary transition-all hover:bg-primary/10 active:scale-95"
                title="Mark task completed"
              >
                <Circle size={22} />
              </button>
            </Card>
          ) : (
            <Card className="p-6 text-center text-text-muted border-dashed border-2 border-border/60">
              <p className="font-semibold text-sm text-text">No pending tasks for today! ✨</p>
              <p className="text-xs mt-1">Use the Planner page to add or plan tasks for tomorrow.</p>
            </Card>
          )}

          {/* Main Goal Strip */}
          {mainGoal && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-text">Main Focus Goal</h2>
                <a href="/goals" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                  <span>View All</span>
                  <ArrowRight size={13} />
                </a>
              </div>
              <Card className="p-5 bg-surface-2/60 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <h3 className="font-bold text-base text-text">{mainGoal.title}</h3>
                  </div>
                  {mainGoal.description && (
                    <p className="text-xs text-text-muted">{mainGoal.description}</p>
                  )}
                </div>
                <div className="w-full sm:w-48 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-primary tabular-nums">{mainGoal.progress_percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[#9B8CFF] transition-all duration-500"
                      style={{ width: `${mainGoal.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar: Top Streaks & Upcoming Reminders */}
        <div className="w-full md:w-80 space-y-6">
          {/* Top Streaks */}
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold text-text">Top Streaks</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="flex flex-col items-center justify-center p-4 text-center border border-flame/30 bg-flame/5">
                <Flame className="text-flame mb-1 animate-pulse" size={28} />
                <span className="font-extrabold text-2xl font-display text-text tabular-nums">
                  {stats?.login_current_streak || 0}
                </span>
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                  Login Streak
                </span>
              </Card>

              {stats?.habits && stats.habits.length > 0 ? (
                <Card className="flex flex-col items-center justify-center p-4 text-center border border-flame/30 bg-flame/5">
                  <Flame className="text-flame mb-1" size={28} />
                  <span className="font-extrabold text-2xl font-display text-text tabular-nums">
                    {stats.habits[0].current_streak}
                  </span>
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5 line-clamp-1">
                    {stats.habits[0].name}
                  </span>
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center p-4 text-center border border-border/60">
                  <Sparkles className="text-amber-500 mb-1" size={28} />
                  <span className="font-bold text-lg font-display text-text">Active</span>
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                    Daily Habit
                  </span>
                </Card>
              )}
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-text">Upcoming</h2>
              <a href="/reminders" className="text-xs font-semibold text-primary hover:underline">
                View
              </a>
            </div>

            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.slice(0, 3).map((r) => (
                  <Card key={r.id} className="p-4 flex items-start gap-3 border-l-2 border-l-amber-500 shadow-soft">
                    <div className="mt-0.5 text-amber-500">
                      <Bell size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-text leading-tight">{r.title}</h4>
                      <p className="text-xs text-text-muted tabular-nums">{r.due_date} {r.due_time || ''}</p>
                      <Chip variant="warning" className="text-[10px] py-0.5 px-2">
                        {r.category}
                      </Chip>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-5 text-center text-text-muted text-xs border-dashed border">
                No upcoming reminders scheduled.
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

