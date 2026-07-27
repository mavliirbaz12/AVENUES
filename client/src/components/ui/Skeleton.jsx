import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 * Loading placeholder with shimmer animation
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton', className)}
      {...props}
    />
  );
}

/**
 * SkeletonText Component
 * Text placeholder
 */
export function SkeletonText({ lines = 1, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            lines > 1 && i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard Component
 * Card placeholder
 */
export function SkeletonCard({ className }) {
  return (
    <div className={cn('card-product overflow-hidden', className)}>
      <Skeleton className="h-64 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonGrid Component
 * Grid of card placeholders
 */
export function SkeletonGrid({ count = 4, className }) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonHero Component
 * Hero section placeholder
 */
export function SkeletonHero() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5">
      <Skeleton className="h-8 w-64 mb-8" />
      <Skeleton className="h-16 sm:h-20 lg:h-24 w-full max-w-4xl mb-6" />
      <Skeleton className="h-12 w-full max-w-xl mb-10" />
      <div className="flex gap-4">
        <Skeleton className="h-14 w-40" />
        <Skeleton className="h-14 w-40" />
      </div>
    </div>
  );
}

/**
 * SkeletonImage Component
 * Image placeholder
 */
export function SkeletonImage({ className, aspectRatio = 'aspect-square' }) {
  return (
    <div className={cn('overflow-hidden', aspectRatio, className)}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

/**
 * SkeletonButton Component
 * Button placeholder
 */
export function SkeletonButton({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-24',
    md: 'h-10 w-32',
    lg: 'h-12 w-40',
  };

  return (
    <Skeleton className={cn('rounded-btn', sizes[size], className)} />
  );
}

/**
 * SkeletonAvatar Component
 * Avatar placeholder
 */
export function SkeletonAvatar({ size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <Skeleton className={cn('rounded-full', sizes[size], className)} />
  );
}
