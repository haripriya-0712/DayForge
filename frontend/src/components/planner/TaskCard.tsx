import { type HTMLAttributes } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Chip } from '../ui/Chip';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils';


export interface Task {
  id: number;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  priority: number;
  completed: boolean;
  notes?: string;
  habit_id?: number | null;
  alarm_enabled?: boolean;
  alarm_offset_min?: number;
}

interface TaskCardProps extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  onToggleComplete: (id: number, currentCompleted: boolean) => void;
  onDelete?: (id: number) => void;
}

export function TaskCard({ task, onToggleComplete, onDelete, className, ...props }: TaskCardProps) {
  const controls = useAnimation();
  
  const handleToggle = async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    
    await controls.start({ scale: 1.2, transition: { duration: 0.12 } });
    controls.start({ scale: 1, transition: { duration: 0.12 } });
    
    onToggleComplete(task.id, task.completed);
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      DSA: 'bg-[#6C5CE7]',
      Health: 'bg-[#2FBF8F]',
      Project: 'bg-[#F5A524]',
      Study: 'bg-[#3B82F6]',
      Personal: 'bg-[#EC6FB3]',
      Other: 'bg-[#8E8AA8]'
    };
    return colors[cat] || colors.Other;
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -80, right: 80 }}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x > 60) {
          handleToggle();
        } else if (info.offset.x < -60 && onDelete) {
          onDelete(task.id);
        }
      }}
      className="relative touch-pan-y"
    >
      <Card 
        className={cn(
          'p-4 flex items-center gap-4 relative overflow-hidden transition-all duration-200 border-l-4 shadow-soft hover:shadow-md cursor-pointer select-none',
          task.completed ? 'opacity-65 bg-surface-2/50 dark:bg-surface/40' : 'bg-surface',
          className
        )} 
        {...props}
      >
        <div className={cn('absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full', getCategoryColor(task.category))} />
        
        <div className="flex-1 min-w-0 pl-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {task.start_time && (
              <span className="text-xs font-semibold text-text-muted tabular-nums">
                {task.start_time}{task.end_time ? ` – ${task.end_time}` : ''}
              </span>
            )}
            <Chip variant={task.category.toLowerCase() as any}>{task.category}</Chip>
            {task.habit_id && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-flame bg-flame/10 px-2 py-0.5 rounded-full">
                <Flame size={12} className="fill-flame" /> Habit
              </span>
            )}
          </div>
          <h3 className={cn('font-bold text-base md:text-lg tracking-tight truncate', task.completed && 'line-through text-text-muted')}>
            {task.title}
          </h3>
        </div>
        
        <motion.button 
          animate={controls}
          onClick={handleToggle}
          aria-label={task.completed ? "Mark uncompleted" : "Mark completed"}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90',
            task.completed ? 'bg-success border-success text-white shadow-sm' : 'border-border/80 bg-surface-2 hover:border-primary'
          )}
        >
          {task.completed && (
            <motion.svg 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-4 h-4 text-white stroke-[3]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.button>
      </Card>
    </motion.div>
  );
}

