import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

interface HeatmapProps {
  data: { date: string; completed: boolean }[];
  title?: string;
  columns?: number;
}

export function Heatmap({ data, title }: HeatmapProps) {
  // Sort entries chronologically
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{title}</h3>}
      <div className="flex flex-wrap gap-1.5 justify-start items-center">
        {sortedData.map((item) => {
          const formattedDate = format(parseISO(item.date), 'MMM d, yyyy');
          return (
            <div
              key={item.date}
              title={`${formattedDate}: ${item.completed ? 'Completed' : 'Missed'}`}
              className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs transition-all duration-200 hover:scale-125 cursor-pointer ${
                item.completed
                  ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'bg-surface-3 hover:bg-surface-4'
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-text-muted pt-1 justify-end">
        <span>Missed</span>
        <div className="w-3 h-3 rounded-xs bg-surface-3" />
        <div className="w-3 h-3 rounded-xs bg-success" />
        <span>Completed</span>
      </div>
    </div>
  );
}
