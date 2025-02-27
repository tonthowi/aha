import { useEffect, useRef, useState, useCallback } from 'react';
import { UseMasonryLayoutReturn, MasonryConfig } from './types';
import debounce from 'lodash/debounce';

const defaultConfig: MasonryConfig = {
  breakpoints: {
    sm: 640,  // Mobile breakpoint
    md: 768,  // Tablet breakpoint
    lg: 1024, // Desktop breakpoint
  },
  columns: {
    sm: 1, // Single column for mobile
    md: 1, // Single column for small tablets
    lg: 2, // Two columns for desktop
  },
  gaps: {
    sm: 16, // 16px gap for all screen sizes
    md: 16, // 16px gap for all screen sizes
    lg: 16, // 16px gap for all screen sizes
  },
};

export function useMasonryLayout(
  config: Partial<MasonryConfig> = {}
): UseMasonryLayoutReturn {
  const mergedConfig = { ...defaultConfig, ...config };
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(mergedConfig.columns.sm);
  const [gap, setGap] = useState(mergedConfig.gaps.sm);

  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    let newColumnCount = mergedConfig.columns.sm;
    let newGap = mergedConfig.gaps.sm;

    if (width >= mergedConfig.breakpoints.lg) {
      newColumnCount = mergedConfig.columns.lg;
      newGap = mergedConfig.gaps.lg;
    } else if (width >= mergedConfig.breakpoints.md) {
      newColumnCount = mergedConfig.columns.md;
      newGap = mergedConfig.gaps.md;
    }

    // Test log for debugging layout changes
    console.debug('[Layout] Columns:', newColumnCount, 'Gap:', newGap, 'Width:', width);

    setColumnCount(newColumnCount);
    setGap(newGap);
  }, [mergedConfig]);

  // Debounced version of calculateLayout with a shorter delay
  const debouncedCalculateLayout = useCallback(
    debounce(calculateLayout, 50, { leading: true, maxWait: 150 }),
    [calculateLayout]
  );

  useEffect(() => {
    calculateLayout();

    // Use ResizeObserver for more efficient resize handling
    const resizeObserver = new ResizeObserver(debouncedCalculateLayout);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', debouncedCalculateLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedCalculateLayout);
      debouncedCalculateLayout.cancel();
    };
  }, [debouncedCalculateLayout]);

  return {
    columnCount,
    gap,
    containerRef,
  };
} 