import { useCallback, useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<boolean | void>;
  pullDistance: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  pullDistance,
  disabled = false,
}: PullToRefreshOptions) {
  const elementRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      // Record start position
      startY.current = e.touches[0].clientY;
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Get the element's scroll position
      const scrollTop = elementRef.current?.scrollTop || 0;

      // Only allow pulling when at the top of the element
      if (scrollTop > 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only handle pull down
      if (diff <= 0) {
        setIsPulling(false);
        setPullProgress(0);
        return;
      }

      // Calculate how far we've pulled as a ratio of pullDistance (0 to 1)
      const progress = Math.min(diff / pullDistance, 1);
      
      setIsPulling(true);
      setPullProgress(progress);

      // Prevent default behavior to avoid scrolling
      e.preventDefault();
    },
    [disabled, isRefreshing, pullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    // If pulled far enough, trigger refresh
    if (pullProgress >= 1) {
      setIsRefreshing(true);
      setIsPulling(false);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Set a small delay before resetting for better UX
        setTimeout(() => {
          setIsRefreshing(false);
          setPullProgress(0);
        }, 500);
      }
    } else {
      // Reset state if not pulled far enough
      setIsPulling(false);
      setPullProgress(0);
    }
  }, [disabled, isRefreshing, isPulling, onRefresh, pullProgress]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { elementRef, isPulling, pullProgress, isRefreshing };
} 