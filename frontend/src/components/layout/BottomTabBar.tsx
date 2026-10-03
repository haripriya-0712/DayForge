import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, Bell, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';

const TABS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Stats', path: '/stats', icon: BarChart2 },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Goals', path: '/goals', icon: Target },
];

interface BottomTabBarProps {
  className?: string;
  onNewTask?: () => void;
}

export function BottomTabBar({ className, onNewTask }: BottomTabBarProps) {
  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-surface/90 backdrop-blur-xl pb-safe shadow-lg', className)}>
      <div className="flex h-16 items-center justify-around px-2 relative">
        {TABS.slice(0, 2).map((tab) => (
          <TabItem key={tab.name} {...tab} />
        ))}
        
        <div className="relative -top-5">
          <Button
            size="icon"
            onClick={onNewTask}
            className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 border-4 border-bg active:scale-95 transition-transform"
          >
            <Plus size={26} />
          </Button>
        </div>

        {TABS.slice(2, 5).map((tab) => (
          <TabItem key={tab.name} {...tab} />
        ))}
      </div>
    </div>
  );
}

function TabItem({ name, path, icon: Icon }: any) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center min-w-[48px] gap-1 transition-all duration-150',
          isActive ? 'text-primary font-semibold scale-105' : 'text-text-muted hover:text-text'
        )
      }
    >
      <Icon size={22} strokeWidth={2.2} />
      <span className="text-[10px] tracking-tight font-medium">{name}</span>
    </NavLink>
  );
}

