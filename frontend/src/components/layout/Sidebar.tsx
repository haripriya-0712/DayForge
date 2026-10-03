import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, Bell, Target, Settings, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { logout } from '@/lib/api';

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
  const currentUser = localStorage.getItem('username') || 'User';

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
        {/* User Profile Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-2/60 rounded-xl mb-1 border border-border/50">
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-semibold text-xs uppercase">
            {currentUser.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text truncate capitalize">{currentUser}</p>
            <p className="text-[10px] text-text-muted truncate">Active Account</p>
          </div>
        </div>

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
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
