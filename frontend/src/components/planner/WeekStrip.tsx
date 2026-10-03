import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 15 days around selected date
  const days = Array.from({ length: 15 }).map((_, i) => subDays(selectedDate, 7 - i));
  days.reverse();

  useEffect(() => {
    if (containerRef.current) {
      const childWidth = 64 + 8;
      const centerOffset = (childWidth * 7) - (containerRef.current.clientWidth / 2) + (childWidth / 2);
      containerRef.current.scrollTo({ left: centerOffset, behavior: 'smooth' });
    }
  }, [selectedDate]);

  return (
    <div 
      ref={containerRef}
      className="flex overflow-x-auto py-2 -mx-4 px-4 gap-2.5 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[4.25rem] h-18 py-2.5 rounded-2xl transition-all duration-200 shrink-0 border border-transparent shadow-sm active:scale-95',
              isSelected
                ? 'bg-gradient-to-b from-[#6C5CE7] to-[#8B7CFF] text-white shadow-md shadow-primary/25 border-white/20'
                : 'bg-surface-2/80 text-text hover:bg-surface-2 border-border/40 dark:bg-surface-2'
            )}
          >
            <span className={cn('text-[11px] font-bold uppercase tracking-wider', isSelected ? 'text-white/80' : 'text-text-muted')}>
              {format(day, 'EEE')}
            </span>
            <span className="text-xl font-extrabold font-display tabular-nums tracking-tight">
              {format(day, 'd')}
            </span>
            {isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

