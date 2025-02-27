import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface RefreshSpinnerProps {
  progress: number;
  isRefreshing: boolean;
  className?: string;
}

export function RefreshSpinner({ progress, isRefreshing, className }: RefreshSpinnerProps) {
  return (
    <motion.div
      className={cn(
        'absolute left-1/2 top-4 -translate-x-1/2 z-50',
        'flex items-center justify-center',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: progress > 0 || isRefreshing ? 1 : 0,
        scale: progress > 0 || isRefreshing ? 1 : 0.8,
        y: isRefreshing ? 20 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="rounded-full bg-white shadow-lg p-3"
        animate={{
          rotate: isRefreshing ? 360 : progress * 360,
        }}
        transition={
          isRefreshing
            ? {
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }
            : {
                duration: 0.2,
                type: 'spring',
              }
        }
      >
        <ArrowPathIcon className="w-6 h-6 text-blue-500" />
      </motion.div>
    </motion.div>
  );
} 