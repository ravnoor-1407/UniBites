import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

const DishImage = ({
  src,
  alt = '',
  name = '',
  category = '',
  className = '',
  aspectRatio = 'aspect-square',
}) => {
  const [hasError, setHasError] = useState(false);

  const containerAspect = aspectRatio || 'aspect-square';

  if (!src || hasError) {
    return (
      <div className={`w-full ${containerAspect} bg-surface-alt border border-border rounded-xl flex flex-col items-center justify-center p-3 text-center select-none ${className}`}>
        <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center mb-1.5 shadow-soft">
          <Utensils className="w-5 h-5 text-primary" />
        </div>
        <p className="font-serif font-bold text-xs text-text line-clamp-1">
          {name || 'Campus Dish'}
        </p>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
          {category || 'UniBites'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      onError={() => setHasError(true)}
      alt={alt || name || 'Campus dish'}
      loading="lazy"
      className={`w-full ${containerAspect} object-cover rounded-xl ${className}`}
    />
  );
};

export default DishImage;
