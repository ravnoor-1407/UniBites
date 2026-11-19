import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`bg-border/60 animate-pulse rounded-xl ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-card border border-border p-4 shadow-soft flex flex-col gap-3 h-full">
      <Skeleton className="w-full aspect-[4/3] rounded-xl" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/40">
        <Skeleton className="w-16 h-5" />
        <Skeleton className="w-20 h-9 rounded-xl" />
      </div>
    </div>
  );
};

export default Skeleton;
