import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[14px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none',
          {
            'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25': variant === 'primary',
            'bg-surface-2 text-text hover:bg-surface-2/80 border border-border/40': variant === 'secondary',
            'hover:bg-surface-2 text-text': variant === 'ghost',
            'bg-danger text-white hover:bg-danger/95 shadow-md shadow-danger/20': variant === 'danger',
            'border border-border bg-transparent text-text hover:bg-surface-2': variant === 'outline',
            'min-h-[44px] h-11 px-5 py-2.5': size === 'md',
            'min-h-[36px] h-9 px-3.5 text-xs font-medium rounded-xl': size === 'sm',
            'min-h-[48px] h-12 px-7 text-base rounded-2xl': size === 'lg',
            'min-h-[44px] h-11 w-11 p-0 rounded-xl': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

