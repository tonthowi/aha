import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  pullDistance = 100,
  resistance = 1.5,
}: UsePullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const isActive = useRef(false);

  const reset = useCallback(() => {
    setIsPulling(false);
    setPullProgress(0);
    startY.current = 0;
    currentY.current = 0;
    isActive.current = false;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate if we're at the top of the scroll
    if (window.scrollY === 0) {
      isActive.current = true;
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isActive.current) return;

    currentY.current = e.touches[0].clientY;
    const delta = (currentY.current - startY.current) / resistance;

    // Only pull down, not up
    if (delta > 0) {
      setIsPulling(true);
      setPullProgress(Math.min(delta / pullDistance, 1));
      e.preventDefault();
    }
  }, [pullDistance, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isActive.current) return;

    const shouldRefresh = pullProgress >= 1;
    setIsPulling(false);
    
    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    reset();
  }, [onRefresh, pullProgress, isRefreshing, reset]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', reset);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', reset);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, reset]);

  return {
    elementRef,
    isPulling,
    isRefreshing,
    pullProgress,
  };
} 