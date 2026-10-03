import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarMascot } from './AvatarMascot';
import type { AvatarMood } from '@/lib/avatarMood';
import { X, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface AvatarWidgetProps {
  mood?: AvatarMood;
  message?: string;
  quickActionLabel?: string;
  quickActionPath?: string;
  onRefreshMessage?: () => void;
}

export function AvatarWidget({
  mood = 'idle',
  message = "Ready to forge today's plan, Haripriya?",
  quickActionLabel,
  quickActionPath = '/planner',
  onRefreshMessage
}: AvatarWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            className="pointer-events-auto mb-2.5 max-w-xs md:max-w-sm p-4 rounded-[20px] bg-surface border border-primary/30 shadow-2xl relative backdrop-blur-xl"
          >
            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 right-7 w-4 h-4 bg-surface border-r border-b border-primary/30 rotate-45" />

            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Forge Mascot</span>
                <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-full bg-primary-soft uppercase">
                  {mood}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-full hover:bg-surface-2 transition-colors"
                title="Dismiss message"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs md:text-sm font-semibold text-text leading-snug">{message}</p>

            <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-border/50 gap-2">
              {quickActionLabel ? (
                <Button
                  asChild
                  size="sm"
                  variant="primary"
                  className="text-xs h-7 px-3 py-1 font-bold rounded-xl gap-1 shadow-sm"
                >
                  <a href={quickActionPath}>
                    <span>{quickActionLabel}</span>
                    <ArrowRight size={12} />
                  </a>
                </Button>
              ) : (
                <span className="text-text-muted text-[11px]">Tap mascot to poke</span>
              )}

              <button
                onClick={onRefreshMessage}
                className="text-primary hover:underline flex items-center gap-1 font-bold text-[11px] shrink-0"
              >
                <MessageCircle size={12} />
                <span>New Quote</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex items-center">
        <AvatarMascot
          mood={mood}
          size={64}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
            if (onRefreshMessage) onRefreshMessage();
          }}
          className="filter drop-shadow-xl hover:scale-105 transition-transform"
        />
      </div>
    </div>
  );
}

