import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AvatarMood } from '@/lib/avatarMood';

export type { AvatarMood };

interface AvatarMascotProps {
  mood?: AvatarMood;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function AvatarMascot({ mood = 'idle', size = 64, className = '', onClick }: AvatarMascotProps) {
  const [tapReaction, setTapReaction] = useState(false);

  const handleMascotTap = () => {
    setTapReaction(true);
    if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    setTimeout(() => setTapReaction(false), 800);
    if (onClick) onClick();
  };

  // Motion variants according to mood
  const mascotVariants = {
    idle: {
      y: [0, -4, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    cheering: {
      y: [0, -12, 0],
      scale: [1, 1.08, 1],
      rotate: [0, -4, 4, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' as const }
    },
    celebrating: {
      y: [0, -18, 0],
      rotate: [0, -12, 12, -6, 6, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' as const }
    },
    encouraging: {
      rotate: [-4, 4, -4],
      y: [0, -3, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }
    },
    worried: {
      rotate: [-6, 6, -6],
      y: [0, 2, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const }
    },
    sleeping: {
      y: [4, 6, 4],
      scaleY: [0.94, 1, 0.94],
      rotate: [12, 14, 12],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
    },
    sleepy: {
      rotate: [0, 5, 0],
      y: [0, 3, 0],
      transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' as const }
    },
    comeback: {
      y: [0, -10, 0],
      rotate: [-5, 5, -5],
      scale: [1, 1.1, 1],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    }
  };

  const earVariants = {
    cheering: { rotate: [-8, 8, -8], transition: { duration: 0.4, repeat: Infinity } },
    celebrating: { rotate: [-14, 14, -14], transition: { duration: 0.35, repeat: Infinity } },
    worried: { rotate: [-5, 5, -5], transition: { duration: 0.6, repeat: Infinity } },
    sleeping: { rotate: [10, 12, 10], transition: { duration: 4, repeat: Infinity } }
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      variants={mascotVariants}
      animate={tapReaction ? { rotate: [0, 360], scale: [1, 1.25, 1], y: [0, -20, 0] } : mood}
      transition={tapReaction ? { duration: 0.75, ease: 'easeOut' } : undefined}
      onClick={handleMascotTap}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Background aura for celebration/cheering */}
      {(mood === 'celebrating' || mood === 'cheering') && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/40 to-purple-500/40 blur-md"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* SVG Mascot Art */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`drop-shadow-md relative z-10 overflow-visible transition-opacity duration-300 ${
          mood === 'sleeping' ? 'opacity-80' : 'opacity-100'
        }`}
      >
        {/* Crown & Dance Sparkles for celebrating */}
        {mood === 'celebrating' && (
          <motion.g
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: [0, -4, 0], opacity: 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <path
              d="M45 28 L53 38 L60 22 L67 38 L75 28 L72 44 L48 44 Z"
              fill="#FFD700"
              stroke="#B38F00"
              strokeWidth="2"
            />
            <circle cx="45" cy="26" r="3" fill="#FF4500" />
            <circle cx="60" cy="20" r="3" fill="#3B82F6" />
            <circle cx="75" cy="26" r="3" fill="#10B981" />
          </motion.g>
        )}

        {/* Sweat Droplet for worried */}
        {mood === 'worried' && (
          <motion.path
            d="M92 40 C92 40 98 48 95 52 C92 56 87 54 87 50 C87 46 92 40 92 40 Z"
            fill="#3B82F6"
            opacity="0.85"
            animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Zzz for sleeping or sleepy */}
        {(mood === 'sleeping' || mood === 'sleepy') && (
          <g>
            <motion.text
              x="85"
              y="28"
              fill="#8B5CF6"
              fontSize="16"
              fontWeight="bold"
              animate={{ opacity: [0, 1, 0], y: [28, 12], x: [85, 92] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              z
            </motion.text>
            <motion.text
              x="96"
              y="18"
              fill="#6366F1"
              fontSize="12"
              fontWeight="bold"
              animate={{ opacity: [0, 1, 0], y: [18, 4], x: [96, 104] }}
              transition={{ duration: 2.2, delay: 0.8, repeat: Infinity }}
            >
              Z
            </motion.text>
          </g>
        )}

        {/* Ears */}
        {/* Left Ear */}
        <motion.path
          d="M32 48 L18 16 L50 34 Z"
          fill="#FF6B35"
          stroke="#D94E1B"
          strokeWidth="3"
          strokeLinejoin="round"
          variants={earVariants}
        />
        <path d="M30 44 L22 24 L42 36 Z" fill="#FFE5D9" />

        {/* Right Ear */}
        <motion.path
          d="M88 48 L102 16 L70 34 Z"
          fill="#FF6B35"
          stroke="#D94E1B"
          strokeWidth="3"
          strokeLinejoin="round"
          variants={earVariants}
        />
        <path d="M90 44 L98 24 L78 36 Z" fill="#FFE5D9" />

        {/* Head Base */}
        <path
          d="M60 102 C25 102 22 68 30 48 C36 34 84 34 90 48 C98 68 95 102 60 102 Z"
          fill="#FF6B35"
          stroke="#D94E1B"
          strokeWidth="3"
        />

        {/* White Muzzle / Cheek Tufts */}
        <path
          d="M60 102 C38 102 30 75 42 62 C48 56 72 56 78 62 C90 75 82 102 60 102 Z"
          fill="#FFFFFF"
        />

        {/* Nose */}
        <ellipse cx="60" cy="74" rx="7" ry="5" fill="#2D3748" />
        <ellipse cx="58" cy="72" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.6" />

        {/* Eyes based on mood */}
        {mood === 'sleeping' || mood === 'sleepy' ? (
          <g stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M42 58 Q48 64 54 58" />
            <path d="M66 58 Q72 64 78 58" />
          </g>
        ) : mood === 'worried' ? (
          <g>
            <circle cx="48" cy="56" r="6" fill="#2D3748" />
            <circle cx="46" cy="54" r="2" fill="#FFFFFF" />
            <circle cx="72" cy="56" r="6" fill="#2D3748" />
            <circle cx="70" cy="54" r="2" fill="#FFFFFF" />
            {/* Worried Eyebrows */}
            <path d="M42 46 L54 50" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M78 46 L66 50" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : mood === 'cheering' || mood === 'celebrating' || mood === 'comeback' ? (
          <g stroke="#2D3748" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M42 58 Q48 50 54 58" />
            <path d="M66 58 Q72 50 78 58" />
          </g>
        ) : mood === 'encouraging' ? (
          <g>
            <circle cx="48" cy="56" r="6.5" fill="#2D3748" />
            <circle cx="46" cy="54" r="2.5" fill="#FFFFFF" />
            <circle cx="72" cy="56" r="6.5" fill="#2D3748" />
            <circle cx="70" cy="54" r="2.5" fill="#FFFFFF" />
            {/* Confident Eyebrows */}
            <path d="M42 48 L54 46" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M78 48 L66 46" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="48" cy="56" r="6" fill="#2D3748" />
            <circle cx="46" cy="54" r="2" fill="#FFFFFF" />
            <circle cx="72" cy="56" r="6" fill="#2D3748" />
            <circle cx="70" cy="54" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Mouth */}
        {mood === 'cheering' || mood === 'celebrating' || mood === 'comeback' ? (
          <path d="M53 82 Q60 92 67 82 Z" fill="#E53E3E" stroke="#2D3748" strokeWidth="2" />
        ) : mood === 'worried' ? (
          <path d="M54 84 Q60 80 66 84" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : mood === 'encouraging' ? (
          <path d="M53 82 Q60 88 67 82" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : mood === 'sleeping' ? (
          <ellipse cx="60" cy="83" rx="3" ry="2" fill="#2D3748" />
        ) : (
          <path d="M55 81 Q60 86 65 81" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Rosy Cheeks */}
        <circle cx="36" cy="66" r="6" fill="#FF8A8A" opacity={mood === 'sleeping' ? '0.4' : '0.65'} />
        <circle cx="84" cy="66" r="6" fill="#FF8A8A" opacity={mood === 'sleeping' ? '0.4' : '0.65'} />

        {/* Waving Hands for Comeback / Celebrating */}
        {(mood === 'comeback' || mood === 'encouraging') && (
          <motion.g
            animate={{ rotate: [-15, 15, -15] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: '20px 80px' }}
          >
            <circle cx="18" cy="78" r="7" fill="#FF6B35" stroke="#D94E1B" strokeWidth="2" />
          </motion.g>
        )}

        {/* Confetti Sparkles for celebrating */}
        {mood === 'celebrating' && (
          <g fill="#FFD700">
            <motion.path
              d="M18 28 L20 33 L25 35 L20 37 L18 42 L16 37 L11 35 L16 33 Z"
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.path
              d="M100 30 L102 35 L107 37 L102 39 L100 44 L98 39 L93 37 L98 35 Z"
              animate={{ scale: [1.3, 0.8, 1.3], opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, delay: 0.3, repeat: Infinity }}
            />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

