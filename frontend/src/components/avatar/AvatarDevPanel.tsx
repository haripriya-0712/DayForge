import { useState } from 'react';
import type { AvatarMood } from '@/lib/avatarMood';
import { Sparkles, X, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AvatarDevPanelProps {
  currentMood: AvatarMood;
  forcedMood: AvatarMood | null;
  onSetForcedMood: (mood: AvatarMood | null) => void;
}

const ALL_MOODS: { id: AvatarMood; label: string; emoji: string }[] = [
  { id: 'idle', label: 'Idle / Bobbing', emoji: '🦊' },
  { id: 'sleeping', label: 'Sleeping (Lying Down)', emoji: '😴' },
  { id: 'celebrating', label: 'Celebrating (Dance)', emoji: '💃' },
  { id: 'cheering', label: 'Cheering (>50%)', emoji: '🙌' },
  { id: 'encouraging', label: 'Encouraging (Late P.M.)', emoji: '💪' },
  { id: 'worried', label: 'Worried (Missed Alarm)', emoji: '😰' },
  { id: 'sleepy', label: 'Sleepy (Late Night)', emoji: '🌙' },
  { id: 'comeback', label: 'Comeback (Welcome Wave)', emoji: '👋' }
];

export function AvatarDevPanel({ currentMood, forcedMood, onSetForcedMood }: AvatarDevPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col items-end pointer-events-auto select-none">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated/90 border border-primary/40 text-primary text-xs font-bold shadow-lg backdrop-blur-md hover:bg-surface-2 transition-all active:scale-95"
          title="Open Mascot Dev Debug Panel"
        >
          <Bug size={14} />
          <span>Mascot Debug</span>
          {forcedMood && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
        </button>
      ) : (
        <div className="w-72 p-4 rounded-2xl bg-surface border border-primary/30 shadow-2xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles size={14} />
              <span>MASCOT MOOD ENGINE DEBUG</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-[11px] text-text-muted leading-tight">
            Active Mood: <strong className="text-text capitalize">{forcedMood || currentMood}</strong>
          </p>

          <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {ALL_MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSetForcedMood(forcedMood === m.id ? null : m.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  forcedMood === m.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-2/70 text-text hover:bg-surface-2'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </span>
                {forcedMood === m.id && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
              </button>
            ))}
          </div>

          {forcedMood && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetForcedMood(null)}
              className="w-full text-xs h-8"
            >
              Reset to Auto Mode
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
