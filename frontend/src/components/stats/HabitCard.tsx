import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Flame, ChevronDown, ChevronUp, Trash2, Award } from 'lucide-react';
import { type HabitStats, getHabitStats, deleteHabit } from '@/lib/api';
import { Heatmap } from './Heatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    category: string;
    target_days: number;
    current_streak: number;
    longest_streak: number;
    completion_rate_30: number;
  };
  onDelete?: () => void;
}

export function HabitCard({ habit, onDelete }: HabitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && !stats) {
      setLoading(true);
      getHabitStats(habit.id)
        .then((data) => setStats(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [expanded, habit.id, stats]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      try {
        await deleteHabit(habit.id);
        onDelete?.();
      } catch (err) {
        console.error('Failed to delete habit:', err);
      }
    }
  };

  return (
    <Card className="p-5 transition-all hover:border-primary/50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-lg">{habit.name}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-3 text-text-muted font-medium">
              {habit.category}
            </span>
          </div>
          <p className="text-xs text-text-muted">Target: {habit.target_days} days / week</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-flame font-bold text-lg">
            <Flame size={20} className="fill-flame" />
            <span>{habit.current_streak}d</span>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-text-muted">30-Day Rate</span>
            <p className="font-semibold text-success">{habit.completion_rate_30}%</p>
          </div>

          <button
            onClick={handleDelete}
            className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors"
            title="Delete Habit"
          >
            <Trash2 size={16} />
          </button>

          <button className="p-1.5 text-text-muted hover:text-text rounded-lg">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-3 h-1.5 rounded-full mt-4 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(habit.completion_rate_30, 100)}%` }}
        />
      </div>

      {/* Expanded Stats Section */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-border space-y-6 animate-in fade-in duration-200">
          {loading ? (
            <div className="text-center py-6 text-text-muted text-sm">Loading stats...</div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-surface-2 p-3 rounded-xl">
                  <span className="text-xs text-text-muted uppercase font-medium">Current Streak</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-flame font-bold text-xl">
                    <Flame size={20} className="fill-flame" />
                    <span>{stats.current_streak} days</span>
                  </div>
                </div>
                <div className="bg-surface-2 p-3 rounded-xl">
                  <span className="text-xs text-text-muted uppercase font-medium">Longest Streak</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-primary font-bold text-xl">
                    <Award size={20} />
                    <span>{stats.longest_streak} days</span>
                  </div>
                </div>
                <div className="bg-surface-2 p-3 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-xs text-text-muted uppercase font-medium">30-Day Completion</span>
                  <div className="mt-1 text-success font-bold text-xl">
                    {stats.completion_rate_30}%
                  </div>
                </div>
              </div>

              {/* 60-Day Heatmap */}
              <div className="bg-surface-2 p-4 rounded-xl">
                <Heatmap data={stats.heatmap} title="60-Day Habit Heatmap" />
              </div>

              {/* Weekly Bar Chart */}
              <div className="bg-surface-2 p-4 rounded-xl space-y-2">
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                  Last 7 Days Activity
                </h4>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weekly_data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis domain={[0, 1]} ticks={[0, 1]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', borderRadius: '8px', border: 'none' }}
                        formatter={(val: any) => [val === 1 ? 'Completed' : 'Missed', 'Status']}
                      />
                      <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                        {stats.weekly_data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.completed === 1 ? '#22c55e' : '#334155'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </Card>
  );
}
