import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }} {...props}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          className="stroke-surface-2"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="stroke-success transition-all duration-500 ease-out"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-display tabular-nums">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
