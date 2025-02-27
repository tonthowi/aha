import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MasonryGridProps } from './types';
import { useMasonryLayout } from './useMasonryLayout';
import { MasonryItem } from './MasonryItem';

const staggerDuration = 0.1; // Duration between each item animation
const maxStaggerDelay = 0.5; // Maximum total stagger delay

export function MasonryGrid({
  children,
  className,
  columnGap = 16,
  rowGap = 16,
}: MasonryGridProps) {
  const { columnCount, gap, containerRef } = useMasonryLayout();
  const [columns, setColumns] = useState<React.ReactNode[][]>([]);
  const focusableElements = useRef<HTMLElement[]>([]);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Distribute children into columns
  useEffect(() => {
    const childrenArray = Children.toArray(children);
    const newColumns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
    
    childrenArray.forEach((child, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(child);
    });

    setColumns(newColumns);
    
    // After initial mount, set to false
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [children, columnCount, isInitialMount]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return;
    }

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.current.indexOf(currentElement);
    
    if (currentIndex === -1) return;

    let nextIndex: number;
    const totalItems = focusableElements.current.length;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        nextIndex = Math.min(totalItems - 1, currentIndex + 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - columnCount);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(totalItems - 1, currentIndex + columnCount);
        break;
      default:
        return;
    }

    event.preventDefault();
    focusableElements.current[nextIndex]?.focus();
  }, [columnCount]);

  // Set up keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Update focusable elements
    focusableElements.current = Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gap: '16px',
      }}
      role="grid"
      aria-rowcount={Math.ceil(Children.count(children) / columnCount)}
      aria-colcount={columnCount}
    >
      <AnimatePresence mode="sync">
        {columns.map((column, columnIndex) => (
          <motion.div
            key={columnIndex}
            className="space-y-4"
            role="row"
            aria-rowindex={columnIndex + 1}
            initial={isInitialMount ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(columnIndex * staggerDuration, maxStaggerDelay),
            }}
          >
            {column.map((child, itemIndex) => (
              <motion.div
                key={itemIndex}
                className="mb-4 last:mb-0"
                role="gridcell"
                aria-colindex={columnIndex + 1}
                aria-rowindex={itemIndex + 1}
                initial={isInitialMount ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(
                    (columnIndex * column.length + itemIndex) * staggerDuration,
                    maxStaggerDelay
                  ),
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 