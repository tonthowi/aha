import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MasonryItemProps } from './types';

export const MasonryItem = forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ children, className, minHeight = 100, maxHeight = 800, priority = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout
      >
        <div 
          className="h-full w-full card-shadow-hover p-6"
          style={{
            contain: 'content',
          }}
        >
          {children}
        </div>
      </motion.div>
    );
  }
);

MasonryItem.displayName = 'MasonryItem'; 