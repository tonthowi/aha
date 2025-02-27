import { ReactNode } from 'react';

export interface MasonryGridProps {
  children: ReactNode;
  columnCount?: number;
  columnGap?: number;
  rowGap?: number;
  className?: string;
}

export interface MasonryColumnProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export interface MasonryItemProps {
  children: ReactNode;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  priority?: boolean; // For image loading priority
}

// Configuration types
export interface MasonryConfig {
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
  };
  columns: {
    sm: number;
    md: number;
    lg: number;
  };
  gaps: {
    sm: number;
    md: number;
    lg: number;
  };
}

// Hook return types
export interface UseMasonryLayoutReturn {
  columnCount: number;
  gap: number;
  containerRef: React.RefObject<HTMLDivElement>;
} 