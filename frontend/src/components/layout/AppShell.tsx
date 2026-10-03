import { type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';
import { ToastContainer } from '../ui/Toast';
import { loginPing } from '@/lib/api';
import { QuickAddSheet } from '../planner/QuickAddSheet';
import { ThemeToggle } from './ThemeToggle';
import { Sparkles } from 'lucide-react';
import { AvatarWidget } from '../avatar/AvatarWidget';
import { AvatarDevPanel } from '../avatar/AvatarDevPanel';
import { useAvatarTrigger } from '../avatar/useAvatarTrigger';

export function AppShell({ children }: { children: ReactNode }) {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const location = useLocation();

  const {
    mood,
    message,
    quickActionLabel,
    quickActionPath,
    forcedMood,
    setForcedMood,
    refreshAvatarMessage
  } = useAvatarTrigger();

  useEffect(() => {
    loginPing();
  }, []);

  const isDashboard = location.pathname === '/';

  return (
    <div className="flex min-h-screen bg-bg text-text selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <Sidebar
        onNewTask={() => setIsNewTaskOpen(true)}
        className="hidden md:flex w-64 flex-col border-r border-border bg-surface fixed inset-y-0 left-0 shadow-sm z-20"
      />

      {/* Dev Debug Panel for Mascot Mood Preview */}
      <AvatarDevPanel
        currentMood={mood}
        forcedMood={forcedMood}
        onSetForcedMood={setForcedMood}
      />

      {/* Main Container */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Sticky Header with Blur */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-surface/85 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B7CFF] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/25">
              <Sparkles size={16} />
            </div>
            <span className="text-lg font-bold font-display tracking-tight text-text">DayForge</span>
          </div>
          <div className="w-auto">
            <ThemeToggle compact />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-32 md:pb-24 overflow-x-hidden">
          <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-6">{children}</div>
        </main>
      </div>

      {/* Floating Global Avatar Widget (Visible on non-dashboard pages or floating on mobile) */}
      {!isDashboard && (
        <AvatarWidget
          mood={mood}
          message={message}
          quickActionLabel={quickActionLabel}
          quickActionPath={quickActionPath}
          onRefreshMessage={refreshAvatarMessage}
        />
      )}

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar className="md:hidden" onNewTask={() => setIsNewTaskOpen(true)} />
      <ToastContainer />

      {/* Global Quick Add Task Sheet */}
      <QuickAddSheet
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        date={new Date()}
        onTaskAdded={() => {
          setIsNewTaskOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}


