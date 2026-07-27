import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonImage } from './Skeleton';

/**
 * LazyImage Component
 * Image with lazy loading, blur-up placeholder, and error handling
 */
export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'aspect-square',
  placeholder = 'emoji',
  fallbackEmoji = '🧴',
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError || !src) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-accent/10 to-accent/20',
          aspectRatio,
          containerClassName
        )}
      >
        <span className="text-6xl sm:text-7xl lg:text-8xl drop-shadow-2xl select-none">
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', aspectRatio, containerClassName)}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && <SkeletonImage className="absolute inset-0" />}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

/**
 * OptimizedImage Component
 * Image with optimization hints
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      {...props}
    />
  );
}

/**
 * ResponsiveImage Component
 * Image with responsive srcSet
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  className,
  ...props
}) {
  // Generate srcSet if src is provided
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    // Extract base path and extension
    const match = baseSrc.match(/^(.*)\.(jpg|jpeg|png|webp|avif)$/i);
    if (!match) return '';

    const [, basePath, ext] = match;
    const widths = [320, 640, 960, 1280, 1920];
    
    return widths
      .map(w => `${basePath}-${w}w.${ext} ${w}w`)
      .join(', ');
  };

  return (
    <img
      src={src}
      alt={alt}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      className={cn('w-full h-auto', className)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}

/**
 * BackgroundImage Component
 * Lazy-loaded background image
 */
export function BackgroundImage({
  src,
  alt,
  children,
  className,
  overlay = false,
  overlayClassName,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div
      className={cn('relative', className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      {...props}
    >
      {!isLoaded && <SkeletonImage className="absolute inset-0" />}
      {overlay && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
