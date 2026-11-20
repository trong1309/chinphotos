import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type CursorVariant = 'default' | 'link' | 'view';

export const CustomCursor: React.FC = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 26, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!pointerQuery.matches || motionQuery.matches) {
      setIsFinePointer(false);
      return;
    }

    setIsFinePointer(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const viewEl = target.closest('[data-cursor="view"]');
      if (viewEl) {
        setVariant('view');
        return;
      }

      const interactiveEl = target.closest('a, button, [role="tab"], input, textarea, select');
      if (interactiveEl) {
        setVariant('link');
        return;
      }

      setVariant('default');
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isFinePointer) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden lg:block"
      aria-hidden="true"
    >
      {/* Outer Spring Follower Ring / View Badge */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: variant === 'view' ? 84 : variant === 'link' ? 48 : 30,
          height: variant === 'view' ? 84 : variant === 'link' ? 48 : 30,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.6,
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className={`flex items-center justify-center rounded-full transition-colors duration-200 ${
          variant === 'view'
            ? 'bg-neutral-900/85 dark:bg-cream-100/90 text-white dark:text-neutral-950 backdrop-blur-md shadow-xl'
            : variant === 'link'
              ? 'border border-accent-600/80 bg-accent-500/10 dark:border-accent-400/80'
              : 'border border-neutral-900/35 dark:border-cream-100/35'
        }`}
      >
        {variant === 'view' && (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] font-semibold">
            {isVi ? 'XEM ↗' : 'VIEW ↗'}
          </span>
        )}
      </motion.div>

      {/* Inner Precision Center Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible && variant === 'default' ? 1 : 0,
          scale: variant === 'default' ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="w-1.5 h-1.5 rounded-full bg-accent-600 dark:bg-accent-400"
      />
    </div>
  );
};

export default CustomCursor;
