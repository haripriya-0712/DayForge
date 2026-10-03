import { useState, useEffect } from 'react';
import { Target, Plus, Flag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { getGoals, type Goal } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoalsData = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <PageWrapper className="space-y-8 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-text tracking-tight">Goals & Milestones</h1>
          <p className="text-text-muted text-sm mt-1">Track long-term aspirational targets & breakdown daily progress</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-md shadow-primary/20 self-start sm:self-auto">
          <Plus size={18} />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-[20px]" />
          <Skeleton className="h-48 w-full rounded-[20px]" />
        </div>
      ) : (
        <>
          {/* Active Goals Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-display font-bold text-text">
              <Flag size={20} className="text-primary" />
              <h2>Active Goals ({activeGoals.length})</h2>
            </div>

            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onRefresh={fetchGoalsData} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Target size={28} />}
                title="No active goals"
                description="Set ambitious targets to break down your habits and celebrate long-term achievements!"
                actionLabel="Create Your First Goal"
                onAction={() => setIsModalOpen(true)}
              />
            )}
          </section>

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-lg font-display font-bold text-text">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <h2>Completed Goals ({completedGoals.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onRefresh={fetchGoalsData} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Modal */}
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchGoalsData}
      />
    </PageWrapper>
  );
}

