import { useState, useEffect } from 'react';
import { Sheet } from '../ui/Sheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { fetchWithAuth } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from '../ui/Toast';
import { Clock, Calendar, Bell } from 'lucide-react';

export function QuickAddSheet({ isOpen, onClose, date, onTaskAdded }: any) {
  const [title, setTitle] = useState('');
  const [taskDate, setTaskDate] = useState(format(date || new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('DSA');
  const [notes, setNotes] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['DSA', 'Study', 'Health', 'Project', 'Personal', 'Other'];

  useEffect(() => {
    if (date) {
      setTaskDate(format(date, 'yyyy-MM-dd'));
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Please enter a task title', 'error');
      return;
    }
    setIsSubmitting(true);

    try {
      const newTask = {
        title: title.trim(),
        date: taskDate,
        start_time: startTime || '09:00',
        end_time: endTime || '10:00',
        category,
        notes: notes.trim() || undefined,
        alarm_enabled: alarmEnabled,
        alarm_offset_min: alarmEnabled ? 0 : 0,
        completed: false
      };

      const added = await fetchWithAuth('/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask)
      });

      if (onTaskAdded) {
        onTaskAdded(added);
      }
      
      setTitle('');
      setNotes('');
      onClose();
      toast('Task created successfully!', 'success');
    } catch (err) {
      console.error('Failed to create task:', err);
      toast('Failed to create task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Task Title
          </label>
          <Input
            autoFocus
            placeholder='e.g., "Solve 2 LeetCode Mediums"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Timeline Fields: Date, Start Time & End Time */}
        <div className="space-y-3 p-3 rounded-2xl bg-surface-2 dark:bg-surface-elevated border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Clock size={14} />
            <span>Schedule Timeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1 flex items-center gap-1">
                <Calendar size={12} />
                Date
              </label>
              <Input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat} onClick={() => setCategory(cat)} className="cursor-pointer">
                <Chip variant={category === cat ? (cat.toLowerCase() as any) : 'default'}>
                  {cat}
                </Chip>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Notes / Details (Optional)
          </label>
          <Input
            placeholder="Add links, problem names, or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Alarm Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 dark:bg-surface border border-border/40">
          <div className="flex items-center gap-2">
            <Bell size={16} className={alarmEnabled ? 'text-primary' : 'text-text-muted'} />
            <span className="text-xs font-semibold text-text">Enable Start Time Alarm</span>
          </div>
          <input
            type="checkbox"
            checked={alarmEnabled}
            onChange={(e) => setAlarmEnabled(e.target.checked)}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="font-bold min-w-[120px]">
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
