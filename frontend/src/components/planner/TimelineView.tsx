import { TaskCard } from './TaskCard';
import type { Task } from './TaskCard';
import { useEffect, useRef, useState } from 'react';
import { isToday } from 'date-fns';

export function TimelineView({ tasks, onToggleComplete, date }: { tasks: Task[], onToggleComplete: (id: number, currentCompleted: boolean) => void, date: Date }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowPercent = (currentHour * 60 + currentMinute) / (24 * 60) * 100;

  useEffect(() => {
    if (isToday(date) && scrollRef.current) {
      const targetScroll = (scrollRef.current.scrollHeight * nowPercent) / 100 - (scrollRef.current.clientHeight / 2);
      scrollRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [date, nowPercent]);

  return (
    <div ref={scrollRef} className="relative h-[60vh] overflow-y-auto no-scrollbar border-l border-border pl-4 space-y-8 mt-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="relative h-[64px] border-b border-border/50">
          <span className="absolute -left-12 -top-3 text-xs text-text-muted w-10 text-right">
            {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
          </span>
        </div>
      ))}

      {isToday(date) && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-primary z-10 flex items-center"
          style={{ top: `${nowPercent}%` }}
        >
          <div className="w-2 h-2 rounded-full bg-primary -ml-1 animate-pulse" />
        </div>
      )}

      {tasks.map(task => {
        if (!task.start_time) return null;
        const [sh, sm] = task.start_time.split(':').map(Number);
        const startPercent = (sh * 60 + sm) / (24 * 60) * 100;
        
        return (
          <div 
            key={task.id} 
            className="absolute left-4 right-0 px-2"
            style={{ top: `${startPercent}%` }}
          >
             <TaskCard task={task} onToggleComplete={onToggleComplete} className="shadow-lg shadow-black/5" />
          </div>
        );
      })}
    </div>
  );
}
