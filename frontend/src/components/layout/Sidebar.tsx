import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, Bell, Target, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Stats', path: '/stats', icon: BarChart2 },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Goals', path: '/goals', icon: Target },
];

interface SidebarProps {
  className?: string;
  onNewTask?: () => void;
}

export function Sidebar({ className, onNewTask }: SidebarProps) {
  return (
    <aside className={cn('p-4 h-screen max-h-screen overflow-y-auto flex flex-col no-scrollbar', className)}>
      <div className="flex items-center gap-2 px-2 py-4 mb-2 flex-shrink-0">
        <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold">D</div>
        <span className="text-xl font-bold font-display tracking-tight">DayForge</span>
      </div>
      
      <div className="mb-4 flex-shrink-0">
        <Button onClick={onNewTask} className="w-full gap-2 shadow-md hover:shadow-lg transition-all" size="lg">
          <Plus size={20} />
          <span>New Task</span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary-soft text-primary font-semibold' : 'text-text-muted hover:bg-surface-2 hover:text-text'
              )
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-3 border-t border-border flex-shrink-0">
        <ThemeToggle />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-soft text-primary font-semibold' : 'text-text-muted hover:bg-surface-2 hover:text-text'
            )
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
