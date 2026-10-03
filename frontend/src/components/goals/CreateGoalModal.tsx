import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createGoal } from '@/lib/api';
import { Calendar, Clock } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COLORS = ['#6C5CE7', '#2FBF8F', '#E84393', '#00CEC9', '#FF7675', '#FDCB6E'];

export function CreateGoalModal({ isOpen, onClose, onSuccess }: CreateGoalModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTargetStr = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState(defaultTargetStr);
  const [activePreset, setActivePreset] = useState<number | null>(3);
  const [color, setColor] = useState('#6C5CE7');
  const [loading, setLoading] = useState(false);

  const applyTimelinePreset = (months: number) => {
    setActivePreset(months);
    const start = new Date(startDate);
    const target = new Date(start);
    target.setMonth(target.getMonth() + months);
    setTargetDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        start_date: startDate,
        target_date: targetDate,
        color,
      });
      setTitle('');
      setDescription('');
      setCategory('Career');
      setStartDate(todayStr);
      setTargetDate(defaultTargetStr);
      setColor('#6C5CE7');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Create New Goal">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Goal Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Land Senior Software Engineer Offer"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Why It Matters / Description (Optional)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this end goal important to you?"
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
              {['Career', 'Health', 'Financial', 'Personal', 'Learning', 'Other'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Color Accent
            </label>
            <div className="flex items-center gap-1.5 pt-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Quick Presets & Date Pickers */}
        <div className="p-3.5 rounded-2xl bg-surface-2 dark:bg-surface-elevated border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Clock size={14} />
              <span>Goal Timeline & Duration</span>
            </div>
            <span className="text-[11px] text-text-muted">Quick Presets</span>
          </div>

          {/* Preset Buttons: 1m, 3m, 6m, 12m */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '1 Month', months: 1 },
              { label: '3 Months', months: 3 },
              { label: '6 Months', months: 6 },
              { label: '1 Year', months: 12 }
            ].map((p) => (
              <button
                key={p.months}
                type="button"
                onClick={() => applyTimelinePreset(p.months)}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  activePreset === p.months
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-2 border-border text-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1 flex items-center gap-1">
                <Calendar size={12} />
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset(null);
                }}
                className="text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1 flex items-center gap-1">
                <Calendar size={12} />
                Target Date
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  setActivePreset(null);
                }}
                className="text-xs"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="font-bold min-w-[120px]">
            {loading ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
