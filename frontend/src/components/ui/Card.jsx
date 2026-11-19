import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-card border border-border shadow-soft flex flex-col h-full overflow-hidden ${
        hoverable ? 'hover:border-primary/40 hover:shadow-card transition-all cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
