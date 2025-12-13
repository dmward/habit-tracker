import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
          'shadow-sm',
          {
            'hover:shadow-md transition-shadow cursor-pointer': hover,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
