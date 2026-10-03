import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'dsa' | 'study' | 'health' | 'project' | 'personal' | 'other' | 'warning' | 'danger';
  active?: boolean;
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'default', active = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-150 border',
          {
            'bg-surface-2 text-text border-border/50': variant === 'default' && !active,
            'bg-primary text-white border-primary shadow-sm': (variant === 'default' || variant === 'primary') && active,
            'bg-primary-soft text-primary border-primary/20': variant === 'primary' && !active,
            'bg-[#ECE9FD] text-[#6C5CE7] border-[#6C5CE7]/30 dark:bg-[#6C5CE7]/20 dark:text-[#8B7CFF]': variant === 'dsa',
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30': variant === 'study',
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30': variant === 'health',
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30': variant === 'project',
            'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30': variant === 'personal',
            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30': variant === 'other',
            'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/40': variant === 'warning',
            'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/25 dark:text-rose-300 dark:border-rose-500/40': variant === 'danger',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Chip.displayName = 'Chip';

export { Chip };

