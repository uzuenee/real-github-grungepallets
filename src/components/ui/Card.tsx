import { HTMLAttributes, forwardRef } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: CardPadding;
    hover?: boolean;
    children: React.ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ padding = 'md', hover = true, className = '', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`
          bg-white rounded-xl border border-secondary-100
          ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl' : 'shadow-md'}
          ${paddingStyles[padding]}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';