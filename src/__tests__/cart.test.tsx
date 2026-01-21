/**
 * Cart Context Tests
 * Tests for cart functionality including adding items, custom pallets, and calculations
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '@/lib/contexts/CartContext';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Clear localStorage before each test to ensure isolation
beforeEach(() => {
    localStorage.clear();
});

// Wrapper for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
    describe('Initial State', () => {
        it('should start with empty cart', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.items).toEqual([]);
            expect(result.current.itemCount).toBe(0);
            expect(result.current.subtotal).toBe(0);
        });
    });

    describe('Adding Regular Items', () => {
        it('should add a regular item to cart', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'test-product-1',
                    productName: 'Test Pallet 48x40',
                    price: 15.00,
                }, 5);
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].quantity).toBe(5);
            expect(result.current.items[0].price).toBe(15.00);
            expect(result.current.itemCount).toBe(5);
            expect(result.current.subtotal).toBe(75.00);
        });

        it('should merge quantities for same product', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'test-product-1',
                    productName: 'Test Pallet',
                    price: 10.00,
                }, 3);
            });

            act(() => {
                result.current.addToCart({
                    productId: 'test-product-1',
                    productName: 'Test Pallet',
                    price: 10.00,
                }, 2);
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].quantity).toBe(5);
        });
    });

    describe('Adding Custom Pallet Items', () => {
        it('should add custom pallet with specs', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'custom-pallet',
                    productName: 'Custom Pallet (48" × 40" × 6")',
                    price: 0, // TBD pricing
                    isCustom: true,
                    customSpecs: {
                        length: '48',
                        width: '40',
                        height: '6',
                        notes: 'Special reinforcement needed'
                    }
                }, 10);
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].isCustom).toBe(true);
            expect(result.current.items[0].customSpecs?.length).toBe('48');
            expect(result.current.items[0].customSpecs?.notes).toBe('Special reinforcement needed');
        });

        it('should create separate entries for different custom specs', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            // Add first custom pallet
            act(() => {
                result.current.addToCart({
                    productId: 'custom-pallet',
                    productName: 'Custom Pallet (48" × 40")',
                    price: 0,
                    isCustom: true,
                    customSpecs: { length: '48', width: '40' }
                }, 5);
            });

            // Add second custom pallet with different specs
            act(() => {
                result.current.addToCart({
                    productId: 'custom-pallet',
                    productName: 'Custom Pallet (36" × 36")',
                    price: 0,
                    isCustom: true,
                    customSpecs: { length: '36', width: '36' }
                }, 3);
            });

            // Should have 2 separate items (not merged)
            expect(result.current.items).toHaveLength(2);
            expect(result.current.items[0].customSpecs?.length).toBe('48');
            expect(result.current.items[1].customSpecs?.length).toBe('36');
        });

        it('should not include custom items in subtotal when price is 0', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            // Add regular item
            act(() => {
                result.current.addToCart({
                    productId: 'regular-pallet',
                    productName: 'Regular Pallet',
                    price: 20.00,
                }, 2);
            });

            // Add custom item with 0 price
            act(() => {
                result.current.addToCart({
                    productId: 'custom-pallet',
                    productName: 'Custom Pallet',
                    price: 0,
                    isCustom: true,
                    customSpecs: { length: '48', width: '40' }
                }, 5);
            });

            // Subtotal should only include regular items
            expect(result.current.subtotal).toBe(40.00);
            expect(result.current.itemCount).toBe(7); // 2 + 5
        });
    });

    describe('Updating Quantity', () => {
        it('should update item quantity', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'test-product',
                    productName: 'Test',
                    price: 10.00,
                }, 2);
            });

            act(() => {
                result.current.updateQuantity('test-product', 10);
            });

            expect(result.current.items[0].quantity).toBe(10);
            expect(result.current.subtotal).toBe(100.00);
        });

        it('should remove item when quantity set to 0', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'test-product',
                    productName: 'Test',
                    price: 10.00,
                }, 5);
            });

            act(() => {
                result.current.updateQuantity('test-product', 0);
            });

            expect(result.current.items).toHaveLength(0);
        });
    });

    describe('Removing Items', () => {
        it('should remove item from cart', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'product-1',
                    productName: 'Product 1',
                    price: 10.00,
                }, 1);
                result.current.addToCart({
                    productId: 'product-2',
                    productName: 'Product 2',
                    price: 20.00,
                }, 1);
            });

            act(() => {
                result.current.removeItem('product-1');
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].productId).toBe('product-2');
        });
    });

    describe('Clearing Cart', () => {
        it('should clear all items', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'product-1',
                    productName: 'Product 1',
                    price: 10.00,
                }, 5);
                result.current.addToCart({
                    productId: 'product-2',
                    productName: 'Product 2',
                    price: 20.00,
                }, 3);
            });

            act(() => {
                result.current.clearCart();
            });

            expect(result.current.items).toHaveLength(0);
            expect(result.current.subtotal).toBe(0);
            expect(result.current.itemCount).toBe(0);
        });
    });

    describe('Delivery Calculation', () => {
        it('should return null (TBD) for delivery - admin sets it later', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'product-1',
                    productName: 'Product',
                    price: 100.00,
                }, 6); // $600 total
            });

            const { delivery } = result.current.getTotal();
            expect(delivery).toBeNull(); // Delivery is now TBD - set by admin
        });

        it('should return total as subtotal only (no delivery at checkout)', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            act(() => {
                result.current.addToCart({
                    productId: 'product-1',
                    productName: 'Product',
                    price: 100.00,
                }, 2); // $200 subtotal
            });

            const { subtotal, total } = result.current.getTotal();
            expect(subtotal).toBe(200);
            expect(total).toBe(200); // Total at checkout is just subtotal, delivery added by admin later
        });
    });
});
