import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AvatarMascot } from './AvatarMascot';
import { Button } from '@/components/ui/Button';
import { Trophy, Flame, X } from 'lucide-react';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  streakCount?: number;
}

export function MilestoneModal({ isOpen, onClose, title, subtitle, streakCount }: MilestoneModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-3xl bg-surface border border-border/80 shadow-2xl p-6 text-center overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-text-muted hover:text-text rounded-full hover:bg-surface-elevated transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4 pt-2">
              <AvatarMascot mood="celebrating" size={88} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-flame/15 text-flame text-xs font-bold uppercase tracking-wider mb-2">
              <Flame size={14} className="fill-current" />
              <span>Milestone Achieved</span>
            </div>

            <h2 className="text-2xl font-display font-extrabold text-text mt-1">{title}</h2>
            <p className="text-text-muted text-sm mt-2 leading-relaxed">{subtitle}</p>

            {streakCount !== undefined && (
              <div className="my-5 p-4 rounded-2xl bg-surface-elevated border border-border/60 flex items-center justify-center gap-3">
                <Trophy size={32} className="text-amber-500" />
                <div className="text-left">
                  <span className="text-2xl font-bold font-display text-text">{streakCount} Days</span>
                  <p className="text-xs text-text-muted font-medium">Continuous Streak</p>
                </div>
              </div>
            )}

            <Button size="lg" className="w-full mt-4 font-bold shadow-lg" onClick={onClose}>
              Keep Forging On! 🚀
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
