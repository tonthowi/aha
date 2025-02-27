interface CategoryPillProps {
  category: string;
  className?: string;
}

export function CategoryPill({ category, className = "" }: CategoryPillProps) {
  return (
    <span 
      className={`inline-flex items-center rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-200 transition-colors ${className}`}
    >
      {category}
    </span>
  );
} 