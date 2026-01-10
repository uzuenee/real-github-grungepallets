/**
 * Wholesale Products Tests
 * Tests for product data and custom pallet detection
 */

import { WHOLESALE_PRODUCTS, getProductById } from '@/lib/wholesale-products';

describe('Wholesale Products', () => {
    describe('Product Data', () => {
        it('should have products defined', () => {
            expect(WHOLESALE_PRODUCTS).toBeDefined();
            expect(WHOLESALE_PRODUCTS.length).toBeGreaterThan(0);
        });

        it('should have required fields for each product', () => {
            WHOLESALE_PRODUCTS.forEach(product => {
                expect(product).toHaveProperty('id');
                expect(product).toHaveProperty('name');
                expect(product).toHaveProperty('size');
                expect(product).toHaveProperty('dimensions');
                expect(product).toHaveProperty('price');
                expect(product).toHaveProperty('category');
                expect(product).toHaveProperty('inStock');
            });
        });

        it('should have valid categories', () => {
            const validCategories = ['grade-a', 'grade-b', 'heat-treated', 'custom'];
            WHOLESALE_PRODUCTS.forEach(product => {
                expect(validCategories).toContain(product.category);
            });
        });

        it('should have positive prices for non-custom products', () => {
            WHOLESALE_PRODUCTS.filter(p => p.category !== 'custom').forEach(product => {
                expect(product.price).toBeGreaterThan(0);
            });
        });
    });

    describe('Custom Pallet', () => {
        it('should have a custom pallet product', () => {
            const customPallet = WHOLESALE_PRODUCTS.find(p => p.category === 'custom');
            expect(customPallet).toBeDefined();
        });

        it('should identify custom pallet by id', () => {
            const customPallet = WHOLESALE_PRODUCTS.find(p => p.id === 'custom-pallet');
            expect(customPallet).toBeDefined();
            expect(customPallet?.category).toBe('custom');
        });

        it('should have custom size indicator', () => {
            const customPallet = WHOLESALE_PRODUCTS.find(p => p.category === 'custom');
            expect(customPallet?.size).toContain('Custom');
        });
    });

    describe('Product Lookup', () => {
        it('should find product by id', () => {
            const firstProduct = WHOLESALE_PRODUCTS[0];
            const found = getProductById(firstProduct.id);
            expect(found).toEqual(firstProduct);
        });

        it('should return undefined for non-existent id', () => {
            const found = getProductById('non-existent-id-12345');
            expect(found).toBeUndefined();
        });
    });

    describe('Heat Treated Products', () => {
        it('should have heat treated products with isHeatTreated flag', () => {
            const htProducts = WHOLESALE_PRODUCTS.filter(p => p.category === 'heat-treated');
            expect(htProducts.length).toBeGreaterThan(0);
            htProducts.forEach(product => {
                expect(product.isHeatTreated).toBe(true);
            });
        });
    });
});
