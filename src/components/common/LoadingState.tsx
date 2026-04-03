import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * Loading State Component
 * Shows a loading spinner with optional message
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-slate-950'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner */}
        <div className="relative inline-block">
          <div
            className={`${sizeClasses[size]} border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin`}
          ></div>
          {/* Inner glow effect */}
          <div
            className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-cyan-400 rounded-full animate-pulse opacity-50`}
          ></div>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader Component
 * Shows a placeholder while content is loading
 */
interface SkeletonProps {
  className?: string;
  count?: number;
  type?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className = '', count = 1, type = 'text' }: SkeletonProps) {
  const baseClasses = 'bg-slate-800 animate-pulse';

  const typeClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${typeClasses[type]} ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Card Skeleton Component
 * Shows a card placeholder
 */
export function CardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton type="circle" className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton Component
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
