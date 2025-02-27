import { TILPostSkeleton } from './TILPostSkeleton';
import { MasonryGrid, MasonryItem } from '@/components/masonry';

interface MasonryGridSkeletonProps {
  itemCount?: number;
}

export function MasonryGridSkeleton({ itemCount = 6 }: MasonryGridSkeletonProps) {
  return (
    <MasonryGrid>
      {Array.from({ length: itemCount }).map((_, index) => (
        <MasonryItem key={index}>
          <TILPostSkeleton />
        </MasonryItem>
      ))}
    </MasonryGrid>
  );
} 