/**
 * Shop & Product Tests
 * Tests for product display, filtering, and search functionality
 */

import { WHOLESALE_PRODUCTS, getProductById, isCustomProduct } from '@/lib/wholesale-products';

describe('Shop Functionality', () => {
    describe('Product Filtering', () => {
        type Category = 'all' | 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';

        const filterByCategory = (products: typeof WHOLESALE_PRODUCTS, category: Category) => {
            if (category === 'all') return products;
            return products.filter(p => p.category === category);
        };

        const filterInStock = (products: typeof WHOLESALE_PRODUCTS) => {
            return products.filter(p => p.inStock);
        };

        const filterHeatTreated = (products: typeof WHOLESALE_PRODUCTS) => {
            return products.filter(p => p.isHeatTreated);
        };

        it('should return all products when category is "all"', () => {
            const result = filterByCategory(WHOLESALE_PRODUCTS, 'all');
            expect(result.length).toBe(WHOLESALE_PRODUCTS.length);
        });

        it('should filter products by category', () => {
            const gradeA = filterByCategory(WHOLESALE_PRODUCTS, 'grade-a');
            expect(gradeA.every(p => p.category === 'grade-a')).toBe(true);

            const gradeB = filterByCategory(WHOLESALE_PRODUCTS, 'grade-b');
            expect(gradeB.every(p => p.category === 'grade-b')).toBe(true);

            const custom = filterByCategory(WHOLESALE_PRODUCTS, 'custom');
            expect(custom.every(p => p.category === 'custom')).toBe(true);
        });

        it('should filter in-stock products', () => {
            const inStock = filterInStock(WHOLESALE_PRODUCTS);
            expect(inStock.every(p => p.inStock)).toBe(true);
        });

        it('should filter heat-treated products', () => {
            const ht = filterHeatTreated(WHOLESALE_PRODUCTS);
            expect(ht.every(p => p.isHeatTreated)).toBe(true);
            expect(ht.length).toBeGreaterThan(0);
        });
    });

    describe('Product Search', () => {
        const searchProducts = (products: typeof WHOLESALE_PRODUCTS, query: string) => {
            const lowerQuery = query.toLowerCase();
            return products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.size.toLowerCase().includes(lowerQuery) ||
                p.dimensions.toLowerCase().includes(lowerQuery)
            );
        };

        it('should find products by name', () => {
            const results = searchProducts(WHOLESALE_PRODUCTS, 'GMA');
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(p => p.name.includes('GMA'))).toBe(true);
        });

        it('should find products by size', () => {
            const results = searchProducts(WHOLESALE_PRODUCTS, '48');
            expect(results.length).toBeGreaterThan(0);
        });

        it('should be case-insensitive', () => {
            const upper = searchProducts(WHOLESALE_PRODUCTS, 'GRADE A');
            const lower = searchProducts(WHOLESALE_PRODUCTS, 'grade a');
            expect(upper.length).toBe(lower.length);
        });

        it('should return empty array for no matches', () => {
            const results = searchProducts(WHOLESALE_PRODUCTS, 'xyznonexistent');
            expect(results).toHaveLength(0);
        });
    });

    describe('Product Sorting', () => {
        const sortByPrice = (products: typeof WHOLESALE_PRODUCTS, ascending: boolean = true) => {
            return [...products].sort((a, b) =>
                ascending ? a.price - b.price : b.price - a.price
            );
        };

        const sortByName = (products: typeof WHOLESALE_PRODUCTS) => {
            return [...products].sort((a, b) => a.name.localeCompare(b.name));
        };

        it('should sort by price ascending', () => {
            const sorted = sortByPrice(WHOLESALE_PRODUCTS, true);
            for (let i = 1; i < sorted.length; i++) {
                expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
            }
        });

        it('should sort by price descending', () => {
            const sorted = sortByPrice(WHOLESALE_PRODUCTS, false);
            for (let i = 1; i < sorted.length; i++) {
                expect(sorted[i].price).toBeLessThanOrEqual(sorted[i - 1].price);
            }
        });

        it('should sort by name alphabetically', () => {
            const sorted = sortByName(WHOLESALE_PRODUCTS);
            for (let i = 1; i < sorted.length; i++) {
                expect(sorted[i].name.localeCompare(sorted[i - 1].name)).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Custom Product Detection', () => {
        it('should identify custom product by function', () => {
            const customProduct = WHOLESALE_PRODUCTS.find(p => p.category === 'custom');
            if (customProduct) {
                expect(isCustomProduct(customProduct)).toBe(true);
            }
        });

        it('should not identify regular products as custom', () => {
            const regularProduct = WHOLESALE_PRODUCTS.find(p => p.category === 'grade-a');
            if (regularProduct) {
                expect(isCustomProduct(regularProduct)).toBe(false);
            }
        });
    });

    describe('Product Details', () => {
        it('should get product by ID', () => {
            const firstProduct = WHOLESALE_PRODUCTS[0];
            const found = getProductById(firstProduct.id);
            expect(found).toEqual(firstProduct);
        });

        it('should return undefined for invalid ID', () => {
            const found = getProductById('invalid-product-id-12345');
            expect(found).toBeUndefined();
        });
    });

    describe('Price Formatting', () => {
        const formatPrice = (price: number): string => {
            return `$${price.toFixed(2)}`;
        };

        const formatPriceRange = (min: number, max: number): string => {
            return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
        };

        const getCustomPriceDisplay = (isCustom: boolean, price: number): string => {
            if (isCustom && price === 0) {
                return 'Quote Required';
            }
            return formatPrice(price);
        };

        it('should format prices with 2 decimal places', () => {
            expect(formatPrice(10)).toBe('$10.00');
            expect(formatPrice(10.5)).toBe('$10.50');
            expect(formatPrice(10.999)).toBe('$11.00'); // Rounds correctly
        });

        it('should format price ranges', () => {
            expect(formatPriceRange(5, 15)).toBe('$5.00 - $15.00');
        });

        it('should show Quote Required for custom products', () => {
            expect(getCustomPriceDisplay(true, 0)).toBe('Quote Required');
            expect(getCustomPriceDisplay(true, 25)).toBe('$25.00');
            expect(getCustomPriceDisplay(false, 0)).toBe('$0.00');
        });
    });

    describe('Stock Status', () => {
        type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

        const getStockStatus = (inStock: boolean, quantity?: number): StockStatus => {
            if (!inStock) return 'out-of-stock';
            if (quantity !== undefined && quantity <= 10) return 'low-stock';
            return 'in-stock';
        };

        const getStockLabel = (status: StockStatus): string => {
            const labels: Record<StockStatus, string> = {
                'in-stock': 'In Stock',
                'low-stock': 'Low Stock',
                'out-of-stock': 'Out of Stock',
            };
            return labels[status];
        };

        it('should return correct stock status', () => {
            expect(getStockStatus(true)).toBe('in-stock');
            expect(getStockStatus(true, 50)).toBe('in-stock');
            expect(getStockStatus(true, 5)).toBe('low-stock');
            expect(getStockStatus(false)).toBe('out-of-stock');
        });

        it('should return readable labels', () => {
            expect(getStockLabel('in-stock')).toBe('In Stock');
            expect(getStockLabel('low-stock')).toBe('Low Stock');
            expect(getStockLabel('out-of-stock')).toBe('Out of Stock');
        });
    });

    describe('Quantity Validation', () => {
        const isValidQuantity = (qty: number): boolean => {
            return Number.isInteger(qty) && qty >= 1 && qty <= 1000;
        };

        const clampQuantity = (qty: number, min: number = 1, max: number = 1000): number => {
            return Math.max(min, Math.min(max, Math.floor(qty)));
        };

        it('should validate reasonable quantities', () => {
            expect(isValidQuantity(1)).toBe(true);
            expect(isValidQuantity(100)).toBe(true);
            expect(isValidQuantity(1000)).toBe(true);
        });

        it('should reject invalid quantities', () => {
            expect(isValidQuantity(0)).toBe(false);
            expect(isValidQuantity(-1)).toBe(false);
            expect(isValidQuantity(1001)).toBe(false);
            expect(isValidQuantity(1.5)).toBe(false);
        });

        it('should clamp quantities within range', () => {
            expect(clampQuantity(0)).toBe(1);
            expect(clampQuantity(-5)).toBe(1);
            expect(clampQuantity(500)).toBe(500);
            expect(clampQuantity(2000)).toBe(1000);
            expect(clampQuantity(5.7)).toBe(5);
        });
    });
});
