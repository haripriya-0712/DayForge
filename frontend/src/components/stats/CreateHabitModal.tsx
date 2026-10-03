import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createHabit } from '@/lib/api';
import { Calendar, Clock } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateHabitModal({ isOpen, onClose, onSuccess }: CreateHabitModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');
  const [targetDays, setTargetDays] = useState(7);
  const [startDate, setStartDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createHabit({
        name: name.trim(),
        category,
        frequency_type: 'daily',
        target_days: targetDays,
        start_date: startDate,
        active: true,
      });
      setName('');
      setCategory('Health');
      setTargetDays(7);
      setStartDate(todayStr);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Create New Habit">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Habit Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 30 Minutes"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-2 dark:bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            >
              {['Health', 'DSA', 'Study', 'Project', 'Personal', 'Other'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} />
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs"
              required
            />
          </div>
        </div>

        {/* Frequency & Timeline Target */}
        <div className="p-3 rounded-2xl bg-surface-2 dark:bg-surface-elevated border border-border/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Clock size={14} />
            <span>Habit Schedule & Frequency</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-text-muted">Target Days per Week:</span>
              <span className="text-primary font-bold">{targetDays} days / week</span>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1 day/wk</span>
              <span>Daily (7 days)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="font-bold min-w-[120px]">
            {loading ? 'Creating...' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
