import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Circle, Plus, Trash2, ChevronDown, ChevronUp, Calendar, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Goal } from '@/lib/api';
import { toggleMilestone, addMilestone, deleteMilestone, updateGoal, deleteGoal } from '@/lib/api';

interface GoalCardProps {
  goal: Goal;
  onRefresh: () => void;
}

export function GoalCard({ goal, onRefresh }: GoalCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleToggleMilestone = async (milestoneId: number) => {
    try {
      await toggleMilestone(milestoneId);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setAddingMilestone(true);
    try {
      await addMilestone(goal.id, { title: newMilestoneTitle.trim() });
      setNewMilestoneTitle('');
      onRefresh();
    } catch (err) {
      console.error('Failed to add milestone:', err);
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    try {
      await deleteMilestone(milestoneId);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  const handleToggleGoalCompleted = async () => {
    setLoadingAction(true);
    try {
      await updateGoal(goal.id, { completed: !goal.completed });
      onRefresh();
    } catch (err) {
      console.error('Failed to update goal:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm(`Are you sure you want to delete goal "${goal.title}"?`)) return;
    setLoadingAction(true);
    try {
      await deleteGoal(goal.id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const goalColor = goal.color || '#6C5CE7';

  return (
    <Card className={`p-6 border-l-4 transition-all ${goal.completed ? 'opacity-75 bg-surface/60' : ''}`} style={{ borderLeftColor: goalColor }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1 pr-4">
          <div className="flex items-center gap-2">
            <Chip variant="primary" style={{ backgroundColor: `${goalColor}20`, color: goalColor, borderColor: `${goalColor}40` }}>
              {goal.category}
            </Chip>
            {goal.completed && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                Completed
              </span>
            )}
          </div>
          <h3 className={`text-xl font-display font-bold text-text ${goal.completed ? 'line-through text-text-muted' : ''}`}>
            {goal.title}
          </h3>
          {goal.description && <p className="text-sm text-text-muted">{goal.description}</p>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleGoalCompleted}
            disabled={loadingAction}
            title={goal.completed ? 'Mark as active' : 'Mark as completed'}
            className="p-2 rounded-xl text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          >
            <CheckCircle2 size={20} className={goal.completed ? 'text-emerald-500 fill-emerald-500/20' : ''} />
          </button>
          <button
            onClick={handleDeleteGoal}
            disabled={loadingAction}
            title="Delete goal"
            className="p-2 rounded-xl text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Progress & Timeline */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-xs font-semibold text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            Day {goal.days_elapsed} of {goal.days_total}
          </span>
          <span style={{ color: goalColor }}>{goal.progress_percentage}% Completed</span>
        </div>
        <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: goalColor }}
          />
        </div>
      </div>

      {/* Linked Habits */}
      {goal.linked_habits && goal.linked_habits.length > 0 && (
        <div className="mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            <Zap size={13} className="text-amber-500" />
            Linked Habits
          </div>
          <div className="flex flex-wrap gap-2">
            {goal.linked_habits.map((habit) => (
              <Chip key={habit.id} variant="default" className="text-xs">
                {habit.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Accordion */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-bold text-text hover:text-primary transition-colors"
          >
            <Target size={16} style={{ color: goalColor }} />
            <span>Milestones ({goal.milestones ? goal.milestones.filter((m) => m.completed).length : 0}/{goal.milestones?.length || 0})</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {goal.milestones && goal.milestones.length > 0 ? (
                goal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 transition-colors text-sm group"
                  >
                    <button
                      onClick={() => handleToggleMilestone(milestone.id)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-text-muted shrink-0 group-hover:text-primary transition-colors" />
                      )}
                      <span className={`truncate ${milestone.completed ? 'line-through text-text-muted' : 'text-text font-medium'}`}>
                        {milestone.title}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-rose-500 transition-all rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted italic py-1">No milestones added yet.</p>
              )}

              {/* Add Milestone Inline Form */}
              <form onSubmit={handleAddMilestone} className="flex gap-2 pt-2">
                <Input
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="Add a new milestone checkpoint..."
                  className="text-xs py-1.5 h-8"
                />
                <Button type="submit" size="sm" variant="secondary" disabled={addingMilestone || !newMilestoneTitle.trim()} className="h-8 text-xs shrink-0">
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
