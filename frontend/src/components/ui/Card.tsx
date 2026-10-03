import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'gradient';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[20px] transition-all duration-200',
          variant === 'default' &&
            'bg-surface p-5 shadow-[0_1px_3px_rgba(20,16,50,0.04),0_8px_24px_rgba(20,16,50,0.06)] border border-border/50 dark:border-border dark:shadow-none',
          variant === 'flat' &&
            'bg-surface-2 p-5 border border-border/40 dark:bg-surface-2 dark:border-border/60',
          variant === 'gradient' &&
            'bg-gradient-to-br from-[#6C5CE7] to-[#8B7CFF] text-white p-6 shadow-xl shadow-primary/20 border border-white/10',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export { Card };

