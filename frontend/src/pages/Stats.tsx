import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Flame, Plus, ShieldCheck, Activity, Target } from 'lucide-react';
import { type StatsOverview, getStatsOverview } from '@/lib/api';
import { HabitCard } from '@/components/stats/HabitCard';
import { Heatmap } from '@/components/stats/Heatmap';
import { CreateHabitModal } from '@/components/stats/CreateHabitModal';
import { PageWrapper } from '@/components/layout/PageWrapper';

export function Stats() {
  const [activeTab, setActiveTab] = useState<'Habits' | 'Logins' | 'Summary'>('Habits');
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    getStatsOverview()
      .then((data) => setOverview(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageWrapper className="space-y-6 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-extrabold text-text tracking-tight">Stats & Analytics</h1>
        {activeTab === 'Habits' && (
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 shadow-sm">
            <Plus size={16} />
            <span>New Habit</span>
          </Button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex p-1 gap-1.5 bg-surface-2 rounded-2xl border border-border/40 max-w-md">
        {(['Habits', 'Logins', 'Summary'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-xl transition-all duration-150 select-none ${
              activeTab === tab
                ? 'bg-surface text-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-[20px]" />
            <Skeleton className="h-28 rounded-[20px]" />
          </div>
          <Skeleton className="h-64 rounded-[20px]" />
        </div>
      ) : !overview ? (
        <Card className="p-8 text-center text-text-muted">Failed to load statistics.</Card>
      ) : (
        <>
          {/* HABITS TAB */}
          {activeTab === 'Habits' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 text-center shadow-soft">
                  <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
                    Active Habits
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Target className="text-primary" size={24} />
                    <span className="text-3xl font-display font-extrabold tabular-nums text-text">{overview.total_active_habits}</span>
                  </div>
                </Card>

                <Card className="p-5 text-center shadow-soft">
                  <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
                    Avg 30-Day Completion
                  </p>
                  <div className="mt-2 text-3xl font-display font-extrabold text-success tabular-nums">
                    {overview.avg_habit_completion_30}%
                  </div>
                </Card>
              </div>

              {overview.habits.length === 0 ? (
                <EmptyState
                  emoji="🔥"
                  title="No habits created yet"
                  description="Build momentum by tracking your daily habits, study routines, and health consistency."
                  actionLabel="Create your first habit"
                  onAction={() => setIsModalOpen(true)}
                />
              ) : (
                <div className="space-y-4">
                  {overview.habits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} onDelete={loadData} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOGINS TAB */}
          {activeTab === 'Logins' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 text-center shadow-soft border border-flame/20 bg-flame/5">
                  <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
                    Current Login Streak
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Flame className="text-flame fill-flame animate-pulse" size={28} />
                    <span className="text-4xl font-display font-extrabold tabular-nums text-text">
                      {overview.login_current_streak} <span className="text-base font-normal text-text-muted">days</span>
                    </span>
                  </div>
                </Card>

                <Card className="p-5 text-center shadow-soft">
                  <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
                    Longest Login Streak
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <ShieldCheck className="text-primary" size={28} />
                    <span className="text-4xl font-display font-extrabold tabular-nums text-text">
                      {overview.login_longest_streak} <span className="text-base font-normal text-text-muted">days</span>
                    </span>
                  </div>
                </Card>
              </div>

              <Card className="p-6 shadow-soft">
                <h3 className="text-lg font-display font-bold text-text mb-4">Login Consistency (Last 60 Days)</h3>
                <Heatmap data={overview.login_heatmap} />
              </Card>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === 'Summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 flex items-center gap-4 shadow-soft">
                  <div className="p-3 bg-flame/10 text-flame rounded-2xl">
                    <Flame size={26} className="fill-flame" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Login Streak</p>
                    <p className="text-2xl font-extrabold font-display tabular-nums text-text">{overview.login_current_streak} days</p>
                  </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 shadow-soft">
                  <div className="p-3 bg-primary-soft text-primary rounded-2xl">
                    <Activity size={26} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Habits Tracked</p>
                    <p className="text-2xl font-extrabold font-display tabular-nums text-text">{overview.total_active_habits}</p>
                  </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 shadow-soft">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <Target size={26} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Avg 30-Day Rate</p>
                    <p className="text-2xl font-extrabold font-display text-success tabular-nums">
                      {overview.avg_habit_completion_30}%
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="p-6 space-y-4 shadow-soft">
                <h3 className="text-lg font-display font-bold text-text">Habit Performance Breakdown</h3>
                <div className="space-y-3">
                  {overview.habits.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3.5 bg-surface-2/70 rounded-2xl border border-border/40">
                      <div>
                        <p className="font-bold text-text text-sm">{h.name}</p>
                        <p className="text-xs text-text-muted">{h.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-success tabular-nums">{h.completion_rate_30}%</span>
                        <p className="text-xs text-text-muted font-medium tabular-nums">{h.current_streak}d streak</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Modal for creating a new habit */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </PageWrapper>
  );
}

