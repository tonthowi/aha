import { motion } from 'framer-motion';

export function TILPostSkeleton() {
  return (
    <div className="p-6 card-shadow-hover">
      {/* Author section */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Author name */}
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <span className="text-gray-300">·</span>
              {/* Date */}
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <span className="text-gray-300">·</span>
              {/* Visibility badge */}
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Category */}
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-3">
        {/* Content lines */}
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Media placeholder */}
      <div className="mt-4 aspect-video w-full bg-gray-200 rounded-2xl animate-pulse" />

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-6">
          {/* Like button */}
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          {/* Comment button */}
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* Bookmark button */}
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
} 