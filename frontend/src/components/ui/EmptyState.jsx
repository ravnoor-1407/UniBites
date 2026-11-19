import React from 'react';
import { SearchX, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = UtensilsCrossed,
  title = 'No items found',
  description = 'Try searching with a different keyword or explore our categories.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`py-12 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-alt border border-border flex items-center justify-center mb-4 shadow-soft">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="font-serif font-bold text-lg text-text mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-muted mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
