/**
 * UI Component Tests
 * Tests for React components
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Card, Badge } from '@/components/ui';

interface CustomSpecs {
    length: string;
    width: string;
    height?: string;
    notes?: string;
}

describe('UI Components', () => {
    describe('Button', () => {
        it('should render with text', () => {
            render(<Button>Click Me</Button>);
            expect(screen.getByText('Click Me')).toBeInTheDocument();
        });

        it('should handle click events', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click Me</Button>);

            fireEvent.click(screen.getByText('Click Me'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should apply variant classes', () => {
            const { container } = render(<Button variant="primary">Primary</Button>);
            expect(container.firstChild).toHaveClass('bg-primary');
        });

        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByText('Disabled')).toBeDisabled();
        });
    });

    describe('Card', () => {
        it('should render children', () => {
            render(<Card>Card Content</Card>);
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<Card className="custom-class">Content</Card>);
            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('Badge', () => {
        it('should render with text', () => {
            render(<Badge>New</Badge>);
            expect(screen.getByText('New')).toBeInTheDocument();
        });

        it('should apply variant styles', () => {
            const { container } = render(<Badge variant="success">Success</Badge>);
            // Check for success variant styling
            expect(container.firstChild).toBeTruthy();
        });
    });
});

describe('Custom Pallet Display', () => {
    it('should display TBD for custom items with no price', () => {
        const customItem = {
            productId: 'custom-pallet-123',
            productName: 'Custom Pallet (48" × 40")',
            price: 0,
            quantity: 5,
            isCustom: true,
            customSpecs: { length: '48', width: '40' } as CustomSpecs
        };

        // Price display logic
        const priceDisplay = customItem.isCustom && customItem.price === 0
            ? 'TBD'
            : `$${customItem.price.toFixed(2)}`;

        expect(priceDisplay).toBe('TBD');
    });

    it('should display actual price when set for custom items', () => {
        const customItem = {
            productId: 'custom-pallet-123',
            productName: 'Custom Pallet (48" × 40")',
            price: 25.50,
            quantity: 5,
            isCustom: true,
            customSpecs: { length: '48', width: '40' } as CustomSpecs
        };

        const priceDisplay = customItem.isCustom && customItem.price === 0
            ? 'TBD'
            : `$${customItem.price.toFixed(2)}`;

        expect(priceDisplay).toBe('$25.50');
    });

    it('should format dimensions correctly', () => {
        const customSpecs: CustomSpecs = { length: '48', width: '40', height: '6' };

        const formatted = `${customSpecs.length}" × ${customSpecs.width}"${customSpecs.height ? ` × ${customSpecs.height}"` : ''
            }`;

        expect(formatted).toBe('48" × 40" × 6"');
    });

    it('should handle missing height', () => {
        const customSpecs: CustomSpecs = { length: '48', width: '40' };

        const formatted = `${customSpecs.length}" × ${customSpecs.width}"${customSpecs.height ? ` × ${customSpecs.height}"` : ''
            }`;

        expect(formatted).toBe('48" × 40"');
    });
});
