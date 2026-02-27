import React from 'react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizes[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded-lg w-1/3" />
      <div className="h-32 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
    </div>
  );
}
