import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MasonryItemProps } from './types';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

export const MasonryItem = forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ children, className, minHeight = 100, maxHeight = 800, priority = false }, ref) => {
    const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '50px',
      freezeOnceVisible: true,
    });

    return (
      <motion.div
        ref={(element) => {
          // Handle both refs
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
          intersectionRef.current = element;
        }}
        className={cn(
          'relative w-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200',
          'hover:shadow-lg hover:-translate-y-1',
          'focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50',
          className
        )}
        style={{
          minHeight,
          maxHeight,
          willChange: 'transform',
          opacity: isIntersecting ? 1 : 0,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        layout
      >
        <div 
          className="h-full w-full"
          style={{
            contain: 'content',
          }}
        >
          {isIntersecting && children}
        </div>
      </motion.div>
    );
  }
);

MasonryItem.displayName = 'MasonryItem'; 