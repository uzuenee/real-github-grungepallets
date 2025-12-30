'use client';

import { HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'warning' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-secondary-100 text-secondary-600',
};

export function Badge({ variant = 'info', className = '', children, ...props }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${variantStyles[variant]}
        ${className}
      `}
            {...props}
        >
            {children}
        </span>
    );
}
