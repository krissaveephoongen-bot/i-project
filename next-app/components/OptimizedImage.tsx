'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { clsx } from 'clsx';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallback?: React.ReactNode;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  fadeIn?: boolean;
}

/**
 * Optimized image component with:
 * - Automatic skeleton loading state
 * - Error fallback
 * - Fade-in animation on load
 * - Lazy loading by default
 */
export function OptimizedImage({
  src,
  alt,
  fallback,
  showSkeleton = true,
  skeletonClassName,
  fadeIn = true,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  }, [onError]);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {isLoading && showSkeleton && (
        <Skeleton 
          className={clsx(
            'absolute inset-0',
            skeletonClassName
          )} 
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={clsx(
          className,
          fadeIn && 'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// Avatar-specific optimized image
interface AvatarImageProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function AvatarImage({ 
  src, 
  name, 
  size = 'md', 
  className 
}: AvatarImageProps) {
  const dimension = avatarSizes[size];
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&size=${dimension * 2}`;
  
  return (
    <OptimizedImage
      src={src || fallbackUrl}
      alt={`${name}'s avatar`}
      width={dimension}
      height={dimension}
      className={clsx('rounded-full object-cover', className)}
      skeletonClassName="rounded-full"
      fallback={
        <div 
          className={clsx(
            'rounded-full bg-blue-600 flex items-center justify-center text-white font-medium',
            className
          )}
          style={{ width: dimension, height: dimension }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      }
      unoptimized={src?.startsWith('https://ui-avatars.com') || !src}
    />
  );
}

// Project logo/image component
interface ProjectImageProps {
  name: string;
  src?: string | null;
  className?: string;
  size?: number;
}

export function ProjectImage({ 
  name, 
  src, 
  className,
  size = 40 
}: ProjectImageProps) {
  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  
  return (
    <OptimizedImage
      src={src || fallbackUrl}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={clsx('rounded-lg object-cover', className)}
      skeletonClassName="rounded-lg"
      fallback={
        <div 
          className={clsx(
            'rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold',
            className
          )}
          style={{ width: size, height: size }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      }
      unoptimized={src?.startsWith('https://api.dicebear.com') || !src}
    />
  );
}

export default OptimizedImage;
